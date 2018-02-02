var mongoose = require('mongoose');
var db_CarouselSchema = mongoose.Schema({
    imageURI: String,
    URI: String, // Where it should link
    rank: Number // For ordering the carousel items. Lower rank means it will come first in the carousel
});
var carouselModel = mongoose.model('carousel', db_CarouselSchema);
module.exports = carouselModel;