var map, pointarray, goodHeatmap, badHeatmap;
var first = true;

var establishments = [];

var badEstablishments = [];

function initialize() {
  doUpdate();
  window.setInterval(doUpdate, 60 * 1000);
}

function doUpdate() {
  console.log("Doing update");
  $.get('/data/', function(data) {
    console.log("GET /data");
    data.forEach(function(elem) {
      if(elem.RatingValue == 5) {
        establishments.push(new google.maps.LatLng(elem.geocode.latitude, elem.geocode.longitude));
      } else if(elem.RatingValue == 1) {
        badEstablishments.push(new google.maps.LatLng(elem.geocode.latitude, elem.geocode.longitude));
      }
    });
    update();
  }).fail(function(req, errStr, err) {
    console.log(err);
    alert(errStr);
  });
}

function update() {
  if(first) {  
    var minLat = Math.min();
    var minLon = Math.min();
    var maxLat = Math.max();
    var maxLon = Math.max();

    establishments.forEach(function(elem) {
      if(elem.d < minLat) minLat = elem.e;
      if(elem.d > maxLat) maxLat = elem.e;

      if(elem.e < minLon) minLon = elem.d;
      if(elem.e > maxLon) maxLon = elem.d;
    });

    var midLat = minLat + ((maxLat - minLat)/2);
    var midLon = minLon + ((maxLon - minLon)/2);

    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(midLon, midLat),
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    first = false;

    var pointArray = new google.maps.MVCArray(establishments);

    var gradient = [ 'rgba(0,0,0,0)', 
'rgba(0,255,0,0.00001)',
'rgba(0,255,0,0.001)',
'rgba(0,255,0,0.1)',
'rgba(0,255,0,0.4)',
'rgba(0,255,0,0.65)',
'rgba(0,255,0,0.8)',
'rgba(0,255,0,0.9)',
'rgba(0,255,0,0.95)',
'rgba(0,255,0,0.98)',
'rgba(0,255,0,0.99)',
'rgba(0,255,0,1)'
];

    var badGradient = [ 'rgba(0,0,0,0)', 
'rgba(255,0,0,0.00001)',
'rgba(255,0,0,0.001)',
'rgba(255,0,0,0.1)',
'rgba(255,0,0,0.4)',
'rgba(255,0,0,0.65)',
'rgba(255,0,0,0.8)',
'rgba(255,0,0,0.9)',
'rgba(255,0,0,0.95)',
'rgba(255,0,0,0.98)',
'rgba(255,0,0,0.99)',
'rgba(255,0,0,1)'];

    badHeatmap = new google.maps.visualization.HeatmapLayer({
      data: new google.maps.MVCArray(badEstablishments),
      opacity: 0.5,
      radius: 0.25,
      dissipating: false,
      gradient: badGradient,
      map: map
    });
    goodHeatmap = new google.maps.visualization.HeatmapLayer({
      data: pointArray,
      opacity: 0.5,
      radius: 0.25,
      dissipating: false,
      gradient: gradient,
      map: map
    });
  } else {
    badHeatmap.setData(new google.maps.MVCArray(badEstablishments));
    goodHeatmap.setData(new google.maps.MVCArray(establishments));
  }
}



google.maps.event.addDomListener(window, 'load', initialize);
