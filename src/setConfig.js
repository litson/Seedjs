var config = require( './CONFIG' );

/**
 * 修改配置，支持至多两层配置
 * （后续可能会用到多层这个功能）
 *
 * @param {Object} setting 配置
 */
module.exports = function ( setting ) {

    var k;
    var key;
    var curr;
    var prev;

    for ( key in setting ) {
        curr = setting[key];
        prev = config[key];

        if ( prev && typeof prev === 'object' ) {
            for ( k in prev ) {
                prev[k] = curr[k];
            }
        } else {
            config[key] = curr;
        }
    }
};