import admin from 'firebase-admin';

const passport = require('passport');

const usersRef = admin.firestore().collection('users');

const init = () => {
  passport.serializeUser((uid, done) => {
    done(null, uid);
  });

  passport.deserializeUser((uid, done) => {
    if (uid) {
      usersRef.doc(uid).get()
        .then((usr) => {
          const userz = usr.data();
          userz.id = uid;
          done(null, userz);
        })
        .catch((error) => {
          done(error, null);
        });
    }
  });
};

export default init;
