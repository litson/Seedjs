define( 'a', function ( require, exports ) {
    var documentString = Seed.getItem( 'documents' );

    var $preview = $( '#preview' );
    var $input   = $( '#input' );

    if ( documentString ) {
        bindInput( documentString )
    } else {
        $.ajax(
            {
                url    : '../README.md',
                success: function ( data ) {
                    bindInput( data );
                }
            }
        )
    }

    function bindInput( documentString ) {
        $( '.wrapper' ).fadeIn();
        $input.val( documentString );
        $input.on( 'input', function () {
            var value = this.value;
            $preview.html(
                markdown.toHTML( value )
            );
            Seed.setItem( 'documents', value );
        } ).trigger( 'input' );

        $( '.close-input' ).on( 'click', function () {

            $( '.input' ).hide();
            $( 'footer' ).show();
            $preview.show();

        } );

        $( '#openEditor' ).on( 'click', function () {

            window.scrollTo( 0, 0 );

            $( '.input' ).show();
            $( 'footer' ).hide();
            $preview.hide();

        } );
    }

    exports.a = 'form a.js';
} );