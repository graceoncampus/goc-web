import moment from 'moment';
import cloudinary from 'cloudinary';
import formidable from 'formidable';
import admin from 'firebase-admin';
import { promisify } from 'util';
import { replaceURLsWithLinks } from '../lib';

const eventsCollection = admin.firestore().collection('events');

const getEventFromDoc = (doc, rawSummary) => {
  let event;
  if (doc.exists) {
    event = doc.data();
    const startdate = moment(event.startDate.toDate());
    const enddate = moment(event.endDate.toDate());

    event.summary = replaceURLsWithLinks(event.summary);
    event.summary = !rawSummary
      ? event.summary.replace(/\\r/g, '').replace(/\\n/g, '<br/>')
      : event.summary.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
    event.formattedDate = startdate.format('MMMM D') === enddate.format('MMMM D')
      ? `${startdate.format('MMMM Do, h:mm A')} - ${enddate.format('h:mm A')}`
      : `${startdate.format('MMMM Do')} - ${enddate.format('MMMM Do')}`;
    event.id = doc.id;
  }
  return event;
};

export const getEvents = async (req, res) => {
  const events = [];
  const eventsSnapshot = await eventsCollection.get();
  if (!eventsSnapshot.empty) {
    eventsSnapshot.forEach((doc) => {
      events.push(getEventFromDoc(doc));
    });
  }
  res.render('events.ejs', {
    title: 'Events',
    events,
  });
};

export const getEditEventById = (req, res) => {
  const { eventid } = req.params;
  eventsCollection
    .doc(eventid)
    .get()
    .then((doc) => {
      const event = getEventFromDoc(doc, true);
      res.render('editevent.ejs', {
        title: 'Edit Event',
        event,
      });
    });
};

export const postEditEventById = (req, res) => {
  // handle errors
  const { eventid } = req.params;
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    let path;
    if (files && files.background && files.background.path) {
      ({ path } = files.background);
    }
    const {
      title,
      location,
      startDate,
      endDate,
      summary,
    } = fields;

    let uri;
    try {
      if (path) {
        const result = await promisify(cloudinary.v2.uploader.upload)(path);
        if (result && result.secure_url) {
          uri = result.secure_url;
        }
      }
      if (eventid) {
        await eventsCollection
          .doc(eventid)
          .update({
            title,
            location,
            bannerURI: uri,
            mobileImage: uri,
            summary,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          });
      } else {
        await eventsCollection
          .add({
            title,
            location,
            bannerURI: uri,
            mobileImage: uri,
            summary,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          });
      }
      res.redirect('/events');
    } catch (e) {
      res.status(500).json(e);
    }
  });
};

export const postDeleteEventById = async (req, res) => {
  const { eventid } = req.params;
  try {
    await eventsCollection
      .doc(eventid)
      .delete();
    res.redirect('/events');
  } catch (e) {
    res.status(500).json(e);
  }
};


export const getCalendarResources = (req, res) => {
  res.status(200);
  res.json({ key: process.env.CALENDAR_API_KEY, email: process.env.CALENDAR_EMAIL });
  res.end();
}
