var LOCATIONS = [
  "Sibiu", "Bucharest", "Berlin", "Paris", "Hamburg", "London", "Amsterdam",
  "New York", "Tokyo", "Beijing", "Sydney", "Johannesburg", "Cairo", "Tehran",
  "San Francisco", "Oslo", "Copenhagen", "Helsinki", "Reykjavik", "Barcelona",
  "Moscow", "Sofia", "Buenos Aires", "Yerevan", "Bogota", "La Paz",
  "Kodinsk, Russia", "Osaka, Japan", "Las Palmas, Spain", "Tijuana, Mexico"
];

var DEFAULT_UNITS = "c"
var RANDOM_LOCATION = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

const DEG = "&deg;";

const DARKSKY_A_K = "e3aeb4ac08abf531bf8a35f20224f683";
const WAQI_A_K = "533b03f58a2c03b0e9d4de287cf858ed5279ed53";
const OPENCAGE_A_K ="6ad9e7ffedd3433685452d40d38f19bb";
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

function title(textTile) {
  return "<span class=title>" + textTile + "&nbsp;&nbsp;</span>";
}

function paragraph(element) {
  return "<p>" + element + "</p>";
}

function concat() {
  return Object.values(arguments).reduce((a, b) => a + b, "")
}

function getUnits(weatherId) {
  return $(weatherId.concat(" .units-button")).val()
}

function showError(weatherId, message) {
  $(weatherId.concat(" .weather-header"))
    .html(concat("<p class=error>", message, "</p>"));
}

// convert weather api icon label to characters
function icon(iconName) {
  switch(iconName) {
    case "clear-day": return "1";
    case "clear-night": return "6";
    case "rain": return "M";
    case "snow": return "I";
    case "sleet": return "W";
    case "wind": return ",";
    case "fog": return "…";
    case "cloudy": return "3";
    case "partly-cloudy-day": return "A";
    case "partly-cloudy-night": return "a";
    default: return "“"
  }
}

function showWeather(weather, placeName, weatherId) {
  getAirQuality(weather.latitude, weather.longitude, weatherId);

  $(weatherId.concat(" .weather-header")).html(concat(
    "<span class='icon'>", icon(weather.icon), "</span> ",
    weather.temp, " ", DEG, weather.unit.toUpperCase()));

  var currentSummary = paragraph(concat(
    title("Current Condition"), weather.currently, ", "
   , weather.temp, " ", DEG, weather.unit.toUpperCase()));

  var humidity = paragraph(concat(
    title("Humidity"), Math.floor(weather.humidity * 100), " %"));

  var wind = paragraph(concat(
    title("Wind"), weather.windSpeed, " ", weather.windSpeedUnits));

  var astronomy = paragraph(
    concat(title("Astronomy"), "<span class=small-icon>7</span> ",
    weather.sunrise, " <span class=small-icon>8</span> ",
    weather.sunset)
  )

  var today = paragraph(
    concat(title("Today"), weather.forecast[0].summary,
    " <span class=low>&darr;</span> ", weather.forecast[0].low, DEG,
    " <span class=high>&uarr;</span> ", weather.forecast[0].high, DEG))

  var forecast = "";
  for(var i = 1; i < 4; i++) {
    item = weather.forecast[i]
    forecast +=
      paragraph(
        concat(
          title(item.weekday), item.summary,
          " <span class=low>&darr;</span> ", item.low, DEG,
          " <span class=high>&uarr;</span> ", item.high, DEG
        )
      )
  }

  $(weatherId.concat(" .weather-items")).children().show();
  $(weatherId.concat(" .summary-items")).html(concat(
    currentSummary, humidity, wind, today, astronomy, forecast));

  $(weatherId.concat(" .location-data")).html(placeName);
  $(weatherId.concat(".weather-items-hr")).show();

  $(weatherId.concat(" .coordinates"))
    .html(weather.latitude + ", " + weather.longitude );
}

