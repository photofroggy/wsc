/**
 * An entire chat client. Instances of this object orchestrate the operation of
 * the client. Other objects are loaded in to control different parts of the client. These
 * components can be reasonably swapped out, assuming they provide the same functionality.
 *
 * @class wsc.Client
 * @constructor
 * @param view {Object} The client's container element.
 * @param options {Object} Configuration options for the client.
 * @param mozilla {Object} Is firefox being used?
 * @since 0.0.1
 */
wsc.Client = function( view, options, mozilla ) {

    this.mozilla = mozilla;
    this.storage = new wsc.Storage;
    this.storage.ui = this.storage.folder('ui');
    this.storage.aj = this.storage.folder('autojoin');
    this.storage.aj.channel = this.storage.aj.folder('channel');
    
    this.fresh = true;
    this.attempts = 0;
    this.connected = false;
    
    /**
     * An instance of a protocol parser.
     *
     * @property protocol
     * @type {Object}
     * @default wsc.Protocol
     */
    this.protocol = null;
    this.flow = null;
    this.ui = null;
    this.events = new EventEmitter();
    this.conn = null;
    
    this.channelo = {};
    this.cchannel = null;
    this.cmds = [];
    this.settings = {
        "domain": "website.com",
        "server": "ws://website.com/wsendpoint",
        "symbol": "",
        "username": "",
        "userinfo": {},
        "pk": "",
        // Monitor: `ns`
        "monitor": ['~Monitor', true],
        "welcome": "Welcome to the wsc web client!",
        "autojoin": "chat:channel",
        "protocol": wsc.Protocol,
        "mparser": wsc.MessageParser,
        "flow": wsc.Flow,
        "extend": [wsc.defaults.Extension],
        "client": 'chatclient',
        "clientver": '0.3',
        "developer": false
    };
    this.autojoin = {
        'on': true,
        'count': 0,
        'channel': []
    };
    this.away = {};
    
    var cli = this;
    // Channels excluded from loops.
    this.exclude = new StringSet();
    // Hidden channels
    this.hidden = new StringSet();
    this.settings = Object.extend( this.settings, options );
    this.config_load();
    this.config_save();
    
    this.mw = new wsc.Middleware();
    
    this.settings.agent = 'Client (' + navigator.platform + '; HTML5; JavaScript) wsc/' + wsc.VERSION + '-r' + wsc.REVISION;
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.protocol = new this.settings.protocol( new this.settings.mparser() );
    this.flow = new this.settings.flow(this.protocol);
    
    this.build();
    
    /*
    for(var index in this.settings["extend"]) {
        this.settings["extend"][index](this);
    }
    */
    
    wsc.defaults.Extension( this );

};

/**
 * Load configuration from localStorage.
 *
 * @method config_load
 */
wsc.Client.prototype.config_load = function(  ) {

    this.settings.developer = ( this.storage.get('developer', this.settings.developer.toString()) == 'true' );
    //this.settings.ui.theme = this.storage.ui.get('theme', this.settings.ui.theme);
    //this.settings.ui.clock = (this.storage.ui.get('clock', this.settings.ui.clock.toString()) == 'true');
    //this.settings.ui.tabclose = (this.storage.ui.get('tabclose', this.settings.ui.tabclose.toString()) == 'true');
    
    this.autojoin.on = (this.storage.aj.get('on', 'true') == 'true');
    this.autojoin.count = parseInt(this.storage.aj.get('count', '0'));
    this.autojoin.channel = [];
    
    var tc = null;
    var c = 0;
    for( var i = 0; i < this.autojoin.count; i++ ) {
        tc = this.storage.aj.channel.get( i, null );
        if( tc == null )
            continue;
        c++;
        this.autojoin.channel.push(tc);
    }
    
    this.autojoin.count = c;

};

/**
 * Save configuration save localStorage.
 *
 * @method config_save
 */
