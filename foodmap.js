var express = require('express');
var app = express();
app.configure(function() {
  app.use('/', express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));
});
var r = require('rethinkdb');

app.get("/data", function(req, res) {
  console.log("GET /data");
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
          var str = JSON.stringify(arr) + '\n';
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


