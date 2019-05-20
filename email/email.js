const nodemailer = require('nodemailer');

function sendMail(textMail,attachments,recepients,emailCred){
	
	var transporter = nodemailer.createTransport({
        host: emailCred.host,
        port: emailCred.port,
		auth: {
		    user: emailCred.username,
		    pass: emailCred.password,
		  }
		});

	var mailOptions = {
	  from: emailCred.senderAddress,
	  to: recepients.toString(),
	  subject: 'Test Results',
	  text: textMail,
	  attachments:attachments,
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	  }
	});
}

module.exports = sendMail;