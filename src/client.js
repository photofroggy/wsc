/**
 * @method wsc_client 
 * @author photofroggy
 * @note To create a client, use the {wsc wsc jQuery method}.
 * 
 * wsc_client is a constructor for the {wsc_client.client wsc client} object.
 * 
 * @param [jQuery] element Main view for the client to be drawn in.
 * @param options
 *  Here the client's settings can be defined, and we store them in ``client.settings``. The settings available are as follows:
 *  [String] domain The domain of the website hosting the client. Used for constructing URLs.
 *  [String] server Address for the WebSocket server to connect to.
 *  [String] agent The client's user-agent. This is sent in the handshake when connecting to the chat server.
 *  [String] username Name of the user using the client.
 *  [String] symbol User symbol for the user. This is automatically updated when the client logs in to the chat server.
 *  [String] pk The user's chat token. Required for logging in to the chat server.
 *  [Array] monitor Configuration for the monitor channel. ``[(String) shorthand_name, (Bool) hidden]``.
 *  [String] welcome Define the message displayed when the client is loaded.
 *  [String] autojoin Define the channel to join when the client logs in successfully.
 *  [Function] protocol A function which returns a protocol parser. By default, {wsc_protocol} is used.
 *  [Array] extend Array of extensions. By default, this only includes {wsc_extdefault}. Refer to {wsc_extbase} for more information.
 *  [String] client Client string to send in the handshake. Defaults to ``chatclient``.
 *  [Function] tablumps Tablumps parser constructor. By default, {wsc_tablumps} is used.
 * @param [Boolean] mozilla Is the browser being used made by mozilla?
 * @return [Object] A {wsc_client.client wsc client} object.
 */
