const { CronJob } = require('cron');
const { loadSermons } = require('./load-sermons.js');

loadSermons();
const job = new CronJob('00 00 12 * * 3', loadSermons, (() => {
  console.log('done updating sermons!');
  /* This function is executed when the job stops */
}),
true, /* Start the job right now */
'America/Los_Angeles');

job.start();
// update sermons now too
loadSermons();
