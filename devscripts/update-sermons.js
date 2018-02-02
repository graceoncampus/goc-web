var CronJob = require('cron').CronJob;
var rp = require('request-promise');
var cheerio = require('cheerio');
var moment = require('moment-timezone');
var mongoose = require('mongoose');
var configDB = require('../build/config/database.js');
var SermonDB = require('../build/models/sermon.js');

mongoose.connect(configDB.url); // connect to our database

const updateSermons = async () => {
    let uri = "https://www.gracechurch.org/teachings/ministry/UCLA%20Grace%20on%20Campus"
    let options = {
        uri,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    let $ = await rp(options);

    const pages = $('.pagination').children('li').text()
    const pageArr = [];
    for (page of pages) {
        if (!isNaN(page)) pageArr.push(page);
    }
    for (page of pageArr) {
        uri = "https://www.gracechurch.org/teachings/ministry/UCLA%20Grace%20on%20Campus?page="+ page;
        options = {
            uri,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        $ = await rp(options);
        var sermons = [];

        $('.listing-wrap').each(function(i, elem) {
            var title = $(this).find(".listing-title").children().first().text();
            var speaker = $(this).find(".meta").children().first().text();
            var unparsed_date = $(this).find(".meta").text();
            var date_patt = /([0-9/]+)/;
            var date = moment.tz(unparsed_date.match(date_patt)[0], "M/D/YYYY", "America/Los_Angeles").toDate();
            var URI = $(this).find(".fa-cloud-download").next().attr("href");
            var passage = $(this).find(".meta-secondary").children().first().text().trim();
            sermons[i] = {title: title, speaker: speaker, date: date, passage: passage, URI: URI}
        });
        for (let s of sermons) {
            const result = await SermonDB.find({title: s.title, date: s.date})
            if (result.length === 0) {
                console.log('hi')
                var sermon = new SermonDB();
                sermon.title = s.title;
                sermon.speaker = s.speaker;
                sermon.passage = s.passage;
                sermon.date = s.date;
                sermon.URI = s.URI;
                sermon.transcriptURI = "";
                await sermon.save();
            }
        }
    }
}
updateSermons();
var job = new CronJob('00 00 12 * * 3', updateSermons, function () {
      console.log("done updating sermons!");
      /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);
job.start();
// update sermons now too
updateSermons();
