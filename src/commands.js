

wsc.defaults.Extension = function( client ) {

    var ext = {};
    ext.away = {};
    ext.away.on = false;
    ext.away.reason = '';
    ext.away.last = {};
    ext.away.ignore = [ '#devart' ];
    
    var init = function(  ) {
        // Commands.
        client.bind('cmd.set', cmd_setter );
        client.bind('cmd.connect', cmd_connection );
        
        // standard dAmn commands.
        client.bind('cmd.join', cmd_join );
        client.bind('cmd.part', cmd_part );
        // send ...
        client.bind('cmd.say', cmd_say );
        client.bind('cmd.npmsg', cmd_npmsg );
        client.bind('cmd.me', cmd_action );
        client.bind('cmd.promote', cmd_chgpriv );
        client.bind('cmd.demote', cmd_chgpriv );
        client.bind('cmd.ban', cmd_ban );
        client.bind('cmd.unban', cmd_ban );
        client.bind('cmd.kick', cmd_killk );
        //client.bind('cmd.get', cmd_get );
        client.bind('cmd.whois', cmd_whois );
        client.bind('cmd.title', cmd_title );
        client.bind('cmd.topic', cmd_title );
        client.bind('cmd.admin', cmd_admin );
        client.bind('cmd.disconnect', cmd_connection );
        client.bind('cmd.kill', cmd_killk );
        client.bind('cmd.raw', cmd_raw );
        
        client.bind('cmd.clear', cmd_clear );
        client.bind('cmd.clearall', cmd_clearall );
        
        client.bind('pkt.property', pkt_property );
        client.bind('pkt.recv_admin_show', pkt_admin_show );
        client.bind('pkt.recv_admin_showverbose', pkt_admin_show );
        client.bind('pkt.get', pkt_get );
        
        
        // Non-standard commands.
        client.bind('cmd.gettitle', cmd_gett);
        client.bind('cmd.gettopic', cmd_gett);
        client.bind('cmd.setaway', cmd_setaway);
        client.bind('cmd.setback', cmd_setback);
        client.bind('pkt.recv_msg.highlighted', pkt_highlighted);
        
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
    var cmd_connection = function( e ) {
        client[e.cmd]();
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
        client.set(e.target, e.cmd, e.args);
    };
    
    // Promote or demote user
    var cmd_chgpriv = function( e ) {
        var bits = e.args.split(' ');
        client[e.cmd.toLowerCase()](e.target, bits[0], bits[1]);
    };
    
    // Ban user
    var cmd_ban = function( e, client ) {
        var args = e.args.split(' ');
        var user = args.shift();
        var cmd = e.cmd;
        if( cmd == 'ban' && args.length > 0 ) {
            client.kick( e.target, user, args.join(' ') );
        }
        client[cmd](e.target, user);
    };
    
    // Send a /me action thingy.
    var cmd_action = function( e ) {
        client.action(e.target, e.args);
    };
    
    // Send a raw packet.
    var cmd_raw = function( e ) {
        client.send( e.args.replace(/\\n/gm, "\n") );
    };
    
    // Kick or kill someone.
    var cmd_killk = function( e, client ) {
        var d = e.args.split(' ');
        var u = d.shift();
        var r = d.length > 0 ? d.join(' ') : null;
        if( e.cmd == 'kick' )
            client.kick( e.target, u, r );
        else
            client.kill( u, r );
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
    
    // Send an disconnect packet.
    var cmd_disconnect = function( event, client ) {
        client.disconnect(  );
    };
    
    // Get the title or topic.
    var cmd_gett = function( event, client ) {
        var which = event.cmd.indexOf('title') > -1 ? 'title' : 'topic';
        client.control.ui.set_text('/' + which + ' ' + client.channel(event.target).info[which].content);
    };
    
    // Away message stuff.
    var cmd_setaway = function( event, client ) {
    
        ext.away.on = true;
        ext.away.reason = event.args;
        var announce = 'is away' + ( ext.away.reason.length > 0 ? ': ' + ext.away.reason : '');
        var chans = client.channels(true);
        
        for( var i in chans ) {
            if( !chans.hasOwnProperty(i) )
                continue;
            if( ext.away.ignore.indexOf( ns.toLowerCase() ) > -1 )
                continue;
            client.action(chans[i], announce);
        }
    
    };
    
    var cmd_setback = function( event, client ) {
        ext.away.on = false;
        var chans = client.channels(true);
        
        for( var i in chans ) {
            if( !chans.hasOwnProperty(i) )
                continue;
            if( ext.away.ignore.indexOf( ns.toLowerCase() ) > -1 )
                continue;
            client.action(chans[i], 'is back');
        }
    };
    
    var pkt_highlighted = function( event, client ) {
    
        if( !ext.away.on )
            return;
        
        if( ext.away.reason.length == 0 )
            return;
        
        if( event.user == client.settings.username )
            return;
        
        if( ext.away.ignore.indexOf( event.sns.toLowerCase() ) != -1 )
            return;
        
        var t = new Date();
        var ns = event.sns.toLowerCase();
        
        if( ns in ext.away.last )
            if( (t - ext.away.last[ns]) <= 60000 )
                return;
        
        client.say(event.ns, event.user + ': I am currently away; reason: ' + ext.away.reason);
        ext.away.last[ns] = t;
    
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
        
        client.cchannel.log_whois(data);
    };
    
    var pkt_get = function( event, client ) {
    
        if( event.ns.indexOf('login:') != 0 )
            return;
        
        client.cchannel.server_message( 'Whois failed for ' + (event.sns.substr(1)), 'not online');
    
    };
    
    var pkt_admin_show = function( event, client ) {
    
        var chan = client.channel(event.ns);
        var lines = event.info.split('\n');
        var info = '';
        var pcs = [];
        var pc = '';
        
        for( var i in lines ) {
            if( !lines.hasOwnProperty(i) )
                continue;
            
            info = lines[i].split(' ');
            
            if( event.p == 'privclass' ) {
                pcs.push([ info.shift(), info.shift().split('=')[1], info.join(' ') ]);
            } else if( event.p == 'users' ) {
                pc = info.shift().split(':', 1)[0];
                pcs.push([ pc, chan.get_privclass_order( pc ), info.join(' ') ]);
            }
        }
        
        chan.log_pc(event.p == 'privclass', pcs);
    
    };
    
    init();

};
