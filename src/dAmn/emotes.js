
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
            'text': 'Here you can turn custom emotes on and off.\n\n<span class="emotestatus">'+stat+'</span>',
            'fields': [
                ['Checkbox', {
                    'ref': 'enabled',
                    'items': [ { 'value': 'yes', 'title': 'On', 'selected': orig.on } ]
                }]
            ],
            'event': {
                'change': function( event ) {
                    settings.emotes.on = (event.data.enabled.indexOf('yes') != -1);
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
                    settings.save();
                },
                'close': function( event ) {
                    settings.emotes.on = orig.on;
                    settings.load();
                    settings.emotes.page = null;
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
                    settings.emotes.notice = new Chatterbox.Popup( client.ui, {
                        'title': 'Emotes',
                        'content': 'Custom emoticons loaded!'
                    } );
                    settings.emotes.notice.build();
                    settings.emotes.notice.window.css({
                        'bottom': 60,
                        'right': 50
                    });
                    setTimeout( function(  ) {
                        if( settings.emotes.notice == null )
                            return;
                        settings.emotes.notice.window.fadeOut(
                            'slow',
                            function(  ) {
                                settings.emotes.notice.window.remove();
                                settings.emotes.notice = null;
                            }
                        );
                    }, 5000 );
                }
            }
            
            settings.emotes.sort();
            settings.emotes.loaded = true;
            settings.emotes.picker.loaded();
            
            if( settings.emotes.page !== null ) {
                settings.emotes.page.view.find('.emotestatus')
                    .html('<em>Emotes loaded.</em>');
            }
            
            settings.emotes.fint = setTimeout( settings.emotes.fetch, 3600000 );
        });
        
        if( settings.emotes.page !== null ) {
            settings.emotes.page.view.find('.emotestatus')
                .html('<em>Fetching emotes...</em>');
        }
    };
    
    settings.emotes.swap = function( e ) {
    
        if( !settings.emotes.on )
            return;
        
        var fec = -1;
        for( var code in settings.emotes.emote ) {
            if( !settings.emotes.emote.hasOwnProperty(code) )
                continue;
            fec = e.input.indexOf(code);
            if( fec == -1 )
                continue;
            e.input = replaceAll(
                e.input, code,
                ':thumb' + settings.emotes.emote[code]['devid'] + ':'
            );
        }
        
        e.input = replaceAll( e.input, ':B', ':bucktooth:' );
    
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
        
        // First part we create our maps for our page items.
        for( var i in settings.emotes.emote ) {
            if( !settings.emotes.emote.hasOwnProperty(i) )
                continue;
            
            emote = settings.emotes.emote[i];
            mitem = {
                'value': emote.code,
                'title': 'created by ' + emote.by
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
    
    };
    
    settings.emotes.select = function( item ) {
        client.ui.control.set_text( client.ui.control.get_text( ) + item );
    };
    
    client.bind('send.msg.before', settings.emotes.swap);
    client.bind('send.action.before', settings.emotes.swap);
    client.bind('send.kick.before', settings.emotes.swap);
    client.bind('send.set.before', settings.emotes.swap);
    
    if( !settings.emotes.on )
        return;
    
    settings.emotes.fetch();

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
        this.add_page({
            'ref': llow,
            'href': '#' + llow,
            'label': letter,
            'title': 'Emotes beginning with ' + letter,
            'items': []
        });
    }
    
    this.add_page({
        'ref': 'misc',
        'href': '#misc',
        'label': '#',
        'title': 'Emotes not beginning with letters',
        'items': []
    });

};

wsc.dAmn.Emotes.Picker.prototype = new Chatterbox.Popup.ItemPicker();
wsc.dAmn.Emotes.Picker.prototype.constructor = wsc.dAmn.Emotes.Picker;

wsc.dAmn.Emotes.Picker.prototype.hide = function(  ) {

    this.window.css({'display': 'none'});

};

wsc.dAmn.Emotes.Picker.prototype.show = function(  ) {

    this.window.css({'display': 'block'});

};

wsc.dAmn.Emotes.Picker.prototype.close = function(  ) {

    this.hide();

};

wsc.dAmn.Emotes.Picker.prototype.build = function( options ) {

    var picker = this;
    Chatterbox.Popup.ItemPicker.prototype.build.call( this, options );
    var bl = 'Reload';
    
    this.rbutton = this.add_button( {
        'href': '#reload',
        'title': 'Reload emoticons',
        'label': 'Reload',
    } );
    
    if( this.settings.emotes.fetching ) {
        this.loading('Loading...');
    }
    
    this.rbutton.click( function(  ) {
        if( picker.settings.emotes.fetching )
            return false;
        if( picker.rbutton.hasClass('evented') )
            return false;
        picker.reload();
        return false;
    } );

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
