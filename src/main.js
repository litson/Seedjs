'use strict';

var win = window;
var doc = document;

var localDataWorker = require( './localDataWorker' );

var $ = require( './$' );

var noop = require( './noop' );
var warn = require( './warn' );

var _executeFileCode = require( './executeFileCode' );
var getFile          = require( './getFile' );

/////////////////////////////////////////////////////////////////////

var seed = {
    cache     : {},
    scan      : scan,
    use       : use,
    removeItem: localDataWorker.removeItem,
    setItem   : localDataWorker.setItem,
    getItem   : localDataWorker.getItem
};

var data = seed.data = require( './CONFIG' );

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