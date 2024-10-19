const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const userRoutes = require('./routes/UserRoutes');
const orphanageRoutes = require('./routes/orphanageRoutes'); 
const donorRoutes = require('./routes/donorRoutes');
const app = express();

// Middleware to parse URL-encoded form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To handle JSON data if necessary

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/userAuthDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Session configuration
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/userAuthDB' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // Session lasts for 1 day
}));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Routes
app.use('/', userRoutes);
app.use('/orphanages', orphanageRoutes);  // Ensure orphanage routes are included
app.use('/donor', donorRoutes);
// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
}); // Assuming you create a separate file for donor routes
// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
