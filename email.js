const emailjs = require("emailjs-com");

const sendEmail = (recipient, subject, htmlContent) => {
  const serviceID = process.env.SERVICE_ID;
const templateID = process.env.TEMPLATE_ID;
const userID = process.env.USER_ID;
  const templateParams = {
    to_email: recipient,
    subject,
    html_content: htmlContent,
  };

  emailjs.send(serviceID, templateID, templateParams, userID)
    .then((response) => {
      console.log("Email sent successfully:", response.text);
    })
    .catch((error) => {
      console.error("Error sending email:", error.text);
    });
};

module.exports = { sendEmail };
