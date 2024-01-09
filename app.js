require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("./passport-config");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const { sendEmail } = require("./email");
const _ = require('lodash');
const { MongoClient, ServerApiVersion } = require('mongodb');


const homeStartingContent = "Welcome to Our Blog Site,Explore a world of ideas and insights at our blog site, where we delve into a myriad of topics that cater to your curiosity. Whether you're passionate about technology, science, or simply enjoy discovering new things, we've got you covered.";
const contactContent = "Have questions or suggestions? The contact section is the gateway to reaching out. We value your feedback and are eager to engage in meaningful conversations. Let's build a community where ideas flow freely.";
const contactConfig = {
  YOUR_EMAIL: "akashramesh2607@gmail.com"}
const app = express();


app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "your-secret-key-should-be-long-and-random",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.get("/login", function (req, res) {
  res.render("login", { message: req.flash("error") });
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

app.get("/signup", function (req, res) {
  res.render("signup", { message: req.flash("error") });
});

app.post("/signup", function (req, res) {
  User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      req.flash("error", "username is already registered");
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

app.get('/logout', (req, res) => {
  const goodbyeMessage = 'We will miss you! Come back soon.';

  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      req.flash('error', 'Error during logout');
    } else {
      req.flash('info', goodbyeMessage);
    }

    res.redirect('/');
  });
});
const uri = process.env.MONGODB_ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  ssl: true,
  sslValidate: true
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

const postSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  author: String,
});

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  if (req.isAuthenticated() && res.locals.currentUser) {
    Post.find({ author: res.locals.currentUser.username }, function (err, posts) {
      if (err) {
        console.error("Error finding posts:", err);
        res.render("home", {
          startingContent: homeStartingContent,
          posts: [],
          currentUser: req.user,
          errorMessage: req.flash('error'),
        });
      } else {
        console.log("Posts found:", posts);
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts,
          currentUser: req.user,
          errorMessage: req.flash('error'),
        });
      }
    });
  } else {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: [],
      currentUser: null,
    });
  }
});

app.get("/posts/:postName", function (req, res) {
  if (req.isAuthenticated()) {
    const requestedTitle = req.params.postName;

    Post.find({ title: requestedTitle, author: req.user.username }, function (err, posts) {
      if (posts.length > 0) {
        res.render("post", {
          title: posts[0].title,
          content: posts[0].content
        });
      } else {
        res.send("Post not found");
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/compose", isLoggedIn, function (req, res) {
  res.render("compose");
});

app.post("/compose", isLoggedIn, function (req, res) {
  console.log("Compose route accessed");
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.user.username
  });

  post.save(function (err) {
    if (!err) {
      console.log("Post saved successfully");
      res.redirect("/");
    } else {
      console.error(err);
      req.flash('error', 'Error saving post');
      res.redirect("/compose");
    }
  });
});

app.get("/posts/:postId/edit", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId, author: req.user.username }, function (err, post) {
    if (post) {
      res.render("edit", {
        postId: post._id,
        postTitle: post.title,
        postContent: post.content
      });
    } else {
      res.send("Post not found");
    }
  });
});

app.post("/posts/:postId/edit", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.updateOne({ _id: requestedPostId, author: req.user.username }, {
    title: req.body.postTitle,
    content: req.body.postBody
  }, function (err) {
    if (!err) {
      res.redirect("/");
    } else {
      console.error(err);
      res.send("Error updating post");
    }
  });
});

app.get("/posts/:postId/delete", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOneAndDelete({ _id: requestedPostId, author: req.user.username }, function (err) {
    if (!err) {
      res.redirect("/");
    } else {
      console.error(err);
      res.send("Error deleting post");
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    req.flash("error", "Please fill in all fields.");
    return res.redirect("/contact");
  }

  // Send an email with the form data
  sendEmail(contactConfig.YOUR_EMAIL, "New Contact Form Submission", `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`);

  // Set a success flash message
  req.flash("success", "We will contact you soon.");
res.render("contact", { success: req.flash("success") });
  
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
