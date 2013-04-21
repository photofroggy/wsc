

/**
 * This extension implements most of the default commands for wsc.
 * @class wsc.defaults.Extension
 * @constructor
 */
wsc.defaults.Extension = function( client ) {

    var ext = {};
    ext.away = {
        'on': false,
        'reason': '',
        'last': {},
        'since': 0,
        'store': client.storage.folder('away'),
        'format': {
            'setaway': '/me is away: {reason}',
            'setback': '/me is back',
            'away': '{from}: I am away, reason: {reason}'
        }
    };
    
    var init = function(  ) {
        // Commands.
        client.bind('cmd.connect', cmd.connection );
        client.bind('cmd.set', cmd.setter );
        
        // standard dAmn commands.
        client.bind('cmd.join', cmd.join );
        client.bind('cmd.chat', cmd.pjoin );
        client.bind('cmd.part', cmd.part );
        // send ...
        client.bind('cmd.say', cmd.say );
        client.bind('cmd.npmsg', cmd.npmsg );
        client.bind('cmd.me', cmd.action );
        client.bind('cmd.promote', cmd.chgpriv );
        client.bind('cmd.demote', cmd.chgpriv );
        client.bind('cmd.ban', cmd.ban );
        client.bind('cmd.unban', cmd.ban );
        client.bind('cmd.kick', cmd.killk );
        //client.bind('cmd.get', cmd.get );
        client.bind('cmd.whois', cmd.whois );
        client.bind('cmd.title', cmd.title );
        client.bind('cmd.topic', cmd.title );
        client.bind('cmd.admin', cmd.admin );
        client.bind('cmd.disconnect', cmd.connection );
        client.bind('cmd.kill', cmd.killk );
        client.bind('cmd.raw', cmd.raw );
        
        client.bind('cmd.clear', cmd.clear );
        client.bind('cmd.clearall', cmd.clearall );
        client.bind('cmd.close', cmd.close );
        
        client.bind('pkt.property', pkt_property );
        client.bind('pkt.recv_admin_show', pkt_admin_show );
        client.bind('pkt.recv_admin_showverbose', pkt_admin_show );
        client.bind('pkt.get', pkt_get );
        
        
        // Non-standard commands.
        client.bind('cmd.gettitle', cmd.gett);
        client.bind('cmd.gettopic', cmd.gett);
        
        // lol themes
        client.bind('cmd.theme', cmd.theme);
        // some ui business.
        client.ui.on('settings.open', settings_page);
        client.ui.on('settings.open.ran', about_page);
        client.ui.on('settings.save.ui', settings_save);
        client.ui.on('settings.save', function(  ) { client.config_save(); } );
    };
    
    var settings_save = function( e, ui ) {
        client.settings.ui.theme = e.theme;
        client.settings.ui.clock = e.clock;
        client.settings.ui.tabclose = e.tabclose;
    };
    
    var settings_page = function( e, ui ) {
    
        var page = e.settings.page('Main');
        var orig = {};
        orig.username = client.settings.username;
        orig.pk = client.settings.pk;
        orig.devel = client.settings.developer;
        
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
        }, true);
        
        page.item('Form', {
            'ref': 'developer',
            'title': 'Developer Mode',
            'text': 'Turn developer mode on or off.\n\nDeveloper mode will expose any hidden\
                channel tabs, amongst other things. Keep this turned off unless you\'re working\
                on implementing something.',
            'fields': [
                ['Checkbox', {
                    'ref': 'enabled',
                    'items': [
                        { 'value': 'on', 'title': 'On', 'selected': orig.devel }
                    ]
                }]
            ],
            'event': {
                'change': function( event ) {
                    client.settings.developer = (event.data.enabled.indexOf('on') != -1);
                    client.ui.developer(client.settings.developer);
                },
                'save': function( event ) {
                    orig.devel = client.settings.developer;
                },
                'close': function( event ) {
                    client.settings.developer = orig.devel;
                    client.ui.developer(client.settings.developer);
                }
            }
        });
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Main',
            'text': 'Use this window to view and change your settings.\n\nCheck\
                    the different pages to see what settings can be changed.',
        }, true);
        
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
    
    /**
     * Holds all of the command handling methods.
     * 
     * @property cmd
     * @type Object
     */
    var cmd = {};
    
    cmd.theme = function( e, client) {
        client.ui.theme(e.args.split(' ').shift());
    };
        
    /**
     * This command allows the user to change the settings for the client through
     * the input box.
     * 
     * @method cmd.setter
     * @param cmd {Object} Command event data.
     */
    cmd.setter = function( e ) {
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
        
    };
    
    /**
     * This command allows the user to force the client to connect to the server.
     * @method cmd.connection
     */
    cmd.connection = function( e ) {
        client[e.cmd]();
    };
    
    // Join a channel
    cmd.join = function( e ) {
        var chans = e.args.split(' ');
        var chans = chans.toString() == '' ? [] : chans;
        
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' )
            return;
        
        for( index in chans )
            client.join(chans[index]);
    };
    
    // Join a channel
    cmd.pjoin = function( e ) {
        var chans = e.args.split(' ');
        var chans = chans.toString() == '' ? [] : chans;
        
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' )
            return;
        
        for( index in chans )
            client.join('@' + chans[index]);
    };
    
    // Leave a channel
    cmd.part = function( e ) {
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
    cmd.title = function( e ) {
        client.set(e.target, e.cmd, e.args);
    };
    
    // Promote or demote user
    cmd.chgpriv = function( e ) {
        var bits = e.args.split(' ');
        client[e.cmd.toLowerCase()](e.target, bits[0], bits[1]);
    };
    
    // Ban user
    cmd.ban = function( e, client ) {
        var args = e.args.split(' ');
        var user = args.shift();
        var cmd = e.cmd;
        if( cmd == 'ban' && args.length > 0 ) {
            client.kick( e.target, user, args.join(' ') );
        }
        client[cmd](e.target, user);
    };
    
    // Send a /me action thingy.
    cmd.action = function( e ) {
        client.action(e.target, e.args);
    };
    
    // Send a raw packet.
    cmd.raw = function( e ) {
        client.send( e.args.replace(/\\n/gm, "\n") );
    };
    
    // Kick or kill someone.
    cmd.killk = function( e, client ) {
        var d = e.args.split(' ');
        var u = d.shift();
        var r = d.length > 0 ? d.join(' ') : null;
        if( e.cmd == 'kick' )
            client.kick( e.target, u, r );
        else
            client.kill( u, r );
    };
    
    // Say something.
    cmd.say = function( e ) {
        if( client.channel(e.target).monitor ) return;
        client.say( e.target, e.args );
    };
    
    // Say something without emotes and shit. Zomg.
    cmd.npmsg = function( e ) {
        client.npmsg( e.target, e.args );
    };
    
    // Clear the channel's log.
    cmd.clear = function( e, client ) {
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            for( var i in users ) {
                if( !users.hasOwnProperty(i) )
                    continue;
                client.ui.channel( e.target ).clear_user( users[i] );
            }
        } else {
            client.ui.channel( e.target ).clear();
        }
    };
    
    // Clear all channel logs.
    cmd.clearall = function( e, client ) {
        var method = null;
        
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            method = function( ns, channel ) {
                for( var i in users ) {
                    if( !users.hasOwnProperty(i) )
                        continue;
                    channel.clear_user( users[i] );
                }
            };
        } else {
            method = function( ns, channel ) {
                channel.clear();
            };
        }
        
        client.ui.chatbook.each( method, true );
    };
    
    cmd.close = function( cmd ) {
        client.part(cmd.target);
        client.remove_ns(cmd.target);
    };
    
    // Send a whois thingy.
    cmd.whois = function( event, client ) {
        client.whois( event.args.split(' ')[0] );
    };
    
    // Send an admin packet.
    cmd.admin = function( event, client ) {
        client.admin( event.target, event.args );
    };
    
    // Send an disconnect packet.
    cmd.disconnect = function( event, client ) {
        client.disconnect(  );
    };
    
    // Get the title or topic.
    cmd.gett = function( event, client ) {
        var which = event.cmd.indexOf('title') > -1 ? 'title' : 'topic';
        client.ui.control.set_text('/' + which + ' ' + client.channel(event.target).info[which].content);
    };
    
    // Process a property packet, hopefully retreive whois info.
    var pkt_property = function( event, client ) {
        if(event.p != 'info')
            return;
        
        var subs = event.pkt.sub;
        var data = subs.shift().arg;
        data.username = event.sns.substr(1);
        data.connections = [];
        var conn = {};
        
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
        
        var usr = event.sns.substr(1);
        
        client.ui.pager.notice({
            'ref': 'whois-' + usr,
            'heading': 'Whois Failed',
            'content': 'Whois failed for ' + usr + '.\nNo such user online.'
        }, false, 5000 );
    
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
    
    /**
     * Implements the ignore feature.
     * 
     * @method Ignore
     */
    wsc.defaults.Extension.Ignore(client);
    
    /**
     * Implements away messages.
     * 
     * @method Away
     */
    wsc.defaults.Extension.Away(client);
    
    /**
     * Implements autojoin channels.
     * 
     * @method Autojoin
     */
    wsc.defaults.Extension.Autojoin(client);

};