wsc.Client.prototype.config_save = function(  ) {

    this.storage.set('developer', this.settings.developer);
    //this.storage.ui.set('theme', this.settings.ui.theme);
    //this.storage.ui.set('clock', this.settings.ui.clock.toString());
    //this.storage.ui.set('tabclose', this.settings.ui.tabclose.toString());
    
    this.storage.aj.set('on', this.autojoin.on.toString());
    this.storage.aj.set('count', this.autojoin.count);
    
    for( var i = 0; i < this.autojoin.count; i++ ) {
        this.storage.aj.channel.remove(i)
    }
    
    if( this.autojoin.channel.length == 0 ) {
        this.storage.aj.set('count', 0);
    } else {
        var c = -1;
        for( var i in this.autojoin.channel ) {
            if( !this.autojoin.channel.hasOwnProperty(i) )
                continue;
            c++;
            this.storage.aj.channel.set( c.toString(), this.autojoin.channel[i] );
        }
        c++;
        this.storage.aj.set('count', c);
    }

};

/**
 * Build the client interface and hook up any required event handlers for the
 * interface. In particular, event handlers are hooked for switching and
 * closing channel tabs.
 * 
 * @method build
 */
wsc.Client.prototype.build = function(  ) {

    //this.ui.build();
    this.create_ns( this.settings.monitor[0], true, true );
    var client = this;
    /*
    this.ui.on('tab.close.clicked', function( event, ui ) {
        if( event.chan.monitor )
            return false;
        client.part(event.ns);
        client.remove_ns(event.ns);
        return false;
    } );
    
    this.ui.on('title.save', function( event, ui ) {
        client.set(event.ns, 'title', event.value);
    } );
    
    this.ui.on('topic.save', function( event, ui ) {
        client.set(event.ns, 'topic', event.value);
    } );
    */

};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
wsc.Client.prototype.loop = function(  ) {

    //this.ui.loop();

};

/**
 * Add an extension to the client.
 * 
 * @method add_extension
 * @param extension {Method} Extension constructor. Not called with `new`.
 */
wsc.Client.prototype.add_extension = function( extension ) {

    this.settings['extend'].push( extension );
    extension( this );

};

/**
 * Bind a method to an event.
 * 
 * @method bind
 * @param event {String} Name of the event to listen for.
 * @param handler {Method} Method to call when the given event is triggered.
 */
wsc.Client.prototype.bind = function( event, handler ) {

    this.events.addListener(event, handler);
    
    if( event.indexOf('cmd.') != 0 || event.length <= 4 )
        return;
    
    cmd = event.slice(4).toLowerCase();
    this.cmds.push(cmd);

};

/**
 * Clear event listeners for a given event.
 *
 * @method clear_listeners
 * @param event {String} Event to clear listeners for.
 */
wsc.Client.prototype.clear_listeners = function( event ) {

    this.events.removeListeners(event);

};

/**
 * Trigger an event.
 * 
 * @method trigger
 * @param event {String} Name of the event to trigger.
 * @param data {Object} Event data.
 */
wsc.Client.prototype.trigger = function( event, data ) {

    return this.events.emit( event, data, this );

};

/**
 * Add a middleware method.
 * 
 * @method middle
 * @param event {String} Event to attach middleware to
 * @param callback {Function} Method to call
 */
wsc.Client.prototype.middle = function( event, callback ) {

    return this.mw.add( event, callback );

};

/**
 * Run a method with middleware.
 *
 * @method cascade
 * @param event {String} Event to run middleware for
 * @param callback {Function} Method to call after running middleware
 * @param data {Object} Input for the method/event
 */
wsc.Client.prototype.cascade = function( event, callback, data ) {

    this.mw.run( event, callback, data );

};

/**
 * Open a connection to the chat server.
 * 
 * If the client is already connected, nothing happens.
 * 
 * @method connect
 */
wsc.Client.prototype.connect = function(  ) {

    if( this.connected )
        return;
    
    this.attempts++;
    
    // Start connecting!
    try {
        var client = this;
        this.conn = wsc.Transport.Create(this.settings.server);
        this.conn.open(function( evt, sock ) { client.flow.open( client, evt, sock ); });
        this.conn.disconnect(function( evt ) { client.flow.close( client, evt ); });
        this.conn.message(function( evt ) { client.flow.message( client, evt ); });
        this.conn.connect();
        //this.ui.server_message('Opening connection');
        this.trigger('start', new wsc.Packet('client connecting\ne=ok\n\n'));
    } catch(err) {
        console.log(err);
        //this.monitor("Your browser does not support WebSockets. Sorry.");
        this.trigger('start', new wsc.Packet('client connecting\ne=no websockets available\n\n'));
    }

};

