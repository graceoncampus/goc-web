var CronJob = require('cron').CronJob;
var firebaseDB = require('../build/firebase.js').firebaseDB;
var ridesRef = firebaseDB.ref("rides");
var ridesSignupRef = firebaseDB.ref("ridesSignup");
const deleteRides = async () => {
  await ridesRef.remove();
  await ridesSignupRef.remove();
}

var job = new CronJob('00 00 24 * * SUN', deleteRides, function () {
  console.log("done deleting rides!");
},
false, /* Start the job right now */
'America/Los_Angeles' /* Time zone of this job. */
);

job.start();
