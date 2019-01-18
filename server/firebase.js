import * as admin from 'firebase-admin';
import * as firebase from 'firebase';
import config from './config/firebase.json';
admin.initializeApp({
    credential: admin.credential.cert(config),
    databaseURL: process.env.databaseURL
})

export default admin;
export const firestoreDB = admin.firestore();
