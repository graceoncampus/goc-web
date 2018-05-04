var rp = require('request-promise');
var cheerio = require('cheerio');
var moment = require('moment-timezone');
var mongoose = require('mongoose');
var configDB = require('../build/config/database.js');
var SermonDB = require('../build/models/sermon.js');
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database

const loadSermons = async () => {
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
            let meta = $(this).find(".listing-content .meta").text().replace(/(?:\r\n|\r|\n)/g, '').split('|')
            meta = meta.map(el => el.trim()) 
            var title = $(this).find(".listing-title").children().first().text();
            var speaker = meta[0]
            var date = moment.tz(meta[2], "M/D/YYYY", "America/Los_Angeles").toDate();
            var URI = $(this).find(".fa-cloud-download").next().attr("href");
            var passage = meta[1]
            sermons[i] = {title: title, speaker: speaker, date: date, passage: passage, URI: URI}
        });
        for (let s of sermons) {
            const result = await SermonDB.find({title: s.title, date: s.date})
            if (result.length === 0) {
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

loadSermons();

module.exports.loadSermons = loadSermons
