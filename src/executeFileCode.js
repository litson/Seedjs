var CONFIG = require( './CONFIG' );
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

    // 获取元素位置（若参数data中含有文件位置则使用，否，则创建）
    var node = data.position || doc.createElement( temp.tagName );

    // 批量附加属性
    for ( var key in temp.props ) {
        node[key] = temp.props[key];
    }

    // 塞到DOM
    if ( !data.position ) {
        doc.head.appendChild( node );
    }

    // 干掉标记
    node.removeAttribute( 'data-' + CONFIG.delimiter );

    // 执行代码；PS：innerHTML,超过一定行数会报错。
    node.appendChild( doc.createTextNode( data.data ) );

    // 一些清理工作
    data.data     = null;
    data.position = null;
};