function showAirQuality(airQuality, weatherId) {
  $(weatherId.concat(" .air-quality-items")).children().show();
  $(weatherId.concat(" .air-quality"))
    .html(title("Air Quality") + airQualityData(airQuality.data.aqi));
  $(weatherId.concat(" .aiq-recorded-at"))
    .html(title("Air Quality Location") + airQuality.data.city.name);
}

function getAirQuality(latitude, longitude, weatherId) {
  var air_quality_uri = AIR_QUALITY_URL + latitude + ";" + longitude +
    "/?token=" + WAQI_A_K;

  $.ajax({
    url: air_quality_uri,
    dataType: 'json',
    success: function(data) {
      showAirQuality(data, weatherId);
    },
    timeout: 2000
  });
}

function geocodeAndGetWeather(place, units, weatherId) {
  $.openCageGeocode(
    {
      place: place,
      apikey: OPENCAGE_A_K,
      success: function(geoData) {
        getWeather(geoData, units, weatherId);
      },
      error: function(error) {
        showError(weatherId, error);
      }
  });
}

//get weather information and display it
function getWeather(geoData, units, weatherId) {
  $.simplerWeather(
    {
      location: geoData.latitude + ", " + geoData.longitude, units,
      apikey: DARKSKY_A_K,
      units: units,
      success: function(weather) {
        showWeather(weather, geoData.placeName, weatherId)
      },

      error: function(error) {
        showError(weatherId, error.message);
      }
  });
}

//hide weather elements and show loading icon
function showLoadingIcon(weatherId) {
  $(weatherId.concat(" .weather-items")).children().hide();
  $(weatherId.concat(" .air-quality-items")).children().hide();
  $(weatherId.concat(" .weather-header"))
    .html(
      "<img src='images/loading.gif' width=50 alt='Loading...'><br />" +
      "<br /><p class=loading>Loading weather information...</p>"
    );
}

if ("geolocation" in navigator) {
  $("#js-geolocation").show();

} else {
  $("#js-geolocation").hide();
}

//$(document).ready(function() {
//  //display weather for one of the locations in LOCATIONS
//  showLoadingIcon("#weather-1")
//  geocodeAndGetWeather(RANDOM_LOCATION, "c", "#weather-1");
//});

$(document).ready(function() {
  $(".units-button")
    .html("&deg;" + DEFAULT_UNITS.toUpperCase())
    .val(DEFAULT_UNITS)
});

$(".js-geolocation").click(function() {
  var weatherId = "#".concat(($(this).attr("name")))

  navigator.geolocation.getCurrentPosition(function(position) {
    //if user enables location services
    showLoadingIcon(weatherId);
    geocodeAndGetWeather(
      position.coords.latitude + "," +
      position.coords.longitude, getUnits(weatherId),
      weatherId
    );
  }, function() {
    //if user disables location services
    showError(
      weatherId,
      "Could not get current position. Please enable location services.");
    $(weatherId.concat(" .weather-items")).children().hide();
  });
});

$(".units-button").click(function () {
  $(this)
    .text( function(_, v) { return v == "°C" ? "°F" : "°C"; })
    .val( function(_, v) { return v == "c" ? "f" : "c"; })

  $(this).toggleClass("button-pushed");
});

function triggerWeatherFlow(clickedElement) {
  var weatherId = "#".concat(clickedElement.attr("name"))
  showLoadingIcon(weatherId);

  var inputLocation = $(weatherId.concat(" .input-location")).val();
  if (inputLocation) {
    geocodeAndGetWeather(inputLocation, getUnits(weatherId), weatherId)
  } else {
    showError(weatherId, "Please provide a location.")
  }
}

$(".submit-location").click(function() {
  triggerWeatherFlow($(this));
});


$(".input-location").keypress(function (e) {
  if (e.which == 13) {
    triggerWeatherFlow($(this));
  }
});

$("#info-button").click(function () {
  //toggle info panel
  $("#info-details").slideToggle("slow");
  $(this).toggleClass("button-pushed");
});

$("#add-weather-button").click(function () {
  $("#weather-1").toggleClass("col-xs-12").toggleClass("col-xs-6")
  $("#weather-2").toggle()
  $(this)
    .toggleClass("add-weather")
    .toggleClass("remove-weather")
});
