// @include templates.js
// @include lib.js
// @include packet.js
// @include channel.js
// @include tablumps.js
// @include protocol.js
// @include commands.js
// @include client.js
// @include control.js

/* wsc - photofroggy
 * jQuery plugin allowing an HTML5/CSS chat client to connect to llama-like
 * chat servers and interact with them.
 */

(function( $ ) {
    
    function inc( $, src ) {
        $.getScript('/static/chat/' + src + '.js');
    }
    
    /*
    inc($, 'lib');
    inc($, 'templates');
    inc($, 'packet');
    inc($, 'channel');
    inc($, 'protocol');
    inc($, 'commands');
    inc($, 'client');
    /**/
    
    // Client containment.
    //var client = null;
    
    $('*').hover(
        function( ) {
            $(this).data('hover', true);
        },
        function( ) {
            $(this).data('hover', false);
        }
    );
    
    $.fn.wsc = function( method, options ) {
        
        client = $(window).data('wscclient');
        
        if( method == 'init' || ui == undefined ) {
            if( client == undefined ) {
                client = wsc_client( $(this), options, $.browser.mozilla );
                $(window).resize(client.resizeUI);
                $(window).focus(function( ) { client.control.focus(); });
            }
            $(window).data('wscclient', client);
        }
        
        if( method != 'init' && method != undefined ) {
            pieces = method.split('.');
            o = client;
            for( i in pieces ) {
                p = pieces[i];
                if( p in o )
                    o = o[p];
                else
                    return this;
            }
            o( $(this), options);
        }
        
        return this;
        
    };
    
})( jQuery );
