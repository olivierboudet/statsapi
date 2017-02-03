var mongoose   = require('mongoose');
var moment   = require('moment');
var Stat = require('./models/stat');

var consoEDFTransformer = {
  process: function(type, value) {
    var yesterday = moment().subtract(1, 'days').startOf('day');

    return Stat.findOne({type: type, time: yesterday})
          .exec()
          .then(function(stat) {
            return (value - stat.values);
          });
  }
}

var transformers = {
  consoHP: consoEDFTransformer,
  consoHC: consoEDFTransformer,
  temperature: {
    process: function(type, value) {
      return new Promise(function(resolve, reject) {
        resolve(value);
      });
    }
  }
}

module.exports.get = function(type) {
  return transformers[type];
}
