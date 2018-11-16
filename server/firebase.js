import * as admin from 'firebase-admin';
import config from './config/firebase.json';
admin.initializeApp({
    credential: admin.credential.cert(config),
    databaseURL: process.env.databaseURL
})

export const firestoreDB = admin.firestore();
export default admin;
