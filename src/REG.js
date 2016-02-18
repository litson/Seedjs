/**
 * REG集
 * @type {Object} REG集
 */
module.exports = {
    // @type {RegExp} 是否是css
    IS_CSS      : /\.css(?:\?|$)/i,
    // @type {RegExp} 资源地址"?"后的参数
    PARAM       : /^(.*\.(?:css|js))(.*)$/i,
    // @type {RegExp} 是否是绝对路径
    ABSOLUTE    : /^\/\/.|:\//,
    // @type {RegExp} url参数关键字
    URL_OPERATOR: /[&?]{1,2}/
};