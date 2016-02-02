var jsonPadding = require( './jsonPadding' );
var ajax        = require( './ajax' );

module.exports = function ( url, success, error, jsonpCallback ) {
    return jsonpCallback
        ? jsonPadding(
        jsonpCallback,
        url,
        function ( data ) {
            success && success( data );
        },
        function () {
            error && error();
        }
    )
        : ajax(
        url,
        success,
        error
    );
};



