
var mongodb = require('mongodb');
var moment = require('moment');

exports.up = function(db, next){
    db.collection('stats_old').find({}).toArray(function(err, stats) {
      stats.forEach( function(doc) {
        console.log(doc);
        var time = moment(doc.time);
        var hour = time.get('hour');
        var minute = time.get('minute');
        time = time.startOf('day');

        var updateDoc = {};
        updateDoc['values.' + hour + '.' + minute] = doc.value;

        db.collection("stats_old").update({time: time.toDate(), type:doc.type, room: 'salon'}, { $set: updateDoc }, { upsert: true});
        db.collection("stats_old").remove(doc);
      });
      next();
    });

};

exports.down = function(db, next){
    next();
};
