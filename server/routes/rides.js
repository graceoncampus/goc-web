const { GoogleSpreadsheet } = require('google-spreadsheet');

import moment from 'moment';
import { promisify } from 'util';
import admin from 'firebase-admin';
import creds from '../config/goc-form-ca6452f3be85.json';
import { mailgun } from '../lib';
import { FIREBASE_CONFIG } from '../config/firebaseConfig';

const ridesRef = admin.firestore().collection('rides');

export const getRidesSignup = (req, res) => {
  res.render('ridesSignup.ejs', {
    title: 'Signup for a Ride',
    config: FIREBASE_CONFIG,
  });
};
const deleteRides = () => ridesRef.doc('current_rides').collection('cars').get().then(ridesSnapshot => !ridesSnapshot.empty && Promise.all(ridesSnapshot.docs.map(doc => doc.ref.delete())));

export const getRides = async (req, res) => {
  let cars = [];
  try {
    const snapshot = await ridesRef.doc('current_rides').collection('cars').get();
    if (!snapshot.empty) {
      cars = snapshot.docs.map((d) => {
        const car = d.data();
        return ({
          driver: car.driver.name,
          riders: car.riders.map(r => r.name),
        });
      });
      const idx = cars.findIndex(c => c.driver === 'IN PROGRESS');
      if (idx > -1) cars.splice(0, 0, cars.splice(idx, 1)[0]);
    }
  } catch (e) {
    console.error(e);
  }
  res.render('rides.ejs', {
    title: 'Rides',
    cars,
  });
};

