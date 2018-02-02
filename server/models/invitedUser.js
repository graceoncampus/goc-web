// load the things we need
var mongoose = require('mongoose');
var db_InvitedUserSchema = mongoose.Schema({
  firebaseID: String,
  email: String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('InvitedUser', db_InvitedUserSchema);