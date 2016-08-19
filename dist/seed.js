(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Seed"] = factory();
	else
		root["Seed"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @file
	 * @fileoverview
	 *              可以将您的 js 、 css 文件在 localStorage 中管理的库。
	 *              使用文档：https://github.com/litson/Seedjs/blob/master/README.md
	 *
	 * @authors      zhangtao23
	 * @date         2016/2/3
	 * @version      1.0.0
	 * @note
	 */

	'use strict';
	var $       = __webpack_require__( 1 );
	var REG     = __webpack_require__( 2 );
	var noop    = __webpack_require__( 3 );
	var warn    = __webpack_require__( 4 );
	var getFile = __webpack_require__( 5 );

	var localDataWorker = __webpack_require__( 10 );
	var executeFileCode = __webpack_require__( 11 );


	/////////////////////////////////////////////////////////////////////

	/**
	 * 基本配置
	 *
	 * @type {Object}
	 */
	var data = __webpack_require__( 9 );

	/**
	 * 缓存文件“实例”
	 *
	 * @type {Object}
	 */
	var cache = {};

	/**
	 * 执行队列
	 *
	 * @type {Array}
	 * @private
	 */
	var _queue = [];

	/**
	 * 依赖关系表
	 * @type {Object}
	 */
	var dependencies = {};

	/**
	 * 导出主体
	 *
	 * @type {Object}
	 */
	var seed = {

	    /**
	     * 用来在页面中加载一个或多个文件
	     *
	     * e.g
	     *
	     *      // 加载一个文件
	     *      Seed.use( './jQuery.js' );
	     *
	     *      // 加载完成后执行回调
	     *      Seed.use( './jQuery.js' , function(){
	     *
	     *          $('.element').show();
	     *
	     *      });
	     *
	     *      // 加载多个文件,加载完成后执行回调
	     *      Seed.use( [ './jQuery.js', './bootstrap.css' ], function(){
	     *
	     *          $('.element').append(
	     *              '<div class="alert alert-warning"> jquery & bootstrap loaded. </div>'
	     *          )
	     *
	     *      } );
	     *
	     *
	     *
	     *
	     * @param {Array | String} ids 文件列表
	     * @param {Function} ready 回调
	     */
	    use: function ( ids, ready ) {

	        if ( !ids ) {
	            return this;
	        }

	        // 单文件
	        if ( 'string' === typeof ids ) {
	            ids = [ids];
	        }

	        // 异常捕获
	        if ( !Array.isArray( ids ) ) {
	            warn( 'Seedjs can\'t resolve a non array parameter!' );
	            return this;
	        }

	        // 二次检测
	        if ( !ids.length ) {
	            warn( 'Did you provide an empty array?' );
	            return this;
	        }

	        // 采用引用对象Function来做key，保证唯一性（反其道而行）
	        if ( {}.toString.call( ready ) !== '[object Function]' ) {
	            ready = noop();
	        }

	        // 以引用对象（function）为 key
	        var index = _queue.indexOf( ready );

	        // 这个引用对象存在依赖
	        if ( -1 === index ) {
	            _queue.push( ready );
	            return this.use( ids, ready );
	        }

	        // 调试模式，清空 LS
	        data.debug && localDataWorker.removeItem();

	        // 分析ID
	        _parseIds( ids, index );

	        // 由docker处理加载任务
	        _docker( dependencies[index].deps );
	    },

	    /**
	     *
	     * 我们的文件可以在DOM中指定位置，
	     * 这样就可以避免冲突（样式加载顺序）,当然显性的指定文件顺序也是可以避免冲突的。
	     *
	     * 在DOM中使用 data-[delimiter] 标记指定的特殊元素占位符，可以使得依赖关系更明确。
	     *
	     * e.g
	     *
	     *      html
	     *
	     *          <script data-seed="./jQuery.js"></script>
	     *          <style data-seed="./bootstrap.css"></style>
	     *
	     *     js
	     *
	     *          Seed.scan( function(){
	     *
	     *                 $('.element').append(
	     *                     '<div class="alert alert-warning"> jquery & bootstrap loaded. </div>'
	     *                 )
	     *
	     *          } );
	     *
	     * @param {Function} ready 回调
	     */
	    scan: function ( ready ) {

	        var files = $( '[data-' + data.delimiter + ']' );
	        var len   = files.length;
	        var ids   = [];

	        if ( !len ) {
	            return this;
	        }

	        for ( var i = 0; i < len; i++ ) {
	            ids.push( files[i].dataset[data.delimiter] );
	        }

	        this.use( ids, ready );
	    },

	    // @type {Object} 成员，配置
	    data: data,

	    // @type {Object} 成员，缓存
	    cache: cache,

	    // @type {Function} 成员方法，批量配置
	    config: __webpack_require__( 12 ),

	    // @type {Function} 成员方法，从本地存储中插入值
	    setItem: localDataWorker.setItem,

	    // @type {Function} 成员方法，从本地存储中获取值
	    getItem: localDataWorker.getItem,

	    // @type {Function} 成员方法，从本地存储中移除或情况值
	    removeItem: localDataWorker.removeItem
	};

	/**
	 * 分析ID
	 *
	 *
	 * @param {Array} ids 文件对象id集合
	 * @param {Number} index 依赖回调的索引
	 * @private
	 */
	function _parseIds( ids, index ) {

	    ids.forEach( function ( id ) {

	        // @type {String} 文件的元素id
	        var originalId = id;

	        id = resolveId( id );

	        // @type {String} 分析文件类型
	        var fileType = REG.IS_CSS.test( id ) ? 'css' : 'js';

	        // 声明依赖关系
	        if ( !cache[id] ) {

	            // 分析文件对象
	            cache[id] = _parseHook( {
	                id          : id,
	                data        : null,
	                status      : 'ready',
	                fileType    : fileType,
	                position    : $( '[data-' + data.delimiter + '="' + originalId + '"]' )[0],
	                dependencies: [index]
	            } );

	            /*
	             * 在 cache 中的文件对象示例：
	             *  {
	             *      "http://cdn.bootcss.com/bootstrap/3.3.6/css/bootstrap.min.css": {
	             *          // id
	             *          "id"          : "http://cdn.bootcss.com/bootstrap/3.3.6/css/bootstrap.min.css",
	             *          // 文件内容，执行完毕后会清空
	             *          "data"        : null,
	             *          // 加载状态
	             *          "status"      : "loaded",
	             *          // 文件类型
	             *          "fileType"    : "css",
	             *          // 文件应处的位置
	             *          "position"    : null,
	             *          // 文件的依赖
	             *          "dependencies": [],
	             *          // 更新tag
	             *          "hook"        : "__seed_version__",
	             *          // 文件的地址
	             *          "fileUrl"     : "http://cdn.bootcss.com/bootstrap/3.3.6/css/bootstrap.min.css"
	             *      }
	             *  }
	             */

	        } else {
	            // 如果之前已经有缓存过，下次则将其依赖set到依赖队列中
	            cache[id].dependencies.push( index );
	        }

	        // 声明依赖队列
	        if ( !dependencies[index] ) {
	            dependencies[index] = {
	                ids : [id],
	                deps: [id]
	            }
	        } else {
	            // 同理，如果存在依赖，则继续set到队列中
	            dependencies[index].ids.push( id );
	            dependencies[index].deps.push( id );
	        }
	    } );
	}

	/**
	 *
	 * 分析下传进来的ID，没有做像node中path.resolve的分析，
	 * 当然将ID全部分析为绝对路径更好。
	 *
	 * @param {string} id id
	 * @return {string} 分析后的id
	 */
	function resolveId( id ) {

	    var first = id.charCodeAt( 0 );

	    // 非绝对路径或点杠开头的加前缀加配置前缀
	    if (
	        !REG.ABSOLUTE.test( id )
	        && (
	            first !== 46 /* "." */
	            && first !== 47 /* "/" */
	        )
	    ) {
	        id = data.base + id;
	    }

	    // 当 uri为 // 开头，加上协议
	    if ( id.indexOf( '//' ) === 0 ) {
	        id = location.protocol + id;
	    }

	    return id;
	}

	/**
	 * 获取文件 hook 标记
	 *
	 * @param {Object} item 文件对象
	 * @returns {Object} 修正后的文件对象
	 * @private
	 */
	function _parseHook( item ) {

	    // @type {Object} 一份默认的配置表
	    var defaultValue = {
	        id     : item.id,
	        fileUrl: item.id,
	        hook   : '__seed_version__'
	    };

	    // @type {Function} 如果提供了map方法，就启用用户使用的map方法
	    var map = data.map || defaultMap;

	    // @type {Object} 通过map方法分析
	    var parsedData = map( item.id, defaultValue );

	    // 分析失败或任何异常，发出警告。降级为启用默认配置.
	    if ( !parsedData || typeof parsedData !== 'object' ) {
	        warn(
	            '\nYou may provide an incorrect \'map\' method!',
	            '\nThe \'map\' method expected return value is :\n',
	            JSON.stringify( {
	                id     : 'Stored \'ID\'',
	                fileUrl: 'Original file URL',
	                hook   : 'Need to update tag'
	            }, null, 4 ),
	            '\nYou can refer to the following method :\n',
	            defaultMap.toString(),
	            '\n Seedjs will use default value :\n',
	            JSON.stringify( defaultValue, null, 4 ),
	            '\n However, it\'s maybe can\'t complete update!'
	        );
	        parsedData = defaultValue;
	    }

	    // 赋值
	    item.id      = parsedData.id;
	    item.hook    = parsedData.hook;
	    item.fileUrl = parsedData.fileUrl;

	    return item;


	    /**
	     * 默认的map函数，用来分析文件对象.
	     *
	     * @param {String} id 文件对象的url
	     * @returns {Object} 分析后的文件对象
	     */
	    function defaultMap( id ) {
	        var datas = id.match( REG.PARAM );

	        // 将一个文件url拆分为：
	        return {
	            // 存储的id
	            id     : datas[1],
	            // 文件路径（非原始）
	            fileUrl: id,
	            // 更新的tag
	            hook   : datas[2] || '__seed_version__'
	        }
	    }

	}

	/**
	 * 分发器
	 *
	 * @param {Array} ids 文件对象的id集合
	 * @private
	 */
	function _docker( ids ) {

	    // copy 一份，然后再用，避免随着依赖的删除，导致执行出现错误；
	    ids.slice( 0 ).forEach( function ( key ) {
	        var item = cache[key];

	        // 如果已经加载完毕的模块，则通知解除依赖关系
	        if ( item.status === 'loaded' ) {
	            return _emit( item );
	        }

	        // hook不同 或 未存储 或开启debug模式, 均异步获取文件回掉通知
	        if (
	            data.debug
	            || (item.hook !== localDataWorker.getItem( item.id + '@hook' ))
	            || !localDataWorker.getItem( item.id )
	        ) {
	            _fileLoad( item );
	        } else {
	            // 否则从本地获取
	            item.data = localDataWorker.getItem( item.id );
	            // 通知解除依赖关系
	            _emit( item );
	        }
	    } );
	}

	/**
	 * 获取文件数据
	 *
	 * @param {Object} $data 传递的文件对象
	 * @private
	 */
	function _fileLoad( $data ) {

	    // 锁
	    if ( $data.status === 'pending' ) {
	        return;
	    }

	    // 加锁
	    $data.status = 'pending';

	    // 获取文件
	    getFile(
	        // 文件地址
	        $data.fileUrl,

	        // 成功回调
	        function ( ajaxCodeString ) {
	            _onGetFileLoad( $data, ajaxCodeString );
	        },

	        // 失败回调
	        function () {
	            warn(
	                'Some exception occurs when getting',
	                $data.fileUrl
	            );
	            _onGetFileLoad( $data, '' );
	        },

	        // 传递全局配置的jsonp关键字
	        // TODO: 单文件支持配置jsonp
	        data.jsonp
	    );
	}

	/**
	 * 异步获取数据后的回调
	 *
	 * @param {Object} data 文件对象
	 * @param {String} codeString 存储的数据
	 * @private
	 */
	function _onGetFileLoad( data, codeString ) {
	    // 数据赋值
	    data.data = codeString;

	    // 存储到ls中
	    _store( data.id, data.hook, codeString );

	    // 通知删除依赖
	    _emit( data );
	}


	/**
	 * 存储到ls中
	 * @param {String} id 存储的id
	 * @param {String} hook 更新标记hook值
	 * @param {String} codeString 存储的数据
	 * @private
	 */
	function _store( id, hook, codeString ) {

	    // 如果开启了调试，则不执行存储操作
	    if ( !data.debug ) {
	        localDataWorker.setItem( id + '@hook', hook );
	        localDataWorker.setItem( id, codeString );
	    }
	}

	/**
	 * 通知解除依赖
	 *
	 * @param {Object} data 文件对象
	 * @private
	 */
	function _emit( data ) {

	    // 复制一份，避免应用对象冲突
	    data
	        .dependencies
	        .slice( 0 )
	        .forEach( function ( index ) {

	            var globalDeps = dependencies[index];

	            // 删除全局依赖
	            globalDeps.deps.splice(
	                globalDeps.deps.indexOf( data.id ), 1
	            );

	            // 删除文件对象依赖
	            data.dependencies.splice(
	                data.dependencies.indexOf( index ), 1
	            );

	            // 检测依赖表数量，为空时执行代码
	            if ( globalDeps.deps.length === 0 ) {
	                _execute( globalDeps.ids, index );
	            }
	        } );
	}

	/**
	 * 批量执行代码
	 * @param {Array} ids 传递的文件对象集合
	 * @param {Number} index 依赖中的对应索引
	 * @private
	 */
	function _execute( ids, index ) {
	    ids.forEach( function ( item ) {
	        executeFileCode( cache[item] );
	    } );
	    _queue[index]();
	}

	// 自动扫描
	seed.scan();

	module.exports = seed;

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * 简单选择器
	 * @param {String} selector 选择器
	 * @returns {NodeList} 元素集
	 */
	module.exports = function ( selector ) {
	    return document.querySelectorAll( selector );
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * REG集
	 * @type {Object} REG集
	 */
	module.exports = {

	    // @type {RegExp} 是否是css
	    IS_CSS: /\.css(?:\?|$)/i,

	    // @type {RegExp} 资源地址"?"后的参数
	    PARAM: /^(.*\.(?:css|js))(.*)$/i,

	    // @type {RegExp} 是否是绝对路径
	    ABSOLUTE: /^\/\/.|:\//,

	    // @type {RegExp} url参数关键字
	    URL_OPERATOR: /[&?]{1,2}/,

	    // @type {RegExp} 获取路径，例如：'/github/a/b/c.html'.match(DIRNAME)[0] ==> '/github/a/b/'
	    DIRNAME: /[^?#]*\//,

	    // @type {RegExp}
	    DOUBLE_DOT: /\/[^/]+\/\.\.\//,

	    // @type {RegExp}
	    DOT: /\/\.\//g,

	    // @type {RegExp}
	    MULTI_SLASH: /([^:/])\/+\//g,

	    // @type {RegExp}
	    ROOT_DIR: /^.*?\/\/.*?\//

	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * 返回一个无引用关系的空函数
	 *
	 * @returns {Function} 一个无引用关系的空函数
	 */
	module.exports = function () {
	    return function () {
	    };
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * 打印一些警告
	 */
	module.exports = function () {
	    console.warn.apply(
	        console,
	        ['[ Seed waring ]'].concat( Array.prototype.slice.call( arguments, 0 ) )
	    );
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var jsonPadding = __webpack_require__( 6 );
	var ajax        = __webpack_require__( 7 );
	var conf        = __webpack_require__( 9 );

	/**
	 * 获取文件，jsonp 或者 ajax get；
	 *
	 * @param {String} url 文件地址
	 * @param {Function} success 成功回调
	 * @param {Function} error 失败回调
	 * @param {String} jsonpCallback jsonp前缀
	 */
	module.exports = function ( url, success, error, jsonpCallback ) {
	    
	    var _success = function ( ajaxData ) {
	        ( conf.load && conf.load( ajaxData ) === false )
	            ? error()
	            : success( ajaxData );
	    };

	    // 有jsonp标识，会启用jsonp方法获取，无则用get方法
	    jsonpCallback
	        ? jsonPadding(
	        jsonpCallback,
	        url,
	        _success,
	        error
	    )
	        : ajax(
	        url,
	        _success,
	        error
	    );
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 *
	 * 简单的jsonp函数
	 *
	 * TODO:
	 *
	 *   jsonpCallback 的无污染
	 *
	 * @param {String} jsonpCallback 注册的全局函数句柄
	 * @param {String} url 资源地址
	 * @param {Function} success 成功回调
	 * @param {Function} error 失败回调
	 */
	module.exports = function ( jsonpCallback, url, success, error ) {

	    var responseData;

	    window[jsonpCallback] = function () {
	        responseData = arguments;
	    };

	    var node   = document.createElement( 'SCRIPT' );
	    var header = document.head;

	    node.onload = node.onerror = function ( event ) {
	        (event.type === 'load') ? success.apply( null, responseData ) : error( event );
	        _clean( node );
	        node = null;
	    };

	    node.src = url;
	    header.insertBefore( node, header.firstChild );

	    function _clean( node ) {
	        node.onload = node.onerror = null;
	        for ( var p in node ) {
	            delete node[p];
	        }
	        header.removeChild( node );
	    }
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var appendQuery = __webpack_require__( 8 );

	/**
	 * ajax get 方法
	 * @param {String} url 地址
	 * @param {Function} success 成功回调
	 * @param {Function} error 失败回调
	 */
	module.exports = function ( url, success, error ) {
	    var xhr = new XMLHttpRequest();
	    xhr.open( 'GET', appendQuery( url, ('_s_t_=' + (+new Date)) ), true );

	    xhr.onreadystatechange = function () {
	        if ( xhr.readyState === 4 ) {
	            xhr.onreadystatechange = null;
	            ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 )
	                ? success( xhr.responseText )
	                : error();
	        }
	    };
	    xhr.send( null );
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var REG = __webpack_require__( 2 );

	/**
	 * 附加参数
	 *
	 * @param {String} url url
	 * @param {String} query 参数
	 * @returns {String} 修正后的参数
	 */
	module.exports = function ( url, query ) {
	    return (query === '') ? url : (url + '&' + query).replace( REG.URL_OPERATOR, '?' );
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * 全局配置文件
	 * @type {Object}
	 * @note 一些默认值为“false”的配置，改为在注视中显示声明；
	 */
	module.exports = {
	    // @type {String} 路径基准
	    base: location.origin,

	    // @type {Boolean} 开启无缓模式
	    // debug: false,

	    // @type {String | Null} jsonp前缀
	    // jsonp: null,

	    // @type {Null | function} 映射函数
	    // map: null,

	    // @type {Null | Function} 获取数据后过的钩子函数
	    // load: null,

	    // @type {String} DOM查找界定符([data-[delimiter]])
	    delimiter: 'seed'
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var CONFIG = __webpack_require__( 9 );
	var doc    = document;

	/**
	 * 执行代码
	 *
	 * 偏业务；
	 *
	 * 简述代码的执行过程
	 *
	 * @param {Object} data
	 */
	module.exports = function ( data ) {

	    // 锁
	    if ( data.status === 'loaded' ) {
	        return;
	    }

	    // 加锁
	    data.status = 'loaded';

	    // 文件类型配置表
	    var attr = {
	        css: {
	            tagName: 'style',
	            props  : {
	                type: 'text/css',
	                id  : data.id
	            }
	        },
	        js : {
	            tagName: 'script',
	            props  : {
	                type: 'text/javascript',
	                id  : data.id
	            }
	        }
	    };

	    // 获得文件类型对应的字段
	    var temp = attr[data.fileType];
	    var node = data.position;

	    if ( temp.tagName === 'style' || !data.position ) {
	        node = doc.createElement( temp.tagName );
	    }

	    // 获取元素位置（若参数data中含有文件位置则使用，否，则创建）
	    // var node = data.position || doc.createElement( temp.tagName );

	    // 批量附加属性
	    for ( var key in temp.props ) {
	        node[key] = temp.props[key];
	    }

	    // 塞到DOM
	    if ( !data.position ) {
	        doc.head.appendChild( node );
	    } else if ( temp.tagName === 'style' ) {
	        doc.head.insertBefore( node, data.position );
	        data.position.parentNode.removeChild( data.position );
	    }

	    // 干掉标记
	    node.removeAttribute( 'data-' + CONFIG.delimiter );

	    // 执行代码；PS：innerHTML,超过一定行数会报错。
	    node.appendChild( doc.createTextNode( data.data ) );

	    // 一些清理工作
	    data.data     = null;
	    data.position = null;
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__( 9 );

	/**
	 * 修改配置，支持至多两层配置
	 * （后续可能会用到多层这个功能）
	 *
	 * @param {Object} setting 配置
	 */
	module.exports = function ( setting ) {

	    var k;
	    var key;
	    var curr;
	    var prev;

	    for ( key in setting ) {
	        curr = setting[key];
	        prev = config[key];

	        if ( prev && typeof prev === 'object' ) {
	            for ( k in prev ) {
	                prev[k] = curr[k];
	            }
	        } else {
	            config[key] = curr;
	        }
	    }
	};

/***/ }
/******/ ])
});
;