import passport from 'passport';
import CustomStrategy from 'passport-custom';
import admin from 'firebase-admin';
import moment from 'moment';
import init from './init';

const invitedRef = admin.firestore().collection('invitedUsers');
const usersRef = admin.firestore().collection('users');

passport.use('signup', new CustomStrategy((req, done) => {
  const {
    firstName,
    lastName,
    number,
    birthday,
    gradyear,
    major,
    homeChurch,
    address,
    password,
  } = req.body;

  const emailStr = req.body.email;
  const email = emailStr.toLowerCase();
  const permissions = {
    admin: 0,
    carousel: 0,
    sermons: 0,
    events: 0,
    classes: 0,
    rides: 0,
  };
  const bday = (birthday && birthday !== '')
    ? moment(birthday, 'MM/DD/YYYY').unix()
    : '';
  const usr = {
    email: email || '',
    firstName: firstName || '',
    lastName: lastName || '',
    phoneNumber: number || '',
    birthday: bday || '',
    grad: gradyear || '',
    major: major || '',
    homeChurch: homeChurch || '',
    address: address || '',
    permissions,
  };

  usersRef.where('email', '==', email).get().then((snapshot) => {
    if (!snapshot.empty) {
      return done('That email is already registered.', false);
    }
    invitedRef.where('email', '==', email).get().then((snapshot2) => {
      if (!snapshot2.empty) {
        admin.auth().createUser({
          email,
          password,
        }).then((user) => {
          usersRef.doc(user.uid).set(usr)
            .then(() => { // add the new user
              snapshot2.forEach((doc) => {
                invitedRef.doc(doc.id).delete().then(() => done(null, user.uid));
              });
            });
        }).catch(error => done(error.message, false));
      } else {
        return done(
          `That email has not been invited.
              Email gocwebteam@gmail.com to get an invite.`,
          false,
        );
      }
    });
  });
}));
init();
export default passport;
