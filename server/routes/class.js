import formidable from 'formidable';
import admin from 'firebase-admin';
import moment from 'moment';

const { FieldValue } = admin.firestore; // need this in order to use arrayUnion and arrayRemove
const classesRef = admin.firestore().collection('classes'); // set classesRef to be the classes database


// display classes to /classes
export const getClasses = async (req, res) => {
  try {
    const classes = await classesRef.get();
    const courses = [];
    if (!classes.empty) {
      //extract information from each class and reformat fields if needed
      classes.forEach((doc) => {
        if (doc.exists) {
          const course = doc.data();
          course.isEnrolled = false;
          if (req.user) {
            if (course.students && course.students.find(s => (s.uid === req.user.id || s.UID === req.user.id ))) {
              course.isEnrolled = true;
            }
          }
          course.details = course.details.replace(/\n/g, '<br/>');
          course.id = doc.id;
          course.dates = `${moment(course.startDate.toDate()).format('M/D/YY')} - ${moment(course.endDate.toDate()).format('M/D/YY')}`;
          course.deadlineString = moment(course.deadline.toDate()).format('M/D/YY');
          courses.push(course);
        }
      });
    }
    //send class data to ejs for display
    res.render('classes.ejs', {
      title: 'Classes',
      classes: courses,
    });
  } catch (e) {
    res.status(500).json(e);
  }
};


//ADMINS: display class editing page for /c/edit/[classID]
export const getEditClassById = async (req, res) => {
  const { classID } = req.params; // get classID
  try {
    const courseDoc = await classesRef
      .doc(classID)
      .get();
    if (courseDoc.exists) {
      const course = courseDoc.data();
      course.startDate = course.startDate.toDate().toISOString().replace('.000Z', '');
      course.endDate = course.endDate.toDate().toISOString().replace('.000Z', '');
      course.deadline = course.deadline.toDate().toISOString().replace('.000Z', '');
      course.id = courseDoc.id;
      res.render('editclass.ejs', {
        title: 'Edit Class',
        Class: course,
      });
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

/*
* postEditClassById parses through the information given in an edit class
* and edits that page. similar to postClass but with an already existing ID
***********possibility of helper function that applies to both of them
*/

//ADMINS: post changes after editing class information
export const postEditClassById = (req, res) => {
  const { classID } = req.params;
  // get information filled out in form:
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields) => {
    const {
      title,
      location,
      instructor,
      totalSpots,
      day,
      classTime,
      numStudents,
      startDate,
      deadline,
      endDate,
      details,
    } = fields;
    try {
      await classesRef.doc(classID).update({
        title,
        location,
        instructor,
        openSpots: totalSpots - numStudents,
        totalSpots,
        day,
        classTime,
        deadline: new Date(deadline),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        details,
        students: [],
      });
      //redirect to /classes afterwards
      res.redirect('/classes');
    } catch (e) {
      res.status(500).json(e);
    }
  });
};
export const getClassById = (req, res) => {
  const classID = req.param('classID');
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
export const enrollStudent = async (req, res) => {
  const classKey = req.body.id;
  const numSpots = parseInt(req.body.openSpots, 10);
  const newOpenSpots = numSpots - 1;
  const fullName = `${req.user.firstName} ${req.user.lastName}`;
  const uid = req.user.id;
  // create a new map with uid and full name
  // this is the format students are stored in their class student array
  const unionVal = {
    uid,
    name: fullName,
  };
  try {
    await classesRef.doc(classKey).update({
      openSpots: newOpenSpots,
      students: FieldValue.arrayUnion(unionVal),
    });
    res.json('success');
  } catch (e) {
    res.status(500).json(e);
  }
};

/*
unenrollStudent gets the user name and uid
It makes sure the user is on the list and then takes it off the student list
*/
export const unenrollStudent = async (req, res) => {
  const classKey = req.body.id;
  const numSpots = parseInt(req.body.openSpots, 10);
  const newOpenSpots = numSpots + 1;
  const fullName = `${req.user.firstName} ${req.user.lastName}`;
  const uid = req.user.id;
  const unionVal = {
    uid,
    name: fullName,
  };
  try {
    await classesRef.doc(classKey).update({
      openSpots: newOpenSpots,
      students: FieldValue.arrayRemove(unionVal),
    });
    res.json('success');
  } catch (e) {
    res.status(500).json(e);
  }
};
/*
* postClass gets information and creates a new class from that information
***********possibility of helper function that applies to both this and postEditClassById
*/
export const postClass = (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields) => {
    if (err) res.status(500).json('could not parse fields');
    const {
      title,
      location,
      instructorName: instructor,
      capacity: totalSpots,
      day,
      time: classTime,
      startDate,
      deadline,
      endDate,
      details,
    } = fields;
    try {
      await classesRef.add({
        title,
        location,
        instructor,
        openSpots: totalSpots,
        totalSpots,
        day,
        classTime,
        deadline: new Date(deadline),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        details,
        students: [],
      });
      res.redirect('/classes');
    } catch (e) {
      res.status(500).json(e);
    }
  });
};

/*
* getViewClassRosterById gets the information of the users enrolled in that class
* 1. collect user uids
* 2. use user uids to find each user information
***************INEFFICIENT SEARCH: currently looping through every single user and comparing every uid
***********************************there definitely should be an quicker way to do it
*/
export const getViewClassRosterById = async (req, res) => {
  const { classID } = req.params;
  if (!classID) res.status(500).json('No ID');
  try {
    const classSnapshot = await classesRef.doc(classID).get();
    if (classSnapshot.exists) {
      const course = classSnapshot.data();
      course.id = classSnapshot.id;
      course.startDate = course.startDate.toDate().toString().slice(4, -42);
      course.endDate = course.endDate.toDate().toString().slice(4, -42);
      course.deadline = course.deadline.toDate().toString().slice(4, -42);
      const userDataPromises = course.students.reduce((result, student) => {
        if (student.UID) result.push(admin.firestore().collection('users').doc(student.UID).get());
        return result;
      }, []);
      const userData = await Promise.all(userDataPromises);
      userData.forEach((student) => {
        const { id } = student;
        const data = student.data();
        const idx = course.students.findIndex(s => s.UID === id);
        if (idx > -1) {
          course.students[idx] = {
            ...course.students[idx],
            ...data,
          };
        }
      });
      res.render('viewClassRoster.ejs', {
        title: 'View Class',
        course,
      });
    } res.status(500).json('No such class exists');
  } catch (e) {
    res.status(500).json(e);
  }
};

/*
* Deletes the class given an id
*/
export const postDeleteClassById = async (req, res) => {
  const { classID } = req.params;
  if (!classID) res.status(500).json('No ID');
  try {
    await classesRef.doc(classID).delete();
    res.json('success');
  } catch (e) {
    res.status(500).json(e);
  }
};
