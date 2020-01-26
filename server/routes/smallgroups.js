import moment from 'moment';
import cloudinary from 'cloudinary';
import formidable from 'formidable';
import admin from 'firebase-admin';
import { promisify } from 'util';
import { replaceURLsWithLinks } from '../lib';

const sgRef = admin.firestore().collection('smallgroups');

/*
getSmallGroups gets small groups 
*/
export const getSmallGroups = async (req, res) => {
    try {
      const msg = await sgRef.doc('men').collection('men_sgs').get();
      const menSgs = [];
        if (!msg.empty) {
          msg.forEach((doc) => {
            if (doc.exists) {
              const course = doc.data();
              menSgs.push(course);
            }
          });
        }
      const fsg = await sgRef.doc('women').collection('women_sgs').get();
      const womenSgs = [];
        if(!fsg.empty){
            fsg.forEach((doc) => {
              if(doc.exists) {
                const course = doc.data();
                womenSgs.push(course);
              }
            })
        }
        res.render('smallgroups.ejs', {
          title: 'Small Groups',
          menSgs,
          womenSgs,
        });
      } catch (e) {
        res.status(500).json(e);
      }
};

// moment(req.body.date).unix()
export const updateRides = async (req, res) => {
  const re1 = /https:\/\/docs\.google\.com\/spreadsheets\/d\//g;
  const re2 = /\/.*/g;
  const sheetID = req.body.sheetURL.replace(re1, '').replace(re2, '');
  const ridesSheet = new GoogleSpreadsheet(sheetID);

  const {
    emailMessage,
    date,
  } = req.body;

  const cars = [];

  const batch = admin.firestore().batch();

  try {
    await deleteRides();
    await promisify(ridesSheet.useServiceAccountAuth)(creds);
    const rows = await promisify(ridesSheet.getRows)(1, {});
    let i = 0;
    let len = rows.length;
    for (; i < len; i += 1) {
      const row = rows[i];
      if (row.ridername && row.drivername) {
        const car = cars.find(c => c.driver.name === row.drivername);
        if (car) {
          car.riders.push({
            uid: row.rideruid,
            morning: row.ridermorning,
            staying: row.riderstaying,
            evening: row.riderevening,
            name: row.ridername,
            email: row.rideremail,
            phoneNumber: row.riderphone,
            location: row.riderpickuplocation,
          });
        } else {
          cars.push({
            driver: {
              uid: row.driveruid,
              name: row.drivername,
              email: row.driveremail,
              phoneNumber: row.driverphone,
              comment: row.postedcomment,
              sendEmail: row.sendemail.toLowerCase() === 'yes',
            },
            riders: [{
              uid: row.rideruid,
              morning: row.ridermorning,
              staying: row.riderstaying,
              evening: row.riderevening,
              name: row.ridername,
              email: row.rideremail,
              phoneNumber: row.riderphone,
              location: row.riderpickuplocation,
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
        batch.update(newCarRef, {
          riders: admin.firestore.FieldValue.arrayUnion(rider),
        });
      });
    }
    await batch.commit();
    res.redirect('/rides');
  } catch (e) {
    res.status(500).json(e);
  }
};

  