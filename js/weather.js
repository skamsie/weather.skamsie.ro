var LOCATIONS = ['Sibiu', 'Bucharest', 'Berlin', 'Paris', 'Hamburg', 'London', 'Amsterdam',
                 'New York', 'Tokyo', 'Beijing', 'Sydney', 'Johannesburg', 'Cairo',
                 'San Francisco', 'Oslo', 'Copenhagen', 'Helsinki'];
var UNITS = 'c';
var RANDOM_LOCATION = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
var WOEID = ''

function getWeather(locationName, tempUnits) {
  //get weather information and display it

  var locationData = '';
  var separator = '';
  
  $.simpleWeather({

    location: locationName,
    woeid: '',
    unit: tempUnits,
    success: function(weather) {
      html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';

        if (weather.region != '') {
		      separator = ', ';
		    };

      locationData = '<span id=weather-city>'+weather.city+'</span>'+separator+weather.region+', '+weather.country;

      $(".weather-items").children().show();
      $("#custom-weather").html(html);
      $("#location-data").html(locationData);
      $("#weather-items-hr").show();
      $("#current-condition").html('Current condition: ' + weather.currently + ' ' + weather.temp + '&deg;' + weather.units.temp);
      $("#humidity").html('Humidity: ' + weather.humidity + ' %');
      $("#wind").html('<span class=small-icon>,</span> '+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed);
      $("#day-low-high").html("Today's forecast: <span class=low>&darr;</span> " + weather.low + '&deg;' + " <span class=high>&uarr;</span> " + weather.high + '&deg;');
      $("#tomorrow").html('Tomorrow: ' + weather.forecast[1].text + '  <span class=low>&darr;</span> ' + weather.forecast[1].low + '&deg;' + ' <span class=high>&uarr;</span> ' + weather.forecast[1].high + '&deg;')
      $("#sun").html('Sun: <span class=small-icon>7</span> ' + weather.sunrise + ' <span class=small-icon>8</span> ' + weather.sunset)
      $("#last-update").html('Last Update: '+weather.updated);

	  },

	  error: function(error) {
	    showLoadingIcon();
		  $("#custom-weather").html("<p id=error>" +error.message+  "</p>");
	  }

  });

}

function showLoadingIcon() {
  //hide weather elements and show loading icon

  $(".weather-items").children().hide();
	$("#weather-items-hr").hide();
	$("#custom-weather").html('<img src="images/loading.gif" width=50 alt="Loading..."><br /><br /><p id=loading>Loading weather information...</p>');

}

if ("geolocation" in navigator) {
  $('#js-geolocation').show();

} else {
  $('#js-geolocation').hide();
}

$(document).ready(function() {
  //display weather for one of the locations in LOCATIONS
  //getWOEID(44.4174097,26.1269814);
  showLoadingIcon()
  getWeather(RANDOM_LOCATION, 'c');  

});

$('#js-geolocation').click(function() {
  //load weather using user latitude and longitude coordinates  

  navigator.geolocation.getCurrentPosition(function(position) {
    //if user enables location services
    showLoadingIcon();
    getWeather(position.coords.latitude + ',' + position.coords.longitude, UNITS); 
  }, function() {
    //if user disables location services
    $("#custom-weather").html("<p id=error>Could not get current position. Please enable location services.</p>");
    $(".weather-items").children().hide();
    $("#weather-items-hr").hide();
  });

});

$("#units-button").click(function () {
  // toggle measurement units and change button color accordingly

  $(this).text(function(i, v){
    return v == '°C' ? '°F' : '°C';
  });
  if (UNITS == 'c') {
    UNITS = 'f';
  } else {
    UNITS = 'c';
  }
  $(this).toggleClass('units-pushed-button');

});


$('#submit-location').click(function() {
  //get weather for the location selected by the user
  showLoadingIcon();
  var inputLocation = $('#input-location').val();
  getWeather(inputLocation, UNITS);

});


$('#input-location').keypress(function (e) {
  if (e.which == 13) {
    showLoadingIcon();
    var inputLocation = $('#input-location').val();
    getWeather(inputLocation, UNITS);
    return false;
  }

});

$("#info-button").click(function () {
  //toggle info panel
  $("#info-details").slideToggle("slow");
  $(this).toggleClass('info-pushed-button');

});

