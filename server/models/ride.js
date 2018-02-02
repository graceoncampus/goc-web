//models/ride
// Database connection
var mongoose = require('mongoose');

// cars: {
//   firebaseKey: {
//     driver: {
//       uid: String,
//       name: String,
//       email: String,
//       phoneNumber: String
//     },
//     riders: {
//       firebaseKey: {
//         uid: String,
//         name: String,
//         email: String,
//         phoneNumber: String,
//         location: String
//       },
//       ...
//     },
//     comment: String,
//     sendEmail: Boolean
//   }
// }

var db_rideSchema = mongoose.Schema({
  firebaseID: String,
  cars: Object,
  date: Number,
  creationDate: Number,
  emailMessage: String
});
var rideModel = mongoose.model('ride', db_rideSchema);
module.exports = rideModel;