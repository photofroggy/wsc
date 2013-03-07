
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
                wsc.dAmn.Stash.fetch( event, link );
            } );
        
        }
    
    };
    
    init();

};


/**
 * Fetch stash data.
 */
wsc.dAmn.Stash.fetch = function( event, link ) {

    $.getJSON(
        'http://backend.deviantart.com/oembed?url=' + link.prop('href') + '&format=jsonp&callback=?',
        function( data ) {
            wsc.dAmn.Stash.render( event, link, data );
        }
    );

};


/**
 * Render a stash thumb.
 */
wsc.dAmn.Stash.render = function( event, link, data ) {

    if( 'error' in data )
        return;
    
    if( data.type != 'photo' )
        return;
    
    var lurl = link.prop('href');
    var w = data.thumbnail_width; var h = data.thumbnail_height;
    var tw, th;
    
    // Deviation link tag. First segment only.
    var title = data.title + ' by ' + data.author_name;
    var anchor = '<a target="_blank" href="' + lurl + '" title="' + title + '">';
    
    if( w/h > 1) {
        th = parseInt((h * 100) / w);
        tw = 100;
    } else {
        tw = parseInt((w * 100) / h);
        th = 100;
    }
    
    if( tw > w || th > h ) {
        tw = w;
        th = h;
    }
    
    var dim = 'width="' + tw + '" height="' + th + '"';
    var shadow = !data.thumbnail_url.match(/.png$/i);
    
    var thumb = anchor + '<img class="thumb' + ( shadow ? ' shadow' : '' ) + '"' +
        dim + ' " alt="' + lurl + '" src="' + data.thumbnail_url_150 + '" /></a>';
    
    link.replaceWith(thumb);
    link = event.item.find('a[href="' + lurl + '"]');
    event.chan.st+= event.item.height();
    event.chan.el.l.w.scrollTop( event.chan.st );
    event.chan.scroll();

};
