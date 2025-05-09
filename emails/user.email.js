import nodemailer from "nodemailer";
import { html } from "./user.email.html.js";
import  jwt  from 'jsonwebtoken';


export const sendEmail = async (option)=>{
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bahaamohammed012003@gmail.com",
      pass: "pqpr hocv ylcl ilxp",
    },
  });

  var token = jwt.sign({ email : option.email }, process.env.JWT_KEY2);
  const info = await transporter.sendMail({
    from: '"Bahaa Mohammed 👻" <bahaamohammed012003@gmail.com>', 
    to: option.email, 
    subject: "Hello ✔",
    html: html(token),
  });  
}