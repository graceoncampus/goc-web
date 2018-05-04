var CronJob = require('cron').CronJob;
var rp = require('request-promise');
var cheerio = require('cheerio');
var moment = require('moment-timezone');
var mongoose = require('mongoose');
var configDB = require('../build/config/database.js');
var SermonDB = require('../build/models/sermon.js');
var loadSermons = require('./load-sermons.js').loadSermons;

mongoose.connect(configDB.url); // connect to our database

loadSermons();
var job = new CronJob('00 00 12 * * 3', loadSermons, function () {
      console.log("done updating sermons!");
      /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);
job.start();
// update sermons now too
loadSermons();
