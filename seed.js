/**
 * [__seed_package__ description]
 * @param  {[type]} root      [description]
 * @param  {[type]} undefined [description]
 * @return {[type]}           [description]
 */
! function __seed_package__(root, undefined) {

    if (root.Seed) {
        return;
    }

    var noop = function() {};

    var ls = root.localStorage;
    var doc = document;
    var header = doc.head;
    var body = doc.body;

    var ABSOLUTE_RE = /^\/\/.|:\//;
    var IS_CSS_RE = /\.css(?:\?|$)/i;

    var seed = root.Seed = {
        DEBUG: true,
        // getFile: getFile,
        support: isSupportLocalStorage(),
        use: use,
        config: config,
        openRealtimeDebugMode: openRealtimeDebugMode,
        // cache: {}
        version: '1.0.0'
    };

    var data = seed.data = {};

    data.base = location.origin;

    /**
     * [use description]
     * @param  {[type]} ids      [description]
     * @param  {[type]} callBack [description]
     * @return {[type]}          [description]
     */
    function use(ids, callBack) {
        var ids = ids;
        if (!Array.isArray(ids)) {
            if (getType(ids) === 'string') {
                ids = [ids];
            } else {
                log('warn', '[类型错误]请提供一个文件名或者文件名数组！');
                return false;
            }
        };

        log('原始数据：', ids);

        ids = parseIds(ids);

        log('路由寻找到：', ids);

        ids = ids.filter(function(item) {
            if (!doc.getElementById(item)) {
                return item;
            } else {
                log('warn', item, '已经被下载！');
            }
        });

        ids.length && dock(ids, function(codeStringQueue) {
            codeStringQueue.forEach(function(item, index) {
                executeCode(item.data, item.id);
            });
            callBack && callBack();
        });

        return seed;
    };

    /**
     * [config description]
     * @param  {[type]} setting [description]
     * @return {[type]}         [description]
     */
    function config(setting) {
        var key;
        var k;
        var curr;
        var prev;
        for (key in setting) {
            curr = setting[key];
            prev = data[key];

            if (prev && getType(prev) === 'object') {
                for (k in prev) {
                    prev[k] = curr[k];
                }
            } else {
                data[key] = curr;
            }
        }
        return seed;
    };

    /**
     * [openRealtimeDebugMode description]
     * @return {[type]} [description]
     */
    function openRealtimeDebugMode() {
        log('============ 已开启无缓存模式 ============');
        data.expires = +new Date;
        return seed;
    };

    /**
     * [parseAlias description]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    function parseAlias(id) {
        var alias = data.alias;
        return alias && (getType(alias[id]) === 'string') ? alias[id] : id;
    };

    /**
     * [parseMap description]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    function parseMap(id) {
        var map = data.map;
        var result = id;
        return result;
    };

    /**
     * [parseIds description]
     * @param  {[type]} ids [description]
     * @return {[type]}     [description]
     */
    function parseIds(ids) {
        var result = [];
        ids.forEach(function(item, index) {

            /**
             * 104 === h ( http, https )
             * 46  === . ( ./ )
             * 47  === / ( / )
             */
            // var charCode = item.charCodeAt(0);

            var item = item.trim();

            if (!ABSOLUTE_RE.test(item)) {
                // 如果非绝对路径，则先在别名中查找
                var relative = parseAlias(item);
                // 如果别名中已存在该路径，则使用
                item = relative ? relative : item;
                // 再做一次十分是绝对路径的检测，因为允许在别名中配置其他‘绝对路径的文件’；
                item = (ABSOLUTE_RE.test(item) ? item : data.base + item);
                // TODO:匹配映射，去掉版本号什么的。
                item = parseMap(item);
            }

            result.push(item);


        });
        return result;
    };

    /**
     * 对比过期时间
     * @param  {[type]} ms [description]
     * @return {[type]}    是否过期，未过期false，已过期true
     */
    function hasExpired(ms) {
        var expire = data.expires;
        // 如果用户未设置更新时间
        if (!expire) {
            return false;
        }
        expire = (getType(expire) === 'date') ? expire : new Date(expire);

        // 判断是不是invlid date,列举了3中方法。。
        // expire = (expire.getDate().toString() === 'NaN') ? 0 : (+expire);
        // expire = (Date.prototype.toString.call(expire) === 'Invalid Date') ? 0 : (+expire);
        expire = (expire.valueOf().toString() === 'NaN') ? 0 : (+expire);

        // 用户设置了过期时间，则对比是否已过期
        return ms < data.expires;
    }

    /**
     * [executeCode description]
     * @param  {[type]} codeString [description]
     * @param  {[type]} uid        [description]
     * @return {[type]}            [description]
     */
    function executeCode(codeString, uid) {

        var isCSS = IS_CSS_RE.test(uid);
        var fileType;
        // var fileWayType;
        var fileWayValue;
        var node;
        var target;

        isCSS
            ? (fileType = 'style', fileWayValue = 'text/css', target = header) : (fileType = 'script', fileWayValue = 'text/javascript', target = body);

        node = doc.createElement(fileType);
        node.id = uid;
        node.type = fileWayValue;
        target.appendChild(node);
        node.innerHTML = codeString;
        log('已执行：', uid);
    };

    /**
     * 根据一个ID的列表，下载
     * @param  {[type]} ids      [description]
     * @param  {[type]} callBack [description]
     * @return {[type]}          [description]
     */
    function dock(ids, callBack) {
        var codeStringQueue = [];
        var fns = [];

        var fnWrapperFromRemote = function(id) {
            return function(next) {
                getFile(id, function(codeString) {
                    codeStringQueue.push({
                        data: codeString,
                        id: id
                    });
                    seed.support && ls.setItem(id, codeString);
                    next();
                }, function() {
                    next();
                });
            }
        };

        var fnWrapperFromLocal = function(id) {
            return function(next) {
                codeStringQueue.push({
                    data: ls.getItem(id),
                    id: id
                });
                next();
            }
        };

        var needLoadData = (function() {
            // 如果不支持localstorge
            if (!seed.support) {
                return true;
            }

            // 判断是否过期
            // 获取本地文件的最后修改时间，如果没有则为0；
            var expire = ls.getItem('__seed_expire__');
            expire = expire ? expire : 0;

            // 如果已过期，则不能从本地取
            if (hasExpired(expire)) {
                // 重新设置过期时间
                ls.setItem('__seed_expire__', data.expires);
                return true;
            }
            return false;
        })();


        // 打包成一个函数队列
        ids.forEach(function(id) {

            if (needLoadData) {
                fns.push(fnWrapperFromRemote(id));
            } else {
                if (seed.support && !ls.getItem(id)) {
                    fns.push(fnWrapperFromRemote(id));
                } else {
                    fns.push(fnWrapperFromLocal(id));
                }
            }

        });

        // 函数队列追加一个函数，待完成后执行回调
        fns.push(function() {
            callBack && callBack(codeStringQueue);
        });

        // 执行函数队列
        queue(fns);
    };

    /**
     * [队列函数]
     * @param  {[Array]} fns     [函数队列]
     * @param  {[Object]} context [函数的执行上下文]
     */
    function queue(fns, context) {
        (function next() {
            if (fns.length > 0) {
                var fn = fns.shift();
                fn.apply(context, [next].concat(Array.prototype.slice.call(arguments, 0)));
            }
        })();
    };

    /**
     * [getType description]
     * @param  {[type]}  object [description]
     * @return {Boolean}        [description]
     */
    function getType(object) {
        return Object.prototype.toString.call(object).replace(/\[\object|\]|\s/gi, '').toLowerCase();
    };

    /**
     * [isSupportLocalStorage description]
     * @return {Boolean} [description]
     */
    function isSupportLocalStorage() {
        var support = true;
        try {
            ls.setItem('_seed_test_', 1);
            ls.removeItem('_seed_test_');
        } catch (e) {
            support = false;
        }
        return support;
    };

    /**
     * 目前不支持JSONP，先用AJAX替代
     * @param  {[type]} url      [description]
     * @param  {[type]} callBack [description]
     * @return {[type]}          [description]
     */
    function getFile(url, success, error) {
        log('正在通过AJAX加载：', url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = noop;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    log('已加载：', url);
                    success && success(xhr.responseText, xhr);
                } else {
                    getFileError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, error);
                }
            }
        }
        xhr.send(null);
        return xhr;
    };

    /**
     * [getFileError description]
     * @param  {[type]} error [description]
     * @param  {[type]} type  [description]
     * @param  {[type]} xhr   [description]
     * @return {[type]}       [description]
     */
    function getFileError(error, type, xhr, callBack) {
        log('warn', '资源加载失败！', arguments);
        callBack && callBack(error, type, xhr);
    };

    /**
     * [log description]
     * @return {[type]} [description]
     */
    function log( /* type [, arg1, arg2...etc. ]*/ ) {
        var args = Array.prototype.slice.call(arguments);
        var type = args[0];
        var isSpecified = !!~['warn', 'info', 'error', 'group', 'groupEnd'].indexOf(type);
        args = isSpecified ? (args.shift(), args) : args;
        args.unshift('[Debug:]');
        return seed.DEBUG && console[isSpecified ? type : 'log'].apply(console, args);
    };

}(window);
