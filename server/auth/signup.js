import passport from 'passport';
import CustomStrategy from 'passport-custom';
import admin from 'firebase-admin';
import moment from 'moment';
import init from './init';

passport.use('signup', new CustomStrategy((req, done) => {
    const {
        firstName,
        lastName,
        phoneNumber,
        birthday,
        grad,
        major,
        homeChurch,
        address,
        password,
    } = req.body
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
    const bday = (birthday && birthday !== '') ? moment(birthday, 'MM/DD/YYYY').unix() : '';
    const image = 'image URL';
    const usr = {
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNumber: phoneNumber || '',
        birthday: bday || '',
        grad: grad || '',
        major: major || '',
        homeChurch: homeChurch || '',
        address: address || '',
        permissions: permissions
    }
    admin.database()
        .ref('users')
        .orderByChild('email')
        .equalTo(email)
        .once('value').then((snapshot) => {
            if (snapshot.val()) {
                return done('That email is already registered.', false);
            } else {
                admin.database()
                    .ref('invitedUsers')
                    .orderByChild('email')
                    .equalTo(email)
                    .once('value').then((snapshot2) => {
                        if (snapshot2.val()) {
                            admin.auth()
                                .createUser({
                                    email,
                                    password
                                })
                                .then((user) => {
                                    let users = {};
                                    users["/users/" + user.uid] = usr
                                    admin.database().ref().update(users).then(() => {
                                        admin.database()
                                            .ref('invitedUsers')
                                            .orderByChild('email')
                                            .equalTo(email)
                                            .on('child_added').then((snapshot3) => {
                                                snapshot3.ref.remove()
                                                return done(null, user.uid)
                                            });
                                    });
                                })
                                .catch(error => done(error.message, false));
                        } else {
                            return done('That email has not been invited. Email gocwebteam@gmail.com to get an invite.', false);
                        }
                    });
            }
        });
}));
init();
export default passport;