var start;
var end;

var map;
var heatmap;
var heatmap_toggle = true;
var heatmap_set = {};

var directionsDisplay;

const GRADIENT = [
  'rgba(188, 224, 96, 0)',
  'rgba(188, 224, 96, 0.2)',
  'rgba(194, 224, 96, 0.5)',
  //'rgba(205, 213, 51, 0.8)',
  'rgba(213, 191, 51, 0.9)',
  //'rgba(241, 181, 28, 0.9)',
  'rgba(241, 142, 28, 0.9)',
  'rgba(241, 53, 28, 0.9)'
];

const HEAT_RADIUS = 100;
const RENDER_RADIUS = 0.8;

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
  console.log('Area num: ' + areaNum);

  if(typeof(heatmap) == 'object'){
    /*
    for(var datum of heatmap.getData()){
      delete datum;
    }
    */
    heatmap.setData([]);
    delete heatmap;
  } 

  if(heatmap_toggle){
  consumer.query()
    .withDataset(dataset)    
    .where({area: areaNum})
    .getRows()
      .on('success', function(rows) { 
        console.log(rows);

        for (var datum of rows){

          //Formats string
          if(datum.location_1 != null){
            var loc = datum.location_1;
            loc = loc.substring(1, loc.length-2);
            var longLat = loc.split(',');
            longLat[1] = longLat[1].substring(1);


            var datumPos = {
              lat: Number(longLat[0]),
              lng: Number(longLat[1])
            }

            var key = longLat[0]+longLat[1];

            /*
            //Add marker at pos
            var loc = new google.maps.Marker({
              position: datumPos,
              map: map
            });
            */
            
            //if(distance(pos.lat, pos.lng, datumPos.lat, datumPos.lng) < RENDER_RADIUS){
            if(isInViewPort(datumPos)){
              //if(!(key in heatmap_set)){
                //heatmap_set[key] = true;
                heatmapData.push(new google.maps.LatLng(datumPos.lat, datumPos.lng));
              //}
            }
          }
          
        }

        
        console.log(heatmapData);
        console.log(google.maps);
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            radius: HEAT_RADIUS,
            gradient: GRADIENT
        });

        heatmap.setMap(map);
        
      })
      .on('error', function(error) { console.error(error);});
    }
    delete consumer;
    for(var datum in heatmapData){
      delete datum;
    }
    //delete heatmapData;
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

function isInViewPort(pos) {
  var loc = new google.maps.LatLng(pos.lat, pos.lng);
  return map.getBounds().contains(loc);
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
    var ucla = {
        lat: 34.0689,
        lng: -118.4452
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: ucla
    }, alternates = true);
    var infoWindow = new google.maps.InfoWindow({
        map: map
    });

    var pos = ucla;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            //FOR TESTING ONLY
            if(FORCED_LOC_UCLA){
              pos = ucla;
            }

            start = pos;

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            map.setCenter(pos);
            var loc = new google.maps.Marker({ //I think this location thing gives us our current location so we need this  as our starting coordinate
            // start = new google.maps.Marker({
                position: pos,
                map: map
            });

            getData('data.lacity.org', 'y9pe-qdrd', pos);

          //Adjusts heat radius based on zoom level
          map.addListener('zoom_changed', function() {        
            zoomLevel = map.getZoom();
            console.log('zoom level: ' + zoomLevel);

            //var heatRad = 0.7240504388*(zoomLevel*zoomLevel)  - 8.322539931*(zoomLevel) + 11.19798978;
            var heatRad = HEAT_RADIUS;
            if(zoomLevel < 14){
              heatmap.setMap(null);
              heatmap_toggle = false;
              console.log('deleting heatmap');
            } else {
              heatmap.setMap(map);
              heatmap_toggle = true;
            }

            heatmap.set('radius', heatRad);
            
            
          });

          //Add listener for moving
           map.addListener('idle', function() {
            console.log(map.getCenter().lat() + ' ' + map.getCenter().lng());
            var currentCenter = {lat: map.getCenter().lat(), lng: map.getCenter().lng()};
            getData('data.lacity.org', 'y9pe-qdrd', currentCenter);                         
          });

        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
        console.log("Location found!");

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

function initAutocomplete() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */
        (document.getElementById('end-loc')), {
            types: ['geocode']
        });

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
    // Get the place details from the autocomplete object.
    // var place = autocomplete.getPlace(); //so this place variable is our ending coordinate, what we need to do is get these geocoordinates so we can use this in the navigation part
       end = autocomplete.getPlace().geometry.location;
}

