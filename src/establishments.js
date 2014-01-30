var request = require('request');
var fs = require('fs');
var r = require('rethinkdb');

function Map() {
  this.establishments = {};
  this.load(1);
}

/**
 * Recusrsive function which loads all pages from the specified page to the end
 * of the API result.
 *
 * Will stop on an error, but will not die.
 */
Map.prototype.load = function(page) {
  var self = this;
  var req = {
    url: 'http://api.ratings.food.gov.uk/establishments/basic/1000/' + page,
    headers: {
      'x-api-version': '2',
      'accept': 'application/json',
    },
  };
  request.get(req, function(error, resp, body) {
    if(error) console.log(error);
    else {
      var json = JSON.parse(body);
      var meta = json.meta;
      var est = json.establishments;
      for(var i =  0; i < est.length; i++) {
        Establishment.exists(est[i].FHRSID, self);
      }
      if( meta.totalPages > page ) {
        self.load(page + 1);
      }
    }
  });
}

Map.prototype.add = function(est) {
  console.log('Adding: ' + est);
  this.establishments[est.id] = est;
};

var map = new Map();

function Establishment(info) {
  this.id = info.FHRSID;
  this.name = info.BusinessName;
  this.location = info.geocode;

  this.data = info;
}

Establishment.exists = function(id, map) {
  var res = undefined;
  r.connect({}, function(err, conn) {
    if(err) throw err;
    r.db('foodmap').table('establishments').get(id).run(conn, function(err,
result) {
      if(err) throw err;
      conn.close();
      if(result == null) {
        console.log('Est %s needs creating', id);
        Establishment.create(id, map);
      } else {
        var cached = new Date(result.cacheDate);
        if (cached.day < new Date().day + 7) {
          console.log("%s is a week old, recacheing", id);
          Establishment.create(id, map);
        }
      }
    });
  });
}

Establishment.create = function(id, map) {
  var req = {
    url: 'http://api.ratings.food.gov.uk/establishments/' + id,
    headers: {
      'x-api-version': '2',
      'accept': 'application/json',
    },
  };
  request(req, function(error, resp, body) {
    if(error) {
      console.log("Error getting %s: %s", id, error);
    } else {
      var info = JSON.parse(body);
      var est = new Establishment(info);
      est.cache();
      map.add(est);
    }
  });
}

Establishment.prototype.toString = function() {
  return this.id + ': ' +this.name + ' (last cached: ' + this.cacheDate + ')';
}

Establishment.prototype.shouldCache = function() {
  return this.data.cacheDate != undefined;
}

Establishment.prototype.cache = function() {
  this.data.cacheDate = Date.now();
  var self = this;
  r.connect({}, function(err, conn) {
    if(err) throw err;
    r.db('foodmap').table('establishments').insert(self.data).run(conn, function(err, result) {
      if(err) {
        console.log("%s was not cached: %s", self.id, err);
      } else {
        console.log("%s cached sucessfully.", self.id);
      }
      conn.close();
    });
  });
}

