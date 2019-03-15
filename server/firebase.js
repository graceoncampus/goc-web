import * as admin from "firebase-admin";
import firebase from "firebase";
require("firebase/firestore");
import config from "./config/firebase.json";
admin.initializeApp({
  credential: admin.credential.cert(config),
  databaseURL: process.env.databaseURL
});
var config2 = {
  apiKey: "AIzaSyC5FN_4EfqAcIoPOOVzTXeze-afOVS_YZo",
  authDomain: "goc-app-6efe2.firebaseapp.com",
  databaseURL: "https://goc-app-6efe2.firebaseio.com",
  projectId: "goc-app-6efe2",
  storageBucket: "goc-app-6efe2.appspot.com",
  messagingSenderId: "44635103582"
};
firebase.initializeApp(config2);

export const firebaseDB = admin.database();
export const firestoreDB = firebase.firestore();
export default admin;
