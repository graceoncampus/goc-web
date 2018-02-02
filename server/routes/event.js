import async from 'async';
import moment from 'moment';
import marked from 'marked';
import admin from 'firebase-admin';
import cloudinary from 'cloudinary';
cloudinary.config({
  cloud_name: 'goc',
  api_key: '328772992973127',
  api_secret: '4Fsxb3XmB4IEpMTcPgj6cqIr3_w'
});
import formidable from 'formidable';
import { replaceURLsWithLinks } from '../lib';

var firebaseDB = admin.database();
var eventsRef = firebaseDB.ref("events");
import _ from 'lodash'
export const getEvents = async (req, res) => {
  const events = await admin.database().ref('/events').once('value');
  const finalEvents = []
  const keyz = _.keys(events.val())
  const eventz = _.values(events.val())
  let i = 0;
  for (let event of eventz) {
      let push = event
      push.summary = replaceURLsWithLinks(event.summary);
      push.id = keyz[i]
      i++;
      push.formattedDate =  moment.unix(event.startdate).format('MMMM D') === moment.unix(event.enddate).format('MMMM D') ?
      moment.unix(event.startdate).format('MMMM Do, h:mm A') + " - " + moment.unix(event.enddate).format('h:mm A')
      :
      moment.unix(event.startdate).format('MMMM Do')  + " - " + moment.unix(event.enddate).format('MMMM Do')
      finalEvents.push(push)
  }
  res.render('events.ejs', {
      events: finalEvents,
      title: 'Events'
  });
};
export const getEditEventById = async (req, res) => {
  var eventid = req.param("eventid");
  const snapshot = await eventsRef.child(eventid).once('value');
  let event = snapshot.val();

  event.start = moment.unix(event.startdate).format('YYYY-MM-DDThh:mm')
  event.end = moment.unix(event.enddate).format('YYYY-MM-DDThh:mm')
  event.formattedDate =  moment.unix(event.startdate).format('MMMM D') === moment.unix(event.enddate).format('MMMM D') ?
  moment.unix(event.startdate).format('MMMM Do, h:mm A') + " - " + moment.unix(event.enddate).format('h:mm A')
  :
  moment.unix(event.startdate).format('MMMM Do')  + " - " + moment.unix(event.enddate).format('MMMM Do')
  event.id = eventid
  res.render('editevent.ejs', {
    title: 'Edit Event',
    event
  });
};
export const postEditEventById = async (req, res) => {
  var eventid = req.param("eventid");
  var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
    const path = files.background.path
    const title = fields.title;
    const banner = fields.banner
    const location = fields.location;
    const startdate = Date.parse(fields.startDate)/1000
    const enddate = Date.parse(fields.endDate)/1000
    const summary = fields.summary;
    if (path.size) {
      cloudinary.v2.uploader.upload(path, function(e, result) {
        eventsRef.child(eventid).set({
          title,
          location,
          bannerURI: result.secure_url,
          mobileImage: result.secure_url,
          summary,
          startdate,
          enddate
        }).then(() => {
          res.redirect('/events');
        })
      });
    }
    else {
      eventsRef.child(eventid).set({
        title,
        location,
        bannerURI: banner,
        mobileImage: banner,
        summary,
        startdate,
        enddate
      }).then(() => {
        res.redirect('/events');
      })
    }
	});
};
export const getEventById = (req, res) => {
  var eventid = req.param("eventid");
  // EventDB.findOne({firebaseID: eventid}, function (err, result) {
  //   if (err || !result) {
  //     res.render('error.ejs', {title: 'Error', message: "Specified event does not exist."});
  //   }
  //   else {
  //     let formattedDate =  moment.unix(result.startdate).format('MMMM Do') === moment.unix(result.enddate).format('MMMM Do') ?
  //       moment.unix(result.startdate).format('MMMM Do, h:mm A') + " - " + moment.unix(result.enddate).format('h:mm A')
  //       :
  //       moment.unix(result.startdate).format('MMMM Do')  + " - " + moment.unix(result.enddate).format('MMMM Do')
  //     result.formattedDate = formattedDate;
  //     result.formattedText = marked(result.summary);
  //     res.render('event.ejs', {
  //       title: 'Error',
  //       event: result
  //     });
  //   }
  // });
};
export const postDeleteEventById = (req, res) => {
  const eventid = req.param("eventid");
  eventsRef.child(eventid)
    .remove()
    .then(function () {
      res.redirect('/events');
    }, function (error) {
      res.redirect('/events');
    });
};
export const postEvent = async(req, res) => {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
	  if (files.background.size) {
      const path = files.background.path
      const title = fields.title;
      const location = fields.location;
      const startdate = Date.parse(fields.startDate)/1000
      const enddate = Date.parse(fields.endDate)/1000
      const summary = fields.summary;

      cloudinary.v2.uploader.upload(path, function(e, result) {
        var newEventRef = eventsRef.push({
          title,
          location,
          bannerURI: result.secure_url,
          mobileImage: result.secure_url,
          summary,
          startdate,
          enddate
        }).then(() => {
          res.redirect('/events');
        })
      });
    } else {
      res.render('error.ejs', {
        title: 'Error',
        message: "You must provide an image"
      });
    }
	});
};
