import moment from "moment";
import firebase from 'firebase';
import { firestoreDB } from "../firebase";
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: "goc",
  api_key: "328772992973127",
  api_secret: "4Fsxb3XmB4IEpMTcPgj6cqIr3_w"
});
import formidable from "formidable";
import { replaceURLsWithLinks } from "../lib";
import _ from "lodash";

const eventsCollection = firestoreDB.collection("events");

const getEventFromDoc = (doc, rawSummary) => {
  let event;
  if (doc.exists) {
    event = doc.data();
    const startdate = moment.utc(event.startDate.toDate())
    const enddate = moment.utc(event.endDate.toDate())

    event.summary = replaceURLsWithLinks(event.summary);
    event.summary = !rawSummary
      ? event.summary.replace(/\\r/g, "").replace(/\\n/g, "<br/>")
      : event.summary.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
    event.formattedDate =
      startdate.format("MMMM D") === startdate.format("MMMM D")
        ? startdate.format("MMMM Do, h:mm A") + " - " + enddate.format("h:mm A")
        : startdate.format("MMMM Do") + " - " + enddate.format("MMMM Do");
    event.id = doc.id;
  }
  return event;
};

export const getEvents = (req, res) => {
  eventsCollection.get().then(snapshot => {
    const events = [];
    snapshot.forEach(doc => {
      events.push(getEventFromDoc(doc));
    });
    res.render("events.ejs", {
      title: "Events",
      events
    });
  });
};

export const getEditEventById = (req, res) => {
  const { eventid } = req.params;
  eventsCollection
    .doc(eventid)
    .get()
    .then(doc => {
      const event = getEventFromDoc(doc, true);
      res.render("editevent.ejs", {
        title: "Edit Event",
        event
      });
    });
};

export const postEditEventById = (req, res) => {
  // handle errors
  const { eventid } = req.params;
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    const path = files.background.path;
    const title = fields.title;
    const location = fields.location;
    console.log(fields.startDate)
    const startDate = new Date(Date.parse(fields.startDate));
    const endDate = new Date(Date.parse(fields.endDate));
    const summary = fields.summary;
    console.log(path)
    if (path) {
      cloudinary.v2.uploader.upload(path, function(e, result) {
        if (eventid){
        eventsCollection
          .doc(eventid)
          .set({
            title,
            location,
            bannerURI: result.secure_url,
            mobileImage: result.secure_url,
            summary,
            startDate,
            endDate
          })
          .then(() => {
            res.redirect("/events");
          });
        }
        else{
          eventsCollection
            .add({
              title,
              location,
              bannerURI: result.secure_url,
              mobileImage: result.secure_url,
              summary,
              startDate,
              endDate
            })
            .then(() => {
              res.redirect("/events");
            });
        }
      });
    }
  });
};

export const postDeleteEventById = (req, res) => {
  const eventid = req.param("eventid");
  console.log(eventid)
  eventsCollection
    .doc(eventid)
    .remove()
    .then(() => res.redirect("/events"))
    .catch(() => res.redirect("/events"));
};
