var map;
/*
const GRADIENT = [
  ''
];
*/
const FORCED_LOC_UCLA = true;
const NUM_AREAS = 21;
const areas = [
  {
    name: 'invalid',
    lat: 0,
    lng: 0
  },
  {
    name: 'central',
    lat: 34.0439789,
    lng: -118.2496511
  },
  {
    name: 'rampart',
    lat: 34.0567093,
    lng: -118.269167
  },
  {
    name: 'southwest',
    lat: 34.0105198,
    lng: -118.3072525
  },
  {
    name: 'hollenbeck',
    lat: 34.044989,
    lng: -118.2152816
  },
  {
    name: 'harbor',
    lat: 33.7577659,
    lng: -118.2913836
  },
  {
    name: 'hollywood',
    lat: 34.095818,
    lng: -118.3328638
  },
  {
    name: 'wilshire',
    lat: 34.0468053,
    lng: -118.3448322
  },
  {
    name: 'westla',
    lat: 34.0437608,
    lng: -118.4529574
  },
  {
    name: 'vannuys',
    lat: 34.1842137,
    lng: -118.448545
  },
  {
    name: 'westvalley',
    lat: 34.1933582,
    lng: -118.5496772
  },
  {
    name: 'northeast',
    lat: 34.1191836,
    lng: -118.2515917
  },
  {
    name: '77thstreet',
    lat: 33.9703047,
    lng: -118.2798509
  },
  {
    name: 'newton',
    lat: 34.0122964,
    lng: -118.2582919
  },
  {
    name: 'pacific',
    lat: 33.991611,
    lng: -118.422014
  },
  {
    name: 'northhollywood',
    lat: 34.1716785,
    lng: -118.3879827
  },
  {
    name: 'foothill',
    lat: 34.2531062,
    lng: -118.4126669
  },
  {
    name: 'devonshire',
    lat: 34.2569812,
    lng: -118.5336139
  },
  {
    name: 'southeast',
    lat: 33.9387432,
    lng: -118.2765059
  },
  {
    name: 'mission',
    lat: 34.2729432,
    lng: -118.4703464
  },
  {
    name: 'olympic',
    lat: 34.050229,
    lng: -118.2933344
  },
  {
    name: 'topanga',
    lat: 34.2213826,
    lng: -118.6018109
  }

];

function getData(address, dataset, pos){
  console.log('Getting data');

  var consumer = new soda.Consumer(address);

  var incident_location;
  var heatmapData = [];

  var areaNum = getClosestArea(pos);

  consumer.query()
    .withDataset(dataset)    
    .where({area: areaNum})
    
    .order('area')
    .getRows()
      .on('success', function(rows) { 
        console.log(rows);

        for (var datum of rows){

          //Formats string
          var loc = datum.location_1;
          loc = loc.substring(1, loc.length-2);
          var longLat = loc.split(',');
          longLat[1] = longLat[1].substring(1);


          var datumPos = {
            lat: Number(longLat[0]),
            lng: Number(longLat[1])
          }

          /*
          //Add marker at pos
          var loc = new google.maps.Marker({
            position: datumPos,
            map: map
          });
          */
          
          if(distance(pos.lat, pos.lng, datumPos.lat, datumPos.lng) < 1){
            heatmapData.push(new google.maps.LatLng(datumPos.lat, datumPos.lng));
          }
          
        }

        
        console.log(heatmapData);
        console.log(google.maps);
        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            radius: 50
            
        });

        heatmap.setMap(map);
        
      })
      .on('error', function(error) { console.error(error);});

    
}

function getClosestArea(pos) {
  var minDis = distance(pos.lat, pos.lng, 0, 0);
  var areaNum = 0;
  for(var count = 1; count <= NUM_AREAS; count++){
    if(distance(pos.lat, pos.lng, areas[count].lat, areas[count].lng) < minDis){
      minDis = distance(pos.lat, pos.lng, areas[count].lat, areas[count].lng);
      areaNum = count;
    }
  }

  return areaNum;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distance(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}

function initMap() {
  var ucla = {lat: 34.0689, lng: -118.4452};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: ucla
  });

  var infoWindow = new google.maps.InfoWindow({map: map});
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //FOR TESTING ONLY
      if(FORCED_LOC_UCLA){
        pos = ucla;
      }

      //DELETE PLZ
      //var usc = {lat: 34.0223519, lng: -118.287311};
      //pos = usc;
      pos = {lat: 34.017949, lng: -118.298532};

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);

      var loc = new google.maps.Marker({
        position: pos,
        map: map
      });

      getData('data.lacity.org', 'y9pe-qdrd', pos);

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });

    
    /*
    //Gets crime data based on area number
    var crimeData = getData('data.lacity.org', 'y9pe-qdrd', 5);
    console.log(crimeData);

    for (var datum of crimeData){

      //Formats string
      var loc = datum.location_1;
      loc = loc.substring(1, loc.length-2);
      var longLat = loc.split(',');
      longLat[1] = longLat[1].substring(1);

      var pos = {
        lat: Number(longLat[0]),
        lng: Number(longLat[1])
      }

      var loc = new google.maps.Marker({
        position: pos,
        map: map
      });
    }
    */

  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}



function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}
