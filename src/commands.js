

wsc.defaults.Extension = function( client ) {

    var init = function(  ) {
        // Commands.
        client.bind('cmd.set', cmd_setter );
        client.bind('cmd.connect', cmd_connect );
        client.bind('cmd.join', cmd_join );
        client.bind('cmd.part', cmd_part );
        client.bind('cmd.title', cmd_title );
        client.bind('cmd.promote', cmd_promote );
        client.bind('cmd.demote', cmd_demote );
        client.bind('cmd.me', cmd_action );
        client.bind('cmd.kick', cmd_kick );
        client.bind('cmd.raw', cmd_raw );
        client.bind('cmd.say', cmd_say );
        client.bind('cmd.npmsg', cmd_npmsg );
        client.bind('cmd.clear', cmd_clear );
        client.bind('cmd.clearall', cmd_clearall );
        client.bind('cmd.whois', cmd_whois );
        client.bind('cmd.admin', cmd_admin );
        client.bind('pkt.property', pkt_property );
        client.bind('pkt.get', pkt_get );
        // lol themes
        client.bind('cmd.theme', cmd_theme);
        // some ui business.
        
        client.ui.on('settings.open', settings_page);
        client.ui.on('settings.open.ran', about_page);
    };
    
    var settings_page = function( e, ui ) {
    
        page = e.settings.page('Main');
        var orig = {};
        orig.theme = replaceAll(client.ui.settings.theme, 'wsct_', '');
        orig.clock = client.ui.clock();
        orig.tc = client.ui.nav.closer();
        orig.username = client.settings.username;
        orig.pk = client.settings.pk;
        
        var themes = [];
        for( i in client.ui.settings.themes ) {
            name = replaceAll(client.ui.settings.themes[i], 'wsct_', '');
            themes.push({ 'value': name, 'title': name, 'selected': orig.theme == name })
        }
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Main',
            'text': 'Use this window to view and change your settings.\n\nCheck\
                    the different pages to see what settings can be changed.',
        });
        
        page.item('Form', {
            'ref': 'login',
            'title': 'Login',
            'text': 'Here you can change the username and token used to\
                    log into the chat server.',
            'fields': [
                ['Textfield', {
                    'ref': 'username',
                    'label': 'Username',
                    'default': orig.username
                }],
                ['Textfield', {
                    'ref': 'token',
                    'label': 'Token',
                    'default': orig.pk
                }]
            ],
            'event': {
                'save': function( event ) {
                    client.settings.username = event.data.username;
                    client.settings.pk = event.data.token;
                }
            }
        });
        
        page.item('Form', {
            'ref': 'ui',
            'title': 'UI',
            'hint': '<b>Timestamp</b><br/>Choose between a 24 hour clock and\
                    a 12 hour clock.\n\n<b>Theme</b><br/>Change the look of the\
                    client.\n\n<b>Close Buttons</b><br/>Turn tab close buttons on/off.',
            'fields': [
                ['Dropdown', {
                    'ref': 'theme',
                    'label': 'Theme',
                    'items': themes
                }],
                ['Dropdown', {
                    'ref': 'clock',
                    'label': 'Timestamp Format',
                    'items': [
                        { 'value': '24', 'title': '24 hour', 'selected': orig.clock },
                        { 'value': '12', 'title': '12 hour', 'selected': !orig.clock }
                    ]
                }],
                ['Check', {
                    'ref': 'tabclose',
                    'label': 'Close Buttons',
                    'items': [
                        { 'value': 'yes', 'title': 'On', 'selected': orig.tc }
                    ]
                }],
            ],
            'event': {
                'change': function( event ) {
                    client.ui.clock(event.data.clock == '24');
                    client.ui.theme(event.data.theme);
                    client.ui.nav.closer(event.data.tabclose.indexOf('yes') > -1);
                },
                'save': function( event ) {
                    orig.clock = event.data.clock == '24';
                    orig.theme = event.data.theme;
                    orig.tc = event.data.tabclose.indexOf('yes') > -1;
                },
                'close': function( event ) {
                    client.ui.clock(orig.clock);
                    client.ui.theme(orig.theme);
                    client.ui.nav.closer(orig.tc);
                }
            }
        });
        
        /* * /
        page.item('Radio', {
            'ref': 'rfoo',
            'title': 'Close Buttons',
            'items': [
                { 'value': 'yes', 'title': 'On', 'selected': orig.tc },
                { 'value': 'no', 'title': 'Off', 'selected': !orig.tc }
            ],
            'event': {
                'change': function( event ) {
                    console.log(client.ui.view.find(this).val(),event);
                },
                'save': function( event ) {
                    console.log(event);
                }
            }
        });
        /* * /
        page.item('Check', {
            'ref': 'foo',
            'title': 'Close Buttons',
            'text': 'Testing out whether this works properly dawg.',
            'items': [
                { 'value': 'yes', 'title': 'On', 'selected': orig.tc }
            ],
            'event': {
                'change': function( event ) {
                    console.log(client.ui.view.find(this).prop('checked'),event);
                },
                'save': function( event ) {
                    console.log(event);
                }
            }
        });
        /* * /
        page.item('Textfield', {
            'ref': 'username',
            'title': 'Username',
            'text': 'The username you want to log in with.',
            'default': orig.username,
            'event': {
                'blur': function( event ) {
                    console.log(client.ui.view.find(this).val(),event);
                },
                'save': function( event ) {
                    console.log(event);
                }
            }
        });
        /* * /
        page.item('Textarea', {
            'ref': 'rabble',
            'title': 'Rabble',
            'text': 'Tell us a bit about yourself, or something gay.',
            'default': orig.username,
            'event': {
                'blur': function( event ) {
                    console.log(client.ui.view.find(this).val(),event);
                },
                'save': function( event ) {
                    console.log(event);
                }
            }
        });
        /* */
        
        page.item('Text', {
            'ref': 'debug',
            'wclass': 'faint',
            'title': 'Debug Information',
            'text': 'Chat Agent: <code>' + client.settings.agent + '</code>\n\nUser\
                    Agent: <code>' + navigator.userAgent + '</code>'
        });
    
    };
        
    var about_page = function( e, ui ) {
    
        var page = e.settings.page('About', true);
        page.item('Text', {
            'ref': 'about-wsc',
            'title': 'Wsc',
            'text': 'Currently using <a href="http://github.com/photofroggy/wsc/">wsc</a>\
                    version ' + wsc.VERSION + ' ' + wsc.STATE + '.\n\nWsc\
                    works using HTML5, javascript, and CSS3. WebSocket is used for the connection\
                    where possible. The source code for this client is pretty huge.\n\nWsc was created\
                    by ~<a href="http://photofroggy.deviantart.com/">photofroggy</a>'
        });
    
    };
    
    var cmd_theme = function( e, client) {
        client.ui.theme(e.args.split(' ').shift());
    };
        
    /**
     * @function setter
     * @cmd set set configuration options
     * This command allows the user to change the settings for the client through
     * the input box.
     */
    var cmd_setter = function( e ) {
        var data = e.args.split(' ');
        var setting = data.shift().toLowerCase();
        var data = data.join(' ');
        if( data.length == 0 ) {
            client.cchannel.serverMessage('Could not set ' + setting, 'No data supplied');
            return;
        }
        
        if( !( setting in client.settings ) ) {
            client.cchannel.serverMessage('Unknown setting "' + setting + '"');
            return;
        }
        
        client.settings[setting] = data;
        client.cchannel.serverMessage('Changed ' + setting + ' setting', 'value: ' + data);
        client.control.setLabel();
        
    };
        
    /**
     * @function connect
     * This command allows the user to force the client to connect to the server.
     */
    var cmd_connect = function( e ) {
        client.connect();
    };
        
    // Join a channel
    var cmd_join = function( e ) {
        var chans = e.args.split(' ');
        var chans = chans.toString() == '' ? [] : chans;
        
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' )
            return;
        
        for( index in chans )
            client.join(chans[index]);
    };
        
    // Leave a channel
    var cmd_part = function( e ) {
        var chans = e.args.split(' ');
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' ) {
            client.part(e.ns);
            return;
        }
        
        for( index in chans )
            client.part(chans[index]);
    };
        
    // Set the title
    var cmd_title = function( e ) {
        client.set(e.target, 'title', e.args);
    };
    
    // Promote user
    var cmd_promote = function( e ) {
        var bits = e.args.split(' ');
        client.promote(e.target, bits[0], bits[1]);
    };
    
    // Demote user
    var cmd_demote = function( e ) {
        var bits = e.args.split(' ');
        client.demote(e.target, bits[0], bits[1]);
    };
        
    // Send a /me action thingy.
    var cmd_action = function( e ) {
        client.action(e.target, e.args);
    };
        
    // Send a raw packet.
    var cmd_raw = function( e ) {
        client.send( e.args.replace(/\\n/gm, "\n") );
    };
        
    // Kick someone.
    var cmd_kick = function( e ) {
        d = e.args.split(' ');
        u = d.shift();
        r = d.length > 0 ? d.join(' ') : null;
        client.kick( e.target, u, r );
    };
        
    // Say something.
    var cmd_say = function( e ) {
        client.say( e.target, e.args );
    };
    
    // Say something without emotes and shit. Zomg.
    var cmd_npmsg = function( e ) {
        client.npmsg( e.target, e.args );
    };
    
    // Clear the channel's log.
    var cmd_clear = function( e, client ) {
        client.cchannel.clear();
    };
    
    // Clear all channel logs.
    var cmd_clearall = function( e, client ) {
        for( c in client.channelo ) {
            client.channelo[c].clear();
        }
    };
    
    // Send a whois thingy.
    var cmd_whois = function( event, client ) {
        client.whois( event.args.split(' ')[0] );
    };
    
    // Send an admin packet.
    var cmd_admin = function( event, client ) {
        client.admin( event.target, event.args );
    };
    
    // Process a property packet, hopefully retreive whois info.
    var pkt_property = function( event, client ) {
        if(event.p != 'info')
            return;
        
        subs = event.pkt.sub;
        data = subs.shift().arg;
        data.username = event.sns.substr(1);
        data.connections = [];
        
        while( subs.length > 0 ) {
            conn = subs.shift().arg;
            conn.channels = [];
            while( subs.length > 0 ) {
                if( subs[0].cmd != 'ns' )
                    break;
                conn.channels.unshift( client.deform_ns(subs.shift().param) );
            }
            data.connections.push(conn);
        }
        
        client.cchannel.show_whois(data);
    };
    
    var pkt_get = function( event, client ) {
    
        if( event.ns.indexOf('login:') != 0 )
            return;
        
        client.cchannel.server_message( 'Whois failed for ' + (event.sns.substr(1)), 'not online');
    
    };
    
    init();

};
