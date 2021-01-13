require('dotenv').config();
const { CronJob } = require('cron').CronJob;
const admin = require('firebase-admin');
const config = require('../server/config/firebase.json');

const deleteFn = admin.functions().httpsCallable('recursiveDelete');
admin.initializeApp({
  credential: admin.credential.cert(config),
  databaseURL: process.env.DATABASE_URL,
});

const deleteRides = async () => {
  deleteFn({ path: 'rides' });
  deleteFn({ path: 'ridesSignup' });
};

const job = new CronJob('00 00 24 * * SUN', deleteRides, (() => {
  console.log('done deleting rides!');
}),
false, /* Start the job right now */
'America/Los_Angeles');

job.start();
