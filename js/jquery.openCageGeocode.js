( function( $ ) {
  'use strict';

  $.extend( {
    openCageGeocode: function( options ) {
      options = $.extend( {
        place: '',
        apikey: '',
        success: function( geoData ) {},
        error: function( message ) {}
      }, options );

      let errorMsg = "Could not geocode this location."

      function geocodeURL() {
        var baseURL = "https://api.opencagedata.com/geocode/v1/json?q=";
        var apiKey = "&key=" + options.apikey;

        return encodeURI(baseURL + options.place + apiKey);
      }

      $.getJSON(
        geocodeURL(),
        function( data ) {
          if( data !== null && data.results.length ) {
            console.log(data)
            var geoData = {};
            var firstResult = data.results[0];

            geoData.placeName = firstResult.formatted
            geoData.latitude = firstResult.geometry.lat
            geoData.longitude = firstResult.geometry.lng

            options.success( geoData )
          } else { options.error(errorMsg); }
        }
      ).fail(function(){ options.error(errorMsg); });

      return this;
    }
  } );
} )( jQuery );
