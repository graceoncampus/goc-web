import fs from 'fs';
import async from 'async';
import crypto from 'crypto';
import _ from 'lodash';
import common from '../lib';
import admin from 'firebase-admin';
import moment from 'moment'
export const getProfile = (req, res) => {
    let user = req.user;
    user.bday = moment.unix(user.birthday).format('YYYY-MM-DD')
    res.render('profile.ejs', {
        title: 'Profile',
        user: user
    });
};
export const postProfileEdit = async (req,res) => {
    const {
        firstName,
        lastName,
        phoneNumber,
        birthday,
        homechurch,
        gradyear,
        major,
        address
    } = req.body;
    const uid = req.user.uid;
    const { email, permissions } = req.user;
    const bday = moment(birthday).unix();
    const users = {};
    users[`/users/${uid}`] = {
        email,
        permissions,
      firstName,
      lastName,
      phoneNumber,
      birthday: bday,
      homeChurch: homechurch,
      grad: gradyear,
      major,
      address
    };
    try {
        await admin.database().ref().update(users) //change
        res.json('success')
    }
    catch (err) {
        res.json(err.message)
    }
};
export const getRoster = async(req, res) => {
    const users = await admin.database().ref('users').once('value'); //change
    const userFinal = []
    for (let user of _.values(users.val())) {
        user.bday = moment.unix(user.birthday).format('MMMM Do, YYYY');
        userFinal.push(user)
    }
    res.render('roster.ejs', {
        title: 'Roster',
        users: userFinal, // get the user out of session and pass to template
    });
};
