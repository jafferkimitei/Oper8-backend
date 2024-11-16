const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const dispatchersRoute = require('./routes/dispatchers');
const driversRoute = require('./routes/drivers');
const loadsRoute = require('./routes/loads');
const payrollsRoute = require('./routes/payrolls');
const miscellaneousRoute = require('./routes/miscellaneous');
const balanceRoute = require('./routes/balance');
const authRoutes = require('./routes/auth');
const sendPayrollEmail = require('./routes/sendPayrollEmail');
const statRoutes = require('./routes/stats');

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'middleware')));

app.use(express.static(path.join(__dirname, 'build')));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { dbName: 'payroll' })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('MongoDB connection error:', error));

  
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: uri,
      dbName: 'payroll',
      collectionName: 'sessions',
      ttl: 24 * 60 * 60
    }),
    secret: process.env.JWTSTUFF,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use('/auth', authRoutes);
app.use('/dispatchers', dispatchersRoute);
app.use('/drivers', driversRoute);
app.use('/loads', loadsRoute);
app.use('/payrolls', payrollsRoute);
app.use('/miscellaneous', miscellaneousRoute);
app.use('/balance', balanceRoute);
app.use('/stats', statRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the Payroll API');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.post('/payrolls/send', async (req, res) => {
  const { userId, payrollData, email } = req.body;

  if (!userId || !payrollData || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    
    await sendPayrollEmail(email, payrollData);

    res.status(200).json({ message: 'Payroll email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send payroll email' });
  }
});

app.use((req, res, next) => {
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
    }
    next();
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
