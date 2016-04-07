/**
 * 全局配置文件
 * @type {Object}
 * @note 一些默认值为“false”的配置，改为在注视中显示声明；
 */
module.exports = {
    // @type {String} 路径基准
    base: location.origin,

    // @type {Boolean} 开启无缓模式
    // debug: false,

    // @type {String | Null} jsonp前缀
    // jsonp: null,

    // @type {Null | function} 映射函数
    // map: null,

    // @type {Null | Function} 获取数据后过的钩子函数
    // load: null,

    // @type {String} DOM查找界定符([data-[delimiter]])
    delimiter: 'seed'
};
