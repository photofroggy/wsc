/* wsc client - photofroggy
 * wsc's chat client. Manages everything pretty much.
 */

function wsc_client( view, options, mozilla ) {
    
    var client = {
    
        view: null,
        mozilla: false,
        control: null,
        tabul: null,
        chatbook: null,
        connected: false,
        conn: null,
        evt_chains: [["recv", "admin"]],
        events: null,
        settings: {
            "domain": "website.com",
            "server": "ws://website.com/wsendpoint",
            "agent": "wsc 0.1a",
            "symbol": "",
            "username": "",
            "userinfo": {},
            "pk": "",
            // Monitor: `ns`
            "monitor": ['~Monitor', true],
            "welcome": "Welcome to the wsc web client!",
            "autojoin": "chat:channel",
            "protocol": wsc_protocol,
            "extend": [wsc_extdefault],
            "control": wsc_control,
            "stype": 'llama',
            "client": 'chatclient',
            "tablumps": wsc_tablumps,
            "avatarfile": '$un[0]/$un[1]/{un}.png',
            "defaultavatar": 'default.gif',
            "avatarfolder": '/avatars/',
            "emotefolder": '/emoticons/',
            "thumbfolder": '/thumbs/',
        },
        // Protocol object.
        protocol: null,
        // Object containing all channel objects.
        channelo: {},
        // Current channel object.
        cchannel: null,
        // Known command names.
        cmds: [],
    
        // Initialise mo'fo'.
        init: function( view, options, mozilla ) {
            
            view.append('<div class="wsc"></div>');
            // Set up variables.
            this.view = view.find('.wsc');
            this.mozilla = mozilla;
            this.connected = false;
            this.conn = null;
            this.events = new EventEmitter();
            this.view.extend( this.settings, options );
            this.mns = this.format_ns(this.settings['monitor'][0]);
            this.lun = this.settings["username"].toLowerCase();
            this.channelo = {};
            this.protocol = this.settings["protocol"]( this );
            //this.addListener('closed'
            
            // Debug!
            //console.log(this);
            
            // Load in extensions
            this.cmds = [];
            for(var index in this.settings["extend"]) {
                this.settings["extend"][index](this);
            }
            
            // Prepare the UI.
            this.buildUI();
            
            // Welcome!
            this.monitor(this.settings["welcome"]);
            
        },
        
        // Register a listener with an event.
        addListener: function( event, handler ) {
            this.events.addListener(event, function( e ) { handler( e ); });
            jqi = event.indexOf('.wsc');
            
            if( event.indexOf('cmd.') != 0 || jqi == -1 || jqi == 4 )
                return;
            
            cmd = event.slice(4, jqi).toLowerCase();
            this.cmds.push(cmd);
        },
        
        // Remove listeners.
        removeListeners: function( ) {
            this.events.removeListeners();
        },
        
        // Run events dawg.
        trigger: function( event, data ) {
            //console.log("emitting "+ event);
            this.events.emit(event, data);
        },
        
        // Channel method wooo
        channel: function( namespace, chan ) {
            namespace = this.deform_ns(namespace).slice(1).toLowerCase();
            /* 
            console.log(namespace);
            console.log(this.channelo);
            /* */
            if( !this.channelo[namespace] && chan )
                this.channelo[namespace] = chan;
            
            return this.channelo[namespace];
        },
        
        // How many channels are we joined in?
        channels: function( ) {
            // - 2 because we always has at least 2 tabs open. Change for release.
            chans = -1;
            for(ns in client.channelo) {
                if( client.channelo[ns].hidden )
                    continue;
                chans++;
            }
            return chans;
        },
        
        // Start the client.
        connect: function( ) {
            if( client.connected )
                return;
            // Start connecting!
            if(CanCreateWebsocket()) {
                client.conn = client.createChatSocket();
                //console.log("connecting");
                client.trigger({name: 'start.wsc', pkt: wsc_packet('client connecting\ne=ok\n\n')});
            } else {
                client.monitor("Your browser does not support WebSockets. Sorry.");
                client.trigger({name: 'start.wsc', pkt: wsc_packet('client connecting\ne=no websockets available\n\n')});
            }
        },
        
        // Create a new WebSocket chat connection.
        createChatSocket: function( ) {
            
            var client = this;
            return CreateWebSocket(
                this.settings["server"],
                // WebSocket connection closed!
                function( evt ) { client.protocol.closed( evt ); },
                // Received a message from the server! Process!
                function( evt ) { client.protocol.process_data( evt ); },
                // Connection opened.
                function( evt ) { client.protocol.connected( evt ); }
            );
            
        },
        
        // Build the initial UI.
        buildUI: function( ) {
            this.view.append( wsc_html_ui );
            this.control = this.settings['control']( this );
            this.tabul = this.view.find('#chattabs');
            this.chatbook = this.view.find('div.chatbook');
            // The monitor channel is essentially our console for the chat.
            hide = this.settings.monitor[1];
            this.createChannel(this.mns, hide);
            this.control.setInput();
            this.control.focus();
            /*
            this.cchannel.setHeader('title', { pkt: {
                        "arg": { "by": "", "ts": "" },
                        "body": '<p>sample title</p>'
                    }
                }
            );
            /**/
            /*
            this.cchannel.setHeader('topic', { pkt: {
                        'arg': { 'by': '', 'ts': '' },
                        'body': '<p>sample topic</p>'
                    }
                }
            );
            /**/
            // For testing purposes only.
            // this.createChannel("llama2", "~Llama2", "server:llama2");
            this.resizeUI();
        },
        
        resizeUI: function( ) {
            // Resize control panel.
            client.control.resize();
            
            
            // Main view dimensions.
            client.view.height( client.view.parent().height() );
            client.view.width( '100%' );
            
            h = (client.view.parent().height() - client.tabul.outerHeight(true) - client.control.height());
            //console.log('>>',client.view.parent().innerHeight(),client.tabul.outerHeight(true),client.control.height())
            // Chatbook dimensions.
            client.chatbook.height(h);
            
            // Channel dimensions.
            for(select in client.channelo) {
                chan = client.channel(select);
                chan.resize();
            }
            //client.control.resize();
        },
        
        // Create a screen for channel `ns` in the UI, and initialise data
        // structures or some shit idk. The `selector` parameter defines the
        // channel without the `chat:` or `#` style prefixes. The `ns`
        // parameter is the string to use for the tab.
        createChannel: function( ns, toggle ) {
            chan = this.channel(ns, wsc_channel(this, ns), toggle);
            chan.build();
            this.toggleChannel(ns);
            if( toggle )
                chan.invisible();
        },
        
        // Remove a channel from the client and the GUI.
        // We do this when we leave a channel for any reason.
        // Note: last channel is never removed and when removing a channel
        // we switch to the last channel in the list before doing so.
        removeChannel: function( ns ) {
            if( this.channels() == 0 ) 
                return;
            
            chan = this.channel(ns);
            chan.remove();
            delete this.channelo[chan.info["selector"]];
            
            var select = '';
            for (tmp in this.channelo) {
                if (this.channelo.hasOwnProperty(tmp) && tmp != chan.info['selector'])
                    select = tmp;
            }
            
            this.toggleChannel(select);
            this.channel(select).resize();
        },
        
        // Select which channel is currently being viewed.
        toggleChannel: function( ns ) {
            //console.log("out: "+previous+"; in: "+ns);
            chan = this.channel(ns);
            
            if( !chan )
                return;
            
            if(this.cchannel) {
                if(this.cchannel == chan)
                    return;
                // Hide previous channel, if any.
                //console.log("prevshift ", previous);
                this.cchannel.hideChannel();
                this.control.cacheInput();
            }
            
            // Show clicked channel.
            chan.showChannel();
            this.control.focus();
            this.cchannel = chan;
            this.control.setLabel();
            if( this.settings['monitor'][1] ) {
                mt = this.tabul.find('#' + this.channel(this.mns).info['selector'] + '-tab')
                mt.addClass(this.settings['monitor'][1]);
            }
            this.resizeUI();
        },
    
        // Write a message to the UI.
        // `ns` is the name of the channel. No `chat:` or `#` style prefix.
        // `msg` is the raw string to be desplayed. Provide messages fully
        // formatted in HTML kthxbai.
        log: function( ns, msg ) {
            var chan = this.channel(ns);
            if( !chan )
                return;
            chan.log(msg);
        },
        
        // Send a log message to all channels.
        logAll: function( msg ) {
            for( ns in this.channelo )
                this.channlo[ns].log(msg);
        },
        
        // Send a log item to all channels.
        logItemAll: function( msg ) {
            for( ns in this.channelo )
                this.channelo[ns].logItem(msg);
        },
        
        monitorAll: function( msg, info ) {
            for( ns in this.channelo )
                this.channelo[ns].serverMessage(msg, info);
        },
        
        // Write a server message to the UI.
        serverMessage: function( ns, msg, info ) {
            var chan = this.channel(ns);
            if( !chan )
                return;
            chan.serverMessage(msg, info);
        },
        
        // System message displayed in the monitor window.
        monitor: function( msg, info ) {
            this.serverMessage(this.mns, msg, info);
        },
        
        // Deform a channel namespace.
        deform_ns: function( ns ) {
            if(ns.indexOf("chat:") == 0)
                return '#' + ns.slice(5);
            
            if(ns.indexOf("server:") == 0)
                return '~' + ns.slice(7);
            
            if(ns.indexOf("pchat:") == 0) {
                var names = ns.split(":");
                names.shift();
                for(var name in names) {
                    if(name.toLowerCase() != this.lun) {
                        return '@' + name;
                    }
                }
            }
            
            if(ns[0] != '#' && ns[0] != '@' && ns[0] != '~')
                return '#' + ns;
            
            return ns;
        },
        
        // Format a channel namespace.
        format_ns: function( ns ) {
            if(ns.indexOf('#') == 0) {
                return 'chat:' + ns.slice(1);
            }
            if(ns.indexOf('@') == 0) {
                var names = [ns.slice(1), this.lun];
                names.sort(caseInsensitiveSort)
                names.unshift("pchat");
                return names.join(':');
            }
            if(ns.indexOf('~') == 0) {
                return "server:" + ns.slice(1);
            }
            if(ns.indexOf('chat:') != 0 && ns.indexOf('server:') != 0 && ns.indexOf('pchat:') != 0)
                return 'chat:' + ns;
            
            return ns;
        },
        
        // Get the event name of a given packet.
        event_name: function( pkt ) {
            
            var name = pkt["cmd"];
            var cmds = null;
            for(var index in this.evt_chains) {
                
                cmds = this.evt_chains[index];
                
                if(cmds[0] != name)
                    continue;
                
                var sub = wsc_packet(pkt["body"]);
                name = name + '_' + sub["cmd"];
                
                if(cmds.length > 1 && sub["param"] != undefined) {
                    if(cmds[1] == sub["cmd"])
                        return name + '_' + sub["param"];
                }
            
            }
            
            return name;
        },
        
        // Send a message to the server.
        // Uses a raw packet string.
        send: function( msg ) {
            if(this.connected) {
                return this.conn.send(msg);
            }
            return -1;
        },
        
        // Protocol methods. Woop!
        
        // Send the chat user agent.
        handshake: function( ) {
            this.send(wsc_packetstr(this.settings['client'], "0.3", {
                "agent": this.settings["agent"]
            }));
        },
        
        // Send a pong!
        pong: function( ) {
            this.send(wsc_packetstr("pong"));
        },
        
        // Send login details.
        login: function( ) {
            pkt = 'login ' + this.settings["username"] + '\npk=' + this.settings["pk"] + '\n';
            this.send( pkt );
        },
        
        // Join a channel.
        join: function( ns ) {
            this.send(wsc_packetstr("join", this.format_ns(ns)));
        },
        
        // Part a channel.
        part: function( ns ) {
            this.send(wsc_packetstr('part', this.format_ns(ns)));
        },
        
        // Promote a user.
        promote: function( ns, user, pc ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('promote', user, {}, ( !pc ? '' : pc ))));
        },
        
        // Send a message to a channel.
        say: function( ns, msg ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('msg', 'main', {}, msg)
            ));
        },
        
        // Send a non-parsed message to a channel.
        npmsg: function( ns, msg ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('npmsg', 'main', {}, msg)
            ));
        },
        
        // Send an action message to a channel.
        action: function( ns, action ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('action', 'main', {}, action)
            ));
        },
        
        // Set the title.
        title: function( ns, title ) {
            this.send(wsc_packetstr('set', this.format_ns(ns), {
                'p': 'title'}, title));
        },
        
        // Kick some mofo
        kick: function( ns, user, r ) {
            this.send(wsc_packetstr('kick', this.format_ns(ns), {
                'u': user }, r ? r : null));
        },
    
    };
    
    client.init(view, options, mozilla);
    return client;

}
