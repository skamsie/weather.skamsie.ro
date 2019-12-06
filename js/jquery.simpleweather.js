// Based on https://github.com/BrookeDot/SimplerWeather

( function( $ ) {
  "use strict";

  function getAltTemp( unit, temp ) {
    if( unit === "f" ) {
      return Math.round( ( 5.0 / 9.0 ) * ( temp - 32.0 ) );
    } else {
      return Math.round( ( 9.0 / 5.0 ) * temp + 32.0 );
    }
  }

  $.extend( {
    simplerWeather: function( options ) {
      options = $.extend( {
        location: "",
        units: "f",
        authmethod: "apikey",
        apikey: "",
        proxyurl: "",
        forecast: "true",
        forecastdays: "4",
        success: function(_weather) {},
        error: function(_message) {}
      }, options );

      //Sets the units based on https://darksky.net/dev/docs
      if( options.units.toLowerCase() === "c" ) {
        var units = "si"
      } else {
        var units = "us"
      }

      function getWeatherURL( authmethod ) {
        var geoLocation = options.location.split( ',' );
        var lat = geoLocation[ 0 ];
        var lon = geoLocation[ 1 ];
        if( authmethod === "apikey" && options.apikey !== '' ) {
          var apiKey = encodeURIComponent( options.apikey );
          return "https://api.darksky.net/forecast/" + apiKey + "/" +
            lat + "," + lon + "/?units=" + units +
            "&exclude=minutely,hourly,alerts,flags";
        } else if( authmethod === "proxy" && options.proxyurl !== "" ) {
          return encodeURI( options.proxyurl + "?lat=" + lat + "&lon=" +
            lon + "&units=" + units );
        } else {
          options.error(
            "Could not retrieve weather due to an invalid api key or proxy setting."
          );
        }
      }

      function formatTime(timeStamp, timeZone) {
        if (isNaN(timeStamp)) {
          return "NA"
        } else {
          return new Date(timeStamp * 1000)
            .toLocaleTimeString(
              "en-US", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: timeZone
              }
            );
        }
      }

      function formatWeekday(timeStamp, timeZone) {
        return new Date(timeStamp * 1000)
          .toLocaleDateString(
            "en-US", { weekday: "long", timeZone: timeZone }
          );
      }

      $.getJSON(
        encodeURI( getWeatherURL( options.authmethod ) + "&callback=?" ),
        function( data ) {
          console.log(data);
          if( data !== null ) {
            var result = data,
              weather = {};

            weather.latitude = result.latitude
            weather.longitude = result.longitude
            weather.temp = Math.round(result.currently.temperature);
            weather.windSpeed = result.currently.windSpeed;
            weather.windSpeedUnits = (options.units == "c" ? "m/s" : "mph");
            weather.currently = result.currently.summary;
            weather.icon = result.currently.icon;
            weather.pressure = result.currently.pressure;
            weather.humidity = result.currently.humidity;
            weather.visibility = result.currently.visibility;
            weather.feelsLike = Math.round(
              result.currently.apparentTemperature);
            weather.updated = result.currently.time;

            weather.high = result.daily.data[0].temperatureHigh;
            weather.low = result.daily.data[0].temperatureLow;
            weather.sunrise = formatTime(
              result.daily.data[0].sunriseTime, result.timezone);
            weather.sunset = formatTime(
              result.daily.data[0].sunsetTime, result.timezone);
            weather.description = result.daily.data[0].summary;

            weather.attributionlink = "https://darksky.net/";
            weather.unit = options.units.toLowerCase();

            if( weather.unit === "f" ) {
              weather.altunit = "c";
            } else {
              weather.altunit = "f";
            }

            weather.alt = {
              temp: getAltTemp( options.units, weather.temp ),
              high: getAltTemp( options.unit, weather.high ),
              low: getAltTemp( options.unit, weather.low )
            };

            if( options.forecast &&
              parseInt( options.forecastdays ) !== "NaN" ) {

              weather.forecast = [];

              for( var i = 0; i < options.forecastdays; i++ ) {
                var forecast = result.daily.data[ i ];
                forecast.date = forecast.time;
                forecast.weekday = formatWeekday(
                  forecast.time, result.timezone);
                forecast.summary = forecast.summary;
                forecast.high = Math.round(forecast.temperatureHigh);
                forecast.low = Math.round(forecast.temperatureLow);
                forecast.icon = forecast.icon;


                forecast.alt = {
                  high: getAltTemp( options.units, forecast.temperatureHigh ),
                  low: getAltTemp( options.units, forecast.temperatureLow )
                };

                weather.forecast.push( forecast );
              }
            }
            options.success( weather );
          } else {
            options.error(
              "There was a problem retrieving the latest weather information."
            );
          }
        }
      );
      return this;
    }
  } );
} )( jQuery );
