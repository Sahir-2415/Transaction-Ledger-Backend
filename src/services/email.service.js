require('dotenv').config();
const nodemailer=require('nodemailer');

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        type:'OAuth2',
        user:process.env.EMAIL_USER,
        clientId:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        refreshToken:process.env.REFRESH_TOKEN
        //these clientID , clientSecret and refreshToken are required to connect or contact with the SMTP server of Gmail
    },
    tls:{
        rejectUnauthorized:false // gives ssl error
    }
})

transporter.verify((error,success)=>{
    if(error){
        console.log("Error connecting to email server:"+error);
    }else{
        console.log("Email server is ready to send messages");
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail,name){
    const subject='Welcome to Backend Ledger!'
    const text=`Hello ${name},\n\nThank you for registering at Backend Ledger.
    We are excited to have you on board!\n\nBest Regards,\nThe Backend Ledger Team`;
    const html= `
        <h1>Welcome to Backend Ledger! 🎉</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>
            Thank you for registering at <strong>Backend Ledger</strong>.
            We are excited to have you on board!
        </p>
        <p>
            Your account has been successfully created and is ready to use.
        </p>
        <p>
            We hope you enjoy your experience with Backend Ledger.
        </p>
        <br>
        <p>
            Best Regards,<br>
            <strong>The Backend Ledger Team</strong>
        </p>
        `
        sendEmail(userEmail,subject,text,html);
}

async function sendTransactionEmail(userEmail,name,amount,toAccount){
    const subject='Transaction successful!';
    const text=`Hello ${name}, \n\n Your transaction of amount ${amount} to account ${toAccount} was successfull`;
    const html=`<p>Hello ${name},</p><p>Your transaction of amount $${amount} to account ${toAccount} was successfull</p>`;

    await sendEmail(userEmail,subject,text,html);
}

async function sendTransactionFailureEmail(userEmail,name,amount,toAccount){
    const subject='Transaction failed!';
    const text=`Hello ${name}, \n\n Your transaction of amount ${amount} to account ${toAccount} failed`;
    const html=`<p>Hello ${name},</p><p>Your transaction of amount $${amount} to account ${toAccount} failed</p>`;

    await sendEmail(userEmail,subject,text,html);
}

module.exports = {sendRegistrationEmail,sendTransactionEmail,sendTransactionFailureEmail};
