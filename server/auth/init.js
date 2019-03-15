var passport = require('passport');
var admin = require('firebase-admin');
import {
  firestoreDB
} from '../firebase';
const usersRef = firestoreDB.collection("users");

const init = () => {
    passport.serializeUser(function (uid, done) {
        done(null, uid);
    });

    passport.deserializeUser(function (uid, done) {
        usersRef.doc(uid).get()
        .then(function(usr) {
            const userz = usr.data();
            userz.id = uid
            done(null, userz)
        })
        .catch(function (error) {
            done(error, null)
        });
    });
};

export default init;
