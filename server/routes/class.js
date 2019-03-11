﻿import { lookupByUID } from '../lib';
import async from 'async';
import _ from 'lodash';
import moment from 'moment';
import marked from 'marked';
import { firestoreDB } from "../firebase"
import formidable from 'formidable';
const FieldValue = require('firebase').firestore.FieldValue;

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
              iClass.dates = moment(iClass.startDate).format('MMMM Do') + ' - ' + moment(iClass.endDate).format('MMMM Do');
              iClass.deadlineString = moment(iClass.deadline).format('MMMM Do');
              for (const student in allStudents) {
                if (allStudents.hasOwnProperty(student)) {
                  if (currentUid === allStudents[student].uid) {
                     iClass.isEnrolled = true;
                  }
                }
              }
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
              //Class.startDate = moment.unix(Class.startDate).format('YYYY-MM-DDThh:mm')
              //Class.endDate = moment.unix(Class.endDate).format('YYYY-MM-DDThh:mm')
              //Class.deadline = moment.unix(Class.deadline).format('YYYY-MM-DDThh:mm')
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
          const startDate = fields.startDate;
          const day = fields.day;
          const deadline = fields.deadline;
          const endDate = fields.endDate;
          const instructor = fields.instructor;
          const location = fields.location;
          const totalSpots = fields.totalSpots;
          const openSpots = totalSpots - Number(fields.numStudents);
          const details = fields.details;
          classesRef.doc(classID).update({
            "title": title,
            "classTime": classTime,
            "startDate": startDate,
            "day": day,
            "deadline": deadline,
            "endDate": endDate,
            "instructor": instructor,
            "location": location,
            "totalSpots": totalSpots,
            "openSpots": openSpots,
            "details": details
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
/*
enrollStudent gets the first and last names of the user as well as their uid.
It appends a map of the student uid and name to the specific class and
updates the number of open spots
*/
export const enrollStudent = (req, res) => {
    const classKey = req.body.id
    const numSpots = parseInt(req.body.openSpots)
    const newOpenSpots = numSpots - 1;
    const fullName = req.user.firstName + " " + req.user.lastName;
    const uid = req.user.uid;
    const unionVal = {
      'uid': uid,
      'name': fullName
    };
    classesRef.doc(classKey).update({
      openSpots: newOpenSpots,
      students: FieldValue.arrayUnion(unionVal)
    }).then(() => {
      console.log("success");
    }).catch(err => console.log("error message: ", err.message));
    res.json('success')
};

/*
unenrollStudent gets the user name and uid
It makes sure the user is on the list and then takes it off the student list
*/
export const unenrollStudent = (req, res) => {
    const classKey = req.body.id
    const numSpots = parseInt(req.body.openSpots)
    const newOpenSpots = numSpots + 1;
    const fullName = req.user.firstName + " " + req.user.lastName;
    const uid = req.user.uid;
    const unionVal = {
      'uid': uid,
      'name': fullName
    };
    classesRef.doc(classKey).update({
      openSpots: newOpenSpots,
      students: FieldValue.arrayRemove(unionVal)
    }).then(() => {
      console.log("success");
    }).catch(err => console.log("error message: ", err.message));
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

export const postClass = (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        const title = fields.title;
        const location = fields.location;
        const instructor = fields.instructorName;
        const openSpots = fields.capacity;
        const totalSpots = fields.capacity;
        const day = fields.day;
        const classTime = fields.time;
        const startDate = fields.startDate;
        const deadline = fields.deadline;
        const endDate = fields.endDate;
        const details = fields.details;
        const students = [];
        var newClassRef = classesRef.doc();
        newClassRef.set({
            title: title,
            location: location,
            instructor: instructor,
            openSpots: openSpots,
            totalSpots: totalSpots,
            day: day,
            classTime: classTime,
            deadline: deadline,
            startDate: startDate,
            endDate: endDate,
            details: details,
            students: students
        }).then(() => {
            res.redirect('/classes');
        })
    });
};

/*export const getViewClassRosterById = (req, res) => {
  console.log("function called");
  const classID = req.params;
  classesRef.doc(classID).get().then(doc => {
    let Class;
    if(doc.exists){
      Class = doc.data();
      Class.id = classID
      var enrolledUsers = classUsersFetch(Class.students);
      console.log("HI@&: " + enrolledUsers);
      res.render('viewClassRoster.ejs', {
            title: 'View Class',
            Class
            //Class, enrolledUsers
        });
    }

  })*/

  export const getViewClassRosterById = (req, res) => {
    var classID = req.params.classID;
    var enrolledUsers = [];
    let Class;
    classesRef.doc(classID).get().then(function(snapshot){
      if(snapshot.exists){
          Class = snapshot.data();
          Class.id = classID;
          var uids = [];
          Class.students.forEach(function(element){
            uids.push(element.UID);
          });
          firestoreDB.collection("users").get().then(snapshot =>{
            snapshot.forEach(doc => {
              let student;
              if(doc.exists){
                student = doc.data();
                if (uids.includes(doc.id)){
                  enrolledUsers.push(student);
                }
              }
            })
            res.render('viewClassRoster.ejs', {
              title: 'View Class',
              Class, enrolledUsers
            });
          }).catch(err => console.log(err.message));
      }else{
        console.log("FAILED RIP RIP RIP");
      }
    }).catch(err=> console.log('hi', err.message));
};

//
// async function classUsersFetch(studentUids){
//   //supposed to get by uid
//   //questions to ask:
//   //- how to get uid nicely
//   //- how to do this w/o async
//   firestoreDB.collection("users").get().then(snapshot =>{
//     const studentInfo = [];
//     snapshot.forEach(doc => {
//       let student;
//       if(doc.exists){
//         student = doc.data();
//         if (studentUids.includes(doc.id)){
//           studentInfo.push(student);
//           console.log("doc:" + doc.id);
//         }
//       }
//     })
//     return studentInfo;
//   }).catch(err => console.log(err.message));
// }

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
