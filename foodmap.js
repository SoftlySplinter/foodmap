var request = require('request')

var url = 'http://api.ratings.food.gov.uk';
var headers = {
  headers: {
    'x-api-version': '2',
    'accept': 'application/json'
  }
};

var page = 1;
var max_page = 2;
var establishments = []

var req = {
  url: url + '/establishments/basic/',
  headers: {
    'x-api-version': '2',
    'accept': 'application/json'
  }
}
request(req, function(error, response, body) {
  if(error) console.log('Error: ' + error);
  if(response.statusCode == 200) {
    var info = JSON.parse(body);
    max_page = info.meta.totalPages;
    for(var i = 0; i < info.establishments.length; i++) {
      var est = info.establishments[i];
      var est_req = {
        url: url + '/establishments/' + est.FHRSID,
        headers: {
          'x-api-version': '2',
          'accept': 'application/json'
        }
      }
      request(est_req, function(error, resp, body) {
        if(error) console.log('Error: ' + error);
        if(response.statusCode == 200) {
          var est_info = JSON.parse(body);
          console.log(est_info);
        }
      });
    }
  } else {
    console.log(response);
  }
});

