import passport from 'passport';
import CustomStrategy from 'passport-custom';
import admin from 'firebase-admin';
import moment from 'moment';
import init from './init';
import {
  firestoreDB2
} from '../firebase';
const invitedRef = firestoreDB2.collection("invitedUsers");
const usersRef = firestoreDB2.collection("users");

passport.use('signup', new CustomStrategy((req, done) => { //what is passport? where is this information coming from?
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

    usersRef.where("email", "==", email).then((snapshot) => {
      if(snapshot.size != 0){
        return done('That email is already registered.', false);
      }
      else{
        invitedRef.where("email", "==", email).then((snapshot2) => {
          if(snapshot.size != 0){
            /* something to create user */.then((user) => {
            users["/users/" + user.uid = usr //change
            usersRef.add(users).then(() => { //add the new user
                admin.database()
                    .ref('invitedUsers')
                    .orderByChild('email')
                    .equalTo(email)
                    .on('child_added').then((snapshot3) => {
                        snapshot3.ref.remove()
                        return done(null, user.uid)
                    });
          });
          }
        });
      }
    });
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
                                .createUser({  //Where does this create a new user? What does this code mean?
                                    email,
                                    password
                                })
                                .then((user) => {
                                    let users = {};
                                    users["/users/" + user.uid] = usr //creates an object with the new users information?
                                    admin.database().ref().update(users).then(() => { //add the new user
                                        admin.database()
                                            .ref('invitedUsers')
                                            .orderByChild('email')
                                            .equalTo(email)
                                            .on('child_added').then((snapshot3) => { //What does this delete?
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
