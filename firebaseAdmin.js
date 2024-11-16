
const admin = require('firebase-admin');
const serviceAccount = require('./oper8-auth-firebase-adminsdk-jgsxw-c63e78e8ba.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
