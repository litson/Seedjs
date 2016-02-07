var REG = require( './REG' );

/**
 *
 * @param url
 * @param query
 * @returns {string}
 */
module.exports = function ( url, query ) {
    return (query === '') ? url : (url + '&' + query).replace( REG.URL_OPERATOR, '?' );
};