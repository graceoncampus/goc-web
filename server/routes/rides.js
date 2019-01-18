import _ from 'lodash';
import moment from 'moment';
import admin from 'firebase-admin';
import GoogleSpreadsheet from 'google-spreadsheet';
import mail from 'mailgun-js';
const mailgun = mail({
  apiKey: 'key-4d9b6eedc8a5b75c6a9e0b7eb49fa76c',
  domain: 'graceoncampus.org'
});
import creds from '../config/goc-form-ca6452f3be85.json';
import common from '../lib';
import {
  firestore,firestoreDB } from '../firebase';
const ridesRef = firestoreDB.collection('rides');

export const getRidesSignup = (req, res) => {
  res.render('ridesSignup.ejs', {
    title: 'Signup for a Ride',
  });
};

export const getRides = async(req, res) => {
  const data = [];
  // const snapshot = await ridesRef.orderByKey().limitToFirst(1).once('value')
  // const snapshot = ridesRef.get().then(snapshot =>{
  const snapshot = await ridesRef.get()
  if (snapshot){
    snapshot.forEach(doc => {
      // console.log(doc.data())
       const allCars = doc.data().cars;
       for(var i=0;i<allCars.length;i++){
         var driver = allCars[i].people[0].name;
         let riders = [];
         for (var j=1;j<allCars[i].people.length;j++){
           riders.push(allCars[i].people[j].name);
         }
         const toAppend = {
           driver,
           riders
         };
         data.push(toAppend)
       }
      console.log(data)
     });
     res.render('rides.ejs', {
       title: 'Rides',
       cars: data
     });
   }
  else {
    res.render('rides.ejs', {
      title: 'Rides',
      cars: null
    });
  }
};

export const updateRides = async(req, res) => {
  const re1 = /https:\/\/docs\.google\.com\/spreadsheets\/d\//g;
  const re2 = /\/.*/g;
  const sheetID = req.body.sheetURL.replace(re1, "").replace(re2, "");
  const ridesSheet = new GoogleSpreadsheet(sheetID);
  // ridesRef.remove();
  const date = moment(req.body.date).unix()
  const emailMessage = (req.body.emailMessage) ? req.body.emailMessage : ''
  const newRideRef = ridesRef.doc("QScTFrSuaPWWbyGgGqMW").collection('cars');

  var ride = {};
  ride.cars = {xeWyLWOqiTc4Y7rdwCHP: [{name: 'Alex Cai'}]}
  ride.date = date;
  ride.emailMessage = (req.body.emailMessage) ? req.body.emailMessage : '';
  ridesSheet.useServiceAccountAuth(creds, (err) => {
    if (err) {
      return;
    }
    ridesSheet.getRows(1, {}, async(err, rows) => {
      if (err) {
        return;
      }
      for (let row of rows) {
        if (row.ridername !== "") {
          const carKey = _.findKey(ride.cars, (item) => (item[0]['name'] == row.drivername));
          if (carKey) {
            // firebase
            console.log(carKey)
            //admin.firestore().doc(`users/${userA}/chats`).update('array', [...]);
            const newRiderRef = await newRideRef.doc(carKey).update({ "car": firebase.firestore.FieldValue.arrayUnion(
            {  uid: row.rideruid || "",
              name: row.ridername || "",
              email: row.rideremail || "",
              phoneNumber: row.riderphone || "",
              location: row.riderpickuplocation || ""}
            )});
            // local
            // ride.cars[carKey] = {
            //   uid: row.rideruid,
            //   morning: row.ridermorning,
            //   staying: row.riderstaying,
            //   evening: row.riderevening,
            //   name: row.ridername,
            //   email: row.rideremail,
            //   phoneNumber: row.riderphone,
            //   location: row.riderpickuplocation
            // }; //uncomment
          }
        }
      }
          // } else if (row.drivername && row.ridername) {
          //   // firebase
          //   const newCarRef = await newRideRef.child("cars").push({
          //     driver: {
          //       uid: row.driveruid || "",
          //       name: row.drivername || "",
          //       email: row.driveremail || "",
          //       phoneNumber: row.driverphone || ""
          //     },
          //     riders: {},
          //     comment: row.postedcomment || "",
          //     sendEmail: row.sendemail ? row.sendemail.toLowerCase() == "yes" : false
          //   });
          //   const newRiderRef = await newCarRef.child("riders").push({
          //     uid: row.rideruid || "",
          //     morning: row.ridermorning,
          //     staying: row.riderstaying,
          //     evening: row.riderevening,
          //     name: row.ridername || "",
          //     email: row.rideremail || "",
          //     phoneNumber: row.riderphone || "",
          //     location: row.riderpickuplocation || ""
          //   });
          //   ride.cars[newCarRef.key] = {
          //     driver: {
          //       uid: row.driveruid || "",
          //       name: row.drivername,
          //       email: row.driveremail,
          //       phoneNumber: row.driverphone
          //     },
          //     riders: {},
          //     comment: row.postedcomment,
          //     sendEmail: row.sendemail ? row.sendemail.toLowerCase() == "yes" : false
          //   };
          //
          //   ride.cars[newCarRef.key].riders[newRiderRef.key] = {
          //     uid: row.rideruid || "",
          //     morning: row.ridermorning,
          //     staying: row.riderstaying,
          //     evening: row.riderevening,
          //     name: row.ridername,
          //     email: row.rideremail,
          //     phoneNumber: row.riderphone,
          //     location: row.riderpickuplocation
          //   };
          // } //uncomment
      //   }
      // }
      // _.filter(ride.cars, car => (car.sendEmail)).forEach(car => {
      //   sendDriverEmail(car, date, emailMessage)
      // });
      res.redirect('/rides');
    })
  })
};

