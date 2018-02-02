// clears out the database (if you make a mistake or change schema)
var mongoose = require('mongoose');
var configDB = require('../config/database.js');
mongoose.connect(configDB.url); // connect to our database
var fs = require('fs');
var _ = require('lodash');
var path = require('path');

var dbsPath = path.join(__dirname, "../models");
var dbFiles = fs.readdirSync(dbsPath);
var dbs = _.map(dbFiles, function (fname) {
    return require(dbsPath + "/" + fname).find().remove();
});