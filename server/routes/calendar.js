import admin from 'firebase-admin';
const calendarRef = admin.firestore().collection('calendar');

//initates calendar and renders calendar.ejs
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

export const getCalendarResources = (req, res) => {
  res.status(200);
  res.json({ key: process.env.CALENDAR_API_KEY, email: process.env.CALENDAR_EMAIL });
  res.end();
}