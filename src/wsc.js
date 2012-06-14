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
    
    /**
     * @function wsc
     * 
     * This function is the plugin method allowing you to run wsc using jQuery.
     * The client is designed to work with jQuery, but the objects are
     * abstracted out of this file/function to make it easier to maintain and
     * such.
     * 
     * This function generates a new {wsc_client.client wsc_client object} if there is no client
     * present in the window. Apart from that, this function can be used to
     * invoke functions on the client object. 
     * 
     * @example
     *  // Create a client inside div.container
     *  $('.container').wsc( 'init' );
     *  
     *  // The above code will create a new chat client which will draw itself
     *  // inside div.container on the page. This example is not too good as no
     *  // configuration options have been supplied. The example connecting is an
     *  // example of a simple configuration using dummy values. In this example,
     *  // we also start a connection to the WebSocket chat server.
     *  
     *  $('.container').wsc( 'init', {
     *      // Connection information.
     *      'domain': 'mywebsite.com',
     *      'server': 'ws://website.com/my/wsproxy:0000',
     *      // Login details.
     *      'username': 'username',
     *      'pk': 'token'
     *  });
     *  
     *  // After creating our client, we can start connecting to the server.
     *  $('.container').wsc( 'connect' );
     * 
     * @param [String] method Name of the method to call on the client object.
     * @param [Object] options Use this to pass arguments to the method being called.
     * @return [Object] Client object on init, something else on different methods.
     */
    $.fn.wsc = function( method, options ) {
        
        client = $(window).data('wscclient');
        
        if( method == 'init' || client === undefined ) {
            if( client == undefined ) {
                client = wsc_client( $(this), options, $.browser.mozilla );
                $(window).resize(client.resizeUI);
                $(window).focus(function( ) { client.control.focus(); });
                setInterval(client.loop, 120000);
            }
            $(window).data('wscclient', client);
        }
        
        if( method != 'init' && method != undefined ) {
            method = 'jq_' + method;
            if( method in client )
                client[method]( $(this), options);
        }
        
        return client;
        
    };
    
})( jQuery );
