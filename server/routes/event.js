import moment from "moment";
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

const getEventFromDoc = doc => {
  let event;
  if (doc.exists) {
    event = doc.data();
    event.summary = replaceURLsWithLinks(event.summary);
    const startdate = moment.unix(event.startDate);
    const enddate = moment.unix(event.endDate);
    event.summary = event.summary.replace(/\\r/g, "").replace(/\\n/g, "<br/>");
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
      const event = getEventFromDoc(doc);
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
    const startdate = Date.parse(fields.startDate) / 1000;
    const enddate = Date.parse(fields.endDate) / 1000;
    const summary = fields.summary;
    if (path.size) {
      cloudinary.v2.uploader.upload(path, function(e, result) {
        eventsCollection
          .doc(eventid)
          .set({
            title,
            location,
            bannerURI: result.secure_url,
            mobileImage: result.secure_url,
            summary,
            startdate,
            enddate
          })
          .then(() => {
            res.redirect("/events");
          });
      });
    }
  });
};

export const postDeleteEventById = (req, res) => {
  const eventid = req.param("eventid");
  eventsCollection
    .doc(eventid)
    .remove()
    .then(() => res.redirect("/events"))
    .catch(() => res.redirect("/events"));
};
