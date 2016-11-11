var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var config = require('app-config');

var mongoose   = require('mongoose');

mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@${config.db.hostname}:${config.db.port}/${config.db.database}`);
mongoose.Promise = global.Promise;

var Stat = require('./app/models/stat');


var router = express.Router();

router.use(function(req, res, next) {
  console.log(req.method + ' ' + req.originalUrl);
  next();
});

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

router
  .route('/stats/:type')
  .post(function(req, res) {

    var stat = new Stat();
    stat.time = new Date();
    stat.type = req.params.type
    stat.value = req.body.value

    stat.save().then(function() {
      res.json({ message: 'Stat saved!' });
    })
    .catch(function(err) {
      res.send(err);
    })
  })
  .get(function(req, res) {

    Stat.find({
      type: req.params.type,
      //time: {$gt: req.params.start, $lt: req.params.end},
    })
    .sort('-time')
    .select('time value')
    .exec()
    .then(function(stats) {
      res.json(stats);
    })
    .catch(function(err) {
      res.send(err);
    });
  });

app.use('/api', router);

app.listen(port);
console.log('Server listening on port ' + port);
