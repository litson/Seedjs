/**
 *
 * TODO:
 *     1.֧��JSONP��ȡcombo����
 *     2.����ȡjs�����쳣�����ô���script + src�Ĵ�ͳ��ʽ���� (��Ӱ��ִ���ٶ�)
 *     3.����combo�ļ�
 *     4.CSS�ļ���������
 *     4.�����ļ���Ϊ�������أ���ִ���ǰ��򣬲������غϲ�
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

    /**
     *
     * @param ids
     * @param callBack
     * @returns {{support: *, use: use, config: config, openRealtimeDebugMode: openRealtimeDebugMode, scan: scan, cache: {}, version: string}}
     */
    function use(ids, callBack) {
        var cssIds = [];
        var jsIds = [];
        if (!Array.isArray(ids)) {
            if (getType(ids) === 'string') {
                ids = [ids];
            } else {
                log('warn', '{fn:Seed.use} --- ', '[���ʹ���]���ṩһ���ļ��������ļ������飡');
                return seed;
            }
        }
        log('{fn:Seed.use} --- ', 'ԭʼ���ݣ�', ids);
        ids = parseIds(ids);
        log('{fn:Seed.use} --- ', '·��Ѱ�ҵ���', ids);

        // �ǵ��Ѿ����ص��ļ�
        ids = ids.filter(function (item) {
            if (!seed.cache[item.id]) {
                return item;
            } else {
                log('warn', '{fn:Seed.use} --- ', item.id, '�ѱ����أ�');
            }
        });
        // ��ֳ�css��js
        ids.forEach(function (item) {
            if (item.type === 'css') {
                cssIds.push(item);
            } else {
                jsIds.push(item);
            }
        });

        // ����ִ��js
        ids.length && dock(ids, function (codeStringQueue) {
            codeStringQueue.forEach(function (item) {
                seed.cache[item.id] = !0;
                executeCode(item);
            });
            callBack && callBack();
        });
        return seed;
    }

    /**
     *
     * @param setting
     * @returns {{support: *, use: use, config: config, openRealtimeDebugMode: openRealtimeDebugMode, scan: scan, cache: {}, version: string}}
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
    }

    /**
     *
     * @returns {{support: *, use: use, config: config, openRealtimeDebugMode: openRealtimeDebugMode, scan: scan, cache: {}, version: string}}
     */
    function openRealtimeDebugMode() {
        log('============ �ѿ����޻���ģʽ ============');
        seed.support = false;
        return seed;
    }

    /**
     *
     * @returns {*}
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
        }
        log('{fn:Seed.scan} --- ', '��ȡ�������ӣ�', ids);
        return seed.use(ids);
    }

    /**
     *
     * @param id
     * @returns {*}
     */
    function parseAlias(id) {
        var alias = data.alias;
        return alias && (getType(alias[id]) === 'string') ? alias[id] : id;
    }

    /**
     *
     * @param item
     * @returns {*}
     */
    function parseHook(item) {
        var map = data.map;
        var mapType = getType(map);

        var hook = '__seed_version__';
        var originalId = item.id;

        var splited;
        var id;

        // ���ӳ������Ǻ���
        if (mapType === 'function') {
            splited = map(originalId);
        } else if (mapType === 'regexp') {
            // ���ӳ�����������
            splited = originalId.match(map);
        } else {
            // ����Ǵ����ӳ�����
            splited = originalId.match(PARAM_RE);
        }

        // ��ӳ�������ֹ���ʱ�����ܻ�ò���Ԥ�ڵĽ��
        // ��ʱֱ������
        if (getType(splited) !== 'array') {
            log('warn', '{fn:parseHook} --- ', '������', originalId, 'ʧ�ܣ�', '�Զ��Թ�');
            return null;
        }

        id = splited[1];

        if (data.ver) {
            hook = data.ver;
        } else {
            // ��������idδ�����仯����ʹ��Ĭ�ϵ�hook����
            if (id !== originalId) {
                hook = splited[2];
            }
        }

        item.id = id;
        item.hook = hook;
        return item;
    }

    /**
     *
     * @param ids
     * @returns {Array}
     */
    function parseIds(ids) {
        var result = [];
        ids.forEach(function (item) {
            var temp = {
                id: item.trim()
            };
            var id = temp.id;
            var relative;
            temp.position = doc.querySelector('[data-seed="' + id + '"]');

            // ���Ҿ���·��
            if (!ABSOLUTE_RE.test(id)) {
                // ����Ǿ���·���������ڱ����в���
                relative = parseAlias(id);
                // ����������Ѵ��ڸ�·������ʹ��
                id = relative || id;
                // ����һ�ξ���·���ļ�⣬��Ϊ������alias����������������·�����ļ�����
                id = (ABSOLUTE_RE.test(id) ? id : data.base + id);
                temp.id = id;
            }

            temp.type = IS_CSS_RE.test(id) ? 'css' : 'js';
            // parseHook��ʱ��������쳣��ֱ������
            temp = parseHook(temp);
            temp && result.push(temp);
        });
        return result;
    }

    /**
     *
     * @param options
     */
    function executeCode(options) {
        var isCSS;
        var tagName;
        var type;
        var target;
        var node = options.position;
        if (!node) {
            isCSS = options.type === 'css';
            isCSS
                ? (tagName = 'style', type = 'text/css', target = doc.head)
                : (tagName = 'script', type = 'text/javascript', target = doc.body);
            node = doc.createElement(tagName);
            node.type = type;
            target.appendChild(node);
        } else {
            node.removeAttribute('data-seed');
        }
        node.id = options.id;
        node.appendChild(doc.createTextNode(options.data));
        log('{fn:executeCode} --- ', '��ִ�У�', options.id);
    }

    /**
     *
     * @param ids
     * @param callBack
     */
    function dock(ids, callBack) {
        var codeStringQueue = [];
        var fns = [];
        // Զ�������ݷ���
        var fnWrapperFromRemote = function (item) {
            return function (next) {
                getFile(item.id, function (codeString) {
                    item.data = codeString;
                    item.type !== 'css' && codeStringQueue.push(item);
                    seed.support && (ls.setItem(item.id, codeString), ls.setItem(item.id + '@hook', item.hook));
                    next(item);
                }, function () {
                    next(null);
                });
            }
        };
        // ���ز���
        var fnWrapperFromLocal = function (item) {
            return function (next) {
                item.data = ls.getItem(item.id);
                item.type !== 'css' && codeStringQueue.push(item);
                next(item);
            }
        };
        // �����һ����������
        ids.forEach(function (item) {
            var needRemote =
                (!seed.support)
                || (!ls.getItem(item.id) || (ls.getItem(item.id + '@hook') !== item.hook));

            log('{fn:dock} --- ', (needRemote ? '' : '��') + '��Ҫ���أ�', item.id);

            var fn = needRemote
                ? fnWrapperFromRemote(item)
                : fnWrapperFromLocal(item);

            if (item.type === 'css') {
                fn(function (item) {
                    item && executeCode(item);
                });
            } else {
                fns.push(fn);
            }
        });
        // ��������׷��һ������������ɺ�ִ�лص�
        fns.push(function () {
            callBack && callBack(codeStringQueue);
        });
        // ִ�к�������
        queue(fns);
    }

    /**
     *
     * @param fns
     * @param context
     */
    function queue(fns, context) {
        (function next() {
            if (fns.length > 0) {
                var fn = fns.shift();
                fn.apply(context, [next].concat(Array.prototype.slice.call(arguments, 0)));
            }
        })();
    }

    /**
     *
     * @param object
     * @returns {string}
     */
    function getType(object) {
        return Object.prototype.toString.call(object).replace(/\[\object|]|\s/gi, '').toLowerCase();
    }

    /**
     *
     * @returns {boolean}
     */
    function isSupportLocalStorage() {
        var support = true;
        try {
            ls.setItem('__seed_test__', 1);
            ls.removeItem('__seed_test__');
        } catch (e) {
            support = false;
        }
        // log('{fn:isSupportLocalStorage} --- ', (support ? '' : '��'), 'localStorage');
        return support;
    }

    /**
     *
     * @param url
     * @param success
     * @param error
     * @returns {XMLHttpRequest}
     */
    function getFile(url, success, error) {
        log('{fn:getFile} --- ', '����ͨ��AJAX���أ�', url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = noop;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    log('{fn:getFile} --- ', '�Ѽ��أ�', url);
                    success && success(xhr.responseText, xhr);
                } else {
                    getFileError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, error);
                }
            }
        };
        xhr.send(null);
        return xhr;
    }

    /**
     *
     * @param error
     * @param type
     * @param xhr
     * @param callBack
     */
    function getFileError(error, type, xhr, callBack) {
        log('warn', '{fn:getFileError} --- ', '��Դ����ʧ�ܣ�', arguments);
        callBack && callBack(error, type, xhr);
    }

    /**
     *
     * @returns {boolean|root.Seed.data.debug|*}
     */
    function log(/* type [, arg1, arg2...etc. ]*/) {
        var args = Array.prototype.slice.call(arguments);
        var type = args[0];
        var isSpecified = !!~['dir', 'warn', 'info', 'error', 'group', 'groupEnd'].indexOf(type);
        args = isSpecified ? (args.shift(), args) : args;
        args.unshift('[Debug:] === ');
        return data.debug && console[isSpecified ? type : 'log'].apply(console, args);
    }
}(window);
