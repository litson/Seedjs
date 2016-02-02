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
        node.setAttribute(
            key,
            temp.props[key]
        );
    }

    if ( !data.position ) {
        document.head.appendChild( node );
    }

    node.removeAttribute( 'data-seed' );
    node.appendChild(
        doc.createTextNode( data.data )
    );

    data.data     = null;
    data.position = null;
};