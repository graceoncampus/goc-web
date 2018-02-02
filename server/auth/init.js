var passport = require('passport');
var admin = require('firebase-admin');

const init = () => {
    passport.serializeUser(function (uid, done) {
        done(null, uid);
    });

    passport.deserializeUser(function (uid, done) {
        admin.database().ref('users/' + uid).once('value')
        .then(function(usr) {
            const userz = usr.val();
            userz.uid = uid
            done(null, userz)
        })
        .catch(function (error) {
            done(error, null)
        });
    });
};

export default init;