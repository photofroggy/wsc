
/**
 * Extension to handle stash links posted in the chat.
 */
wsc.dAmn.Stash = function( client, storage, settings ) {

    var init = function(  ) {
    
        client.ui.on('log_item.after', handle.log_item);
    
    };
    
    var handle = {
    
        log_item: function( event ) {
        
            var links = event.item.find('a[href^="http://sta.sh"]');
            
            links.each( function( i, dlink ) {
                var link = event.item.find(dlink);
                console.log(dlink, dlink.prop('href'));
            } );
        
        }
    
    };
    
    init();

};

