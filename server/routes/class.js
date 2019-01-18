import { lookupByUID } from '../lib';
import async from 'async';
import _ from 'lodash';
import moment from 'moment';
import marked from 'marked';
import { firestoreDB } from "../firebase"
import formidable from 'formidable';

var classesRef = firestoreDB.collection("classes");

export const getClasses = (req, res) => {
    classesRef.get().then(snapshot => {
        const classes = [];
        snapshot.forEach(doc => {
          let iClass;
          if(doc.exists){
              iClass = doc.data();
              const currentUid = req.user.uid
              const allStudents = _.values(iClass.students);
              iClass.details = iClass.details.replace(/\n/g, "<br/>");
              iClass.isEnrolled = false;
              iClass.id = doc.id;
              iClass.startDate = iClass.startDate.toISOString();
              iClass.endDate = iClass.endDate.toISOString();
              iClass.startDate = iClass.startDate.replace(".000Z", "");
              iClass.endDate = iClass.endDate.replace(".000Z", "");
              iClass.dates =
                  moment(iClass.startDate).format('MMMM Do')+ ' - ' + moment(iClass.endDate).format('MMMM Do');
              for (const student in allStudents) {
                if (allStudents.hasOwnProperty(student)) {
                  if (currentUid === allStudents[student].uid) {
                     iClass.isEnrolled = true;
                  }
                }
              }
              iClass.instructor = lookupByUID(iClass.instructorUID)
              iClass.deadlineString = moment.unix(iClass.deadline).format('MMMM Do')
              classes.push(iClass);
          }
        });
        res.render('classes.ejs', {
          title: 'Classes',
          classes
        });
    });
};

export const getEditClassById = (req, res) => {
    const { classID } = req.params;
    classesRef
      .doc(classID)
      .get()
      .then(doc => {
          let Class;
          if(doc.exists){
              Class = doc.data();
              Class.startDate = moment.unix(Class.startDate).format('YYYY-MM-DDThh:mm')
              Class.endDate = moment.unix(Class.endDate).format('YYYY-MM-DDThh:mm')
              Class.deadline = moment.unix(Class.deadline).format('YYYY-MM-DDThh:mm')
              Class.id = classID

              res.render('editclass.ejs', {
                  title: 'Edit Class',
                  Class
              });
          }
      });
};

