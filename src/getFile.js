var jsonPadding = require( './jsonPadding' );
var ajax        = require( './ajax' );

/**
 *
 * @param url
 * @param success
 * @param error
 * @param jsonpCallback
 * @returns {XMLHttpRequest|*}
 */
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