/**
 * Close the connection foo.
 * 
 * @method close
 * @param [event] {Object} Event that resulted in the connection being closed
 */
wsc.Client.prototype.close = function( event ) {

    this.conn.close( event );
    //this.conn = null;

};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} Channel namespace to get or set.
 * @param [channel] {Object} Channel object to use for the given namespace.
 * @return {Object} Channel object associated with the given namespace.
 */
wsc.Client.prototype.channel = function( namespace, channel ) {

    namespace = this.format_ns(namespace).toLowerCase();
    
    if( !this.channelo[namespace] ) {
        if( channel ) {
            this.channelo[namespace] = channel;
                return channel;
        }
        return null;
    }
    
    return this.channelo[namespace];

};

/**
 * Get a count of the number of channels the client has open.
 * Channels with their tabs hidden are not counted.
 * 
 * @method channels
 * @param names {Boolean} Return the names of the open channels?
 * @return {Integer} Number of channels open.
 */
wsc.Client.prototype.channels = function( names ) {

    var chann = [];
    for(ns in this.channelo) {
        if( !this.channelo.hasOwnProperty(ns) )
            continue;
        if( this.channelo[ns].hidden )
            continue;
        chann.push(this.channelo[ns].namespace);
    }
    return names ? chann : chann.length;

};

/**
 * Iterate through the different channels.
 * 
 * @method each_channel
 * @param method {Function} Function to call for each channel.
 */
wsc.Client.prototype.each_channel = function( method, include ) {
    
    var chan = null;
    
    for( var ns in this.channelo ) {
        if( !this.channelo.hasOwnProperty(ns) )
            continue;
        
        chan = this.channelo[ns];
        
        if( !include )
            if( this.exclude.contains( chan.raw ) )
                continue;
        
        if( method( chan.raw, chan ) === false )
            break;
    }
    
};

/**
 * Deform a channel namespace to its shorthand form.
 * 
 * @method deform_ns
 * @param namespace {String} Namespace to deform.
 * @return {String} Shorthand channel namespace.
 */
