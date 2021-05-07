"use strict";

const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
 const mailer = async (email_ids, payload) => {
    //  console.log(process.env)
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({

    service: "Gmail",
      host: "smtp.gmail.com", 
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER_ID, // generated ethereal user
      pass: process.env.GMAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Pankaj Negi 👻" <dev.pankajnegi@gmail.com>', // sender address
    to: email_ids.join(), // list of receivers
    subject: "HERMES Update", // Subject line
    text: "Hi there! We have an update for You.", // plain text body
    html: `<b>${payload}</b>`, // html body
  }).then((msg)=>{console.log("Message send")})
  .catch((err)=>{console.log(err)});

//   console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// main().catch(console.error);

module.exports = mailer;


