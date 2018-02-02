var CronJob = require('cron').CronJob;
var firebaseDB = require('../build/firebase.js').firebaseDB;
var ridesRef = firebaseDB.ref("rides");
var ridesSignupRef = firebaseDB.ref("ridesSignup");

var job = new CronJob({
  cronTime: '00 00 24 * * SUN',
  onTick: function() {
    ridesRef.remove();
    ridesSignupRef.remove();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
