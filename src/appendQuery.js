module.exports = function ( url, query ) {
    return (query === '') ? url : (url + '&' + query).replace( /[&?]{1,2}/, '?' );
}