//
function initDirectionsMap() {

  console.log(start);
  console.log(end);
  console.log('.....')
 // var pointA = new google.maps.LatLng(34.0689, -118.4452),
 //     pointB = new google.maps.LatLng(34.0224, -118.2851),
 if(directionsDisplay != null){
    directionsDisplay.setMap(null);
    directionsDisplay = null;
    console.log('deleted old display');
 }

 directionsDisplay = new google.maps.DirectionsRenderer({
         map: map
})

 var pointA = new google.maps.LatLng(start.lat,start.lng),
     pointB = new google.maps.LatLng(end.lat(), end.lng()),
     
     myOptions = {
         zoom: 16,
         center: pointA

     };

     if(typeof(map) == 'object'){
      delete map;
      map = null;
     }
    map = new google.maps.Map(document.getElementById('map'), myOptions, alternates = true);

    //Adjusts heat radius based on zoom level
    map.addListener('zoom_changed', function() {        
      zoomLevel = map.getZoom();
      console.log('zoom level: ' + zoomLevel);

      //var heatRad = 0.7240504388*(zoomLevel*zoomLevel)  - 8.322539931*(zoomLevel) + 11.19798978;
      var heatRad = HEAT_RADIUS;

      if(zoomLevel < 15){
        heatmap.setMap(null);
        heatmap_toggle = false;
        console.log('deleting heatmap');
      } else {
        heatmap.setMap(map);
        heatmap_toggle = true;
        heatmap.set('radius', heatRad);
      }
 
      
    });

    //Add listener for moving
     map.addListener('idle', function() {
      console.log(map.getCenter().lat() + ' ' + map.getCenter().lng());
      var currentCenter = {lat: map.getCenter().lat(), lng: map.getCenter().lng()};
      getData('data.lacity.org', 'y9pe-qdrd', currentCenter);                         
    });
         //map = new google.maps.Map(document.getElementById('map'), myOptions, alternates = true),
        //  if (map ==null){
        //    console.log('I am null and you fucked up')
        //  }
        
     // Instantiate a directions service.
     directionsService = new google.maps.DirectionsService,
     markerA = new google.maps.Marker({
         position: pointA,
         title: "point A",
         label: "A",
         map: map
        //  console.log('I am MakerA')
     }),


     markerB = new google.maps.Marker({
         position: pointB,
         title: "point B",
         label: "B",
         map: map
        //  console.log('I am MakerB')
     });


     console.log('***************')

 // get route from A to B
 calculateAndDisplayRoute(directionsService, directionsDisplay, map, pointA, pointB);

 map.panTo(pointA);
 map.setZoom(20);

}

function rainbow(iteration){
  var color;
  switch(iteration)
  {
    case 1:
    color = '#0000FF';
    break;
    case 2:
    color = '#00FA9A';
    break;
    case 3:
    color = '#4B0082';
    break;
    case 4:
    color = '#D2691E';
    break;
    case 5:
    color = '#FFD700';
    break;
    case 6:
    color = '#FFA07A';
    break;
    default:
    color = '#9ACD32';
  }
  return color;
}

function getDangerLevel(route){
  var dangerLevel = 0;
  for(var coord in route){
    var consumer = new soda.Consumer('data.lacity.org');
    var areaNum = getClosestArea(coord);

    consumer.query()
    .withDataset('y9pe-qdrd')    
    .where({area: areaNum})
    .getRows()
      .on('success', function(rows) { 
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

          if(distance(coord.lat, coord.lng, datumPos.lat, datumPos.lng) < 1){
            dangerLevel++;
          }
        }

        return dangerLevel;
      })
      .on('error', function(error) { console.error(error);});

  }
}

function getBestRoute(routes){
  var minDanger = getDangerLevel(routes[0]);
  var bestRoute = 0;
  for(var routeNum = 0; routeNum < routes.length; routeNum++){
    thisDanger = getDangerLevel(routes[routeNum]);
    if(thisDanger < minDanger){
        minDanger = thisDanger;
        bestRoute = routeNum;
    }
  }

  return bestRoute;
}

const maxPoints = 7;
const maxRoutes = 7;

function calculateAndDisplayRoute(directionsService, directionsDisplay, map, pointA, pointB) {
  directionsService.route({
    origin: pointA,
    destination: pointB,
    avoidTolls: true,
    avoidHighways: false,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true
  }, function (response, status) {
    if (status == google.maps.DirectionsStatus.OK)
    {

      //console.log(response.routes);
      var x = new Array(response.routes.length);
      for (var i = 0; i < response.routes.length; i++) 
      {
        x[i] = [];
      }

      console.log('num routes ' + i);

      for (var i = 0; i < response.routes.length && i<maxRoutes; i++) {
        
        // var directionsD = new google.maps.DirectionsRenderer({map})
        var directionsD = new google.maps.DirectionsRenderer({ map, polylineOptions: { strokeColor: rainbow(i),strokeOpacity: 0.25} });
        directionsD.setDirections(response)
        directionsD.setRouteIndex(i)

        
        var a =  response.routes[i].overview_path.length;
        var rawQuotient = a/maxPoints;
        var remainder = rawQuotient % 1;
        var quotient = rawQuotient - remainder;
        for(var q = 0; q < a; q += quotient)
        {
          // var p = response.routes[i].overview_path[q]
          // console.log(response.routes[i].overview_path[q].lng());
          x[i][q] = {lat: response.routes[i].overview_path[q].lat(),lng: response.routes[i].overview_path[q].lng() };
          //console.log(x[i][q]);

        }
        
      }
      //directionsDisplay.setDirections(response);
      bestRoute = getBestRoute(x);
      console.log(bestRoute);
      var directionsD = new google.maps.DirectionsRenderer({ map, polylineOptions: { strokeColor: rainbow(bestRoute),strokeOpacity: 1, strokeWeight: 6} });
      directionsD.setDirections(response)
      directionsD.setRouteIndex(bestRoute)

    }
    else
    {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function test(){
  console.log('test');
}

function initMain() {
  initMap()
  initAutocomplete()
  var buttonstatus = document.getElementById("inputbutton");
  if (buttonstatus === null){
    console.log('I am null')
  }
  buttonstatus.addEventListener('click', initDirectionsMap);
}
