/**
 * 简单选择器
 * @param {String} selector 选择器
 * @returns {NodeList} 元素集
 */
module.exports = function ( selector ) {
    return document.querySelectorAll( selector );
};