var appendQuery = require( './appendQuery' );

/**
 * get 方法
 * @param url 地址
 * @param success 成功回调
 * @param error   失败回调
 */
module.exports = function ( url, success, error ) {
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', appendQuery( url, ('_s_t_=' + (+new Date)) ), true );

    xhr.onreadystatechange = function () {
        if ( xhr.readyState === 4 ) {
            xhr.onreadystatechange = null;
            ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 )
                ? success( xhr.responseText )
                : error();
        }
    };
    xhr.send( null );
};