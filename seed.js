/**
 *
 * TODO:
 *     1.支持JSONP拉取combo数据
 *     2.若拉取js出现异常，采用创建script + src的传统方式下载 (会影响执行速度)
 *     3.本地combo文件
 *     4.CSS文件并发下载
 *     4.所有文件改为并发下载，但执行是按序，并做本地合并
 *     6.deal buttom top
 *
 */
!function __seed_package__(root) {

    if (root.Seed) {
        return;
    }

    var noop = function () {
    };

    var ls = root.localStorage;
    var doc = document;

    var ABSOLUTE_RE = /^\/\/.|:\//;
    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var PARAM_RE = /^(.*\.(?:css|js))(.*)$/i;

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

    function use(ids, callBack) {
        if (!Array.isArray(ids)) {
            if (getType(ids) === 'string') {
                ids = [ids];
            } else {
                log('warn', '{fn:Seed.use} --- ', '[类型错误]请提供一个文件名或者文件名数组！');
                return seed;
            }
        }

        log('{fn:Seed.use} --- ', '原始数据：', ids);

        ids = parseIds(ids);

        log('{fn:Seed.use} --- ', '路由寻找到：', ids);

        ids = ids.filter(function (item) {
            if (!seed.cache[item.id]) {
                return item;
            } else {
                log('warn', '{fn:Seed.use} --- ', item.id, '已被下载！');
            }
        });

        // 下载执行
        ids.length && dock(ids, function (codeStringQueue) {
            codeStringQueue.forEach(function (item) {
                seed.cache[item.id] = !0;
                executeCode(item.data, item.id, item.position);
            });
            callBack && callBack();
        });

        return seed;
    }

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
    }

    function openRealtimeDebugMode() {
        log('============ 已开启无缓存模式 ============');
        seed.support = false;
        return seed;
    }

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
            // temp.parentNode.removeChild(temp);
        }

        log('{fn:Seed.scan} --- ', '获取到的种子：', ids);

        return seed.use(ids);
    }

    function parseAlias(id) {
        var alias = data.alias;
        return alias && (getType(alias[id]) === 'string') ? alias[id] : id;
    }

    function parseHook(item) {
        var map = data.map;

        var splited;
        var id;

        var hook = '__seed_version__';
        var mapType = getType(map);
        var originalId = item.id;

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
            log('warn', '{fn:parseHook} --- ', '解析：', originalId, '失败，', '自动略过');
            // 有的时候会解析出错，返回null,此时直接跳出
            return null;
        }

        id = splited[1];

        if (data.ver) {
            hook = data.ver
        } else {
            // 若解析后，id未发生变化，则使用默认的hook规则
            if (id !== originalId) {
                hook = splited[2];
            }
        }

        item.id = id;
        item.hook = hook;
        return item;
    }

    function parseIds(ids) {
        var result = [];
        ids.forEach(function (item) {

            /**
             * 104 === h ( http, https )
             * 46  === . ( ./ )
             * 47  === / ( / )
             */
            // var charCode = item.charCodeAt(0);

            var temp = {
                id: item.trim()
            }
            var id = temp.id;
            var relative;

            temp.position = doc.querySelector('[data-seed="' + id + '"]');

            if (!ABSOLUTE_RE.test(id)) {
                // 如果非绝对路径，则先在别名中查找
                relative = parseAlias(id);
                // 如果别名中已存在该路径，则使用
                id = relative || id;
                // 再做一次绝对路径的检测，因为允许在alias中配置其他‘绝对路径的文件’；
                temp.id = (ABSOLUTE_RE.test(id) ? id : data.base + id);
            }

            // parseHook的时候如果出异常，直接跳过
            temp = parseHook(temp);
            temp && result.push(temp);

        });
        return result;
    }

    function executeCode(codeString, uid, DOMposition) {

        var isCSS;
        var fileType;
        var fileWayValue;
        var target;

        var node = DOMposition;

        if (!node) {
            isCSS = IS_CSS_RE.test(uid);

            isCSS
                ? (fileType = 'style', fileWayValue = 'text/css', target = doc.head) : (fileType = 'script', fileWayValue = 'text/javascript', target = doc.body);

            node = doc.createElement(fileType);
            node.type = fileWayValue;
            target.appendChild(node);
        } else {
            node.removeAttribute('data-seed');
        }

        node.id = uid;
        node.appendChild(doc.createTextNode(codeString));
        log('{fn:executeCode} --- ', '已执行：', uid);
    }

    function dock(ids, callBack) {
        var codeStringQueue = [];
        var fns = [];

        // 远程拉数据方法
        var fnWrapperFromRemote = function (item) {
            return function (next) {
                getFile(item.id, function (codeString) {
                    codeStringQueue.push({
                        data: codeString,
                        id: item.id,
                        position: item.position
                    });

                    seed.support && (ls.setItem(item.id, codeString), ls.setItem(item.id + '@hook', item.hook));

                    next();
                }, function () {
                    next();
                });
            }
        }

        // 本地查找
        var fnWrapperFromLocal = function (item) {
            return function (next) {
                codeStringQueue.push({
                    data: ls.getItem(item.id),
                    id: item.id,
                    position: item.position
                });
                next();
            }
        };

        // 打包成一个函数队列
        ids.forEach(function (item) {

            var condition = (function (item) {
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
        fns.push(function () {
            callBack && callBack(codeStringQueue);
        });

        // 执行函数队列
        queue(fns);
    }

    function queue(fns, context) {
        (function next() {
            if (fns.length > 0) {
                var fn = fns.shift();
                fn.apply(context, [next].concat(Array.prototype.slice.call(arguments, 0)));
            }
        })();
    }

    function getType(object) {
        return Object.prototype.toString.call(object).replace(/\[\object|\]|\s/gi, '').toLowerCase();
    }

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
    }

    function getFile(url, success, error) {
        log('{fn:getFile} --- ', '正在通过AJAX加载：', url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
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
    }

    function getFileError(error, type, xhr, callBack) {
        log('warn', '{fn:getFileError} --- ', '资源加载失败！', arguments);
        callBack && callBack(error, type, xhr);
    }

    function log(/* type [, arg1, arg2...etc. ]*/) {
        var args = Array.prototype.slice.call(arguments);
        var type = args[0];
        var isSpecified = !!~['dir', 'warn', 'info', 'error', 'group', 'groupEnd'].indexOf(type);
        args = isSpecified ? (args.shift(), args) : args;
        args.unshift('[Debug:] === ');
        return data.debug && console[isSpecified ? type : 'log'].apply(console, args);
    }
}(window);
