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

    function use(ids, callBack) {
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

        ids = ids.filter(function (item) {
            if (!seed.cache[item.id]) {
                return item;
            } else {
                log('warn', '{fn:Seed.use} --- ', item.id, '�ѱ����أ�');
            }
        });

        // ����ִ��
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
        log('============ �ѿ����޻���ģʽ ============');
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

        log('{fn:Seed.scan} --- ', '��ȡ�������ӣ�', ids);

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

        // ���ӳ������Ǻ���
        if (mapType === 'function') {
            splited = map(originalId);
            // ���ӳ�����������
        } else if (mapType === 'regexp') {
            splited = originalId.match(map);
            // ����Ǵ����ӳ�����
        } else {
            splited = originalId.match(PARAM_RE);
        }

        // ��ӳ�������ֹ���ʱ�����ܻ�ò���Ԥ�ڵĽ��
        if (getType(splited) !== 'array') {
            log('warn', '{fn:parseHook} --- ', '������', originalId, 'ʧ�ܣ�', '�Զ��Թ�');
            // �е�ʱ��������������null,��ʱֱ������
            return null;
        }

        id = splited[1];

        if (data.ver) {
            hook = data.ver
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
                // ����Ǿ���·���������ڱ����в���
                relative = parseAlias(id);
                // ����������Ѵ��ڸ�·������ʹ��
                id = relative || id;
                // ����һ�ξ���·���ļ�⣬��Ϊ������alias����������������·�����ļ�����
                temp.id = (ABSOLUTE_RE.test(id) ? id : data.base + id);
            }

            // parseHook��ʱ��������쳣��ֱ������
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
        log('{fn:executeCode} --- ', '��ִ�У�', uid);
    }

    function dock(ids, callBack) {
        var codeStringQueue = [];
        var fns = [];

        // Զ�������ݷ���
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

        // ���ز���
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

        // �����һ����������
        ids.forEach(function (item) {

            var condition = (function (item) {
                // ��֧��LS����
                if (!seed.support) {
                    return true;
                }
                // ֧��ls�����Ǳ�����û�и�item������ڸ�item�����ǰ汾���Ѿ�����
                if (!ls.getItem(item.id) || (ls.getItem(item.id + '@hook') !== item.hook)) {
                    return true;
                }
                return false;
            })(item);

            log('{fn:dock} --- ', (condition ? '' : '��') + '��Ҫ���أ�', item.id);

            fns.push(
                condition ? fnWrapperFromRemote(item) : fnWrapperFromLocal(item)
            );
        });

        // ��������׷��һ������������ɺ�ִ�лص�
        fns.push(function () {
            callBack && callBack(codeStringQueue);
        });

        // ִ�к�������
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
        // log('{fn:isSupportLocalStorage} --- ', (support ? '' : '��'), 'localStorage');
        return support;
    }

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
        }
        xhr.send(null);
        return xhr;
    }

    function getFileError(error, type, xhr, callBack) {
        log('warn', '{fn:getFileError} --- ', '��Դ����ʧ�ܣ�', arguments);
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
