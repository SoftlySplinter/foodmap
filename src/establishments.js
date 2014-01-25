var request = require('request');
var fs = require('fs');
var r = require('rethinkdb');

function Map() {
  this.establishments = {};
  this.load(1);
}

Map.prototype.load = function(page) {
  console.log('Loading Establishments...');
  var self = this;
  var req = {
    url: 'http://api.ratings.food.gov.uk/establishments/basic/1000/' + page,
    headers: {
      'x-api-version': '2',
      'accept': 'application/json',
    },
  };
  request.get(req, function(error, resp, body) {
    var json = JSON.parse(body);
    var meta = json.meta;
    var est = json.establishments;
    for(var i =  0; i < est.length; i++) {
      Establishment.exists(est[i].FHRSID, self);
    }
    if( meta.totalPages > page ) {
      self.load(page + 1);
    }
  });
}

Map.prototype.add = function(est) {
  console.log('Adding: ' + est);
  this.establishments[est.id] = est;
};

var map = new Map();

Map.prototype.loadEst = function(id) {
}

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
        console.log('Est ' + id + ' needs creating');
        Establishment.create(id, map);
      }
      else {
        console.log('Est ' + id + ' already cached');
      }
    });
  });
}

Establishment.create = function(id, map) {
  console.log("Loading Establishment " + id);
  var req = {
    url: 'http://api.ratings.food.gov.uk/establishments/' + id,
    headers: {
      'x-api-version': '2',
      'accept': 'application/json',
    },
  };
  request(req, function(error, resp, body) {
    var info = JSON.parse(body);
    var est = new Establishment(info);
    est.cache();
    map.add(est);
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
      if(err) throw err;
      conn.close();
    });
  });
}

