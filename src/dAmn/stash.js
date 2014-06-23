
wsc.dAmn.Stash = {};

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


/**
 * Cache for stash items.
 * @class wsc.dAmn.Stash.Cache
 * @constructor
 */
wsc.dAmn.Stash.Cache = function(  ) {

    this.item = {};

};

/**
 * Remove old items from the cache.
 * @method uncache
 */
wsc.dAmn.Stash.Cache.prototype.uncache = function(  ) {

    var t = (new Date).getTime();
    
    for( var id in this.item ) {
        
        if( !this.item.hasOwnProperty(id) )
            continue;
        
        if( t - this.item[id].time < 30000 )
            continue;
        
        delete this.item[id];
    
    }

};

/**
 * Get a stash item.
 * @method get
 * @param id {Array} Stash id.
 * @param callback {Function} Method to call with the resulting html.
 */
wsc.dAmn.Stash.Cache.prototype.get = function( id, callback ) {

    this.uncache();
    
    var item = this.item[id];
    
    if( item ) {
    
        callback( item );
        return;
    
    }
    
    item = {
        id: id,
        url: 'http://sta.sh/' + id,
        time: (new Date).getTime(),
        html: '',
        data: null
    };
    
    var stash = this;
    
    var cache = function( data ) {
    
        if( 'error' in data )
            return callback();
        
        if( data.type != 'photo' )
            return callback();
        
        item.html = wsc.dAmn.Stash.item_html(item.url, data);
        item.data = data;
        stash.item[id] = item;
        callback(item);
    
    };
    
    $.getJSON(
        'http://backend.deviantart.com/oembed?url=' + item.url + '&format=jsonp&callback=?',
        function( stashdata ) {
            cache( stashdata );
        }
    );

};

wsc.dAmn.Stash.cache = new wsc.dAmn.Stash.Cache();

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
        
            var linkso = event.item.find('a[href^="http://sta.sh"]');
            
            var links = [];
            
            linkso.each( function( index, item ) {
            
                links.push( event.item.find(item) );
            
            } );
            
            if( links.length == 0 )
                return;
            
            var next = function(  ) {
                
                if( links.length == 0 ) {
                    event.chan.st+= event.item.height();
                    event.chan.el.l.w.scrollTop( event.chan.st );
                    event.chan.scroll();
                    return;
                }
                
                rlink( links.pop() );
            
            };
            
            var rlink = function( link ) {
                
                if( !link )
                    return next();
                
                var url = link.prop('href');
                
                if( !url )
                    return next();
                
                url = url.split('/');
                var id = url[url.length - 1];
                
                wsc.dAmn.Stash.cache.get( id, function( item ) {
                
                    if( !item )
                        return next();
                    
                    wsc.dAmn.chatterbox.Stash.render( link, item );
                    next();
                
                } );
            
            };
            
            rlink( links.pop() );
        
        }
    
    };
    
    init();

};


/**
 * Render a stash thumb.
 */
wsc.dAmn.chatterbox.Stash.render = function( link, item ) {
    
    link.replaceWith(item.html);
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

};

wsc.dAmn.tadpole.Stash = function( client, ui, api ) {

    var init = function(  ) {
    
        ui.middle( 'ns.log', function( data, done ) {
        
            var linkso = $(data.content).find('a[href^="http://sta.sh"]');
            
            var links = [];
            
            linkso.each( function( index, item ) {
            
                links.push( $(item) );
            
            } );
            
            if( links.length == 0 )
                return done( data );
            
            var next = function(  ) {
                
                if( links.length == 0 )
                    return done( data );
                
                rlink( links.pop() );
            
            };
            
            var rlink = function( link ) {
                
                if( !link )
                    return next();
                
                var url = link.prop('href');
                var html = $('<span></span>').append(link).html();
                
                if( !url )
                    return next();
                
                url = url.split('/');
                var id = url[url.length - 1];
                
                wsc.dAmn.Stash.cache.get( id, function( item ) {
                
                    if( !item )
                        return next();
                    
                    data.content = replaceAll( data.content, html, item.html );
                    next();
                
                } );
            
            };
            
            rlink( links.pop() );
        
        } );
    
    };
    
    init();

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
