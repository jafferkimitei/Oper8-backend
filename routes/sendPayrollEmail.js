require('dotenv').config(); 

const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Register the 'if_eq' helper
Handlebars.registerHelper('if_eq', function(a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'admin@sarencoinc.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendPayrollEmail = async (recipientEmail, payrollData) => {
  try {
    if (!payrollData.week) {
      const startDate = new Date(payrollData.startDate);
      const week = getWeekNumber(startDate);
      payrollData.week = week;
    }

    const templatePath = path.join(__dirname, '../templates/emailTemplate.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    const emailHtml = template({ payrollData });

    const mailOptions = {
      from: 'admin@sarencoinc.com',
      to: recipientEmail,
      subject: `Payroll for Week: ${payrollData.week}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil(diff / oneDay / 7);
}

module.exports = sendPayrollEmail;
