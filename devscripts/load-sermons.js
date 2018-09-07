var axios = require("axios");
const { resolve } = require("url");
var cheerio = require("cheerio");
var moment = require("moment-timezone");
var mongoose = require("mongoose");
var configDB = require("../build/config/database.js");
var SermonDB = require("../build/models/sermon.js");
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database

const sermons = [];

let uri =
    "https://www.gracechurch.org/sermons/ministry/UCLA%20Grace%20on%20Campus";
const loadSermons = async url => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        $(".listing-wrap").each(function(i, elem) {
            let meta = $(this)
                .find(".listing-content .meta")
                .text()
                .replace(/(?:\r\n|\r|\n)/g, "")
                .split("|");
            meta = meta.map(el => el.trim());
            var title = $(this)
                .find(".listing-title")
                .children()
                .first()
                .text();
            var speaker = meta[0];
            var date = moment
                .tz(meta[2], "M/D/YYYY", "America/Los_Angeles")
                .toDate();
            var URI = $(this)
                .find(".fa-cloud-download")
                .next()
                .attr("href");
            var passage = meta[1];
            sermons.push({
                title: title,
                speaker: speaker,
                date: date,
                passage: passage,
                URI: URI
            });
        });
        let nextPageLink = $(".pagination")
            .find(".active")
            .next()
            .find("a")
            .attr("href");
        nextPageLink = nextPageLink.replace(
            "/" + nextPageLink.split("/")[1],
            "https://www.gracechurch.org"
        );
        if (!nextPageLink) exportSermons();
        else loadSermons(nextPageLink);
    } catch (error) {
        console.log(error);
        exportSermons();
    }
};

const exportSermons = async () => {
    await Promise.all(
        sermons.map(({ title, date, speaker, passage, URI }) => {
            return new Promise((resolve, reject) =>
                SermonDB.findOneAndUpdate(
                    {
                        title,
                        date
                    },
                    {
                        title,
                        date,
                        speaker,
                        passage,
                        URI
                    },
                    { upsert: true },
                    function(err, doc) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(doc);
                        }
                    }
                )
            );
        })
    );
};
loadSermons(uri);

module.exports.loadSermons = loadSermons;
