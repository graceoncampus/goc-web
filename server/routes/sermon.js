import moment from 'moment';
import admin from 'firebase-admin';

// const Parser = require('rss-parser');
// const parser = new Parser();
const sermonRef = admin.firestore().collection('sermons');

export const getSermons = async (req, res) => {
  let sermons = [];
  try {
    const snapshot = await sermonRef.orderBy('date', 'desc').get();
    if (!snapshot.empty) {
      sermons = snapshot.docs.map(s => ({
        datestring: moment(s.data().date).format('M/D/YY'),
        ...s.data(),
      }));
    }
  } catch (e) {
    console.error(e);
  }
  res.render('sermons.ejs', {
    title: 'Sermons',
    sermons,
  });
};
