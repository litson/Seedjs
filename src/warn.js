/**
 * 打印一些警告
 */
module.exports = function () {
    console.warn.apply(
        console,
        ['[ Seed waring ]'].concat( Array.prototype.slice.call( arguments, 0 ) )
    );
};