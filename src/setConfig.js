var data = require( './CONFIG' );

module.exports = function ( setting ) {
    
    var k;
    var key;
    var curr;
    var prev;

    for ( key in setting ) {
        curr = setting[key];
        prev = data[key];

        if ( prev && typeof prev === 'object' ) {
            for ( k in prev ) {
                prev[k] = curr[k];
            }
        } else {
            data[key] = curr;
        }
    }
};