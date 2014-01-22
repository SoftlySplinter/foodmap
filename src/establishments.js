var request = require('request');
var fs = require('fs');

function Map() {
  this.establishments = {};
  this._cache = this.loadCache();
  this.load();
}

Map.prototype.loadCache = function() {
  var self = this;
  fs.readdir('.cache', function(err, files) {
    if(err) throw err;
    for(var i = 0; i < files.length; i++) {
      fs.readFile('.cache/' + files[i], function(err, data) {
        self.add(new Establishment(JSON.parse(data)));
      });
    }
  });
}

Map.prototype.load = function() {
  console.log('Loading Establishments...');
  var self = this;
  var req = {
    url: 'http://api.ratings.food.gov.uk/establishments/basic/',
    headers: {
      'x-api-version': '2',
      'accept': 'application/json',
    },
  };
  request.get(req, function(error, resp, body) {
    var est = JSON.parse(body).establishments;
    for(var i =  0; i < est.length; i++) {
      var id = est[i].FHRSID;
      if( self.establishments[id] != undefined ) {
        console.log(id + ' already cached');
        continue;
      }
      self.loadEst(est[i].FHRSID);
    }
  });
}

Map.prototype.add = function(est) {
  console.log('Adding: ' + est);
  this.establishments[est.id] = est;
};

var map = new Map();

Map.prototype.loadEst = function(id) {
  console.log("Loading Establishment " + id);
  var req = {
    url: 'http://api.ratings.food.gov.uk/establishments/' + id,
    headers: {
      'x-api-version': '2',
      'accept': 'application/json',
    },
  };
  var self = this;
  request(req, function(error, resp, body) {
    var info = JSON.parse(body);
    var est = new Establishment(info);
    est.cache();
    self.add(est);
  });
}

function Establishment(info) {
  this.id = info.FHRSID;
  this.name = info.BusinessName;
  this.location = info.geocode;

  this.data = info;
  this.cacheDate = info.cacheDate || Date.now();
}

Establishment.prototype.toString = function() {
  return this.id + ': ' +this.name + ' (last cached: ' + this.cacheDate + ')';
}

Establishment.prototype.cache = function() {
  // TODO cache to a DB.
}

