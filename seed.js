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
                log('warn', '[���ʹ���]���ṩһ���ļ��������ļ������飡');
                return false;
            }
        };

        log('ԭʼ���ݣ�', ids);

        ids = parseIds(ids);

        log('·��Ѱ�ҵ���', ids);

        ids = ids.filter(function(item) {
            if (!doc.getElementById(item)) {
                return item;
            } else {
                log('warn', item, '�Ѿ������أ�');
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
        log('============ �ѿ����޻���ģʽ ============');
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
                // ����Ǿ���·���������ڱ����в���
                var relative = parseAlias(item);
                // ����������Ѵ��ڸ�·������ʹ��
                item = relative ? relative : item;
                // ����һ��ʮ���Ǿ���·���ļ�⣬��Ϊ�����ڱ�������������������·�����ļ�����
                item = (ABSOLUTE_RE.test(item) ? item : data.base + item);
                // TODO:ƥ��ӳ�䣬ȥ���汾��ʲô�ġ�
                item = parseMap(item);
            }

            result.push(item);


        });
        return result;
    };

    /**
     * �Աȹ���ʱ��
     * @param  {[type]} ms [description]
     * @return {[type]}    �Ƿ���ڣ�δ����false���ѹ���true
     */
    function hasExpired(ms) {
        var expire = data.expires;
        // ����û�δ���ø���ʱ��
        if (!expire) {
            return false;
        }
        expire = (getType(expire) === 'date') ? expire : new Date(expire);

        // �ж��ǲ���invlid date,�о���3�з�������
        // expire = (expire.getDate().toString() === 'NaN') ? 0 : (+expire);
        // expire = (Date.prototype.toString.call(expire) === 'Invalid Date') ? 0 : (+expire);
        expire = (expire.valueOf().toString() === 'NaN') ? 0 : (+expire);

        // �û������˹���ʱ�䣬��Ա��Ƿ��ѹ���
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
        log('��ִ�У�', uid);
    };

    /**
     * ����һ��ID���б�����
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
            // �����֧��localstorge
            if (!seed.support) {
                return true;
            }

            // �ж��Ƿ����
            // ��ȡ�����ļ�������޸�ʱ�䣬���û����Ϊ0��
            var expire = ls.getItem('__seed_expire__');
            expire = expire ? expire : 0;

            // ����ѹ��ڣ����ܴӱ���ȡ
            if (hasExpired(expire)) {
                // �������ù���ʱ��
                ls.setItem('__seed_expire__', data.expires);
                return true;
            }
            return false;
        })();


        // �����һ����������
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

        // ��������׷��һ������������ɺ�ִ�лص�
        fns.push(function() {
            callBack && callBack(codeStringQueue);
        });

        // ִ�к�������
        queue(fns);
    };

    /**
     * [���к���]
     * @param  {[Array]} fns     [��������]
     * @param  {[Object]} context [������ִ��������]
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
     * Ŀǰ��֧��JSONP������AJAX���
     * @param  {[type]} url      [description]
     * @param  {[type]} callBack [description]
     * @return {[type]}          [description]
     */
    function getFile(url, success, error) {
        log('����ͨ��AJAX���أ�', url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = noop;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    log('�Ѽ��أ�', url);
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
        log('warn', '��Դ����ʧ�ܣ�', arguments);
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
