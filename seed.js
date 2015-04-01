/**
 *
 * TODO:
 *     1.支持JSONP拉取combo数据
 *     2.若拉取js出现异常，采用创建script + src的传统方式下载 (会影响执行速度)
 *     3.本地combo文件
 *     4.CSS文件并发下载
 *     5.expires 可否 改为 version方式
 *     6.deal buttom top
 * 
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
    // var header = doc.head;
    // var body = doc.body;

    var ABSOLUTE_RE = /^\/\/.|:\//;
    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var PARAM_RE = /^(.*\.(?:css|js))(.*)$/i;

    // console.dir('http://dfa.cn/b.js?abc'.match(PARAM_RE));

    var seed = root.Seed = {
        // getFile: getFile,
        support: isSupportLocalStorage(),
        use: use,
        config: config,
        openRealtimeDebugMode: openRealtimeDebugMode,
        scan: scan,
        cache: {},
        version: '1.0.0'
    };

    var data = seed.data = {
        debug: false
    };

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
                log('warn', '{fn:Seed.use} --- ', '[类型错误]请提供一个文件名或者文件名数组！');
                return false;
            }
        };

        log('{fn:Seed.use} --- ', '原始数据：', ids);

        ids = parseIds(ids);

        log('{fn:Seed.use} --- ', '路由寻找到：', ids);


        ids = ids.filter(function(item) {
            if (!seed.cache[item.id]) {
                return item;
            } else {
                log('warn', '{fn:Seed.use} --- ', item.id, '已被下载！');
            }
        });

        ids.length && dock(ids, function(codeStringQueue) {
            codeStringQueue.forEach(function(item) {
                seed.cache[item.id] = !0;
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
     * 未完成
     * @return {[type]} [description]
     */
    function scan() {
        var files = doc.querySelectorAll('[data-seed]');

        var len = files.length;
        if (!len) {
            return seed;
        }

        var ids = [];
        var i = 0;
        var temp;

        for (; i < len; i++) {
            temp = files[i];
            ids.push(temp.dataset.seed);
            temp.parentNode.removeChild(temp);
        }

        log('{fn:Seed.scan} --- ', '获取到的种子：', ids);

        return seed.use(ids);
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
     *
     * 'http://example.org/exp.js?hook' ==> 
     * {
     *     id:   'http://example.org/exp.js',
     *     hook: '?hook'
     * }
     * 
     * 
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    function parseHook(originalId) {

        var map = data.map;

        var splited;
        var id;

        var hook = '__seed_version__';
        var mapType = getType(map);

        // 如果映射规则是函数
        if (mapType === 'function') {

            splited = map(originalId);
            // 如果映射规则是正则
        } else if (mapType === 'regexp') {

            splited = originalId.match(map);
            // 如果是错误的映射规则
        } else {
            splited = originalId.match(PARAM_RE);
        }

        // 当映射规则出现故障时，可能会得不到预期的结果
        if (getType(splited) !== 'array') {
            log('warn', '{fn:parseHook} --- ', '\n解析映射规则失败 by\n', map, '\n', originalId, '\n', '使用默认规则');
            splited = originalId.match(PARAM_RE);
        }

        id = splited[1];

        // 若解析后，id未发生变化，则使用默认的hook规则
        if (id !== originalId) {
            hook = splited[2];
        }

        return {
            id: id,
            hook: hook
        };
    };

    /**
     * [parseIds description]
     * @param  {[type]} ids [description]
     * @return {[type]}     [description]
     */
    function parseIds(ids) {
        var result = [];
        ids.forEach(function(item) {

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
                // 再做一次绝对路径的检测，因为允许在alias中配置其他‘绝对路径的文件’；
                item = (ABSOLUTE_RE.test(item) ? item : data.base + item);
                // TODO:匹配映射，去掉版本号什么的。
                item = parseHook(item);
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
        expire = (Date.prototype.toString.call(expire) === 'Invalid Date') ? 0 : (+expire);
        // expire = (expire.valueOf().toString() === 'NaN') ? 0 : (+expire);

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
            ? (fileType = 'style', fileWayValue = 'text/css', target = doc.header) : (fileType = 'script', fileWayValue = 'text/javascript', target = doc.body);

        node = doc.createElement(fileType);
        node.id = uid;
        node.type = fileWayValue;
        target.appendChild(node);
        // node.innerHTML = codeString;
        // innerHTML再js文件超过大概5000行的时候会出输入超限异常。
        node.appendChild(doc.createTextNode(codeString));
        log('{fn:executeCode} --- ', '已执行：', uid);
    };


    // function _exeScript




    /**
     * 根据一个ID的列表，下载
     * @param  {[type]} ids      [description]
     * @param  {[type]} callBack [description]
     * @return {[type]}          [description]
     */
    function dock(ids, callBack) {
        var codeStringQueue = [];
        var fns = [];

        // 远程拉数据方法
        var fnWrapperFromRemote = function(item) {
            return function(next) {
                getFile(item.id, function(codeString) {
                    codeStringQueue.push({
                        data: codeString,
                        id: item.id
                    });

                    seed.support && (ls.setItem(item.id, codeString), ls.setItem(item.id + '@hook', item.hook));

                    next();
                }, function() {
                    next();
                });
            }
        };

        // 本地查找
        var fnWrapperFromLocal = function(item) {
            return function(next) {
                codeStringQueue.push({
                    data: ls.getItem(item.id),
                    id: item.id
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
        ids.forEach(function(item) {

            var condition = needLoadData || (function(item) {
                // 不支持LS采用
                if (!seed.support) {
                    return true;
                }
                // 支持ls，但是本地中没有该item，或存在该item，但是版本号已经更新
                if (!ls.getItem(item.id) || (ls.getItem(item.id + '@hook') !== item.hook)) {
                    return true;
                }
                return false;
            })(item);

            log('{fn:dock} --- ', (condition ? '' : '不') + '需要下载：', item.id);

            fns.push(
                condition ? fnWrapperFromRemote(item) : fnWrapperFromLocal(item)
            );
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
            ls.setItem('__seed_test__', 1);
            ls.removeItem('__seed_test__');
        } catch (e) {
            support = false;
        }
        // log('{fn:isSupportLocalStorage} --- ', (support ? '' : '不'), 'localStorage');
        return support;
    };

    /**
     * 目前不支持JSONP，先用AJAX替代
     * @param  {[type]} url      [description]
     * @param  {[type]} callBack [description]
     * @return {[type]}          [description]
     */
    function getFile(url, success, error) {
        log('{fn:getFile} --- ', '正在通过AJAX加载：', url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = noop;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    log('{fn:getFile} --- ', '已加载：', url);
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
        log('warn', '{fn:getFileError} --- ', '资源加载失败！', arguments);
        callBack && callBack(error, type, xhr);
    };

    /**
     * [log description]
     * @return {[type]} [description]
     */
    function log( /* type [, arg1, arg2...etc. ]*/ ) {
        var args = Array.prototype.slice.call(arguments);
        var type = args[0];
        var isSpecified = !!~['dir', 'warn', 'info', 'error', 'group', 'groupEnd'].indexOf(type);
        args = isSpecified ? (args.shift(), args) : args;
        args.unshift('[Debug:] === ');
        return data.debug && console[isSpecified ? type : 'log'].apply(console, args);
    };

}(window);
