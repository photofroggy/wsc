

/**
 * This extension implements most of the default commands for wsc.
 * @class wsc.defaults.Extension
 * @constructor
 */
wsc.defaults.Extension = function( client ) {

    var ext = {};
    
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
        client.bind('cmd.close', cmd.close );
        
        client.bind('pkt.property', pkt_property );
        client.bind('pkt.recv_admin_show', pkt_admin_show );
        client.bind('pkt.recv_admin_showverbose', pkt_admin_show );
        client.bind('pkt.get', pkt_get );
        
    };
    
    ext.save = function( e, ui ) {
        client.settings.ui.theme = e.theme;
        client.settings.ui.clock = e.clock;
        client.settings.ui.tabclose = e.tabclose;
    };
    
    /**
     * Holds all of the command handling methods.
     * 
     * @property cmd
     * @type Object
     */
    var cmd = {};
        
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
        if( client.channel(e.target).monitor )
            return;
        client.say( e.target, e.args );
    };
    
    // Say something without emotes and shit. Zomg.
    cmd.npmsg = function( e ) {
        client.npmsg( e.target, e.args );
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
    
    // Process a property packet, hopefully retreive whois info.
    var pkt_property = function( event, client ) {
        if(event.p != 'info')
            return;
        
        var subs = event.pkt.sub;
        var data = subs.shift().arg;
        data.username = event.sns.substr(1);
        data.connections = [];
        var conn = null;
        var section = {};
        
        while( subs.length > 0 ) {
            section = subs.shift();
            
            switch( section.cmd ) {
                
                case 'conn':
                    if( conn != null ) {
                        data.connections.push(conn);
                    }
                    
                    conn = section.arg;
                    conn.channels = [];
                    break;
                
                case 'agent':
                    conn.agent = [[ 'agent', section.arg.agent ]];
                    
                    if( section.arg.hasOwnProperty('url') )
                        conn.agent.push( [ 'url', section.arg.url ] );
                    
                    if( section.arg.hasOwnProperty('browser') )
                        conn.agent.push( [ 'browser', section.arg.browser ] );
                    
                    for( var k in section.arg ) {
                        if( k == 'agent' || k == 'url' || k == 'browser' )
                            continue;
                        
                        if( section.arg.hasOwnProperty( k ) ) {
                            conn.agent.push( [ k, section.arg[k] ] );
                        }
                    }
                    break;
                
                case 'ns':
                    conn.channels.unshift( client.deform_ns(section.param) );
                    break;
            
            }
        
        }
        
        data.connections.push(conn);
        
        client.trigger( 'pkt.whois', {
            name: 'pkt.whois',
            pkt: event.pkt,
            info: data
        });
        
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
        
        client.ui.chatbook.current.log_pc(event.p == 'privclass', pcs);
    
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
    wsc.defaults.Extension.Away(client, ext);
    
    /**
     * Implements autojoin channels.
     * 
     * @method Autojoin
     */
    wsc.defaults.Extension.Autojoin(client, ext);
    
    return ext;

};
