import moment from 'moment';
import admin from 'firebase-admin';
import GoogleSpreadsheet from 'google-spreadsheet';
import creds from '../config/goc-form-ca6452f3be85.json';
import _ from 'lodash';
import {
  firestoreDB
} from '../firebase';

const calendarRef = firestoreDB.collection("calendar");

export const getCalendar = (req, res) => {
  calendarRef.doc("events").get().then((doc) => {
    let events = {}
    if (doc.exists) {
      events = doc.data()
      res.render('calendar.ejs', {
        title: 'Calendar',
        events: events
      });
    }
  })
};

export const updateCalendar = async(req, res) => {
  const re1 = /https:\/\/docs\.google\.com\/spreadsheets\/d\//g;
  const re2 = /\/.*/g;
  const sheetURL = 'https://docs.google.com/spreadsheets/d/1P8MTCwyaKNnEi1UjefgViGZlDmfL7qTJMhbIDZaxlNA';
  // const sheetID = req.body.sheetURL.replace(re1, "").replace(re2, "");
  const sheetID = sheetURL.replace(re1, "").replace(re2, "");
  const calendarSheet = new GoogleSpreadsheet(sheetID);
  const events = {};
  calendarSheet.useServiceAccountAuth(creds, (err) => {
    if (err) {
      return;
    }
    calendarSheet.getRows(1, {}, async(err, rows) => {
      if (err) {
        return;
      }
      const event_headers = [ 'event1','event2','event3']
      for (let row of rows){
        events[row.startdate] = {};
        let count = 0;
        for (let header of event_headers){
          if (row[header].length > 1){
            events[row.startdate][count] = { text: row[header], time: row[header + 'time'], endtime: row[header + 'timeend'],location: row[header + 'location'],end_date: row.enddate, type: row[header + 'type']};
            count = count + 1;
          }
        }
      }
    calendarRef.doc("events").delete();
    const newCalendarRef = await calendarRef.doc("events").set(events)
    res.redirect('/calendar')
  });
  });

};
