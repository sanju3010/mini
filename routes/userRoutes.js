const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Need = require('../models/Need');
const Child = require('../models/Child');
const Orphanage = require('../models/orphanage');
const nodemailer = require('nodemailer');
router.use(bodyParser.urlencoded({ extended: true }));

// Route to render the home page
router.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Route to render the registration page
router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register', async (req, res) => {

    const { name, email, password, role } = req.body;
    console.log("Received data:", { name, email, password, role }); // Add this line
    if (!name || !email || !password || !role) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Create a new user and save to the database
        const newUser = new User({ name, email, password, role });
        await newUser.save();
        
        //res.status(201).send('User registered successfully!');
        res.redirect('/login');
    } catch (error) {
        res.status(400).send('Error during registration: ' + error.message);
    }
});

// Route to render the login page
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.send('Invalid email or password');
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.send('Invalid email or password');
        }
        console.log("User object:", user);
        // Store user in session
       // req.session.user = { id: user._id, email: user.email , name: user.name, role: user.role };
       req.session.user = { _id: user._id, email: user.email, name: user.name, role: user.role };

       console.log("Session after login:", req.session.user);
        // Redirect based on user role
        if(user.role === 'Orphanage') {
            return res.redirect('/orphanages'); // Ensure this route exists in your app
        }
        // Inside the login route in userRoutes.js
        if (user.role === 'Donor') {
             return res.redirect('/donor');
        }

        // For other roles, redirect to the home page or respective page
        res.redirect('/');
    } catch (error) {
        res.send('Error during login: ' + error.message);
    }
});


router.get('/donor', async (req, res) => {
    try {
        const needs = await Need.find();  // Fetch needs
        const children = await Child.find();  // Fetch children
        
        // Render donor page and pass user, needs, and children
        res.render('donor', { user: req.session.user, needs, children });
    } catch (error) {
        res.status(500).send('Error loading donor dashboard');
    }
});

// router.post('/notify-orphanages', async (req, res) => {
//     const { donorId, needId } = req.body;
    
//     console.log('Received donorId:', donorId);
//     console.log('Received needId:', needId); // Log the needId

//     if (!donorId || !needId) {
//         return res.status(400).send('Invalid donor ID or need ID');
//     }

//     try {
//         const donor = await User.findById(donorId);
//         if (!donor) {
//             return res.status(404).send('Donor not found');
//         }

//         const orphanagesWithNeeds = await Orphanage.find().populate('needs');

//         for (let orphanage of orphanagesWithNeeds) {
//             const orphanageNeeds = orphanage.needs.map(need => `${need.description} (${need.quantity})`).join('\n');

//             const transporter = nodemailer.createTransport({
//                 service: 'Gmail',
//                 auth: {
//                     user: 'your-email@gmail.com',
//                     pass: 'your-email-password'
//                 }
//             });

//             const mailOptions = {
//                 from: 'your-email@gmail.com',
//                 to: orphanage.email,
//                 subject: 'A Donor is Ready to Help!',
//                 text: `Dear ${orphanage.name},\n\nA donor named ${donor.name} is ready to help with your needs:\n${orphanageNeeds}\n\nPlease contact the donor for more information.`
//             };

//             await transporter.sendMail(mailOptions);
//         }

//         res.status(200).send('Notifications sent successfully');
//     } catch (error) {
//         console.error('Error sending notifications:', error);
//         res.status(500).send('Failed to send notifications');
//     }
// });
router.post('/notify-orphanages', async (req, res) => {
    const { donorId, needId } = req.body;  // Need ID is passed as well
    console.log('Received donorId:', donorId);
    if (!donorId) {
        return res.status(400).send('Invalid donor ID');
    }

    try {
        // Find the donor by ID (assuming donor is logged in and donorId is passed)
        const donor = await User.findById(donorId);
        if (!donor) {
            return res.status(404).send('Donor not found');
        }

        // Find the orphanage with the specific need
        const orphanage = await Orphanage.findOne({ 'needs._id': needId }).populate('needs');
        if (!orphanage) {
            return res.status(404).send('Orphanage not found');
        }

        // Find the specific need to include in the email
        const need = orphanage.needs.id(needId);
        if (!need) {
            return res.status(404).send('Need not found');
        }

        // Set up nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',  // You can configure the email service here
            auth: {
                user: 'manasadannaram99@gmail.com', // Replace with your actual email for sending
                pass: 'Manasa@197581'  // Replace with your actual password for sending
            }
        });

        // Set up the email options, filling the "from" with the donor's email and "to" with the orphanage's email
        const mailOptions = {
            from: donor.email,  // The email of the logged-in donor
            to: orphanage.email,  // The email of the orphanage
            subject: 'A Donor is Ready to Help!',
            text: `Dear ${orphanage.name},\n\nA donor named ${donor.name} (${donor.email}) is ready to help with your need: ${need.description} (${need.quantity}).\n\nPlease contact the donor for more information.`
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).send('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send('Failed to send notification');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/'); // Redirect to home page after logout
    });
});
module.exports = router;

