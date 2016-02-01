/**
 * @file
 * @fileoverview
 * @authors      zhangtao23
 * @date         2015/12/5
 * @version      1.3.0
 * @note
 */

/* global module */

'use strict';
(function ( win, doc ) {

    function noop() {
        return function () {
        }
    }

    var ls = win.localStorage;

    var localDataWorker = {
        support: (function () {
            var support = true;
            try {
                ls.setItem( '__seed_test__', 1 );
                ls.removeItem( '__seed_test__' );
            } catch ( e ) {
                support = false;
            }
            return support;
        })(),
        setItem: function ( key, value ) {
            if ( this.support ) {
                ls.setItem( key, value );
            }
            // else do cookie.
            return this;
        },
        getItem: function ( key ) {
            return this.support ? ls.getItem( key ) : null;
        }
    };

    function getFile( url, success, error ) {

        var xhr = new XMLHttpRequest();
        xhr.open( 'GET', appendQuery( url, ('_s_t_=' + (+new Date)) ), true );

        xhr.onreadystatechange = function () {
            if ( xhr.readyState === 4 ) {
                xhr.onreadystatechange = noop;
                if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 ) {
                    success && success( xhr.responseText, xhr );
                } else {
                    getFileError( xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, error );
                }
            }
        };

        xhr.send( null );
        return xhr;
    }

    function getFileError( error, type, xhr, callBack ) {
        callBack && callBack( error, type, xhr );
    }

    function appendQuery( url, query ) {
        return (query === '') ? url : (url + '&' + query).replace( /[&?]{1,2}/, '?' );
    }

    /////////////////////////////////////////////////////////////////////

    var seed = {
        scan : scan,
        cache: {},
        use  : use
    };

    var data = seed.data = {
        debug: true
    };

    data.base = win.location.origin;

    function scan( callBack ) {
        var files = doc.querySelectorAll( '[data-seed]' );
        var len   = files.length;
        var ids   = [];

        if ( !len ) {
            return seed;
        }

        for ( var i = 0; i < len; i++ ) {
            ids.push( files[i].dataset.seed );
        }

        return seed.use( ids, callBack );
    }

    var _queue       = [];
    var cache        = seed.cache;
    var dependencies = {};

    function use( ids, callBack ) {

        if ( !ids ) {
            return seed;
        }

        if ( Object.prototype.toString.call( callBack ) !== '[object Function]' ) {
            callBack = noop();
        }

        var index = _queue.indexOf( callBack );

        if ( -1 === index ) {
            _queue.push( callBack );
            return use( ids, callBack );
        }

        if ( 'string' === typeof ids ) {
            ids = [ids];
        }

        if ( !Array.isArray( ids ) ) {
            console.warn( '[Seedjs can\'t resolve a non array parameter!]' );
            return seed;
        }

        _parseIds( ids, index );

        // 由docker处理加载任务
        _docker( dependencies[index].deps );
        return seed;
    }

    function _parseIds( ids, index ) {
        ids.forEach( function ( id ) {

            if ( !/^\/\/.|:\//.test( id ) ) {
                id = data.base + id;
            }

            var fileType = /\.css(?:\?|$)/i.test( id ) ? 'css' : 'js';

            // 声明依赖关系
            if ( !cache[id] ) {
                cache[id] = {
                    id          : id,
                    data        : null,
                    fileType    : fileType,
                    // 标记，该文件被传入的第N个回调依赖
                    dependencies: [index],
                    status      : 'ready',
                    position    : doc.querySelector( '[data-seed="' + id + '"]' )
                };
            } else {
                cache[id].dependencies.push( index );
            }

            cache[id] = _parseHook( cache[id] );

            if ( !dependencies[index] ) {
                dependencies[index] = {
                    ids : [id],
                    // 标记，该回调依赖哪些文件
                    deps: [id]
                }
            } else {
                dependencies[index].ids.push( id );
                dependencies[index].deps.push( id );
            }
        } );
    }

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
            console.warn(
                '\n[ Seed Warning ]',
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

    function _docker( ids ) {
        ids.slice( 0 ).forEach( function ( key ) {
            var item = cache[key];

            // 如果已经加载完毕的模块
            if ( item.status === 'loaded' ) {
                return _emit( item );
            }

            var codeString = localDataWorker.getItem( item.id );

            // hook不同或者未存储,均ajax回掉通知
            if ( (item.hook !== localDataWorker.getItem( item.id + '@hook' ))
                || !codeString ) {
                _fileLoad( item );
            } else {
                item.data = codeString;
                _emit( item );
            }
        } );
    }

    function _fileLoad( data ) {
        if ( data.status === 'pending' ) {
            return;
        }
        data.status = 'pending';
        getFile(
            data.fileUrl,
            function ( ajaxCodeString ) {
                data.data = ajaxCodeString;
                localDataWorker.setItem( data.id + '@hook', data.hook );
                localDataWorker.setItem( data.id, ajaxCodeString );
                _emit( data );
            }
        );
    }

    // 通知解除依赖
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

    function _execute( ids, index ) {
        ids.forEach( function ( item ) {
            _executeFileCode( cache[item] );
        } );
        _queue[index]();
    }

    function _executeFileCode( data ) {

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
        var node = data.position || doc.createElement( temp.tagName );

        for ( var key in temp.props ) {
            node[key] = temp.props[key];
        }

        if ( !data.position ) {
            doc.head.appendChild( node );
        }

        node.removeAttribute( 'data-seed' );
        node.appendChild(
            doc.createTextNode( data.data )
        );

        data.data     = null;
        data.position = null;
    }

    win.Seed = seed;

})( window, document );