function wsc_client( view, options, mozilla ) {
    
    /**
     * @object client
     * @author photofroggy
     * 
     * @note To create a client, use the {wsc wsc jQuery method}.
     * 
     * This object acts as a client for dAmn-like chat servers.
     * When initialising the object, you can provide different configuration
     * options using the ``options`` parameter.
     */
    var client = {
    
        version: '0.5.29',
        dev_state: 'alpha',
        view: null,
        mozilla: false,
        control: null,
        tabul: null,
        chatbook: null,
        connected: false,
        conn: null,
        fresh: true,
        evt_chains: [["recv", "admin"]],
        events: null,
        attempts: 0,
        default_themes: [ 'wsct_default', 'wsct_test' ],
        settings: {
            "domain": "website.com",
            "server": "ws://website.com/wsendpoint",
            "agent": "",
            "symbol": "",
            "username": "",
            "userinfo": {},
            "pk": "",
            // Monitor: `ns`
            "monitor": ['~Monitor', true],
            "welcome": "Welcome to the wsc web client!",
            "autojoin": "chat:channel",
            "protocol": wsc.Protocol,
            "extend": [wsc_extdefault],
            "control": wsc_control,
            "stype": 'llama',
            "client": 'chatclient',
            "clientver": '0.3',
            "tablumps": wsc.Tablumps,
            "flow": wsc.Flow,
            "avatarfile": '$un[0]/$un[1]/{un}',
            "defaultavatar": 'default.gif',
            "avatarfolder": '/avatars/',
            "emotefolder": '/emoticons/',
            "thumbfolder": '/thumbs/',
            "theme": 'wsct_default',
            "themes": [ 'wsct_default', 'wsct_test' ],
        },
        // Protocol object.
        protocol: null,
        // Flow object.
        flow: null,
        // Object containing all channel objects.
        channelo: {},
        // Current channel object.
        cchannel: null,
        // Known command names.
        cmds: [],
        
        /**
         * @constructor init
         * @author photofroggy
         * 
         * I guess this is what I would consider the "actual" constructor.
         * 
         * @param [jQuery] element The client's main view.
         * @param [Boolean] mozilla Are we running firefox?
         */
        init: function( view, options, mozilla ) {
            
            view.extend( this.settings, options );
            this.settings.agent = 'wsc/' + this.version + ' (' + this.settings.username + '; ' + navigator.language + '; ' + navigator.platform + ') Chatterbox/' + Chatterbox.VERSION;
            
            //view.append('<div class="wsc '+this.settings['theme']+'"></div>');
            this.ui = new Chatterbox.UI( view, {
                'themes': this.settings.themes,
                'theme': this.settings.theme,
                'monitor': this.settings.monitor,
                'username': this.settings.username,
                'domain': this.settings.domain
            }, mozilla );
            // Set up variables.
            this.attempts = 0;
            this.view = view.find('.wsc');
            this.mozilla = mozilla;
            this.connected = false;
            this.conn = null;
            this.events = new EventEmitter();
            this.mns = this.format_ns(this.settings['monitor'][0]);
            this.lun = this.settings["username"].toLowerCase();
            this.channelo = {};
            this.protocol = new this.settings.protocol( new this.settings.tablumps() );
            this.flow = new this.settings.flow(this.protocol);
            //this.addListener('closed'
            
            // Debug!
            //console.log(this);
            
            // Prepare the UI.
            this.buildUI();
            
            // Load in extensions
            this.cmds = [];
            for(var index in this.settings["extend"]) {
                this.settings["extend"][index](this);
            }
            
            // Welcome!
            this.monitor(this.settings["welcome"]);
            
        },
        
        /**
         * @function registerExtension
         * Use this function to register an extension with the client after
         * creating the client. This method should be called through jQuery
         * as follows:
         * 
         * @example registering an extension
         *  $('.container').wsc( 'registerExtension', my_constructor );
         *  
         *  // The above uses an example 'my_constructor', which can be as simple
         *  // as the following.
         *  function my_constructor( client ) {
         *      client.addListener( 'cmd.slap',
         *          function( e ) {
         *              // Slap your victim or something.
         *              client.action( e.target, 'slaps ' + ( e.args || e.user ) );
         *          }
         *      );
         *  }
         * 
         * @param [Function] constructor Extension constructor.
         */
        registerExtension: function( constructor ) {
            if( container === undefined )
                return;
            client.settings['extend'].push( constructor );
            constructor( client );
        },
        
        /**
         * @function jq_registerExtension
         * jQuery interface for registerExtension.
         * 
         * @param [jQuery] view jQuery view the method was called through.
         * @param [Function] constructor Extension constructor.
         */
        jq_registerExtension: function( view, constructor ) {
            client.registerExtension(constructor);
        },
        
        /**
         * @function bind
         * Bind an event handler to a specific wsc event. Doing this will make
         * the client call the handler every time the given event is triggered.
         * @param [String] event Name of the event to bind the handler to.
         * @param [Function] handler Event handling function.
         */
        bind: function( event, handler ) {
            this.events.addListener(event, handler);
            
            if( event.indexOf('cmd.') != 0 || event.length <= 4 )
                return;
            
            cmd = event.slice(4).toLowerCase();
            this.cmds.push(cmd);
        },
        
        /**
         * @function jq_bind
         * jQuery interface for the bind method.
         * @param [jQuery] view Element the method was called on.
         * @param [Object] opt Method arguments.
         */
        jq_bind: function( view, opt ) {
            client.bind( opt['event'], opt['handler'] );
        },
        
        /**
         * @function removeListeners
         * Removes all event listeners from the client.
         */
        removeListeners: function( ) {
            this.events.removeListeners();
        },
        
        /**
         * @function trigger
         * Trigger an event in the client.
         * @param [String] event Name of the event to trigger.
         * @param [Object] data Event data.
         */
        trigger: function( event, data ) {
            //console.log("emitting "+ event);
            client.events.emit(event, data, client);
        },
        
        /**
         * @function jq_trigger
         * jQuery interface for the trigger method.
         */
        jq_trigger: function( view, opts ) {
            client.trigger( opts['event'], opts['data'] );
        },
        
        /**
         * @function channel
         * 
         * @overload
         *  Get the channel object associated with the given namespace.
         *  @param [String] namespace
         *  
         * @overload
         *  Set the channel object associated with the given namespace.
         *  @param [String] namespace
         *  @param [Object] chan A {wsc_channel.channel wsc channel object} representing the channel specified.
         */
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
        
        /**
         * @function channels
         * 
         * Determine how many channels the client has open. Hidden channels are
         * not included in this, and we don't include the first channel because
         * there should always be at least one non-hidden channel present in the
         * client.
         * 
         * @return [Integer] Number of channels open in the client.
         */
        channels: function( ) {
            chans = -1;
            for(ns in client.channelo) {
                if( client.channelo[ns].hidden )
                    continue;
                chans++;
            }
            return chans;
        },
        
        /**
         * @function connect
         * 
         * This function can be used to open a connection to the chat server. If
         * we are already connected, this function does nothing.
         * 
         * @todo Create a fallback to use if WebSockets are not available. Like,
         *  really now.
         */
        connect: function( ) {
            if( client.connected )
                return;
            
            this.attempts++;
            
            // Start connecting!
            if(CanCreateWebsocket()) {
                client.conn = client.createChatSocket();
                client.conn.connect();
                //console.log("connecting");
                client.trigger('start', new wsc.Packet('client connecting\ne=ok\n\n'));
            } else {
                client.monitor("Your browser does not support WebSockets. Sorry.");
                client.trigger('start', new wsc.Packet('client connecting\ne=no websockets available\n\n'));
            }
        },
        
        // We need this, dawg.
        jq_connect: function( ) {
            client.connect();
        },
        
        /**
         * @function createChatSocket
         * Does what it says on the tin.
         * @return [Object] WebSocket connection.
         */
        createChatSocket: function( ) {
            
            var client = this;
            conn = wsc.Transport.Create(this.settings.server);
            conn.open(function( evt, sock ) { client.flow.open( client, evt, sock ); });
            conn.disconnect(function( evt ) { client.flow.close( client, evt ); });
            conn.message(function( evt ) { client.flow.message( client, evt ); });
            return conn;
            
        },
        
        // Build the initial UI.
        buildUI: function( ) {
            this.ui.build();
            this.control = this.settings.control( this );
            this.ui.on( 'channel.selected', function( event, ui ) {
                client.cchannel = client.channel(event.ns);
                client.control.cache_input(event);
            } );
            this.ui.on('tab.close.clicked', function( event, ui ) {
                client.close_channel(event, ui);
            } );
        },
        
        resizeUI: function( ) {
            // Resize control panel.
            client.control.resize();
            
            // Main view dimensions.
            //console.log('>> pH:',client.view.parent().height());
            client.view.height( client.view.parent().height() );
            client.view.width( '100%' );
            
            h = (client.view.parent().height() - client.tabul.outerHeight(true) - client.control.height());
            //console.log('>> rUI h parts:',client.view.parent().height(),client.tabul.outerHeight(true),client.control.height());
            //console.log('>> rUI h:', h);
            // Chatbook dimensions.
            client.chatbook.height(h);
            
            // Channel dimensions.
            for(select in client.channelo) {
                chan = client.channel(select);
                chan.resize();
            }
            //client.control.resize();
        },
        
        // Called by setInterval every two minutes. Approximately. Maybe. Who cares?
        // It is up to whatever implements the client to set up the loop by
        // calling setInterval(client.loop, 120000); or whatever variations.
        // Wsc's jQuery plugin does this automagically.
        loop: function( ) {
            client.doLoop();
        },
        
        // Ok so I lied, this is the stuff that actually runs on the loop thingy.
        // This is to avoid thingies like scope fucking up. Seriously. Wtf js?
        doLoop: function( ) {
            for( key in this.channelo ) {
                c = this.channelo[key];
                msgs = c.ui.logpanel.find( '.logmsg' );
                
                if( msgs.length < 200 )
                    continue;
                
                while( msgs.length > 200 ) {
                    msgs.slice(0, 10).remove();
                    msgs = c.ui.logpanel.find( '.logmsg' );
                }
                
                c.ui.resize();
            }
        },
        
        // Create a screen for channel `ns` in the UI, and initialise data
        // structures or some shit idk. The `selector` parameter defines the
        // channel without the `chat:` or `#` style prefixes. The `ns`
        // parameter is the string to use for the tab.
        create_channel: function( ns, toggle ) {
            chan = this.channel(ns, new wsc.Channel(this, ns, toggle));
            chan.build();
        },
        
        // Remove a channel from the client and the GUI.
        // We do this when we leave a channel for any reason.
        // Note: last channel is never removed and when removing a channel
        // we switch to the last channel in the list before doing so.
        remove_channel: function( ns ) {
            this.ui.remove_channel(ns);
        },
        
        close_channel: function( event, ui ) {
            // Cannot close the monitor channel!
            if( event.chan.monitor )
                return;
            
            client.part(event.ns);
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
        
        // System message displayed in the monitor window.
        monitor: function( msg, info ) {
            this.ui.monitor(msg, info);
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
                for(i in names) {
                    name = names[i];
                    if(name.toLowerCase() != this.lun) {
                        return '@' + name;
                    }
                }
            }
            
            if( ns.indexOf('login:') == 0 )
                return '@' + ns.slice(6);
            
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
                
                var sub = new wsc.Packet(pkt["body"]);
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
            return this.conn.send(msg);
        },
        
        // Protocol methods. Woop!
        
        // Send the chat user agent.
        handshake: function( ) {
            this.send(wsc_packetstr(this.settings['client'], this.settings["clientver"], {
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
            this.trigger( { name: 'send.msg.before', 'msg': msg, 'ns': ns } );
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
