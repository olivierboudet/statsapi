var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var moment     = require('moment');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var config = require('app-config');

var mongoose   = require('mongoose');

mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@${config.db.hostname}:${config.db.port}/${config.db.database}`);
mongoose.Promise = global.Promise;

var Stat = require('./app/models/stat');
var Transformer = require('./app/transformer');

var router = express.Router();

router.use(function(req, res, next) {
  console.log((new Date())+ req.method + ' ' + req.originalUrl);
  next();
});

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

router
  .route('/stats/:type')
  .post(function(req, res) {

    var now = moment();
    var hour = now.get('hour');
    var minute = now.get('minute');

    var updateDoc = {};

    var transformer = Transformer.get(req.params.type);
    transformer.process(req.params.type, req.body.value).then(function(value) {
      console.log("value = " + value);
      var granularity = req.body.granularity;
      if (granularity === 'daily') {
        updateDoc['values'] = value;
      } else if (!granularity || granularity === 'minutely') {
        updateDoc['values.' + hour + '.' + minute] = value;
      }

      Stat.update(
        { time: now.startOf('day'), type: req.params.type, room: req.body.room },
        { $set: updateDoc },
        { upsert: true}
      )
      .then(function() {
        res.sendStatus(201);
      })
      .catch(function(err) {
        res.send(err);
      })
    });
  })
  .get(function(req, res) {

    var filters = {
      type: req.params.type
    }

    if(req.query.start && req.query.end) {
      var start = moment(req.query.start);
      var end = moment(req.query.end);
      filters.time = {$gte: start.toDate(), $lte: end.toDate()}
    }

    Stat.find(filters)
    .sort('-time')
    .exec()
    .then(function(stats) {
      res.json(stats);
    })
    .catch(function(err) {
      res.send(err);
    });
  });

app.use('/', router);

app.listen(port);
console.log('Server listening on port ' + port);
