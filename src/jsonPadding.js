/**
 *
 * @param jsonpCallback
 * @param url
 * @param success
 * @param error
 */
module.exports = function ( jsonpCallback, url, success, error ) {

    var responseData;

    window[jsonpCallback] = function () {
        responseData = arguments;
    };

    var node   = document.createElement( 'SCRIPT' );
    var header = document.head;

    node.onload = node.onerror = function ( event ) {
        (event.type === 'load') ? success.apply( null, responseData ) : error( event );
        _clean( node );
        node = null;
    };

    node.src = url;
    header.insertBefore( node, header.firstChild );

    function _clean( node ) {
        node.onload = node.onerror = null;
        for ( var p in node ) {
            delete node[p];
        }
        header.removeChild( node );
    }
};