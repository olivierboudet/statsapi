var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StatSchema   = new Schema({
    time: Date,
    type: String,
    value: Number,
    room: String
});

module.exports = mongoose.model('Stat', StatSchema);
