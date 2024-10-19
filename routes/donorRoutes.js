const express = require('express');
const router = express.Router();
const Need = require('../models/Need');  // Assuming you have a Need model
const Child = require('../models/Child');  // Assuming you have a Child model
// Route to display the donor dashboard
router.get('/', async (req, res) => {
    // Check if the user is logged in and if their role is 'Donor'
    if (!req.session.user || req.session.user.role !== 'Donor') {
        return res.redirect('/login');  // Redirect to login if not logged in as donor
    }

    try {
        // Fetch orphanage needs and children from the database
        const needs = await Need.find();
        const children = await Child.find();

        // Render the donor dashboard view, passing the user, needs, and children data
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

module.exports = router;
