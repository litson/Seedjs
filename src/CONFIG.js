/**
 * 全局配置文件
 * @type {{
 *      base: (*|string),
 *      debug: boolean,
 *      jsonp: null,
 *      delimiter: string
 * }}
 */
module.exports = {
    base     : window.location.origin,
    debug    : false,
    jsonp    : null,
    delimiter: 'seed'
};