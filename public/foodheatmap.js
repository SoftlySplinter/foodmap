// Adding 500 Data Points
var map, pointarray, heatmap;

var establishments = [
];

function initialize() {
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
    zoom: 5,
    center: new google.maps.LatLng(midLon, midLat),
    mapTypeId: google.maps.MapTypeId.SATELLITE
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  var pointArray = new google.maps.MVCArray(establishments);

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: pointArray
  });
  heatmap.set('opacity', 0.75);
  heatmap.set('radius', 20);
  heatmap.set('gradient', ['rgba(0, 140, 0, 0 )', 'rgba(0, 160, 0, 1)', 
                           'rgba(0, 180, 0, 1 )', 'rgba(0, 200, 0, 1)']);

  heatmap.setMap(map);
}

$.get('/data/', function(data) {
  data.forEach(function(elem) {
    establishments.push(new google.maps.LatLng(elem.geocode.latitude, elem.geocode.longitude));
  });
  initialize();
}).fail(function(req, errStr, err) {
  console.log(err);
  alert(errStr);
});

google.maps.event.addDomListener(window, 'load', initialize);
