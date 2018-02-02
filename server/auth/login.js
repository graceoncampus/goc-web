import passport from 'passport';
import CustomStrategy from 'passport-custom';
import admin from 'firebase-admin';

import init from './init';

passport.use('login', new CustomStrategy((req, done) => {
    admin.auth().verifyIdToken(req.body.token)
        .then(function (decodedToken) {
            done(null, decodedToken.uid)
        }).catch(function (error) {
            done(error, null)
        });
}));
init();

export default passport;