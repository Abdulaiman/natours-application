const nodeMailer = require('nodemailer');

const sendEmail = async (option) => {
  ///// CREATE A TRANSPORTER
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  ///// DEFINE EMAIL OPTION
  const mailOptions = {
    from: 'Abdul Aiman <abduldanmaihaja@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
    // html:
  };

  ///// SEND THE EMAIL

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