const sendDriverEmail = (car, date, emailMessage) => {
  if (car && car.riders && car.driver && car.driver.email && date && emailMessage) {
    const name = car.driver.name
    const formattedDate =  moment.unix(date).format('MM/DD')
    const message = 'Hi ' + name + '! :)\n\n' +
      'Thanks for offering to drive this ' + date + '!\n\n' +
      'Here are your riders:\n\n' +
      _.map(car.riders, function (r) {
        return r.name + ': ' + r.phoneNumber + ' | ' + r.location;
      }).join('\n') + '\n\n' +
      (car.comment && car.comment != '' ? 'Comments: ' + car.comment : '') + '\n\n' +
      (emailMessage ? emailMessage + '\n\n' : '') +
      'Thanks!\n' +
      'Rides Team\n' +
      'Ashlynn McGuff and Matthew Lin\n' +
      'gocrides@gmail.com | (310) 694-5216';
    const riders = _.map(car.riders, function (r) {
      let times = ''
      if (r.morning==='m') {
        times += 'Morning '
      }
      if (r.evening==='e') {
        times += 'Evening '
      }
      if (r.staying==='s') {
        times += 'Staying '
      }
      return `${r.name}<br/>☎️ ${r.phoneNumber} 📍${r.location}<br/>${times}<br/><br/>`;
    })
    const riderString = riders.join(" "); // remove comma delimiters from riders array
    var data = {
      to: car.driver.email,
      bcc: 'gocrides@gmail.com',
      from: 'Grace on Campus Rides Team <gocrides@gmail.com>',
      subject: 'Rides ' + formattedDate,
      text: message,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml"><head> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> <title>Rides</title> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style></head><body style="width: 100% !important; height: 100%; margin: 0; line-height: 1.4; background-color: #F2F4F6; color: #3a3f4b; -webkit-text-size-adjust: none; box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#F2F4F6"> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style> <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#f9f9f9"> <tr> <td align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 24px 0; border-radius: 3px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; width: 100%;"> <tr> <td class="email-masthead" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px 0; word-break: break-word;" align="center"> <a href="https://example.com" class="email-masthead_name" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;"> <img style="margin: 30px 0; max-width: 200px; text-align: center" src="https://res.cloudinary.com/goc/image/upload/v1507845999/Fill-16_ozm9l3.png"/> </a> </td></tr><tr> <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #ecedef; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #ecedef; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word;" bgcolor="#FFFFFF"> <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF"> <tr> <td class="content-cell" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px; word-break: break-word;"> <p style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: normal; margin-top: 0;" align="left">Greetings ${name},</p><p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin: 0;" align="left">Thank you for offering to drive this ${formattedDate}! We greatly appreciate your service to the body.</p><br/> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">Here are your riders:</p><table class="attributes" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid rgba(0,0,0,.125); border-radius: 5px;box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 0 21px;"> <tr> <td class="attributes_content" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 16px; word-break: break-word;" bgcolor="#fff"> <table width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;"> <tr> <td class="attributes_item" style="color:#3a3f4b; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; word-break: break-word;font-size:18px"> <span style="font-size:14px; letter-spacing: 0.5px; color:#848895">Riders</span> <br/>${riderString}</td></tr></table> </td></tr></table> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">${emailMessage ? emailMessage + '\n\n' : ''}</p><p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">Thanks! <br/>Rides Team<br/> Ashlynn McGuff and Matthew Lin<br/> gocrides@gmail.com | (310) 694-5216 </p></td></tr></table> </td></tr><tr> <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;"> <tr> <td class="content-cell" align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px 35px 0; word-break: break-word;"> <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5em; margin-top: 0;" align="center">© 2017 <a style="text-decoration: none;color:#ae956b" href="https://graceoncampus.org">Grace on Campus</a> <br/>A Ministry of <a style="text-decoration: none;color:#ae956b" href="https://gracechurch.org">Grace Community Church</a> </p></td></tr></table> </td></tr></table> </td></tr></table></body></html>`
    };
    mailgun.messages().send(data); // send email to driver
  }
}