wsc.Client.prototype.deform_ns = function( namespace ) {

    var sym = namespace[0];
    
    if( sym == '#'
        || sym == '@'
        || sym == '~'
        || sym == '+' )
            return namespace;
    
    if( namespace.indexOf("chat:") == 0 )
        return '#' + namespace.slice(5);
    
    if( namespace.indexOf("server:") == 0 )
        return '~' + namespace.slice(7);
    
    if( namespace.indexOf("feed:") == 0 )
        return '#' + namespace.slice(5);
    
    if( namespace.indexOf('login:') == 0 )
        return '@' + namespace.slice(6);
    
    if( namespace.indexOf("pchat:") == 0 ) {
        var names = namespace.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    return '#' + namespace;

};

/**
 * Format a channel namespace in its longhand form.
 * 
 * @method format_ns
 * @param namespace {String} Channel namespace to format.
 * @return {String} Formatted namespace.
 */
wsc.Client.prototype.format_ns = function( namespace ) {

    var n = namespace.slice( 1 );
    
    switch( namespace[0] ) {
        
        case '@':
            var names = [n, this.lun];
            names.sort(caseInsensitiveSort)
            names.unshift("pchat");
            namespace = names.join(':');
            break;
        
        case '~':
            namespace = "server:" + n;
            break;
        
        case '+':
            namespace = 'feed:' + n
            break;
            
        case '#':
            namespace = 'chat:' + n;
            break;
            
        default:
            if( namespace.indexOf('chat:') == 0
                || namespace.indexOf('pchat:') == 0
                || namespace.indexOf('server:') == 0
                || namespace.indexOf('feed:') == 0 )
                    break;
            namespace = 'chat:' + namespace;
            break;
    }
    
    return namespace;

};

/**
 * Create a channel object for the client.
 * 
 * @method create_ns
 * @param namespace {String} Namespace to use for the channel.
 * @param hidden {Boolean} Should the channel tab be hidden?
 */
wsc.Client.prototype.create_ns = function( namespace, hidden, monitor ) {

    var chan = this.channel(namespace, new wsc.Channel(this, namespace, hidden, monitor));
    this.trigger( 'ns.create', {
        name: 'ns.create',
        ns: namespace,
        chan: chan,
        client: this
    });
    chan.build();

};

/**
 * Remove a channel object from the client.
 * 
 * @method remove_ns
 * @param namespace {String} Namespace of the channel to remove.
 */
wsc.Client.prototype.remove_ns = function( namespace ) {

    if( !namespace )
        return;
    
    this.cascade(
        'ns.remove',
        function( data ) {
            var chan = data.client.channel( data.ns );
            
            if( !chan )
                return;
            
            delete data.client.channelo[chan.raw.toLowerCase()];
        },
        {
            ns: namespace,
            client: this
        }
    );

};

/**
 * Focus the client on a particular channel, for some reason.
 * 
 * If the UI is managing everything to do with the channel being used, maybe this
 * should be deprecated...
 *
 * @method select_ns
 * @param ns {String} Namespace of the channel to select
 */
wsc.Client.prototype.select_ns = function( ns ) {

    this.cchannel = this.channel(ns) || this.cchannel;

};

/**
 * Write a log message to a channel's log view.
 * 
 * @method log
 * @param namespace {String} Namespace of the channel to log to.
 * @param data {String} Message to display.
 */
wsc.Client.prototype.log = function( namespace, data ) {

    var chan = this.channel(namespace);
    
    if( !chan )
        return;
    
    chan.log(data);

};

/**
 * Write a message to the client monitor.
 * 
 * @method monitor
 * @param message {String} Message to display.
 */
wsc.Client.prototype.monitor = function( message ) {

    console.log( message );
    //this.ui.monitor(message);

};

/**
 * Mute a user.
 * 
 * @method mute_user
 * @param user {String} User to mute.
 */
wsc.Client.prototype.mute_user = function( user ) {

    //return this.ui.mute_user( user );

};

/**
 * Unmute a user.
 * 
 * @method unmute_user
 * @param user {String} User to unmute.
 */
wsc.Client.prototype.unmute_user = function( user ) {

    //return this.ui.unmute_user( user );

};

// Client packets

/**
 * Send a packet to the server.
 * 
 * @method send
 * @param data {String} Packet to send.
 * @return {Integer} Number of characters written to the server.
 *   -1 for failure.
 */
wsc.Client.prototype.send = function( data ) {

    return this.conn.send(data);

};

/**
 * Send a handshake packet.
 * 
 * @method handshake
 */
wsc.Client.prototype.handshake = function(  ) {

    this.send(wsc_packetstr(this.settings.client, this.settings.clientver, {
        "agent": this.settings.agent
    }));

};

/**
 * Send a login packet.
 * 
 * @method login
 */
wsc.Client.prototype.login = function(  ) {

    pkt = 'login ' + this.settings.username + '\npk=' + this.settings.pk + '\n';
    this.send( pkt );

};

/**
 * Send a pong packet to the server.
 * 
 * @method pong
 */
wsc.Client.prototype.pong = function(  ) {

    this.send(wsc_packetstr("pong"));

};

/**
 * Join a channel.
 * 
 * @method join
 * @param namespace {String} Channel to join.
 */
wsc.Client.prototype.join = function( namespace ) {

    this.send(wsc_packetstr("join", this.format_ns(namespace)));

};

/**
 * Leave a channel.
 * 
 * @method part
 * @param namespace {String} Channel to leave.
 */
wsc.Client.prototype.part = function( namespace ) {

    this.send(wsc_packetstr('part', this.format_ns(namespace)));

};

/**
 * Send a message to a channel.
 * 
 * @method say
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.say = function( namespace, message ) {

    var c = this;
    this.cascade( 'send.msg',
        function( data ) {
            c.send(wsc_packetstr('send', c.format_ns(data.ns), {},
                wsc_packetstr('msg', 'main', {}, data.input)
            ));
        }, { 'input': message, 'ns': namespace }
    );

};

/**
 * Send a non-parsed message to a channel.
 * 
 * @method npmsg
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.npmsg = function( namespace, message ) {

    var c = this;
    this.cascade( 'send.npmsg',
        function( data ) {
            c.send(wsc_packetstr('send', c.format_ns(data.ns), {},
                wsc_packetstr('npmsg', 'main', {}, data.input)
            ));
        }, { 'input': message, 'ns': namespace }
    );

};

/**
 * Send an action message to a channel.
 * 
 * @method action
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.action = function( namespace, action ) {

    var c = this;
    this.cascade( 'send.action',
        function( data ) {
            c.send(wsc_packetstr('send', c.format_ns(data.ns), {},
                wsc_packetstr('action', 'main', {}, data.input)
            ));
        }, { 'input': action, 'ns': namespace }
    );

};

/**
 * Promote a user in a channel.
 * 
 * @method promote
 * @param namespace {String} Channel to promote someone in.
 * @param user {String} User to promote.
 * @param [pc] {String} Privclass to promote the user to.
 */
wsc.Client.prototype.promote = function( namespace, user, pc ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('promote', user, {}, ( !pc ? '' : pc ))));

};

