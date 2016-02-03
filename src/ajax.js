var appendQuery = require( './appendQuery' );

/**
 *
 * @param url
 * @param success
 * @param error
 * @returns {XMLHttpRequest}
 */
module.exports = function ( url, success, error ) {
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', appendQuery( url, ('_s_t_=' + (+new Date)) ), true );

    xhr.onreadystatechange = function () {
        if ( xhr.readyState === 4 ) {
            xhr.onreadystatechange = null;
            if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 ) {
                success && success( xhr.responseText, xhr );
            } else {
                error && error();
            }
        }
    };

    xhr.send( null );
    return xhr;
};