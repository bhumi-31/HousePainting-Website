const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host : process.env.EMAIL_HOST,
    port : process.env.EMAIL_PORT,
    secure: false,
    auth :{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


transporter.verify((error, success) => {
    if(error){
        console.error('Email configuration error:', error.message);
    }else{
        console.log('Email server is ready to send messages');
    }
});

module.exports = transporter;