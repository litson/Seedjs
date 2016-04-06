var jsonPadding = require( './jsonPadding' );
var ajax        = require( './ajax' );
var conf        = require( './CONFIG' );

/**
 * 获取文件，jsonp 或者 ajax get；
 *
 * @param {String} url 文件地址
 * @param {Function} success 成功回调
 * @param {Function} error 失败回调
 * @param {String} jsonpCallback jsonp前缀
 */
module.exports = function ( url, success, error, jsonpCallback ) {

    // 转向偏业务； this指向当前操作的 “seed文件” 对象
    var _success = function ( ajaxData ) {
        ( conf.load && conf.load( ajaxData ) === false )
            ? error()
            : success( ajaxData );
    };

    // 有jsonp标识，会启用jsonp方法获取，无则用get方法
    jsonpCallback
        ? jsonPadding(
        jsonpCallback,
        url,
        _success,
        error
    )
        : ajax(
        url,
        _success,
        error
    );
};