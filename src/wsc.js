/**
 * jQuery plugin.
 * 
 * Wrapper for implementing the plugin.
 * 
 * @class jQuery.plugin
 * @constructor
 * @param $ {Object} jQuery instance
 */
(function( $ ) {
    
    $('*').hover(
        function( e ) {
            $(this).data('hover', true);
        },
        function( e ) {
            $(this).data('hover', false);
        }
    );
    
    /**
     * Implements the wsc client as a jQuery plugin.
     * 
     * To create a new client, pass `"init"` as the method, as follows:
     *      
     *      $('div.container').wsc( 'init', options );
     * 
     * @method wsc
     * @param method {String} Method to call
     * @param options {Object} Method input options
     * @return {Object} Instance of wsc
     */
    $.fn.wsc = function( method, options ) {
        
        var client = $(window).data('wscclient');
        
        if( method == 'init' || client === undefined ) {
            if( client == undefined ) {
                client = new wsc.Client( $(this), options, ($.browser.mozilla || false) );
                $(window).resize(function( ) { client.ui.resize(); });
                $(window).focus(function( ) { client.ui.control.focus(); });
                setInterval(function(  ) { client.loop(); }, 120000);
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
    $.fn.wscui = function( method, options ) {
        
        ui = $(window).data('wscui');
        
        if( method == 'init' || ui === undefined ) {
            if( ui == undefined ) {
                ui = new Chatterbox.UI( $(this), options, ($.browser.mozilla || false) );
                $(window).resize(ui.resize);
            }
            $(window).data('wscui', ui);
        }
        
        if( method != 'init' && method != undefined ) {
            method = 'jq_' + method;
            if( method in ui )
                ui[method]( $(this), options);
        }
        
        return ui;
        
    };
    
})( jQuery );
