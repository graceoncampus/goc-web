import { lookupByUID } from '../lib';
import async from 'async';
import _ from 'lodash';
import moment from 'moment';
import marked from 'marked';
import admin from 'firebase-admin';
var firebaseDB = admin.database();
var classesRef = firebaseDB.ref("classes");

export const getClasses = async (req, res) => { 
    const classes = await admin.database().ref('/classes').once('value');
    const finalClasses = []
    const claz = _.values(classes.val())
    const keys = _.keys(classes.val());
    let i = 0;
    for (let c of claz) {
        let push = c
        const currentUid = req.user.uid
        const allStudents = _.values(c.students);
        push.isEnrolled = false;
        push.id = keys[i]
        i++;
        push.dates = moment.unix(c.startDate).format('MMMM Do')+ ' - ' +moment.unix(c.endDate).format('MMMM Do');
        for (const student in allStudents) {
          if (allStudents.hasOwnProperty(student)) {
            if (currentUid === allStudents[student].uid) {
              push.isEnrolled = true;
            }
          }
        }
        push.instructor = await lookupByUID(c.instructorUID)
        push.deadlineString = moment.unix(c.deadline).format('MMMM Do')
        finalClasses.push(push)
    }
    res.render('classes.ejs', {
        classes: finalClasses,
        title: 'Classes'
    });
};

export const getEditClassById = (req, res) => {
    var classID = req.param("classID");
    // ClassDB.findOne({firebaseID: classID}, function (err, Class) {
    //     if (err) {
    //         res.render('error.ejs', {title: 'Error', message: "Specified class does not exist."});
    //     }
    //     else {
    //         UserDB.findOne({firebaseID: Class.instructorUID}, function(err, instructor) {
    //             Class.instructor = instructor;
    //             res.render('editclass.ejs', {
    //                 title: 'Edit Class', 
    //               Class: Class,
    //               inputDeadline: moment.tz(Class.deadline * 1000, req.cookies.timezone).format("YYYY-MM-DDTHH:mm:ss"),
    //               inputEnd: moment.tz(Class.endDate * 1000, req.cookies.timezone).format("YYYY-MM-DDTHH:mm:ss")
    //             });
    //         });
    //     }
    // });
};
export const postEditClassById = function () {
    return (req, res) => {
        var classID = req.param("classID");
        // ClassDB.findOne({firebaseID: classID}, function (err, Class) {
        //     UserDB.findOne({email: req.body.instructorEmail}, function(e, instructor) {
        //         if (req.body.title) {
        //             Class.title = req.body.title;
        //         }
        //         if (!e && req.body.instructorEmail) {
        //             Class.instructorUID = instructor.firebaseID;
        //         }
        //         if (req.body.location) {
        //             Class.location = req.body.location;
        //         }
        //         if (req.body.details) {
        //             Class.details = req.body.details;
        //         }
        //         if (req.body.time) {
        //             Class.classTime = req.body.time;
        //         }
        //         if (req.body.endDate) {
        //             Class.endDate = common.timezonify(req.body.endDate, req.cookies.timezone);
        //         }
        //         if (req.body.capacity) {
        //             Class.totalSpots = req.body.capacity;
        //         }
        //         if (req.body.deadline) {
        //             Class.deadline = common.timezonify(req.body.deadline, req.cookies.timezone);
        //         }

        //         Class.save(function () {
        //             classesRef.child(Class.firebaseID)
        //               .update({
        //                 title: Class.title || "",
        //                 classTime: Class.classTime || "",
        //                 location: Class.location || "",
        //                 endDate: Class.endDate || 0,
        //                 details: Class.details || "",
        //                 instructorUID: Class.instructorUID || "",
        //                 enrolledUsers: Class.enrolledUsers || [],
        //                 totalSpots: Class.totalSpots || 0,
        //                 openSpots: Class.openSpots || 0,
        //                 deadline: Class.deadline || 0
        //               })
        //               .then(function () {
        //                 res.redirect('/c/' + Class.firebaseID);
        //               }, function (error) {
        //                 res.redirect('/c/' + Class.firebaseID);
        //               });
        //         });
        //     });
        // });
    }
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
export const postClass = function() {
    return (req, res) => {
        if (req.body.title) {
            // var newClass = new ClassDB();
            // UserDB.findOne({email: req.body.instructorEmail}, function(err, instructor) {
            //     newClass.title = req.body.title;
            //     if (!err && instructor) {
            //         newClass.instructorUID = instructor.firebaseID;
            //     }
            //     newClass.location = req.body.location;
            //     newClass.classTime = req.body.time;
            //     newClass.endDate = common.timezonify(req.body.endDate, req.cookies.timezone);
            //     newClass.details = req.body.details;
            //     newClass.deadline = common.timezonify(req.body.deadline, req.cookies.timezone);
            //     newClass.totalSpots = req.body.capacity;
            //     newClass.openSpots = req.body.capacity;
            //     newClass.enrolledUsers = [];

            //     var newClassRef = classesRef.push({
            //       title: newClass.title || "",
            //       classTime: newClass.classTime || "",
            //       location: newClass.location || "",
            //       endDate: newClass.endDate || 0,
            //       details: newClass.details || "",
            //       instructorUID: newClass.instructorUID || "",
            //       enrolledUsers: [],
            //       totalSpots: newClass.totalSpots || 0,
            //       openSpots: newClass.openSpots || 0,
            //       deadline: newClass.deadline || 0
            //     });

            //     newClass.firebaseID = newClassRef.key;

            //     newClass.save(function () {
            //         res.redirect('/c/' + newClass.firebaseID);
            //     });
            // });
        }
        else {
            res.redirect('/classes');
        }
    };
};
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
