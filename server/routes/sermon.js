import moment from 'moment';
import admin from 'firebase-admin';

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


export const postSermon = async (req, res) => {
  const {
    title,
    speaker,
    passage,
    date,
    URI,
  } = req.body;
  try {
    await sermonRef.add({
      title,
      speaker,
      passage,
      date: date ? moment(date, 'MM/DD/YYYY').unix() : moment(new Date(), 'MM/DD/YYYY').unix(),
      URI,
    });
    res.redirect('/sermons');
  } catch (e) {
    res.status(500).json(e);
  }
};

export const getEditSermonById = async (req, res) => {
  const { sermonid } = req.params;
  if (!sermonid) res.status(500).json('Invalid id');
  try {
    const sermon = await sermonRef.doc(sermonid).get();
    if (!sermon.exists) res.status(500).json('Sermon with given id does not exist');
    else {
      res.render('editsermon.ejs', {
        title: 'Edit Sermon',
        sermon: sermon.data(),
      });
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

export const postEditSermonById = async (req, res) => {
  const { sermonid } = req.params;
  if (!sermonid) res.status(500).json('Invalid id');
  try {
    const {
      title,
      speaker,
      passage,
      date,
      URI,
    } = req.body;
    await sermonRef.doc(sermonid).update({
      title,
      speaker,
      passage,
      date: date ? moment(date, 'MM/DD/YYYY').unix() : moment(new Date(), 'MM/DD/YYYY').unix(),
      URI,
    });
    res.redirect('/sermons');
  } catch (e) {
    res.status(500).json(e);
  }
};
