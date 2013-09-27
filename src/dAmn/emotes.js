
wsc.dAmn.Emotes = function( client, storage, settings ) {

    settings.emotes.emote = {};
    settings.emotes.page = null;
    settings.emotes.fint = null;
    settings.emotes.notice = null;
    settings.emotes.fetching = false;
    settings.emotes.loaded = false;
    settings.emotes.picker = new wsc.dAmn.Emotes.Picker( client.ui, {
        'event': {
            'select': function( item ) { settings.emotes.select( item ); },
            'reload': function(  ) { settings.emotes.fetch(); }
        }
    }, settings );
    settings.emotes.picker.build();
    settings.emotes.picker.hide();
    
    /*
    client.ui.control.add_button( {
        'label': '',
        'icon': 'user',
        'href': '#emotes',
        'title': 'Emote picker.',
        'handler': function() {
            if( settings.emotes.picker.window.css('display') == 'none' ) {
                settings.emotes.picker.show();
            } else {
                settings.emotes.picker.close();
            }
        }
    });
    */
    
    settings.emotes.configure_page = function( event, ui ) {
    
        var page = event.settings.page('Emotes');
        settings.emotes.page = page;
        
        var orig = {};
        orig.on = settings.emotes.on;
        var stat = '';
        if( orig.on ) {
            if( !settings.emotes.loaded || settings.emotes.fetching )
                stat = '<em>Fetching emotes...</em>';
            else
                stat = '<em>Emotes loaded.</em>';
        }
        
        page.item('Form', {
            'ref': 'switch',
            'title': 'Enable Emotes',
            'text': 'Here you can turn custom emotes on and off.',
            'fields': [
                ['Checkbox', {
                    'ref': 'enabled',
                    'items': [ { 'value': 'yes', 'title': 'On', 'selected': orig.on } ]
                }]
            ],
            'event': {
                'change': function( event ) {
                    settings.emotes.on = (event.data.enabled.indexOf('yes') != -1);
                    settings.emotes.picker.state( settings.emotes.on );
                    if( settings.emotes.on ) {
                        settings.emotes.fetch();
                        return;
                    }
                    if( settings.emotes.fint === null )
                        return;
                    clearTimeout(settings.emotes.fint);
                    settings.emotes.fint = null;
                },
                'save': function( event ) {
                    orig.on = settings.emotes.on;
                    if( !settings.emotes.on ) {
                        settings.emotes.picker.loading('Disabled');
                    } else {
                        if( !settings.emotes.fetching ) {
                            settings.emotes.picker.loaded();
                        }
                    }
                },
                'close': function( event ) {
                    settings.emotes.on = orig.on;
                    settings.load();
                    settings.emotes.page = null;
                    if( settings.emotes.fint === null )
                        return;
                    clearTimeout(settings.emotes.fint);
                    settings.emotes.fint = null;
                }
            }
        });
    
    };
    
    client.ui.on('settings.open.ran', settings.emotes.configure_page);
    
    settings.emotes.fetch = function(  ) {
        if( settings.emotes.loaded ) {
            settings.emotes.picker.loading('Reloading...');
        } else {
            settings.emotes.picker.loading();
        }
        settings.emotes.fetching = true;
        jQuery.getJSON('http://www.thezikes.org/publicemotes.php?format=jsonp&jsoncallback=?&' + (new Date()).getDay(), function(data){
            settings.emotes.fetching = false;
            settings.emotes.emote = data;
            
            if( !settings.emotes.loaded ) {
                if( settings.emotes.on ) {
                    client.ui.pager.notice({
                        'ref': 'emotes-loaded',
                        'heading': 'Emote CLOUD',
                        'content': 'Emoticons from zike\'s Emote CLOUD have been loaded.'
                    }, false, 5000, true);
                }
            }
            
            settings.emotes.sort();
            settings.emotes.loaded = true;
            settings.emotes.picker.loaded();
            settings.emotes.fint = setTimeout( settings.emotes.fetch, 3600000 );
        },
        function(  ) {
            settings.emotes.picker.loaded();
            return false;
        });
    };
    
    settings.emotes.swap = function( data, done ) {
    
        if( !settings.emotes.on ) {
            done( data );
            return;
        }
        
        var codes = data.input.match(/:([\S]+):/g);
        var code = '';
        var ci = -1;
        
        var fcs = function( em ) {
            return em != codes[ci];
        };
        
        for( ci in codes ) {
            
            code = codes[ci];
            codes = codes.filter( fcs );
            
            if( !settings.emotes.emote.hasOwnProperty(code) )
                continue;
            
            data.input = replaceAll(
                data.input, code,
                ':thumb' + settings.emotes.emote[code]['devid'] + ':'
            );
        }
        
        data.input = replaceAll( data.input, ':B', ':bucktooth:' );
        done( data );
    
    };
    
    settings.emotes.prepare = function( item ) {
    
        item = replaceAll( item, '&', '&amp;' );
        item = replaceAll( item, '<', '&lt;' );
        item = replaceAll( item, '>', '&gt;' );
        return replaceAll( item, '"', '&quot;' );
    
    };
    
    settings.emotes.repair = function( item ) {
    
        item = replaceAll( item, '&quot;', '"' );
        item = replaceAll( item, '&lt;', '<' );
        item = replaceAll( item, '&gt;', '>' );
        return replaceAll( item, '&amp;', '&' );
    
    };
    
    settings.emotes.sort = function(  ) {
    
        var map = [
            [], [], [], [], [], [], [],
            [], [], [], [], [], [], [],
            [], [], [], [], [], [], [],
            [], [], [], [], [], [], 
        ];
        var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#';
        var emote = null;
        var mitem = null;
        var prted = false;
        var idex = -1;
        var debug = true;
        
        /*
         * Until we have a better option...
        // First part we create our maps for our page items.
        for( var i in settings.emotes.emote ) {
            if( !settings.emotes.emote.hasOwnProperty(i) )
                continue;
            
            emote = settings.emotes.emote[i];
            var t = replaceAll(emote.img.split('/')
                .pop().split('.').shift(),
                '__', ' ');
            t = replaceAll(t, '_', ' ');
            
            var eimg = wsc.dAmn.Emotes.Thumb( emote.devid, {
                'user': emote.by,
                'title': t,
                'otitle': 'created by ' + emote.by,
                'aclose': '',
                'anchor': '',
                'thumb': emote.img
            } );
            
            mitem = {
                'value': '<span class="thumb">' + eimg +
                    '</span><span class="value">' +
                    settings.emotes.prepare(emote.code) + '</span>',
                'title': 'created by ' + emote.by,
                'html': true
            };
            
            idex = alpha.indexOf( emote.code.substr(1, 1).toUpperCase() );
            
            if( idex == -1 )
                idex = alpha.indexOf( '#' );
            
            map[idex].push(mitem);
        }
        
        var sorter = function( a, b ) {
            return caseInsensitiveSort( a.value, b.value );
        };
        
        var dp = settings.emotes.picker.page( '#' );
        var page = null;
        
        // Now we sort all of the emotes on each page.
        for( var i = 0; i < alpha.length; i++ ) {
            map[i].sort( sorter );
            page = settings.emotes.picker.page( alpha[i], dp );
            page.options.items = map[i];
        }
        
        // Display the newly sorted emotes.
        settings.emotes.picker.refresh();
        */
    
    };
    
    settings.emotes.select = function( item ) {
        client.ui.control.set_text(
            client.ui.control.get_text( ) + settings.emotes.repair(item)
        );
    };
    
    client.middle('send.msg', settings.emotes.swap);
    client.middle('send.action', settings.emotes.swap);
    client.middle('send.kick', settings.emotes.swap);
    client.middle('send.set', settings.emotes.swap);
    
    if( !settings.emotes.on )
        return;
    
    settings.emotes.fetch();

};

