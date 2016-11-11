var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StatSchema   = new Schema({
    time: Date,
    type: String,
    value: Number
});

module.exports = mongoose.model('Stat', StatSchema);
