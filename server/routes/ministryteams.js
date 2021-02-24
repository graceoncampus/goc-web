import admin from 'firebase-admin';

const { FieldValue } = admin.firestore; // need this in order to use arrayUnion and arrayRemove
const teamRef = admin.firestore().collection('ministryTeams'); // gets firestore reference to 'classes' subcollection

/*
* getClasses gets all the classes that are in the firestore database
* and relevant information and sends it to be displayed
* Used when accessing the graceoncampus.org/classes webpage
*/
export const getTeams = async (req, res) => {
  try {
    const teams = await teamRef.get();
    const endTeams = [];
    if (!teams.empty) {
      teams.forEach((doc) => {
        if (doc.exists) {
          const team = doc.data();
          endTeams.push(team);
        }
      });
    }
    res.render('ministryteams.ejs', {
      title: 'Ministry Teams',
      teams: endTeams,
    });
  } catch (e) {
    res.status(500).json(e);
  }
};