const sendDriverEmail = (car, date, emailMessage) => {
  if (
    car.driver
    && car.driver.email
    && car.riders
    && car.riders.length > 1
    && date
    && emailMessage
  ) {
    const { name, email } = car.driver;
    const carRiders = car.riders;
    const formattedDate = moment(date).format('M/D/YY');
    const message = `Hi ${
      name
    }! :)\n\n`
    + `Thanks for offering to drive this ${
      date
    }!\n\n`
    + `Here are your riders:\n\n${
      carRiders.map(r => `${r.name}: ${r.phoneNumber} | ${r.location}`).join('\n')
    }\n\n${
      car.comment && car.comment !== '' ? `Comments: ${car.comment}` : ''
    }\n\n${
      emailMessage ? `${emailMessage}\n\n` : ''
    }Thanks!\n`
    + 'Rides Team\n'
    + 'gocrides@gmail.com | (310) 694-5216';
    const riders = carRiders.map((r) => {
      let times = '';
      if (r.morning === 'm') {
        times += 'Morning ';
      }
      if (r.evening === 'e') {
        times += 'Evening ';
      }
      if (r.staying === 's') {
        times += 'Staying ';
      }
      return `<b>${
        r.name
      }</b>${r.phoneNumber || r.location ? '<br />' : ''}${r.phoneNumber ? ` ☎️ ${r.phoneNumber}` : ''}${r.location ? ` 📍 ${r.location}` : ''}${times ? `<br/>Services: ${times}` : ''}<br/><br/>`;
    });
    const riderString = riders.join(' '); // remove comma delimiters from riders array
    const data = {
      to: email,
      bcc: 'gocrides@gmail.com',
      from: 'Grace on Campus Rides Team <gocrides@gmail.com>',
      subject: `Rides ${formattedDate}`,
      text: message,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml"><head> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> <title>Rides</title> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style></head><body style="width: 100% !important; height: 100%; margin: 0; line-height: 1.4; background-color: #F2F4F6; color: #3a3f4b; -webkit-text-size-adjust: none; box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#F2F4F6"> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style> <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#f9f9f9"> <tr> <td align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 24px 0; border-radius: 3px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; width: 100%;"> <tr> <td class="email-masthead" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px 0; word-break: break-word;" align="center"> <a href="https://example.com" class="email-masthead_name" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;"> <img style="margin: 30px 0; max-width: 200px; text-align: center" src="https://res.cloudinary.com/goc/image/upload/v1507845999/Fill-16_ozm9l3.png"/> </a> </td></tr><tr> <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #ecedef; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #ecedef; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word;" bgcolor="#FFFFFF"> <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF"> <tr> <td class="content-cell" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px; word-break: break-word;"> <p style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: normal; margin-top: 0;" align="left">Greetings ${name},</p><p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin: 0;" align="left">Thank you for offering to drive this ${formattedDate}! We greatly appreciate your service to the body.</p><br/> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">Here are your riders:</p><table class="attributes" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid rgba(0,0,0,.125); border-radius: 5px;box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 0 21px;"> <tr> <td class="attributes_content" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 16px; word-break: break-word;" bgcolor="#fff"> <table width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;"> <tr> <td class="attributes_item" style="color:#3a3f4b; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; word-break: break-word;font-size:18px"> <span style="font-size:14px; letter-spacing: 0.5px; color:#848895">Riders</span> <br/>${riderString}</td></tr></table> </td></tr></table> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">${
        emailMessage ? `${emailMessage}\n\n` : ''
      }</p><p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">Thanks! <br/>Rides Team<br/> gocrides@gmail.com | (310) 694-5216 </p></td></tr></table> </td></tr><tr> <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;"> <tr> <td class="content-cell" align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px 35px 0; word-break: break-word;"> <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5em; margin-top: 0;" align="center">© 2017 <a style="text-decoration: none;color:#539ab9" href="https://graceoncampus.org">Grace on Campus</a> <br/>A Ministry of <a style="text-decoration: none;color:#539ab9" href="https://gracechurch.org">Grace Community Church</a> </p></td></tr></table> </td></tr></table> </td></tr></table></body></html>`,
    };
    mailgun.messages().send(data); // send email to driver
  }
};

// moment(req.body.date).unix()
export const updateRides = async (req, res) => {
  const re1 = /https:\/\/docs\.google\.com\/spreadsheets\/d\//g;
  const re2 = /\/.*/g;
  const sheetID = req.body.sheetURL.replace(re1, '').replace(re2, '');
  const ridesSheetDoc = new GoogleSpreadsheet(sheetID);
  
  const {
    emailMessage,
    date,
  } = req.body;

  const cars = [];

  const batch = admin.firestore().batch();

  try {
    await deleteRides();
    await ridesSheetDoc.useServiceAccountAuth({
      client_email: creds.client_email,
      private_key: creds.private_key
    });
    await ridesSheetDoc.loadInfo();
    const ridesSheet = ridesSheetDoc.sheetsByIndex[0];

    const rows = await ridesSheet.getRows({offset: 0});
    let i = 0;
    let len = rows.length;
    for (; i < len; i += 1) {
      const row = rows[i];
      if (row.rider_name && row.driver_name) {
        const car = cars.find(c => c.driver.name === row.driver_name);
        if (car) {
          car.riders.push({
            uid: row.rider_uid,
            morning: row.rider_morning,
            staying: row.rider_staying,
            evening: row.rider_evening,
            name: row.rider_name,
            email: row.rider_email,
            phoneNumber: row.rider_phone,
            location: row.rider_pickup_location,
          });
        } else {
          cars.push({
            driver: {
              uid: row.driver_uid,
              name: row.driver_name,
              email: row.driver_email,
              phoneNumber: row.driver_phone,
              comment: row.posted_comment,
              sendEmail: row.send_email.toLowerCase() === 'yes',
            },
            riders: [{
              uid: row.rider_uid,
              morning: row.rider_morning,
              staying: row.rider_staying,
              evening: row.rider_evening,
              name: row.rider_name,
              email: row.rider_email,
              phoneNumber: row.rider_phone,
              location: row.rider_pickup_location,
            }],
          });
        }
      }
    }

    batch.update(ridesRef.doc('current_rides'), {
      date,
      emailMessage,
    });
    i = 0;
    len = cars.length;

    for (; i < len; i += 1) {
      const car = cars[i];
      const newCarRef = ridesRef.doc('current_rides').collection('cars').doc();
      
      batch.set(newCarRef, {
        driver: car.driver,
      });
      if (car.driver.sendEmail) sendDriverEmail(car, date, emailMessage);
      car.riders.forEach((rider) => {
        if (rider.uid) {
          batch.update(admin.firestore().collection('users').doc(rider.uid), {
            currentCar: newCarRef.id,
          });
        }
        
        // Fill in missing values to avoid issues with undefined parsing from google spreadsheet
        rider.uid = rider.uid ? rider.uid : '';
        rider.morning = rider.morning ? rider.morning : '';
        rider.staying = rider.staying ? rider.staying : '';
        rider.evening = rider.evening ? rider.evening : '';
        rider.name = rider.name ? rider.name : '';
        rider.email = rider.email ? rider.email : '';
        rider.phoneNumber = rider.phoneNumber ? rider.phoneNumber : '';
        rider.location = rider.location ? rider.location : '';

        batch.update(newCarRef, {
          riders: admin.firestore.FieldValue.arrayUnion(rider),
        });
      });
    }
    await batch.commit();
    res.redirect('/rides');
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};



export const notifyRiders = async (req, res) => {
  if (!req.user || !(req.user.permissions.admin || req.user.permissions.rides)) {
    res.status(500).json('User is not authorized');
    return;
  }

  const users = [];
  try {
    const carCollection = await ridesRef.doc('current_rides').collection('cars').get();
    carCollection.docs.forEach((carDoc) => {
      
    });
    // const usersWithRides = await admin.firestore().collection('users').where('currentCar', '>', '').get();
    // if (!usersWithRides.empty) {
    //   for (const u of usersWithRides.docs) {
    //     const data = u.data();
    //     if (data.tokens && Array.isArray(data.tokens) && data.tokens.length > 0) {
    //       try {
    //         const carDoc = await ridesRef.doc('current_rides').collection('cars').doc(data.currentCar).get();
    //         console.log(data.currentCar);
    //         if (carDoc.exists) {
    //           const car = carDoc.data();
    //           const rider = car.riders.find(r => r.email === u.email);
    //           if (rider) {
    //             users.push({
    //               driver: car.driver,
    //               location: rider.location,
    //               ...data,
    //             }); 
    //           }
    //         }
    //       } catch (e) {
    //         res.status(500).json('Something went wrong while gathering riders from users.')
    //       }
    //     }
    //   }
    // }

    users.forEach((u) => {
      const body = `Your driver to church this Sunday is ${u.driver.name}. Be at ${u.location ? u.location : 'your respective pickup location'} at 8:15 AM. See you at church ⛪️!`;
      u.tokens.forEach((t) => {
        const payload = {
          notification: {
            title: 'GOC Rides Team',
            body,
          },
          token: t,
        };
        const messaging = admin.messaging();
        messaging
          .send(payload)
          .then((result) => {
            console.log('sendmessage ok:', result);
          })
          .catch((error) => {
            console.log('sendmessage ERROR:', error);
          });
      });
    });
  } catch (e) {
    console.log(e);
  }
  res.json('sent');
};
