var ls = window.localStorage;

/**
 * 本地存储操作
 *
 * PS: 原有cookie的降级
 *
 * @type {Object}
 */
var localDataWorker = {

    // @type {Boolean} 是否支持
    support: (function () {

        /**
         * 检测是否支持localStorage，
         * 有如下几种情况：
         *      1、不支持；
         *      2、隐私模式；
         *      3、写满了；
         * @param {Function} cb 二次检测回调
         * @returns {Boolean} 是否支持
         * @private
         */
        function _support( cb ) {
            var support = true;
            try {

                // 尝试通过读写检测
                ls.setItem( '__seed_test__', 1 );
                ls.removeItem( '__seed_test__' );
            } catch ( e ) {

                // 发生异常后，交给cb操作
                if ( cb ) {
                    try {
                        support = cb();
                    } catch ( ex ) {
                        support = false;
                    }
                } else {

                    // 读写失败后
                    support = false;
                }
            }

            return support;
        }

        // 递归校验，第一次如果发生异常，尝试清除ls后再次检测
        return _support( function () {
            ls.clear();
            return _support();
        } );
    })(),

    /**
     * 写
     *
     * @param {String} key 键
     * @param {String} value 值
     */
    setItem: function ( key, value ) {
        localDataWorker.support && ls.setItem( key, value );
    },

    /**
     * 读
     * @param {String} key 键
     * @returns {String | Null} 返回值
     */
    getItem: function ( key ) {
        return localDataWorker.support ? ls.getItem( key ) : null;
    },

    /**
     * 移除 | 清空
     *
     * 有参数key，则尝试删除该项，无则全部清空
     * @param {String} key 键
     */
    removeItem: function ( key ) {
        localDataWorker.support
        && (
            key
                ? ls.removeItem( key )
                : ls.clear()
        );
    }
};

module.exports = localDataWorker;