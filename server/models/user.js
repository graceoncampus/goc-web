// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
  firebaseID: String,
  address: String,
  birthday: Number,
  email: String,
  firstName: String,
  grad: Number,
  lastName: String,
  major: String,
  phoneNumber: String,
  image: String,
  homeChurch: String,
  permissions: {
    admin: Number,
    carousel: Number,
    sermons: Number,
    discussions: Number,
    events: Number,
    classes: Number,
    testperm: Number,
    rides: Number
  }
});
// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);