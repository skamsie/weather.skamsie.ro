var LOCATIONS = [
  "Sibiu", "Bucharest", "Berlin", "Paris", "Hamburg", "London", "Amsterdam",
  "New York", "Tokyo", "Beijing", "Sydney", "Johannesburg", "Cairo", "Tehran",
  "San Francisco", "Oslo", "Copenhagen", "Helsinki", "Reykjavik", "Barcelona",
  "Moscow", "Sofia", "Buenos Aires", "Yerevan", "Bogota", "La Paz"
];
var UNITS = "c";
var RANDOM_LOCATION = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

const DEG = "&deg;";
const TODAY = "<span class=title>Today: </span>";
const HUMIDITY = "<span class=title>Humidity: </span>";
const WIND = "<span class=title>Wind: </span>"
const CURRENT = "<span class=title>Current Condition: </span>";
const LAST_UPDATE = "<span class=title>Weather Last Updated: </span>";
const ASTRONOMY = "<span class=title>Astronomy: </span>";
const AIR_QUALITY_URL = "https://api.waqi.info/feed/geo:"


function airQualityData(aiq) {
  if (0 <= aiq && aiq <= 50) {
    return "<span style='color:#00A000;'> " + aiq + " Good </span>"
  } else if (51 <= aiq && aiq <= 100) {
    return "<span style='color:gold;'> " + aiq + " Moderate </span>"
  } else if (101 <= aiq && aiq <= 150) {
    return "<span style='color:coral;'> " + aiq +
      " Unhealthy for sensitive groups </span>"
  } else if (151 <= aiq && aiq <= 200) {
    return "<span style='color:salmon;'> " + aiq + " Unhealthy </span>"
  } else if (201 <= aiq && aiq <= 300) {
    return "<span style='color:orangered;'> " + aiq + " Very Unhealthy </span>"
  } else if (aiq >= 301) {
    return "<span style='color:#D00000;'> " + aiq + " Hazardous </span>"
  } else {
    return aiq
  }
}

function getAirQuality(latitude, longitude) {
  var air_quality_url = AIR_QUALITY_URL + latitude + ";" + longitude +
    "/?token=533b03f58a2c03b0e9d4de287cf858ed5279ed53";

  $.ajax({
    url: air_quality_url,
    dataType: 'json',
    success: function(data) {
      $(".air-quality-items").children().show();
      $("#air-quality")
        .html(
          "<span class='title'>Air Quality: </span>" +
          airQualityData(data.data.aqi));
      $("#aiq-recorded-at")
        .html("<span class='title'> Air Q. Location: </span>" +
          data.data.city.name);
    },
    timeout: 2000
  });
}

function geocodeAndGetWeather(place, tempUnits) {
  $.openCageGeocode(
    {
      place: place,
      apikey: '6ad9e7ffedd3433685452d40d38f19bb',
      success: function(geoData) {
        getWeather(geoData, tempUnits);
      },
      error: function(error) {
        showLoadingIcon();
        $("#custom-weather").html("<p id=error>" + error +  "</p>");
      }
  });
}

function getWeather(geoData, tempUnits) {
  //get weather information and display it

  $.simplerWeather(
    {
      location: geoData.latitude + ", " + geoData.longitude, tempUnits,
      apikey: 'e767bd753e5d345eae07bbc9d9e8ee92',
      units: tempUnits,
      success: function(weather) {
        var html = "<h2><i class='icon-" + weather.icon + "'></i> " +
          weather.temp + DEG + weather.unit.toUpperCase() + "</h2>";

        getAirQuality(weather.latitude, weather.longitude);

        $(".weather-items").children().show();
        $("#custom-weather").html(html);
        $("#location-data").html(geoData.placeName);
        $("#weather-items-hr").show();
        $("#current-condition")
          .html(
            CURRENT + weather.currently + " " + weather.temp +
            DEG + weather.unit.toUpperCase()
          );
        $("#humidity").html(HUMIDITY + weather.humidity + " %");
        $("#wind").html(WIND + weather.windSpeed);
        $("#today")
          .html(
            TODAY + weather.forecast[0].summary +
            " <span class=low>&darr;</span> " + weather.forecast[0].low + DEG +
            " <span class=high>&uarr;</span> " + weather.forecast[0].high + DEG
          );
        $("#tomorrow")
          .html(
            "<span class=title>" + weather.forecast[1].date + ": </span>" +
            weather.forecast[1].summary + " <span class=low>&darr;</span> " +
            weather.forecast[1].low + DEG + " <span class=high>&uarr;</span> " +
            weather.forecast[1].high + DEG
          );
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
  $(".air-quality-items").children().hide();
  $("#weather-items-hr").hide();
  $("#custom-weather")
    .html(
      "<img src='images/loading.gif' width=50 alt='Loading...'><br />" +
      "<br /><p id=loading>Loading weather information...</p>"
    );
}

if ("geolocation" in navigator) {
  $("#js-geolocation").show();

} else {
  $("#js-geolocation").hide();
}

$(document).ready(function() {
  //display weather for one of the locations in LOCATIONS
  showLoadingIcon()
  geocodeAndGetWeather(RANDOM_LOCATION, "c");
});

$("#js-geolocation").click(function() {
  //load weather using user latitude and longitude coordinates

  navigator.geolocation.getCurrentPosition(function(position) {
    //if user enables location services
    showLoadingIcon();
    geocodeAndGetWeather(
      position.coords.latitude + "," +
      position.coords.longitude, UNITS
    );
  }, function() {
    //if user disables location services
    $("#custom-weather")
      .html(
        "<p id=error>Could not get current position. " +
        "Please enable location services.</p>"
      );
    $(".weather-items").children().hide();
    $("#weather-items-hr").hide();
  });
});

$("#units-button").click(function () {
  // toggle measurement units and change button color accordingly

  $(this).text(function(i, v){
    return v == "°C" ? "°F" : "°C";
  });
  if (UNITS == "c") {
    UNITS = "f";
  } else {
    UNITS = "c";
  }
  $(this).toggleClass("units-pushed-button");
});


$("#submit-location").click(function() {
  //get weather for the location selected by the user
  showLoadingIcon();
  var inputLocation = $("#input-location").val() || "";
  geocodeAndGetWeather(inputLocation, UNITS);
});


$('#input-location').keypress(function (e) {
  if (e.which == 13) {
    showLoadingIcon();
    var inputLocation = $('#input-location').val() || "";
    geocodeAndGetWeather(inputLocation, UNITS);
    return false;
  }
});

$("#info-button").click(function () {
  //toggle info panel
  $("#info-details").slideToggle("slow");
  $(this).toggleClass('info-pushed-button');
});