wsc.dAmn.Emotes.Tablumps = function( data ) {

    var d = {
        'id': data[0],
        'thumb': data[4],
        'server': parseInt(data[3]),
        'flags': data[5].split(':'),
        'dimensions': '',
        'title': '',
        'anchor': '',
        'otitle': data[1]
    };
    
    d.flags[0] = parseInt(d.flags[0]);
    d.flags[1] = parseInt(d.flags[1]);
    d.flags[2] = parseInt(d.flags[2]);
    
    var isgif = d.thumb.match( /\.gif$/i );
    var dim = data[2].split('x'); var w = parseInt(dim[0]); var h = parseInt(dim[1]);
    var tw, th;
    // Deviation title.
    var ut = (d.otitle.replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') || '-') + '-' + d.id;
    
    // Deviation link tag. First segment only.
    d.title = d.otitle + ', ' + w + 'x' + h;
    d.anchor = '<a target="_blank" href="http://www.deviantart.com/art/' + ut + '" title="' + d.title + '">';
    
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
    
    d.dimensions = 'width="' + tw + '" height="' + th + '"';
    d.flags.push(isgif && ( w > 200 || h > 200 ));
    
    return wsc.dAmn.Emotes.Thumb( d.id, d );

};

wsc.dAmn.Emotes.Thumb = function( id, deviation ) {

    deviation = Object.extend( {
        'title': 'deviation by user',
        'anchor': '<a href="http://url.com/devation__by_user.gif" target="_blank" title="deviation by user">',
        'aclose': '</a>',
        'thumb': 'fs26/f/2008/160/b/2/deviation_by_username.gif',
        'otitle': 'deviation',
        'flags': false,
        'dimensions': '',
        'server': '1',
    }, ( deviation || {} ) );
    var shadow = false;
    var isgif = deviation.thumb.match( /\.gif$/i );
    
    if( deviation.flags ) {
        // Time to go through the flags.
        if( deviation.flags[1] > 0 )
            return deviation.anchor + '[mature deviation: ' + deviation.otitle + ']' + deviation.aclose;
        
        if( deviation.flags[2] > 0 )
            return deviation.anchor + '[deviation: ' + deviation.otitle + ']' + deviation.aclose;
    
        if( deviation.flags[3] )
            return deviation.anchor + '[deviation: ' + d.otitle + ']' + deviation.aclose;
        
        shadow = (deviation.flags[0] == 0);
    }
    
    
    var path = '';
    
    if( isgif ) {
        var f = deviation.thumb.replace(/:/, '/');
        path = 'http://fc0' + deviation.server + '.deviantart.net/' + f;
        var det = f.split('/');
        if( det.length > 1 ) {
            det = det['.'];
            if( det && det.length > 2 )
                path = 'http://' + deviation.thumb;
        }
        return deviation.anchor + '<img class="thumb" title="' + deviation.title +
            '"' + deviation.dimensions + ' alt=":thumb'+id+':" src="' +
            path +'" />' + deviation.aclose;
    }
    path = 'http://backend.deviantart.com/oembed?url=http://www.deviantart.com/deviation/'+id+'&format=thumb150';
    
    if( deviation.thumb.match(/.png$/i) )
        shadow = false;
    
    return deviation.anchor + '<img class="thumb' + ( shadow ? ' shadow' : '' ) + '"' +
        deviation.dimensions + ' " alt=":thumb'+id+':" src="'+path+
        '" />' + deviation.aclose;
};

/**
 * Emote picker.
 * This should be used for retrieving input from the user.
 */
wsc.dAmn.Emotes.Picker = function( ui, options, settings ) {

    options = options || {};
    options = Object.extend( {
        'title': 'Emotes',
        'event': {
            'select': function( item ) {  },
            'reload': function(  ) {}
        }
    }, options );
    
    Chatterbox.Popup.ItemPicker.call( this, ui, options );
    this.settings = settings;
    this.rbutton = null;
    var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var letter = '';
    var llow = '';
    
    for( var i = 0; i < alpha.length; i++ ) {
        letter = alpha[i];
        llow = letter.toLowerCase();
        this.add_page( {
            'ref': llow,
            'href': '#' + llow,
            'label': letter,
            'title': 'Emotes beginning with ' + letter,
            'items': []
        }, wsc.dAmn.Emotes.Page );
    }
    
    this.add_page( {
        'ref': 'misc',
        'href': '#misc',
        'label': '#',
        'title': 'Emotes not beginning with letters',
        'items': []
    }, wsc.dAmn.Emotes.Page);

};

wsc.dAmn.Emotes.Picker.prototype = new Chatterbox.Popup.ItemPicker();
wsc.dAmn.Emotes.Picker.prototype.constructor = wsc.dAmn.Emotes.Picker;

wsc.dAmn.Emotes.Picker.Disabled = '<section class="pages">\
            <section class="disabled">\
                <p>The emote cloud is currently disabled.</p><p>To use emoticons from\
                the cloud, click the button below to enable them.</p><p>\
                <a href="#enable" class="button text">Enable</a>\
                </p>\
            </section>\
            </section>\
            <section class="buttons"></section>';

wsc.dAmn.Emotes.Picker.prototype.state = function( on ) {

    this.settings.emotes.on = ( on || false );
    this.rebuild();
    this.refresh();

};

wsc.dAmn.Emotes.Picker.prototype.hide = function(  ) {

    this.window.css({'display': 'none'});

};

wsc.dAmn.Emotes.Picker.prototype.show = function(  ) {

    this.window.css({'display': 'block'});
    this.refresh();

};

wsc.dAmn.Emotes.Picker.prototype.close = function(  ) {

    this.hide();

};

wsc.dAmn.Emotes.Picker.prototype.build = function( options ) {

    Chatterbox.Popup.ItemPicker.prototype.build.call( this, options );
    this.rebuild();

};

wsc.dAmn.Emotes.Picker.prototype.rebuild = function( options ) {

    var picker = this;
    this.window.find('.inner .content').html('');
    
    if( this.settings.emotes.on ) {
        this.options.content = Chatterbox.render('ip.main');
    } else {
        this.options.content = wsc.dAmn.Emotes.Picker.Disabled;
    }
    
    this.window.find('.inner .content').html(this.options.content);
    this.pbook = this.window.find('section.pages');
    this.buttons = this.window.find('section.buttons');
    this.rbutton = this.add_button( {
        'href': '#reload',
        'title': 'Reload emoticons',
        'label': 'Reload'
    } );
    
    if( this.settings.emotes.fetching ) {
        this.loading('Loading...');
    }
    
    if( !this.settings.emotes.on ) {
        this.loading('Disabled');
    }
    
    this.rbutton.click( function(  ) {
        if( !picker.settings.emotes.on )
            return false;
        if( picker.settings.emotes.fetching )
            return false;
        if( picker.rbutton.hasClass('evented') )
            return false;
        picker.reload();
        return false;
    } );
    
    if( this.settings.emotes.on ) {
        this.tabs = this.window.find('section.tabs ul');
        /* */
        var ip = this;
        var page = null;
        
        for( var i in this.pages ) {
            if( !this.pages.hasOwnProperty(i) )
                continue;
            page = this.pages[i];
            page.build();
            if( i == 0 )
                this.select_page(page);
        }
        /* */
    } else {
        this.dis = this.pbook.find('.disabled');
        this.dis.css( {
            'max-width': 330
        } );
        
        this.dis.find('p').css( {
            'margin': '5px 10px 5px 10px',
        } );
        
        this.dis.find('p').last().css( {
            'text-align': 'center',
            'margin-top': 25,
            'margin-bottom': 25
        });
        
        this.dis.find('p').first().css( {
            'margin-top': 25
        });
        
        this.window.find('a[href=#enable].button').click( function(  ) {
            picker.state(true);
            picker.settings.emotes.fetch();
            picker.settings.save();
            return false;
        } );
    }

};

wsc.dAmn.Emotes.Picker.prototype.loaded = function(  ) {

    this.rbutton.html( 'Reload' );
    this.rbutton.removeClass('evented');

};

wsc.dAmn.Emotes.Picker.prototype.loading = function( text ) {

    text = text || 'Reloading...';
    this.rbutton.addClass('evented');
    this.rbutton.html(text);

};

wsc.dAmn.Emotes.Picker.prototype.reload = function(  ) {

    this.loading();
    this.options.event.reload();

};

wsc.dAmn.Emotes.Page = function(  ) {
    Chatterbox.Popup.ItemPicker.Page.apply(this, arguments);
};

wsc.dAmn.Emotes.Page.prototype = new Chatterbox.Popup.ItemPicker.Page();
wsc.dAmn.Emotes.Page.prototype.constructor = wsc.dAmn.Emotes.Page;

wsc.dAmn.Emotes.Page.prototype.refresh = function(  ) {

    if( !this.picker.settings.emotes.on )
        return;
    
    Chatterbox.Popup.ItemPicker.Page.prototype.refresh.call(this);
    var page = this;
    
    page.view.find('span.thumb img').error( function(  ) {
        var el = page.view.find(this);
        var em = el.parent().parent();
        var val = page.picker.settings.emotes.repair(em.find('.value').html());
        delete page.picker.settings.emotes.emote[val];
        em.remove();
        return false;
    } );
    
    page.view.find('span.thumb img').load( function(  ) {
        var el = page.view.find(this);
        var w = el.width();
        var h = el.height();
        var th, tw;
        
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
        
        el.css({
            'height': th,
            'width': tw
        });
        
        el.parent().css( {
            'float': 'right',
            'display': 'block'
        } );
    } );

};
