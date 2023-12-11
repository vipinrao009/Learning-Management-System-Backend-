import nodemailer from "nodemailer";

const sendEmail = async function (email, subject, message) {
  //create reuseble transpoter object using the default
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  //   send mail with defined transport object
  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL, //sender email
    to: email, // user email
    subject: subject, // Subject line
    html: message, // html body
  });
};

export default sendEmail;
