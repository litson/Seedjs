/* global define */
define( 'seedRequire', {
    load: function ( name, req, onload, config ) {
        var url = window.location.origin + config.baseUrl + name + '.js';
        Seed.use( url, function () {
            req( [name], function ( value ) {
                onload( value );
            } );
        } );
    }
} );