/**
 * Ignore extension.
 * 
 * Implements the ignore functionality.
 */
wsc.defaults.Extension.Ignore = function( client ) {

    var settings = {};
    var storage = client.storage.folder('ignore');
    var istore = storage.folder('ignored');
    
    var init = function(  ) {
    
        load();
        save(); // Just in case we don't have the stuff stored in the first place.
        
        // Commands
        client.bind('cmd.ignore', cmd_ignore);
        client.bind('cmd.unignore', cmd_unignore);
        
        // Settings window
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Ignores');
        var orig = {};
        orig.im = settings.ignore;
        orig.uim = settings.unignore;
        orig.usr = client.ui.umuted;
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Ignores',
            'text': 'Use <code>ignore</code> to ignore people.\n\n\
                    You can "ignore" other users of the chat server using the\n\
                    <code>/ignore</code> command. Ignoring a user hides their\
                    messages from you in the channel log.',
        });
        
        page.item('Form', {
            'ref': 'msgs',
            'title': 'Messages',
            'text': 'Here you can set the messages displayed when you ignore or\
                    unignore a user.\n\nThe text <code>{user}</code> is replaced\
                    with the name of the user your are ignoring or unignoring.',
            'fields': [
                ['Textfield', {
                    'ref': 'ignore',
                    'label': 'Ignore',
                    'default': orig.im
                }],
                ['Textfield', {
                    'ref': 'unignore',
                    'label': 'Unignore',
                    'default': orig.uim
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.ignore = event.data.ignore;
                    settings.unignore = event.data.unignore;
                    save();
                }
            }
        });
        
        var imgr = page.item('Items', {
            'ref': 'ignoreds',
            'title': 'Users',
            'text': 'This is the list of users that you have silenced.\n\nUse the\
                    commands <code>/ignore</code> and <code>/unignore</code>\
                    to edit the list.',
            'items': orig.usr,
            'prompt': {
                'title': 'Add User',
                'label': 'User:',
            },
            'event': {
                'up': function( event ) {
                    var swap = event.args.swap;
                    client.ui.umuted[swap['this'].index] = swap.that.item;
                    client.ui.umuted[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.ui.umuted;
                },
                'down': function( event ) {
                    var swap = event.args.swap;
                    client.ui.umuted[swap['this'].index] = swap.that.item;
                    client.ui.umuted[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.ui.umuted;
                },
                'add': function( event ) {
                    client.mute_user( event.args.item );
                    imgr.options.items = client.ui.umuted;
                },
                'remove': function( event ) {
                    client.unmute_user( event.args.item );
                    imgr.options.items = client.ui.umuted;
                },
                'save': function( event ) {
                    orig.usr = client.ui.umuted;
                    save();
                },
                'close': function( event ) {
                    load();
                }
            }
        });
    
    };
    
    var cmd_ignore = function( cmd ) {
    
        var users = cmd.args.split(' ');
        var user = '';
        var msg = '';
        var mod = false;
        
        for( var i in users ) {
            if( !users.hasOwnProperty( i ) )
                continue;
            
            user = users[i];
            tmod = client.mute_user( user );
            if( !tmod )
                continue;
            
            mod = tmod;
            msg = replaceAll( settings.ignore, '{user}', user );
            if( msg.indexOf('/me ') == 0 ) {
                msg = msg.substr(4);
                client.action( cmd.target, msg );
            } else {
                client.say( cmd.target, msg );
            }
        }
        
        if( mod )
            save();
    
    };
    
    var cmd_unignore = function( cmd ) {
    
        var users = cmd.args.split(' ');
        var user = '';
        var msg = '';
        var mi = -1;
        var mod = false;
        var tmod = false;
        
        for( var i in users ) {
            if( !users.hasOwnProperty( i ) )
                continue;
            
            user = users[i];
            tmod = client.unmute_user( user );
            if( !tmod )
                continue;
            
            mod = tmod;
            msg = replaceAll( settings.unignore, '{user}', user );
            if( msg.indexOf('/me ') == 0 ) {
                msg = msg.substr(4);
                client.action( cmd.target, msg );
            } else {
                client.say( cmd.target, msg );
            }
        }
        
        if( mod )
            save();
    
    };
    
    var load = function(  ) {
        
        settings.ignore = storage.get('ignore', '/me is ignoring {user} now');
        settings.unignore = storage.get('unignore', '/me is not ignoring {user} anymore');
        settings.count = parseInt( storage.get( 'count', 0 ) );
        
        var tu = null;
        for( var i in client.ui.umuted ) {
            if( !client.ui.umuted.hasOwnProperty(i) ) {
                continue;
            }
            client.unmute_user( client.ui.umuted[i] );
        }
        
        client.ui.umuted = [];
        
        if( settings.count > 0 ) {
            tu = null;
            for( var i = 0; i < settings.count; i++ ) {
                client.mute_user( istore.get(i, null) );
                //client.ui.mute_user( tu );
            }
        }
        
    };
    
    var save = function(  ) {
    
        storage.set('ignore', settings.ignore);
        storage.set('unignore', settings.unignore);
        
        for( var i = 0; i < settings.count; i++ ) {
            istore.remove(i)
        }
        
        if( client.ui.umuted.length == 0 ) {
            storage.set('count', 0);
        } else {
            var c = -1;
            for( var i in client.ui.umuted ) {
            
                if( !client.ui.umuted.hasOwnProperty(i) )
                    continue;
                
                c++;
                istore.set( c.toString(), client.ui.umuted[i] );
            
            }
            
            c++;
            settings.count = c;
            storage.set('count', c);
        }
    
    };
    
    init();

};

