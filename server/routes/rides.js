import _ from "lodash";
import moment from "moment";
import admin from "firebase-admin";
import GoogleSpreadsheet from "google-spreadsheet";
import mail from "mailgun-js";
const FieldValue = require('firebase').firestore.FieldValue;
const mailgun = mail({
  apiKey: "key-4d9b6eedc8a5b75c6a9e0b7eb49fa76c",
  domain: "graceoncampus.org"
});
import creds from "../config/goc-form-ca6452f3be85.json";
import common from "../lib";
import { firestoreDB } from "../firebase";
const ridesRef = firestoreDB.collection("rides");

export const getRidesSignup = (req, res) => {
  res.render("ridesSignup.ejs", {
    title: "Signup for a Ride"
  });
};

export const getRides = (req, res) => {
  const data = [];
  ridesRef.doc("current_rides").collection("cars").get().then((snapshot) => {

    if (snapshot.size != 0){
      snapshot.forEach(doc => {
        const car = doc.data().car;

        if (car) {
          var driver = car[0].name;
          let riders = [];
          for (var i = 1; i < car.length; i++) {
            riders.push(car[i].name);
          }
          const toAppend = {
            driver,
            riders
          };
          data.push(toAppend);
        }
      })
      res.render("rides.ejs", {
        title: "Rides",
        cars: data
      });
    } else {
      res.render("rides.ejs", {
        title: "Rides",
        cars: null
      });
    }}
  );
};


export const updateRides = async (req, res) => {
  const re1 = /https:\/\/docs\.google\.com\/spreadsheets\/d\//g;
  const re2 = /\/.*/g;
  const sheetID = req.body.sheetURL.replace(re1, "").replace(re2, "");
  const ridesSheet = new GoogleSpreadsheet(sheetID);
  const date = moment(req.body.date).unix();
  const emailMessage = req.body.emailMessage ? req.body.emailMessage : "";

  deleteRides();
  const snapshot = await firestoreDB.collection('rides').doc('current_rides').get();
  if (snapshot.exists) {
    await ridesRef.doc("current_rides").update({
      date,
      emailMessage
    });
  }
  else{
    await ridesRef.doc("current_rides").set({
      date,
      emailMessage
    });
  }

  const newRideRef = ridesRef.doc("current_rides").collection("cars");

  var ride = {};
  ride.cars = {};
  ride.date = date;
  ride.emailMessage = req.body.emailMessage ? req.body.emailMessage : "";
  ridesSheet.useServiceAccountAuth(creds, err => {
    if (err) {
      return;
    }
    ridesSheet.getRows(1, {}, async (err, rows) => {
      if (err) {
        return;
      }
      for (let row of rows) {
        if (row.ridername !== "") {
          let carKey = _.findKey(
            ride.cars,
            item => item[0]["name"] == row.drivername
          );
          if (carKey) {
            // firebase
            const newRiderRef = await newRideRef.doc(carKey).update({
              car: FieldValue.arrayUnion({
                uid: row.rideruid || "",
                name: row.ridername || "",
                email: row.rideremail || "",
                phoneNumber: row.riderphone || "",
                location: row.riderpickuplocation || ""
              })
            });
            // local
            ride.cars[carKey].push({
              uid: row.rideruid,
              morning: row.ridermorning,
              staying: row.riderstaying,
              evening: row.riderevening,
              name: row.ridername,
              email: row.rideremail,
              phoneNumber: row.riderphone,
              location: row.riderpickuplocation
            });
          } else if (row.drivername && row.ridername) {
            // firebase
            const car = {
              car: [
                {
                  uid: row.driveruid || "",
                  name: row.drivername || "",
                  email: row.driveremail || "",
                  phoneNumber: row.driverphone || "",
                  comment: row.postedcomment || "",
                  sendEmail: row.sendemail ? row.sendemail.toLowerCase() == "yes" : false
                },
                {
                  uid: row.rideruid || "",
                  morning: row.ridermorning,
                  staying: row.riderstaying,
                  evening: row.riderevening,
                  name: row.ridername || "",
                  email: row.rideremail || "",
                  phoneNumber: row.riderphone || "",
                  location: row.riderpickuplocation || ""
                }
              ],
            }
            let newCarRef = {};
            if (row.drivername == "IN PROGRESS"){
              await newRideRef.doc("0").set(car);
              newCarRef.id = "0";
            }
            else {
              newCarRef = await newRideRef.add(car);
            }
            ride.cars[newCarRef.id] = [
              {
                uid: row.driveruid || "",
                name: row.drivername,
                email: row.driveremail,
                phoneNumber: row.driverphone,
                comment: row.postedcomment,
                sendEmail: row.sendemail ? row.sendemail.toLowerCase() == "yes" : false
              },
              {
                uid: row.rideruid || "",
                morning: row.ridermorning,
                staying: row.riderstaying,
                evening: row.riderevening,
                name: row.ridername,
                email: row.rideremail,
                phoneNumber: row.riderphone,
                location: row.riderpickuplocation,
              },
            ];
            carKey = newCarRef.id
          }

          //set the current rider id to be current car id
          if (row.rideruid){
            await firestoreDB.collection("users").doc(row.rideruid).update({currentCar: carKey}).catch(err => console.log("error message: ", err.message));
          }
        }
      }
      _.filter(ride.cars, car => (car[0].sendEmail)).forEach(car => {
        sendDriverEmail(car, date, emailMessage)
      });
      res.redirect("/rides");
    });
  });
};

