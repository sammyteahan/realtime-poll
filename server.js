var r = require('rethinkdb');
var express = require('express');
var socketio = require('socket.io');
var config = require('./config');

var app = express();

app.use(express.static(__dirname + '/public'));

/**
 * @desc start up server with socket io and express
 */
 var io = socketio.listen(app.listen(config.port), {log: false});
 console.log(' -- Party on port ' + config.port + ' -- ');

/**
 * @desc connect to rethink,
 * and broadcast changefeed through socket.io
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
