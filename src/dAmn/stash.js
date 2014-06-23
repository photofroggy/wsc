
wsc.dAmn.Stash = {};

/**
 * Extension to handle stash links posted in the chat. Provides some helper functions
 * to meet this end as well.
 *
 * @class dAmn.Stash
 */
wsc.dAmn.chatterbox.Stash = function( ui, ext ) {

    var init = function(  ) {
    
        ui.on('log_item.after', handle.log_item);
    
    };
    
    var handle = {
    
        log_item: function( event ) {
        
            var links = event.item.find('a[href^="http://sta.sh"]');
            
            links.each( function( i, dlink ) {
                var link = event.item.find(dlink);
                wsc.dAmn.chatterbox.Stash.fetch( event, link );
            } );
        
        }
    
    };
    
    init();

};


/**
 * Fetch stash data.
 */
wsc.dAmn.chatterbox.Stash.fetch = function( event, link ) {

    $.getJSON(
        'http://backend.deviantart.com/oembed?url=' + link.prop('href') + '&format=jsonp&callback=?',
        function( data ) {
            wsc.dAmn.chatterbox.Stash.render( event, link, data );
        }
    );

};

wsc.dAmn.Stash.dimensions = function( data ) {

    var w = data.thumbnail_width; var h = data.thumbnail_height;
    var tw, th;
    
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
    
    return {
        height: h,
        width: w,
        thumb: {
            height: th,
            width: tw
        }
    };

};


wsc.dAmn.Stash.item_html = function( url, data ) {

    var d = wsc.dAmn.Stash.dimensions( data );
    var w = d.width; var h = d.height;
    
    // Deviation link tag. First segment only.
    var title = data.title + ' by ' + data.author_name;
    var anchor = '<a class="stashlink" target="_blank" href="' + url + '" title="' + title + '">';
    
    var dim = 'width="' + d.thumb.width + '" height="' + d.thumb.height + '"';
    //var shadow = !data.thumbnail_url.match(/.png$/i) ? ' shadow' : '';
    var id = url.split('/').pop();
    
    return '<span class="stashthumb" id="'+id+'">' + anchor + '<img class="smaller thumb"' +
        dim + ' " alt="' + url + '" src="' + data.thumbnail_url_150 + '" />\
        </a></span>';

};


/**
 * Render a stash thumb.
 */
wsc.dAmn.chatterbox.Stash.render = function( event, link, data ) {

    if( 'error' in data )
        return;
    
    if( data.type != 'photo' )
        return;
    
    var lurl = link.prop('href');
    
    link.replaceWith(wsc.dAmn.Stash.item_html( lurl, data ));
    /*link.append('<a href="#toggle" class="button iconic plus" title="Larger"></a>');
    
    var lw = event.item.find('span#' + id);
    link = lw.find('a[href="' + lurl + '"]');
    
    var smaller = link.find('img.smaller');
    var larger = null;
    var zoomed = false;
    
    var toggle = lw.find('a[href="#toggle"]');
    
    toggle.click( function(  ) {
    
        if( !zoomed ) {
            smaller.css('display', 'none');
            
            if( larger == null ) {
                lw.find('a.stashlink').append('<img class="larger thumb' + shadow + '" width="' + w + '"\
                height="' + h + '" alt="' + lurl + '" src="' + data.thumbnail_url + '" />');
                larger = lw.find('img.larger');
            }
            
            larger.css('display', 'inline');
            zoomed = true;
            
            toggle.removeClass('plus');
            toggle.addClass('minus');
            toggle.prop('title', 'Smaller');
                    
            event.chan.st+= event.item.height();
            event.chan.el.l.w.scrollTop( event.chan.st );
            event.chan.scroll();
            
            return false;
        }
        
        larger.css('display', 'none');
        smaller.css('display', 'inline');
        
        toggle.removeClass('minus');
        toggle.addClass('plus');
        toggle.prop('title', 'Larger');
            
        event.chan.st+= event.item.height();
        event.chan.el.l.w.scrollTop( event.chan.st );
        event.chan.scroll();
        
        zoomed = false;
        
        return false;
    
    } );
    */
    event.chan.st+= event.item.height();
    event.chan.el.l.w.scrollTop( event.chan.st );
    event.chan.scroll();

};

wsc.dAmn.tadpole.Stash = function( client, ui, api ) {

    var init = function(  ) {
    
        ui.middle( 'ns.log', function( data, done ) {
        
            var next = function( data ) {
            
                var link = data.content.match( /<a target="_blank" href="http:\/\/sta.sh\/([^"]+)([^>]+)>([^<]+)<\/a>/i );
                
                if( !link )
                    return done( data );
                
                wsc.dAmn.tadpole.Stash.fetch( data, link, next );
            
            };
            
            next( data );
        
        } );
    
    };
    
    init();

};


/**
 * Fetch stash data.
 */
wsc.dAmn.tadpole.Stash.fetch = function( data, link, done ) {

    $.getJSON(
        'http://backend.deviantart.com/oembed?url=http://sta.sh/' + link[1] + '&format=jsonp&callback=?',
        function( stashdata ) {
            wsc.dAmn.tadpole.Stash.replace( data, link, stashdata, done );
        }
    );

};

wsc.dAmn.tadpole.Stash.replace = function( data, link, stashdata, done ) {

    if( 'error' in stashdata )
        return done( data );
    
    if( stashdata.type != 'photo' )
        return done( data );
    
    var url = 'http://sta.sh/' + link[1];
    
    data.content = replaceAll(
        data.content,
        link[0],
        wsc.dAmn.Stash.item_html( url, stashdata )
    );
    
    done( data );

};
