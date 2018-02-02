import SermonDB from '../models/sermon';
import moment from 'moment';

export const getSermons = (req, res) => {
    SermonDB.find().sort({date: -1}).exec(function (err, results) {
        res.render('sermons.ejs', {
            title: "Sermons",
            sermons: results.map(function(elem) {
                elem.datestring = moment(elem.date).format('M/D/YY');
                return elem;
            }),
        });
    });
};


export const postSermon = (req, res) => {
    var sermon = new SermonDB();
    sermon.title = (req.body.title) ? req.body.title : "";
    sermon.speaker = (req.body.speaker) ? req.body.speaker : "";
    sermon.passage = (req.body.passage) ? req.body.passage : "";
    sermon.date = (req.body.date) ? moment(birthday, 'MM/DD/YYYY').unix() : moment(new Date(), 'MM/DD/YYYY').unix();
    sermon.URI = (req.body.URI) ? req.body.URI : "";
    sermon.save();
    res.redirect('/sermons');
};

export const getEditSermonById = (req, res) => {
    var sermonId = req.param("sermonid");
    SermonDB.findById(sermonId, function (err, result) {
        if (err) {
            res.render('error.ejs', {
                title: 'Error',
                message: "Specified sermon does not exist."
            });
        }
        else {
            res.render('editsermon.ejs', {
                title: 'Edit Sermon',
                sermon: result
            });
        }
    });
};

export const postEditSermonById = (req, res) => {
    var sermonId = req.param("sermonid");
    SermonDB.findById(sermonId, function (err, result) {
        if (req.body.title) {
            result.title = req.body.title;
        }
        if (req.body.speaker) {
            result.speaker = req.body.speaker;
        }
        if (req.body.passage) {
            result.passage = req.body.passage;
        }
        if (req.body.date) {
            result.date = moment(req.body.date, 'MM/DD/YYYY').unix();
        }
        if (req.body.URI) {
            result.URI = req.body.URI;
        }
        result.save();
        res.redirect('/sermons');
    });
};