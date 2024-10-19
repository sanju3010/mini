const express = require('express');
const router = express.Router();
const Need = require('../models/Need');  // Assuming you have a Need model
const Child = require('../models/Child');  // Assuming you have a Child model
const Orphanage = require('../models/orphanage');  // Assuming you have an Orphanage model

// Route to display the orphanage management page
router.get('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Orphanage') {
        return res.redirect('/login'); // Redirect if not logged in as Orphanage
    }

    try {
        // Fetch orphanage needs and children from the database
        const needs = await Need.find();
        const children = await Child.find();

        // Render the orphanages.ejs view, passing the user, needs, and children data
        res.render('orphanages', {
            user: req.session.user,
            needs: needs, 
            children: children
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching orphanage data.');
    }
});

// Route to handle adding a new need
router.post('/needs', async (req, res) => {
    try {
        const { description, quantity } = req.body;

        // Create a new need and save it to the database
        const newNeed = new Need({
            description: description,
            quantity: quantity
        });
        await newNeed.save();

        res.redirect('/orphanages');  // Redirect to the orphanage dashboard after saving
    } catch (error) {
        console.error('Error adding need:', error);
        res.status(500).send('Error adding need.');
    }
});

// Route to handle adding a new child
router.post('/children', async (req, res) => {
    try {
        const { name, age, gender } = req.body;

        // Create a new child and save it to the database
        const newChild = new Child({
            name: name,
            age: age,
            gender: gender
        });
        await newChild.save();

        res.redirect('/orphanages');  // Redirect to the orphanage dashboard after saving
    } catch (error) {
        console.error('Error adding child:', error);
        res.status(500).send('Error adding child.');
    }
});
// Route to display needs and children to donors
router.get('/donor', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Donor') {
        return res.redirect('/login'); // Redirect if not logged in as Donor
    }

    try {
        // Fetch orphanage needs and children from the database
        const needs = await Need.find();
        const children = await Child.find();

        // Render the donor view (create a donor.ejs) and pass the needs and children data
        res.render('donor', {
            user: req.session.user,
            needs: needs,
            children: children
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching orphanage data.');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/');
    });
});

module.exports = router;
