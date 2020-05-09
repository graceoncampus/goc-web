import GoogleSpreadsheet from 'google-spreadsheet';
import { promisify } from 'util';
import admin from 'firebase-admin';
import creds from '../config/goc-form-ca6452f3be85.json';

const calendarRef = admin.firestore().collection('calendar');

export const getCalendar = (req, res) => {
  calendarRef.doc('events').get().then((doc) => {
    let events = {};
    if (doc.exists) {
      events = doc.data();
      res.render('calendar.ejs', {
        title: 'Calendar',
        events,
      });
    }
  });
};

export const updateCalendar = async (req, res) => {
  const re1 = /https:\/\/docs\.google\.com\/spreadsheets\/d\//g;
  const re2 = /\/.*/g;
  const sheetID = req.body.sheetURL.replace(re1, '').replace(re2, '');
  const calendarDoc = new GoogleSpreadsheet(sheetID);
  const events = {};
  try {
    await promisify(calendarDoc.useServiceAccountAuth)(creds);
    await calendarDoc.loadInfo();
    const calendarSheet = calendarDoc.sheetsByIndex[0];
    const rows = await promisify(calendarSheet.getRows)(1);
    const eventHeaders = ['event1', 'event2', 'event3'];
    rows.forEach((row) => {
      events[row.startdate] = {};
      let count = 0;
      eventHeaders.forEach((header) => {
        if (row[header].length > 1) {
          events[row.startdate][count] = {
            text: row[header], time: row[`${header}time`], endtime: row[`${header}timeend`], location: row[`${header}location`], end_date: row.enddate, type: row[`${header}type`], description: row[`${header}description`],
          };
          count += 1;
        }
      });
    });
    calendarRef.doc('events').delete();
    await calendarRef.doc('events').set(events);
    res.redirect('/calendar');
  } catch (e) {
    res.status(500).json(e);
  }
  res.status(500).json('error');
};