const deleteRides = () => {
  var collectionRef = ridesRef.doc("current_rides").collection("cars");
  collectionRef.get().then((snapshot) => {
    if (snapshot.size == 0){
      return;
    }

    //delete all the documents in the collection
    snapshot.docs.forEach((doc) =>{
      doc.ref.delete();
    })
  })
}

const sendDriverEmail = (car, date, emailMessage) => {
  if (
    car.length > 1 &&
    car[0].email &&
    date &&
    emailMessage
  ) {
    const name = car[0].name;
    const carRiders = car.slice(1);
    const formattedDate = moment.unix(date).format("MM/DD");
    const message =
    "Hi " +
    name +
    "! :)\n\n" +
    "Thanks for offering to drive this " +
    date +
    "!\n\n" +
    "Here are your riders:\n\n" +
    _.map(carRiders, function(r) {
      return r.name + ": " + r.phoneNumber + " | " + r.location;
    }).join("\n") +
    "\n\n" +
    (car.comment && car.comment != "" ? "Comments: " + car.comment : "") +
    "\n\n" +
    (emailMessage ? emailMessage + "\n\n" : "") +
    "Thanks!\n" +
    "Rides Team\n" +
    "Ashlynn McGuff and Matthew Lin\n" +
    "gocrides@gmail.com | (310) 694-5216";
    const riders = _.map(carRiders, function(r) {
      let times = "";
      if (r.morning === "m") {
        times += "Morning ";
      }
      if (r.evening === "e") {
        times += "Evening ";
      }
      if (r.staying === "s") {
        times += "Staying ";
      }
      return `${
        r.name
      }<br/>☎️ ${r.phoneNumber} 📍${r.location}<br/>${times}<br/><br/>`;
    });
    const riderString = riders.join(" "); // remove comma delimiters from riders array
    var data = {
      to: car[0].email,
      bcc: "gocrides@gmail.com",
      from: "Grace on Campus Rides Team <gocrides@gmail.com>",
      subject: "Rides " + formattedDate,
      text: message,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml"><head> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> <title>Rides</title> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style></head><body style="width: 100% !important; height: 100%; margin: 0; line-height: 1.4; background-color: #F2F4F6; color: #3a3f4b; -webkit-text-size-adjust: none; box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#F2F4F6"> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style> <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#f9f9f9"> <tr> <td align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 24px 0; border-radius: 3px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; width: 100%;"> <tr> <td class="email-masthead" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px 0; word-break: break-word;" align="center"> <a href="https://example.com" class="email-masthead_name" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;"> <img style="margin: 30px 0; max-width: 200px; text-align: center" src="https://res.cloudinary.com/goc/image/upload/v1507845999/Fill-16_ozm9l3.png"/> </a> </td></tr><tr> <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #ecedef; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #ecedef; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word;" bgcolor="#FFFFFF"> <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF"> <tr> <td class="content-cell" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px; word-break: break-word;"> <p style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: normal; margin-top: 0;" align="left">Greetings ${name},</p><p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin: 0;" align="left">Thank you for offering to drive this ${formattedDate}! We greatly appreciate your service to the body.</p><br/> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">Here are your riders:</p><table class="attributes" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid rgba(0,0,0,.125); border-radius: 5px;box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 0 21px;"> <tr> <td class="attributes_content" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 16px; word-break: break-word;" bgcolor="#fff"> <table width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;"> <tr> <td class="attributes_item" style="color:#3a3f4b; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; word-break: break-word;font-size:18px"> <span style="font-size:14px; letter-spacing: 0.5px; color:#848895">Riders</span> <br/>${riderString}</td></tr></table> </td></tr></table> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">${
        emailMessage ? emailMessage + "\n\n" : ""
      }</p><p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">Thanks! <br/>Rides Team<br/> Ashlynn McGuff and Matthew Lin<br/> gocrides@gmail.com | (310) 694-5216 </p></td></tr></table> </td></tr><tr> <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;"> <tr> <td class="content-cell" align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px 35px 0; word-break: break-word;"> <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5em; margin-top: 0;" align="center">© 2017 <a style="text-decoration: none;color:#ae956b" href="https://graceoncampus.org">Grace on Campus</a> <br/>A Ministry of <a style="text-decoration: none;color:#ae956b" href="https://gracechurch.org">Grace Community Church</a> </p></td></tr></table> </td></tr></table> </td></tr></table></body></html>`
    };
    mailgun.messages().send(data); // send email to driver
  }
};
