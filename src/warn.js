/**
 * 打印一些警告
 * @param messages
 */
module.exports = function ( messages ) {
    return console.warn.apply(
        console,
        ['[ Seed waring ]'].concat( Array.prototype.slice.call( arguments, 0 ) )
    )
};