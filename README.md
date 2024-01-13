Blog Site with Node.js, Express, and MongoDB
Welcome to our Blog Site, a full-stack web application built using Node.js, Express, and MongoDB. This project provides a platform where users can create, edit, and view blog posts. It includes user authentication, session management, and MongoDB integration for data storage.

Features:
User Authentication: Secure user authentication using Passport.js with a local strategy.
Session Management: Utilizes Express sessions to manage user sessions.
Database Integration: MongoDB database integration for storing blog posts and user data.
CRUD Operations: Allows users to create, read, update, and delete their blog posts.
Contact Form: A contact form for users to reach out, with email notifications using the integrated email module.
Responsive Design: The site is designed to be responsive, providing a seamless experience across different devices.
Project Structure:
/models: Mongoose models for defining the schema of the User and Post entities.
/passport-config.js: Configuration file for Passport.js authentication strategies.
/email.js: Module for sending email notifications.
/views: EJS templates for rendering different pages.
/public: Static assets like stylesheets and client-side JavaScript.
/routes: Express routes for handling different HTTP requests.
How to Run:
Clone the repository: git clone https://github.com/akash2600707/Blog-App.git
Install dependencies: npm install
Create a .env file and set MONGODB_ATLAS_URI to your MongoDB connection string.
Start the server: npm start
Visit http://localhost:3000 in your browser.
Feel free to explore, contribute, or use this project as a foundation for your own blogging platform. We welcome feedback, suggestions, and contributions!

