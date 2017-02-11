var mongoose   = require('mongoose');
var moment   = require('moment');
var Stat = require('./models/stat');

var consoEDFTransformer = {
  process: function(type, value) {
    var yesterday = moment().subtract(1, 'days').startOf('day');

    return Stat.findOne({type: type, time: yesterday})
          .exec()
          .then(function(stat) {
            var result = {};
            result.last_index = value;

            if(stat == undefined || stat.values == undefined) {
              result.value = value;
            } else {
              result.value = (value - stat.values.last_index);
            }

            return result;
          });
  }
}

var transformers = {
  consoHP: consoEDFTransformer,
  consoHC: consoEDFTransformer
}

module.exports.get = function(type) {
  if(transformers[type] == undefined) {
    return function(type, value) {
      return new Promise(function(resolve, reject) {
        resolve(value);
      });
    }
  }

  return transformers[type];
}