/**
 * Demote a user in a channel.
 * 
 * @method demote
 * @param namespace {String} Channel to demote someone in.
 * @param user {String} User to demote.
 * @param [pc] {String} Privclass to demote the user to.
 */
wsc.Client.prototype.demote = function( namespace, user, pc ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('demote', user, {}, ( !pc ? '' : pc ))));

};

/**
 * Ban a user from a channel.
 * 
 * @method ban
 * @param namespace {String} Channel to ban someone from.
 * @param user {String} User to ban.
 */
wsc.Client.prototype.ban = function( namespace, user ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('ban', user)));

};

/**
 * Unban a user from a channel.
 * 
 * @method unban
 * @param namespace {String} Channel to unban someone from.
 * @param user {String} User to unban.
 */
wsc.Client.prototype.unban = function( namespace, user ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('unban', user)));

};

/**
 * Kick a user from a channel.
 * 
 * @method kick
 * @param namespace {String} Channel to kick someone from.
 * @param user {String} User to kick.
 * @param [reason] {String} Reason for the kick.
 */
wsc.Client.prototype.kick = function( namespace, user, reason ) {

    var c = this;
    this.cascade( 'send.kick',
        function( data ) {
            c.send(wsc_packetstr('kick', c.format_ns(data.ns), { 'u': data.user }, data.input || null));
        }, { 'input': reason || '', 'ns': namespace, 'user': user }
    );

};

/**
 * Kill a user's connection to the server.
 * Only message network admins have access to this packet on the server.
 * 
 * @method kill
 * @param user {String} User to kill.
 * @param [reason] {String} Reason for the kill.
 */
wsc.Client.prototype.kill = function( user, reason ) {

    this.send(wsc_packetstr('kill', 'login:' + user, {}, reason || null));

};

/**
 * Send an admin comment to a channel.
 * 
 * @method admin
 * @param namespace {String} Channel to use for the admin command.
 * @param command {String} Command to run.
 */
wsc.Client.prototype.admin = function( namespace, command ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('admin', '', {}, command)
    ));

};

/**
 * Request a channel property from the server.
 * 
 * @method property
 * @param namespace {String} Namespace of the channel to get a property for.
 * @param property {String} Name of the property to get.
 */
wsc.Client.prototype.property = function( namespace, property ) {

    this.send(wsc_packetstr('get', this.format_ns(namespace), { 'p': property }));

};

/**
 * Set a channel property.
 * 
 * @method set
 * @param namespace {String} Namespace of the channel to set a property for.
 * @param property {String} Name of the property to set. Should be 'title' or
 *   'topic'.
 * @param value {String} Value to set the property to.
 */
wsc.Client.prototype.set = function( namespace, property, value ) {

    var c = this;
    this.cascade( 'send.set',
        function( data ) {
            c.send(wsc_packetstr('set', c.format_ns(data.ns), { 'p': data.property }, data.input));
        }, { 'input': value, 'ns': namespace, 'property': property }
    );

};

/**
 * Get whois information for a user.
 * 
 * @method whois
 * @param user {String} User to get information for.
 */
wsc.Client.prototype.whois = function( user ) {

    this.send(wsc_packetstr('get', 'login:' + user, { 'p': 'info' }));

};

/**
 * Send a disconnect packet.
 * 
 * @method disconnect
 */
wsc.Client.prototype.disconnect = function(  ) {

    this.send(wsc_packetstr('disconnect'));

};

