/**
 * 简单选择器
 * @param selector 选择器
 * @returns {NodeList}
 */
module.exports = function ( selector ) {
    return document.querySelectorAll( selector );
};