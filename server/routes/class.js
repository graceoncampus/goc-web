import { lookupByUID } from '../lib';
import _ from 'lodash';
import moment from 'moment';
import marked from 'marked';
import { firestoreDB } from "../firebase"
import formidable from 'formidable';

const FieldValue = require('firebase').firestore.FieldValue; //need this in order to use arrayUnion and arrayRemove

var classesRef = firestoreDB.collection("classes"); //gets firestore reference to 'classes' subcollection

/*
* getClasses gets all the classes that are in the firestore database
* and relevant information and sends it to be displayed
* Used when accessing the graceoncampus.org/classes webpage
*/
export const getClasses = (req, res) => {
    classesRef.get().then(snapshot => { // gets and waits for all the information in classesRef
        const classes = []; // array of all classes
        snapshot.forEach(doc => { // each class is a document inside the subcollection 'classes'
          let iClass;
          if(doc.exists){ // check if document(an individual class) exists
              iClass = doc.data(); // get class information

              // get relevant data and set fields in iClass, then push individual class to be part of array classes
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
              //add individual class to list of classes
              classes.push(iClass);
          }
        });
        //render
        res.render('classes.ejs', {
          title: 'Classes',
          classes
        });
    });
};

/*
* getEditClassById accesses a specific class based on their classID and passes
* the information to be rendered when accessing graceoncampus.org/c/edit/[classID]
* Problems with getEditClassById:
*             - the dates aren't displayed in the edit page; have to manually reenter
*               even if not changing the date information
*                 - probably a conflicting Date format used between TimeStamp and what
*                   used in editclass.ejs ??
*/
export const getEditClassById = (req, res) => {
    const { classID } = req.params; // get classID
    classesRef
      .doc(classID)
      .get()
      .then(doc => { //doc is the specific class information
          let Class;
          if(doc.exists){
              Class = doc.data();
              // ***************possibly might need to format these dates
              //Class.startDate = moment.unix(Class.startDate).format('YYYY-MM-DDThh:mm')
              //Class.endDate = moment.unix(Class.endDate).format('YYYY-MM-DDThh:mm')
              //Class.deadline = moment.unix(Class.deadline).format('YYYY-MM-DDThh:mm')
              Class.id = classID
              //render
              res.render('editclass.ejs', {
                  title: 'Edit Class',
                  Class
              });
          }
      });
};

/*
* postEditClassById parses through the information given in an edit class
* and edits that page. similar to postClass but with an already existing ID
***********possibility of helper function that applies to both of them
*/
export const postEditClassById = (req, res) => {
    const { classID } = req.params;
    //get information filled out in form:
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
          //create new class with this information
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
            //redirect to classes if successful
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
    // create a new map with uid and full name
    // this is the format students are stored in their class student array
    const unionVal = {
      'uid': uid,
      'name': fullName
    };
    classesRef.doc(classKey).update({
      openSpots: newOpenSpots,
      students: FieldValue.arrayUnion(unionVal) //appends to array if value doesn't exist already
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

/*A function that doesn't do much*/
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

/*A function that doesn't do much*/
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

/*
* postClass gets information and creates a new class from that information
***********possibility of helper function that applies to both this and postEditClassById
*/
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
        var newClassRef = classesRef.doc(); //create new document under 'classes'
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
            //redirect to /classes if successful
            res.redirect('/classes');
        })
    });
};

/*
* getViewClassRosterById gets the information of the users enrolled in that class
* 1. collect user uids
* 2. use user uids to find each user information
***************INEFFICIENT SEARCH: currently looping through every single user and comparing every uid
***********************************there definitely should be an quicker way to do it
*/
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
          /*start of area that should be changed*/
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
          /*end of area that should be changed*/
      }else{
        console.log("FAILED RIP RIP RIP");
      }
    }).catch(err=> console.log('hi', err.message));
};

/*
* A function that doesn't do much
* **********might be needed to implement if we add a delete button
*/
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
