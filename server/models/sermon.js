//models/sermon
// Database connection
var mongoose = require('mongoose');
var db_SermonSchema = mongoose.Schema({
    title: String,
    speaker: String,
    passage: String,
    URI: String,
    date: Date,
    tags: [String]
});
var sermonModel = mongoose.model('sermon', db_SermonSchema);
module.exports = sermonModel;