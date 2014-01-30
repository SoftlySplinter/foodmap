var map, pointarray, heatmap;
var first = true;

var establishments = [
];

function initialize() {
  doUpdate();
  window.setInterval(doUpdate, 5000);
}

function doUpdate() {
  console.log("Doing update");
  $.get('/data/', function(data) {
    console.log("GET /data");
    data.forEach(function(elem) {
      establishments.push(new google.maps.LatLng(elem.geocode.latitude, elem.geocode.longitude));
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
      zoom: 5,
      center: new google.maps.LatLng(midLon, midLat),
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    first = false;

    var pointArray = new google.maps.MVCArray(establishments);

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: pointArray
    });
    heatmap.set('opacity', 1.);
    heatmap.set('radius', 20);

    heatmap.setMap(map);
  } else {
    var pointArray = new google.maps.MVCArray(establishments);
    heatmap.setData(pointArray);
  }
}



google.maps.event.addDomListener(window, 'load', initialize);