export const postEditClassById = (req, res) => {
    const { classID } = req.params;
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields){
          const title = fields.title;
          const classTime = fields.classTime;
          const startDate = Date.parse(fields.startDate)/1000;
          const day = fields.day;
          const deadline = Date.parse(fields.deadline)/1000;
          const endDate = Date.parse(fields.endDate)/1000;
          const instructorUID = fields.instructorUID;
          const location = fields.location;
          const totalSpots = fields.totalSpots;
          const openSpots = totalSpots - Number(fields.numStudents);
          const details = fields.details;
          classesRef.child(classID).update({
            title,
            classTime,
            startDate,
            day,
            deadline,
            endDate,
            instructorUID,
            location,
            totalSpots,
            openSpots,
            details
          }).then(() => {
            res.redirect('/classes');
          })
        });
};
export const getClassById = (req, res) => {
    var classID = req.param("classID");
    // ClassDB.findOne({firebaseID: classID}, function (err, result) {
    //     if (err) {
    //         res.render('error.ejs', {title: 'Error', message: "Specified class does not exist." });
    //     }
    //     else {
    //         var instructor = result.instructorUID
    //         if (!common.isAlphaOrParen) {
    //             instructor = common.lookupByUID(result.instructorUID)
    //         }
    //         var enrolled = _.any(result.enrolledUsers, function (v) {
    //             return v === req.user.firebaseID;
    //         });
    //         result.instructor = instructor;
    //         var enrolledUsers = common.joinUserIds(result.enrolledUsers);
    //         res.render('class.ejs', {
    //             Class: result,
    //             enrolled: enrolled,
    //             enrolledUsers: enrolledUsers,
    //             instructor: instructor,
    //             deadlineString: moment.unix(result.deadline).format('MMMM Do'),
    //             formattedText: marked(result.details),
    //             title: result.title,
    //         });
    //     }
    // });
};
export const enrollStudent = async(req, res) => {
    const classKey = req.body.id
    const numSpots = parseInt(req.body.openSpots)
    const newOpenSpots = numSpots - 1;
    await admin.database().ref(`classes/${classKey}/students`).push({ uid: req.user.uid });
    await admin.database().ref(`classes/${classKey}/openSpots`).set(newOpenSpots);
    res.json('success')
};
export const unenrollStudent = async(req, res) => {
    const uid = req.user.uid;
    const classKey = req.body.id
    const numSpots = parseInt(req.body.openSpots)
    const newOpenSpots = numSpots + 1;
    await admin.database().ref(`classes/${classKey}/students`).orderByChild('uid').equalTo(uid).once('child_added', (snapshot) => {
      snapshot.ref.remove();
    });
    await admin.database().ref(`classes/${classKey}/openSpots`).set(newOpenSpots)
    res.json('success')
}
export const unsignupClassById = (req, res) => {
    var classID = req.param("classID");
    // ClassDB.findOneAndUpdate({ firebaseID: classID }, {
    //     $pull: { "enrolledUsers": req.user.firebaseID }
    // }, function (err, c) {
    //     if (err) {
    //         res.render('error.ejs', {title: 'Error', message: "Specified class does not exist." });
    //     }
    //     else {
    //       classesRef.child(classID)
    //         .update({
    //           enrolledUsers: c.enrolledUsers.slice()
    //         })
    //         .then(function () {
    //           res.redirect('/c/' + classID);
    //         }, function (error) {
    //           res.redirect('/c/' + classID);
    //         });
    //     }
    // });
};
export const dropUserFromClass = (req, res) => {
    var classID = req.param("classID");
    var userid = req.param("userid");
    // ClassDB.findOneAndUpdate({firebaseID: classID}, {
    //     $pull: { "enrolledUsers": userid }
    // }, function (err, c) {
    //     if (err) {
    //         res.render('error.ejs', {title: 'Error', message: "Specified class does not exist." });
    //     }
    //     else {
    //         classesRef.child(classID)
    //           .update({
    //             enrolledUsers: c.enrolledUsers
    //           })
    //           .then(function () {
    //             res.redirect('/c/' + classID);
    //           }, function (error) {
    //             res.redirect('/c/' + classID);
    //           });
    //     }
    // });
};

export const postClass = async(req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        const title = fields.title;
        const location = fields.location;
        const instructorUID = fields.instructorName;
        const openSpots = fields.capacity;
        const totalSpots = fields.capacity;
        const day = fields.day;
        const classTime = fields.time;
        const deadline = Date.parse(fields.deadline)/1000;
        const startDate = Date.parse(fields.startDate)/1000;;
        const endDate = Date.parse(fields.endDate)/1000;
        const details = fields.details;
        var newClassRef = classesRef.push({
            title,
            location,
            instructorUID,
            openSpots,
            totalSpots,
            day,
            classTime,
            deadline,
            startDate,
            endDate,
            details
        }).then(() => {
            res.redirect('/classes');
        })
    });
};

export const getViewClassRosterById = async(req, res) => {
  var classID = req.param("classID");
  const snapshot = await classesRef.child(classID).once('value');
  let Class = snapshot.val();
  Class.startDate = moment.unix(Class.startDate).format('MMMM DD');
  Class.endDate = moment.unix(Class.endDate).format('MMMM DD');
  Class.deadline = moment.unix(Class.deadline).format('MMMM DD');
  Class.id = classID;
  var enrolledUsers = await classUsersFetch(Class.students);
  res.render('viewClassRoster.ejs', {
      title: 'View Class',
      Class, enrolledUsers
  });
};

const classUsersFetch = async(studentUids) => {
  var usersRef = await firebaseDB.ref("users").once('value');
  var users = usersRef.val();
  var studentInfo = [];
  if (studentUids != null) {
    var Objkeys = Object.keys(studentUids);
    for (var key in Objkeys) {
        var thisUid = studentUids[Objkeys[key]].uid;
        studentInfo.push(users[thisUid]);
    }
}
  return studentInfo;
}

export const postDeleteClassById = function(req, res) {
    var classID = req.param("classID");
    // ClassDB.findOneAndRemove({firebaseID: classID}, function (err, result) {
    //     if (!err) {
    //       firebaseDB.ref("events/" + result.firebaseID)
    //         .remove()
    //         .then(function () {
    //           res.redirect('/classes');
    //         }, function (error) {
    //           res.redirect('/classes');
    //         });
    //     }
    // });
};
