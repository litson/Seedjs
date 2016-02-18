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
var $       = require( './$' );
var REG     = require( './REG' );
var noop    = require( './noop' );
var warn    = require( './warn' );
var getFile = require( './getFile' );

var localDataWorker = require( './localDataWorker' );
var executeFileCode = require( './executeFileCode' );


/////////////////////////////////////////////////////////////////////

/**
 * 基本配置
 *
 * @type {Object}
 */
var data = require( './CONFIG' );

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
        if ( Object.prototype.toString.call( ready ) !== '[object Function]' ) {
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
    config: require( './setConfig' ),

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
 * @param {Array} ids 文件对象id集合
 * @param {Number} index 依赖回调的索引
 * @private
 */
function _parseIds( ids, index ) {

    ids.forEach( function ( id ) {

        // @type {String} 文件的元素id
        var originalId = id;

        // 非绝对路径加配置前缀
        if ( !REG.ABSOLUTE.test( id ) ) {
            id = data.base + id;
        }

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

module.exports = seed;