import moment from 'moment';
import admin from 'firebase-admin';

// const Parser = require('rss-parser');
// const parser = new Parser();

const sermonRef = admin.firestore().collection('sermons');

export const getSermons = async (req, res) => {
  let sermonPageNumber = 1;
  let maxSermonPages = 1; //TEMP VALUE
  const sermonPage = req.params ? req.params.page || 1 : 1;
  const sermonsPerPage = 7;
  let sermons = [];
  let sermonsOnPage = [];
  let sermonSize = 0;
  try {
    const snapshot = await sermonRef.orderBy('date', 'desc').get();
    sermonSize = snapshot.size;
    var sermonCount=0;
    if (!snapshot.empty) {
      sermons = snapshot.docs.map(s => ({
        datestring: moment(s.data().date.toDate()).format('M/D/YY'),
        page:Math.floor(1+(sermonCount++)/sermonsPerPage), //Should be the page on which this sermon is displayed
        ...s.data(),
      }));
    }
    sermonPageNumber = parseInt(sermonPage, 10);
    sermonsOnPage = sermons.filter(sermon => {
      return sermon.page === sermonPageNumber;
    })
    sermons=sermonsOnPage;
    maxSermonPages = Math.ceil(sermonSize/sermonsPerPage);
    } catch (e) {
    console.error(e);
  }
  res.render('sermons.ejs', {
    title: 'Sermons',
    sermons,
    currentPage: sermonPageNumber,
    nextPage: sermonPageNumber < maxSermonPages ? sermonPageNumber + 1 : null,
    previousPage: sermonPageNumber === 1 ? null : sermonPageNumber - 1,
    pages: Array.from(Array(maxSermonPages), (x, i) => i + 1),
  });
};
