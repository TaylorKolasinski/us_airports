var usAirports = angular.module('USAirports', ['mgcrea.ngStrap', 'ngRoute']);

// Controller that manages gettiner the review from twitter
function NauticalMilesController($scope, $http) {

  $scope.selectedAirport = '';
  $scope.selectedAirport2 = '';

  $scope.init = function() {
    make_request('data/airports/airport_data.json');
  }

  // Make request and hanlde results
  var make_request = function(url) {
    $http({
      method: 'GET',
      url: url}).success(function(data) {
          $scope.air_obj = data;
      });
  }

  // Function to calucalte the nautical miles between two airports
  $scope.calc_miles = function() {
    // Set radius of the eart in km
    var R = 6371;

    // Set the lat/lng points for the two airports
    var lat1 = $scope.selectedAirport.lat, lng1 = $scope.selectedAirport.lng,
        lat2 = $scope.selectedAirport2.lat, lng2 = $scope.selectedAirport2.lng;

    // Convert lat and lat/lng differences to radians
    var r_lat1 = lat1.toRad(), r_lat2 = lat2.toRad(), r_lng1 = lng1.toRad(), r_lng2 = lng2.toRad(),
        r_lat_dif = (lat2 - lat1).toRad(), r_lng_dif = (lng2 - lng1).toRad();

    // Calculate natical miles
    var a = Math.sin(r_lat_dif/2) * Math.sin(r_lat_dif/2) + Math.cos(r_lat1)*Math.cos(r_lat2) *
            Math.sin(r_lng_dif/2) * Math.sin(r_lng_dif/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = (R * c)/1.852;
    $scope.nautical_miles = d;

    // Get midpoint coordinates
    // Need to improve
    // var bx = Math.cos(r_lat2) * Math.cos(r_lng_dif),
    //     by = Math.sin(r_lat2) * Math.sin(r_lng_dif);

    // var lat3 = Math.atan2(Math.sin(r_lat1) + Math.sin(r_lat2), Math.sqrt( (Math.cos(r_lat1) + bx) * (Math.cos(r_lat1) + bx) + by*by));
    // var lng3 = r_lat1 + Math.atan2(by, Math.cos(r_lng1) + bx);
    // lat3_d = (lat3*180)/Math.PI;
    // lng3_d = (lng3*180)/Math.PI;

    // Build map and add markers
    var mapOptions, map, airport1, airport2, directFlight, marker1, marker2, flightPath;

    mapOptions = {
      zoom: 4,
      center: new google.maps.LatLng(39.833333, -98.583333)
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    airport1 = new google.maps.LatLng(lat1, -lng1);
    airport2 = new google.maps.LatLng(lat2, -lng2);

    directFlight = [ airport1, airport2];

    marker1 = new google.maps.Marker({
      position: airport1,
      map: map,
      title: $scope.selectedAirport.airport
    });

    marker2 = new google.maps.Marker({
      position: airport2,
      map: map
    });

    flightPath = new google.maps.Polyline({
      path: directFlight,
      geodesic: true,
      strokeColor: '#3498db',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    flightPath.setMap(map);
    $('.results_container').show();
  }
}



// Add degree to radian conversion to number prototype
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}



