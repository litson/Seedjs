/******/ (function(modules) { // webpackBootstrap
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

	'use strict';

	var win = window;
	var doc = document;

	var localDataWorker = __webpack_require__( 1 );

	var $ = __webpack_require__( 2 );

	var noop = __webpack_require__( 3 );
	var warn = __webpack_require__( 4 );

	var _executeFileCode = __webpack_require__( 5 );
	var getFile          = __webpack_require__( 7 );

	/////////////////////////////////////////////////////////////////////

	var seed = {
	    cache     : {},
	    scan      : scan,
	    use       : use,
	    removeItem: localDataWorker.removeItem,
	    setItem   : localDataWorker.setItem,
	    getItem   : localDataWorker.getItem
	};

	var data = seed.data = __webpack_require__( 6 );

	function scan( callBack ) {
	    var files = $( '[data-' + data.delimiter + ']' );
	    var len   = files.length;
	    var ids   = [];

	    if ( !len ) {
	        return seed;
	    }

	    for ( var i = 0; i < len; i++ ) {
	        ids.push( files[i].dataset[data.delimiter] );
	    }

	    return seed.use( ids, callBack );
	}

	var _queue       = [];
	var cache        = seed.cache;
	var dependencies = {};

	/**
	 * Seed.use
	 * @param ids
	 * @param ready
	 * @returns {*}
	 */
	function use( ids, ready ) {

	    if ( !ids ) {
	        return seed;
	    }

	    if ( Object.prototype.toString.call( ready ) !== '[object Function]' ) {
	        ready = noop();
	    }

	    // 以引用对象（function）为 key
	    var index = _queue.indexOf( ready );

	    // 这个引用对象存在依赖
	    if ( -1 === index ) {
	        _queue.push( ready );
	        return use( ids, ready );
	    }

	    // 单文件
	    if ( 'string' === typeof ids ) {
	        ids = [ids];
	    }

	    // 异常捕获
	    if ( !Array.isArray( ids ) ) {
	        warn( '[Seedjs can\'t resolve a non array parameter!]' );
	        return seed;
	    }

	    // 分析ID
	    _parseIds( ids, index );

	    // 由docker处理加载任务
	    _docker( dependencies[index].deps );
	    return seed;
	}

	/**
	 * 分析ID
	 * @param ids
	 * @param index
	 * @private
	 */
	function _parseIds( ids, index ) {
	    ids.forEach( function ( id ) {

	        var originalId = id;

	        if ( !/^\/\/.|:\//.test( id ) ) {
	            id = data.base + id;
	        }

	        var fileType = /\.css(?:\?|$)/i.test( id ) ? 'css' : 'js';

	        // 声明依赖关系
	        if ( !cache[id] ) {
	            cache[id] = _parseHook( {
	                id          : id,
	                data        : null,
	                fileType    : fileType,
	                dependencies: [index],
	                status      : 'ready',
	                position    : $( '[data-' + data.delimiter + '="' + originalId + '"]' )[0]
	            } );
	        } else {
	            cache[id].dependencies.push( index );
	        }

	        if ( !dependencies[index] ) {
	            dependencies[index] = {
	                ids : [id],
	                deps: [id]
	            }
	        } else {
	            dependencies[index].ids.push( id );
	            dependencies[index].deps.push( id );
	        }
	    } );
	}

	/**
	 * 获取文件 hook 标记
	 * @param item
	 * @returns {*}
	 * @private
	 */
	function _parseHook( item ) {

	    function defaultMap( id ) {
	        var datas = id.match( /^(.*\.(?:css|js))(.*)$/i );
	        return {
	            id     : datas[1],
	            fileUrl: id,
	            hook   : datas[2] || '__seed_version__'
	        }
	    }

	    var defaultValue = {
	        id     : item.id,
	        fileUrl: item.id,
	        hook   : '__seed_version__'
	    };

	    var map        = data.map || defaultMap;
	    var parsedData = map( item.id, defaultValue );

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

	    item.id      = parsedData.id;
	    item.hook    = parsedData.hook;
	    item.fileUrl = parsedData.fileUrl;

	    return item;
	}

	/**
	 * 分发器
	 * @param ids
	 * @private
	 */
	function _docker( ids ) {
	    // copy 一份，然后再用，避免随着依赖的删除，导致执行出现错误；
	    ids.slice( 0 ).forEach( function ( key ) {
	        var item = cache[key];

	        // 如果已经加载完毕的模块
	        if ( item.status === 'loaded' ) {
	            return _emit( item );
	        }

	        // hook不同 或 未存储 或开启debug模式, 均ajax回掉通知
	        if (
	            data.debug
	            || (item.hook !== localDataWorker.getItem( item.id + '@hook' ))
	            || !localDataWorker.getItem( item.id )
	        ) {
	            _fileLoad( item );
	        } else {
	            item.data = localDataWorker.getItem( item.id );
	            _emit( item );
	        }
	    } );
	}

	/**
	 * 加载文件
	 * @param data
	 * @private
	 */
	function _fileLoad( $data ) {
	    if ( $data.status === 'pending' ) {
	        return;
	    }
	    $data.status = 'pending';
	    getFile(
	        $data.fileUrl,
	        function ( ajaxCodeString ) {
	            _onGetFileLoad( $data, ajaxCodeString );
	        },
	        function () {
	            warn(
	                'Some exception occurs when getting',
	                $data.fileUrl
	            );
	            _onGetFileLoad( $data, '' );
	        },
	        data.jsonp
	    );
	}

	/**
	 *
	 * @param data
	 * @param codeString
	 * @private
	 */
	function _onGetFileLoad( data, codeString ) {
	    data.data = codeString;
	    _store( data.id, data.hook, codeString );
	    _emit( data );
	}


	/**
	 * 存储到ls
	 * @param id
	 * @param hook
	 * @param data
	 * @private
	 */
	function _store( id, hook, codeString ) {
	    if ( !data.debug ) {
	        localDataWorker.setItem( id + '@hook', hook );
	        localDataWorker.setItem( id, codeString );
	    }
	}

	/**
	 * 通知解除依赖
	 * @param data
	 * @private
	 */
	function _emit( data ) {
	    data
	        .dependencies
	        .slice( 0 )
	        .forEach( function ( index ) {

	            var globalDeps = dependencies[index];

	            globalDeps.deps.splice(
	                globalDeps.deps.indexOf( data.id ), 1
	            );

	            data.dependencies.splice(
	                data.dependencies.indexOf( index ), 1
	            );

	            if ( globalDeps.deps.length === 0 ) {
	                _execute( globalDeps.ids, index );
	            }
	        } );
	}

	/**
	 * 批量执行代码
	 * @param ids
	 * @param index
	 * @private
	 */
	function _execute( ids, index ) {
	    ids.forEach( function ( item ) {
	        _executeFileCode( cache[item] );
	    } );
	    _queue[index]();
	}

	// bind to global;
	win.Seed = seed;

/***/ },
/* 1 */
/***/ function(module, exports) {

	var ls = window.localStorage;

	var localDataWorker = {
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
	        if ( localDataWorker.support ) {
	            ls.setItem( key, value );
	        }
	        // else do cookie.
	    },

	    /**
	     * 读
	     * @param key
	     * @returns {null}
	     */
	    getItem: function ( key ) {
	        return localDataWorker.support ? ls.getItem( key ) : null;
	    },

	    /**
	     *
	     * @param key
	     * @returns {*}
	     */
	    removeItem: function ( key ) {
	        if ( localDataWorker.support ) {
	            return key ? ls.removeItem( key ) : ls.clear()
	        }
	    }
	};

	module.exports = localDataWorker;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 *
	 * @param selector
	 * @returns {NodeList}
	 */
	module.exports = function ( selector ) {
	    return document.querySelectorAll( selector );
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 *
	 * @returns {Function}
	 */
	module.exports = function () {
	    return function () {
	    };
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 *
	 * @param messages
	 */
	module.exports = function ( messages ) {
	    return console.warn.apply(
	        console,
	        ['[ Seed waring ]'].concat( Array.prototype.slice.call( arguments, 0 ) )
	    )
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var CONFIG = __webpack_require__( 6 );

	/**
	 *
	 * @param data
	 */
	module.exports = function ( data ) {
	    if ( data.status === 'loaded' ) {
	        return;
	    }
	    data.status = 'loaded';

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

	    var temp = attr[data.fileType];
	    var node = data.position || document.createElement( temp.tagName );

	    for ( var key in temp.props ) {
	        node[key] = temp.props[key];
	    }

	    if ( !data.position ) {
	        document.head.appendChild( node );
	    }

	    node.removeAttribute( 'data-' + CONFIG.delimiter );
	    node.appendChild(
	        document.createTextNode( data.data )
	    );

	    data.data     = null;
	    data.position = null;
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 *
	 * @type {{base: (*|string), debug: boolean, jsonp: null, delimiter: string}}
	 */
	module.exports = {
	    base     : window.location.origin,
	    debug    : false,
	    jsonp    : null,
	    delimiter: 'seed'
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var jsonPadding = __webpack_require__( 8 );
	var ajax        = __webpack_require__( 9 );

	/**
	 *
	 * @param url
	 * @param success
	 * @param error
	 * @param jsonpCallback
	 * @returns {XMLHttpRequest|*}
	 */
	module.exports = function ( url, success, error, jsonpCallback ) {
	    return jsonpCallback
	        ? jsonPadding(
	        jsonpCallback,
	        url,
	        function ( data ) {
	            success && success( data );
	        },
	        function () {
	            error && error();
	        }
	    )
	        : ajax(
	        url,
	        success,
	        error
	    );
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 *
	 * @param jsonpCallback
	 * @param url
	 * @param success
	 * @param error
	 */
	module.exports = function ( jsonpCallback, url, success, error ) {

	    var responseData;

	    window[jsonpCallback] = function () {
	        responseData = arguments;
	    };

	    var node   = document.createElement( 'SCRIPT' );
	    var header = document.head;

	    node.onload = node.onerror = function ( event ) {
	        (event.type === 'load') ? success( responseData[0].toString() ) : error( event );
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var appendQuery = __webpack_require__( 10 );

	/**
	 *
	 * @param url
	 * @param success
	 * @param error
	 * @returns {XMLHttpRequest}
	 */
	module.exports = function ( url, success, error ) {
	    var xhr = new XMLHttpRequest();
	    xhr.open( 'GET', appendQuery( url, ('_s_t_=' + (+new Date)) ), true );

	    xhr.onreadystatechange = function () {
	        if ( xhr.readyState === 4 ) {
	            xhr.onreadystatechange = null;
	            if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 ) {
	                success && success( xhr.responseText, xhr );
	            } else {
	                error && error();
	            }
	        }
	    };

	    xhr.send( null );
	    return xhr;
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 *
	 * @param url
	 * @param query
	 * @returns {string}
	 */
	module.exports = function ( url, query ) {
	    return (query === '') ? url : (url + '&' + query).replace( /[&?]{1,2}/, '?' );
	};

/***/ }
/******/ ]);