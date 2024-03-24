import nodemailer from 'nodemailer'
import Mailgen from 'mailgen'
import ENV from '../config.js'


let nodeconfig = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: ENV.EMAIL,
      pass: ENV.PASSWORD,
    }
  
}

//post request will be made at api/registerMail
//the data passed will be username useremail text subject 

let transporter = nodemailer.createTransport(nodeconfig)

let mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mailgen",
        link: "https://mailgen.js"
    }
});

export const registerMail = async (req, res) => { 
    const {username , userEmail , text , subject } = req.body
    
    //body of the eamil
    var email ={
        body :{
            name  : username,
            intro : text || "Welcome to the new world",
            outro : "Need help , or have questions? Just reply to this email , we'd love to help"
        }
    }

    var emailBody = mailGenerator.generate(email);

    let message  = {
        from : ENV.email,
        to : userEmail,
        subject : subject || "Signup succesful",
        html : emailBody

    }

    //send mail
    transporter.sendMail(message)
    .then( () => {
      return res.status(200).send({msg : " Your should have recieved the email"})
    })
    .catch(error => res.status(500).send({error}))
 }