var r = require('rethinkdb');
var express = require('express');
var socket = require('socket.io');
var bodyParser = require('body-parser');
var config = require('./config');

var app = express();

app.use(express.static(__dirname + '/public'));

/**
* @desc start up server with socket io and express
*/
var io = socket.listen(app.listen(config.port), {log: false});
console.log(' -- Party on port ' + config.port + ' -- ');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(createConnection);

/**
* @desc REST Routes
*/
app.route('/questions').get(get);
app.route('/questions').post(create);
app.route('/questions/:id').put(update);
app.route('/questions/:id').get(getOne);

app.use(closeConnection);

function get(req, res, next) {
  r.table('kdpoll')
    .run(req._rdbConn).then(function (cursor) {
      return cursor.toArray();
    }).then(function (result) {
      res.json(result);
    }).error(handleError(res))
    .finally(next);
}

function getOne(req, res, next) {
  var id = req.params.id;
  r.table('kdpoll')
    .get(id)
    .run(req._rdbConn).then(function (result) {
      res.json(result);
    }).finally(next);
}

/**
* @todo send updated document in response
*/
function update(req, res, next) {
  var id = req.body.id;
  r.table('kdpoll')
    .get(id)
    .update({'points': r.row('points').add(1)}, {returnChanges: true})
    .run(req._rdbConn).then(function (result) {
      if(result.replaced !== 1) {
        handleError(res, next)(new Error('Document was not updated'));
      } else {
        res.json(result.changes[0].new_val);
      }
    }).finally(next);
}

function create(req, res, next) {
  var question = req.body;
  r.table('kdpoll')
    .insert(question, {returnChanges: true}).run(req._rdbConn).then(function (result) {
      if (result.inserted !== 1) {
        handleError(res, next)(new Error('Document was not inserted'));
      } else {
        res.json(result.changes[0].new_val);
      }
    }).error(handleError(res))
    .finally(next);
}

/**
* @desc middleware to create rethinkdb connection
*/
function createConnection(req, res, next) {
  r.connect({db: 'test'}).then(function (conn) {
    req._rdbConn = conn;
    next();
  }).error(handleError(res));
}

/**
* @desc middleware to close connection
*/
function closeConnection(req, res, next) {
  req._rdbConn.close();
}

/**
* @desc handle error on rethinkdb connection
*/
function handleError(res) {
  return function(error) {
    res.status(500).send(error.message);
  }
}

/**
* @desc change feed
*/
r.connect({db: 'test'}).then(function (conn) {
  r.table('kdpoll').changes().run(conn)
  .then(function (cursor) {
    cursor.each(function (err, change) {
      console.log('New Change: ', change);
      io.sockets.emit('question change', change);
    });
  });
});

/**
* @desc upon first connection from a client,
* send them everything currently in our table
*/
io.sockets.on('connection', function (socket) {

  r.connect({db: 'test'}).then(function (conn) {
    return r.table('kdpoll')
      .run(conn)
      .finally(function() { conn.close(); });
  })
  .then(function (cursor) { return cursor.toArray(); })
  .then(function (result) { socket.emit('load questions', result); })
  .error(function (err) { console.log('Error retrieving questions: ', err); });

  /**
   * @desc action :: new question
   *
   * @param data {Object} - Object with text and points
   */
  socket.on('new question', function (data) {
    r.connect({db: 'test'}).then(function (conn) {
      return r.table('kdpoll')
        .insert(data)
        .run(conn)
        .finally(function() { conn.close(); });
    })
    .error(function (err) { console.log('Error adding new question: ', err); });
  });

  /**
   * @desc action :: upvote question
   *
   * @param data {string} - id of question
   */
  socket.on('upvote question', function (data) {
    r.connect({db: 'test'}).then(function (conn) {
      return r.table('kdpoll')
        .get(data)
        .update({'points': r.row('points').add(1)})
        .run(conn)
      .finally(function () { conn.close(); });
    })
    .error(function (err) { console.log('Error upvoting question: ', err); });
  });
});
