var express = require('express');
var app = express();
var r = require('rethinkdb');

app.get("/data", function(req, res) {
  r.connect({}, function(err, conn) {
    if(err) {
      res.writeHead(500);
      res.end(err.toString());
      return;  
    }
    r.db('foodmap').table('establishments').run(conn, function(err, cursor) {
      if(err) {
        res.writeHead(500);
        res.end(err.toString());
        return;
      }
      var arr = []
      cursor.each(function(err, result) {
        if(result != undefined) arr.push(result);
        if(!cursor.hasNext()) {
          var str = JSON.stringify(arr);
          res.writeHead(200, {'Content-Type': 'application/json',
                              'Content-Length': str.length});
          res.end(str);
        }
      });
    });
    conn.close();
  });
})
app.listen(8000, '127.0.0.1');


