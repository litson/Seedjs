!function ( e ) {
    function t( o ) {
        if ( n[o] )return n[o].exports;
        var r = n[o] = {exports: {}, id: o, loaded: !1};
        return e[o].call( r.exports, r, r.exports, t ), r.loaded = !0, r.exports
    }

    var n = {};
    return t.m = e, t.c = n, t.p = "", t( 0 )
}( [function ( e, t, n ) {
    "use strict";
    function o( e, t ) {
        e.forEach( function ( e ) {
            var n = e;
            f.ABSOLUTE.test( e ) || (e = _.base + e);
            var o = f.IS_CSS.test( e ) ? "css" : "js";
            x[e] ? x[e].dependencies.push( t ) : x[e] = r( {
                id          : e,
                data        : null,
                status      : "ready",
                fileType    : o,
                position    : l( "[data-" + _.delimiter + '="' + n + '"]' )[0],
                dependencies: [t]
            } ), S[t] ? (S[t].ids.push( e ), S[t].deps.push( e )) : S[t] = {ids: [e], deps: [e]}
        } )
    }

    function r( e ) {
        function t( e ) {
            var t = e.match( f.PARAM );
            return {id: t[1], fileUrl: e, hook: t[2] || "__seed_version__"}
        }

        var n = {id: e.id, fileUrl: e.id, hook: "__seed_version__"}, o = _.map || t, r = o( e.id, n );
        return r && "object" == typeof r || (h( "\nYou may provide an incorrect 'map' method!", "\nThe 'map' method expected return value is :\n", JSON.stringify( {
            id     : "Stored 'ID'",
            fileUrl: "Original file URL",
            hook   : "Need to update tag"
        }, null, 4 ), "\nYou can refer to the following method :\n", t.toString(), "\n Seedjs will use default value :\n", JSON.stringify( n, null, 4 ), "\n However, it's maybe can't complete update!" ), r = n), e.id = r.id, e.hook = r.hook, e.fileUrl = r.fileUrl, e
    }

    function i( e ) {
        e.slice( 0 ).forEach( function ( e ) {
            var t = x[e];
            return "loaded" === t.status ? c( t ) : void(_.debug || t.hook !== g.getItem( t.id + "@hook" ) || !g.getItem( t.id ) ? s( t ) : (t.data = g.getItem( t.id ), c( t )))
        } )
    }

    function s( e ) {
        "pending" !== e.status && (e.status = "pending", v( e.fileUrl, function ( t ) {
            a( e, t )
        }, function () {
            h( "Some exception occurs when getting", e.fileUrl ), a( e, "" )
        }, _.jsonp ))
    }

    function a( e, t ) {
        e.data = t, u( e.id, e.hook, t ), c( e )
    }

    function u( e, t, n ) {
        _.debug || (g.setItem( e + "@hook", t ), g.setItem( e, n ))
    }

    function c( e ) {
        e.dependencies.slice( 0 ).forEach( function ( t ) {
            var n = S[t];
            n.deps.splice( n.deps.indexOf( e.id ), 1 ), e.dependencies.splice( e.dependencies.indexOf( t ), 1 ), 0 === n.deps.length && d( n.ids, t )
        } )
    }

    function d( e, t ) {
        e.forEach( function ( e ) {
            y( x[e] )
        } ), I[t]()
    }

    var l = n( 3 ), p = window, f = n( 2 ), m = n( 10 ), h = n( 12 ), v = n( 7 ), g = n( 9 ), y = n( 6 ), _ = n( 1 ), x = {}, I = [], S = {}, w = {
        use       : function ( e, t ) {
            if ( !e )return this;
            if ( "string" == typeof e && (e = [e]), !Array.isArray( e ) )return h( "Seedjs can't resolve a non array parameter!" ), this;
            if ( !e.length )return h( "Did you provide an empty array?" ), this;
            "[object Function]" !== Object.prototype.toString.call( t ) && (t = m());
            var n = I.indexOf( t );
            return -1 === n ? (I.push( t ), this.use( e, t )) : (_.debug && g.removeItem(), o( e, n ), i( S[n].deps ), this)
        },
        scan      : function ( e ) {
            var t = l( "[data-" + _.delimiter + "]" ), n = t.length, o = [];
            if ( !n )return this;
            for ( var r = 0; n > r; r++ )o.push( t[r].dataset[_.delimiter] );
            return this.use( o, e )
        },
        data      : _,
        cache     : x,
        config    : n( 11 ),
        setItem   : g.setItem,
        getItem   : g.getItem,
        removeItem: g.removeItem
    };
    p.Seed = w
}, function ( e, t ) {
    e.exports = {base: window.location.origin, debug: !1, jsonp: null, delimiter: "seed"}
}, function ( e, t ) {
    e.exports = {
        IS_CSS      : /\.css(?:\?|$)/i,
        PARAM       : /^(.*\.(?:css|js))(.*)$/i,
        ABSOLUTE    : /^\/\/.|:\//,
        URL_OPERATOR: /[&?]{1,2}/
    }
}, function ( e, t ) {
    e.exports = function ( e ) {
        return document.querySelectorAll( e )
    }
}, function ( e, t, n ) {
    var o = n( 5 );
    e.exports = function ( e, t, n ) {
        var r = new XMLHttpRequest;
        return r.open( "GET", o( e, "_s_t_=" + +new Date ), !0 ), r.onreadystatechange = function () {
            4 === r.readyState && (r.onreadystatechange = null, r.status >= 200 && r.status < 300 || 304 === r.status ? t && t( r.responseText, r ) : n && n())
        }, r.send( null ), r
    }
}, function ( e, t, n ) {
    var o = n( 2 );
    e.exports = function ( e, t ) {
        return "" === t ? e : (e + "&" + t).replace( o.URL_OPERATOR, "?" )
    }
}, function ( e, t, n ) {
    var o = n( 1 );
    e.exports = function ( e ) {
        if ( "loaded" !== e.status ) {
            e.status = "loaded";
            var t = {
                css: {tagName: "style", props: {type: "text/css", id: e.id}},
                js : {tagName: "script", props: {type: "text/javascript", id: e.id}}
            }, n  = t[e.fileType], r = e.position || document.createElement( n.tagName );
            for ( var i in n.props )r[i] = n.props[i];
            e.position || document.head.appendChild( r ), r.removeAttribute( "data-" + o.delimiter ), r.appendChild( document.createTextNode( e.data ) ), e.data = null, e.position = null
        }
    }
}, function ( e, t, n ) {
    var o = n( 8 ), r = n( 4 );
    e.exports = function ( e, t, n, i ) {
        return i ? o( i, e, t, n ) : r( e, t, n )
    }
}, function ( e, t ) {
    e.exports = function ( e, t, n, o ) {
        function r( e ) {
            e.onload = e.onerror = null;
            for ( var t in e )delete e[t];
            a.removeChild( e )
        }

        var i;
        window[e] = function () {
            i = arguments
        };
        var s = document.createElement( "SCRIPT" ), a = document.head;
        s.onload = s.onerror = function ( e ) {
            "load" === e.type ? n.apply( null, i ) : o( e ), r( s ), s = null
        }, s.src = t, a.insertBefore( s, a.firstChild )
    }
}, function ( e, t ) {
    var n = window.localStorage, o = {
        support      : function () {
            function e( e ) {
                var t = !0;
                try {
                    n.setItem( "__seed_test__", 1 ), n.removeItem( "__seed_test__" )
                } catch ( o ) {
                    if ( e )try {
                        t = e()
                    } catch ( r ) {
                        t = !1
                    } else t = !1
                }
                return t
            }

            return e( function () {
                return n.clear(), e()
            } )
        }(), setItem : function ( e, t ) {
            o.support && n.setItem( e, t )
        }, getItem   : function ( e ) {
            return o.support ? n.getItem( e ) : null
        }, removeItem: function ( e ) {
            return o.support ? e ? n.removeItem( e ) : n.clear() : void 0
        }
    };
    e.exports = o
}, function ( e, t ) {
    e.exports = function () {
        return function () {
        }
    }
}, function ( e, t, n ) {
    var o = n( 1 );
    e.exports = function ( e ) {
        var t, n, r, i;
        for ( n in e )if ( r = e[n], i = o[n], i && "object" == typeof i )for ( t in i )i[t] = r[t]; else o[n] = r
    }
}, function ( e, t ) {
    e.exports = function ( e ) {
        return console.warn.apply( console, ["[ Seed waring ]"].concat( Array.prototype.slice.call( arguments, 0 ) ) )
    }
}] );