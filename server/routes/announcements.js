import moment from 'moment';
import { firestoreDB } from '../firebase'
import _ from 'lodash';
import { replaceURLsWithLinks } from '../lib';

const times = [
  60000, // minute
  3600000, // hour
  86400000, // day
  604800000, // week
  2629800000, // month
  31557600000, // year
];

const past = (value, units) => (`${value} ${units} ago`);

past.f = 'just now';

const singleValue = time => (time === 'hour' ? 'an' : 'a');
export const getAnnouncements = (req, res) => {
    firestoreDB.collection('announcements').get().then((snapshot) => {
    const finalPosts = []
    snapshot.forEach((doc) => {
      let post = doc.data()
      var formattedPost = replaceURLsWithLinks(post.post)
      formattedPost = formattedPost.replace(/\n/g, "<br/>");
      post.Post = formattedPost
      post.date = getRelativeTime(post.date.toDate())
      finalPosts.push(post)
    });
    res.render('announcements.ejs', {
        title: 'Announcements',
        posts: finalPosts
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });
};

export const getRelativeTime = (time) => {
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  let i = 0,
    units,
    value;
  const iMax = times.length;
  for (; i < iMax; i += 1) {
    value = times[i];
    const prev = times[i - 1];
    if (diff < value) {
      switch (i) {
        case 0:
          return past.f;
        case 1:
          units = 'minute';
          break;
        case 2:
          units = 'hour';
          break;
        case 3:
          units = 'day';
          break;
        case 4:
          units = 'week';
          break;
        case 5:
          units = 'month';
          break;
        default:
          break;
      }
      value = Math.floor(diff / prev);
      break;
    } else if (i === 5) {
      units = 'year';
      value = Math.floor(diff / times[i]);
    }
  }
  return value === 1 ? past(singleValue(value), units) : past(value, `${units}s`);
};
