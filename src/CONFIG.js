/**
 * 全局配置文件
 * @type {Object}
 */
module.exports = {
    // @type {String} 路径基准
    base     : window.location.origin,
    // @type {Boolean} 开启无缓模式
    debug    : false,
    // @type {String | Null} jsonp前缀
    jsonp    : null,
    // @type {String} DOM查找界定符([data-[delimiter]])
    delimiter: 'seed'
};
