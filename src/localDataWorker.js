var ls = window.localStorage;

module.exports = {
    support: (function () {
        /**
         * 检测是否支持localStorage，
         * 有如下几种情况：
         *      1、不支持；
         *      2、隐私模式；
         *      3、写满了；
         * @param cb
         * @returns {boolean}
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

        return _support( function () {
            ls.clear();
            return _support();
        } );
    })(),

    /**
     * 写
     * @param key
     * @param value
     * @returns {exports}
     */
    setItem: function ( key, value ) {
        if ( this.support ) {
            ls.setItem( key, value );
        }
        // else do cookie.
        return this;
    },

    /**
     * 读
     * @param key
     * @returns {null}
     */
    getItem: function ( key ) {
        return this.support ? ls.getItem( key ) : null;
    }
};