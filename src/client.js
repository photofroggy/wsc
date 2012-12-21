/**
 * Chat client.
 *
 * @class Client
 * @constructor
 * @param view {Object} The client's container element.
 * @param options {Object} Configuration options for the client.
 * @param mozilla {Object} Is firefox being used?
 */
wsc.Client = function( view, options, mozilla ) {

    this.mozilla = mozilla;
    this.fresh = true;
    this.attempts = 0;
    this.connected = false;
    this.protocol = null;
    this.flow = null;
    this.ui = null;
    this.events = new EventEmitter();
    this.conn = null;
    this.channelo = {};
    this.cchannel = null;
    this.exclude = [];
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
        "control": wsc.Control,
        "protocol": wsc.Protocol,
        "mparser": wsc.MessageParser,
        "flow": wsc.Flow,
        "ui": Chatterbox.UI,
        "extend": [wsc.defaults.Extension],
        "client": 'chatclient',
        "clientver": '0.3',
        "theme": wsc.defaults.theme,
        "themes": wsc.defaults.themes,
    };
    
    view.extend( this.settings, options );
    
    this.ui = new this.settings.ui( view, {
        'themes': this.settings.themes,
        'theme': this.settings.theme,
        'monitor': this.settings.monitor,
        'username': this.settings.username,
        'domain': this.settings.domain
    }, mozilla );
    
    this.settings.agent = this.ui.LIB + '/' + this.ui.VERSION + ' (' + navigator.appVersion.match(/\(([^)]+)\)/)[1] + ') wsc/' + wsc.VERSION;
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.protocol = new this.settings.protocol( new this.settings.mparser() );
    this.flow = new this.settings.flow(this.protocol);
    
    this.build();
    
    for(var index in this.settings["extend"]) {
        this.settings["extend"][index](this);
    }
    
    // Welcome!
    this.monitor(this.settings["welcome"]);

};

/**
 * Build the client interface and hook up any required event handlers for the
 * interface. In particular, event handlers are hooked for switching and
 * closing channel tabs.
 * 
 * @method build
 */
wsc.Client.prototype.build = function(  ) {

    this.ui.build();
    this.control = new this.settings.control( this );
    var client = this;
    
    this.ui.on( 'channel.selected', function( event, ui ) {
        client.cchannel = client.channel(event.ns);
        client.control.cache_input(event);
    } );
    
    this.ui.on('tab.close.clicked', function( event, ui ) {
        if( event.chan.monitor )
            return false;
        client.part(event.ns);
        return false;
    } );

};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
wsc.Client.prototype.loop = function(  ) {

    this.ui.loop();

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

    this.events.emit( event, data, this );

};

/**
 * Open a connection to the chat server.
 * If the client if already connected, nothing happens.
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
        this.ui.server_message('Opening connection');
        this.trigger('start', new wsc.Packet('client connecting\ne=ok\n\n'));
    } catch(err) {
        console.log(err);
        this.monitor("Your browser does not support WebSockets. Sorry.");
        this.trigger('start', new wsc.Packet('client connecting\ne=no websockets available\n\n'));
    }

};

/**
 * Close the connection foo.
 * 
 * @method close
 */
wsc.Client.prototype.close = function(  ) {

    console.log(this.conn);
    this.conn.close();
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

    namespace = this.deform_ns(namespace).slice(1).toLowerCase();
    
    if( !this.channelo[namespace] && channel )
        this.channelo[namespace] = channel;
    
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
            if( this.exclude.indexOf( chan.namespace.toLowerCase() ) != -1 )
                continue;
        
        if( method( chan.namespace, chan ) === false )
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

    if(namespace.indexOf("chat:") == 0)
        return '#' + namespace.slice(5);
    
    if(namespace.indexOf("server:") == 0)
        return '~' + namespace.slice(7);
    
    if(namespace.indexOf("pchat:") == 0) {
        var names = namespace.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    if( namespace.indexOf('login:') == 0 )
        return '@' + namespace.slice(6);
    
    if(namespace[0] != '#' && namespace[0] != '@' && namespace[0] != '~')
        return '#' + namespace;
    
    return namespace;

};

/**
 * Format a channel namespace in its longhand form.
 * 
 * @method format_ns
 * @param namespace {String} Channel namespace to format.
 * @return {String} Formatted namespace.
 */
wsc.Client.prototype.format_ns = function( namespace ) {

    if(namespace.indexOf('#') == 0) {
        return 'chat:' + namespace.slice(1);
    }
    if(namespace.indexOf('@') == 0) {
        var names = [namespace.slice(1), this.lun];
        names.sort(caseInsensitiveSort)
        names.unshift("pchat");
        return names.join(':');
    }
    if(namespace.indexOf('~') == 0) {
        return "server:" + namespace.slice(1);
    }
    if(namespace.indexOf('chat:') != 0 && namespace.indexOf('server:') != 0 && namespace.indexOf('pchat:') != 0)
        return 'chat:' + namespace;
    
    return namespace;

};

/**
 * Create a channel object for the client.
 * 
 * @method create_ns
 * @param namespace {String} Namespace to use for the channel.
 * @param hidden {Boolean} Should the channel tab be hidden?
 */
wsc.Client.prototype.create_ns = function( namespace, hidden ) {

    chan = this.channel(namespace, new wsc.Channel(this, namespace, hidden));
    chan.build();

};

/**
 * Remove a channel object from the client.
 * 
 * @method remove_ns
 * @param namespace {String} Namespace of the channel to remove.
 */
wsc.Client.prototype.remove_ns = function( namespace ) {

    this.ui.remove_channel(namespace);

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

    this.ui.monitor(message);

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

    e = { name: 'send.msg.before', 'msg': message, 'ns': namespace };
    this.trigger( e );
    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('msg', 'main', {}, e.msg)
    ));

};

/**
 * Send a non-parsed message to a channel.
 * 
 * @method npmsg
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.npmsg = function( namespace, message ) {

    e = { name: 'send.npmsg.before', 'msg': message, 'ns': namespace };
    this.trigger( e );
    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('npmsg', 'main', {}, e.msg)
    ));

};

/**
 * Send an action message to a channel.
 * 
 * @method action
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.action = function( namespace, action ) {

    e = { name: 'send.action.before', 'msg': action, 'ns': namespace };
    this.trigger( e );
    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('action', 'main', {}, e.msg)
    ));

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
wsc.Client.prototype.unban = function( namespae, user ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('unban', user, {}, ( !pc ? '' : pc ))));

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

    this.send(wsc_packetstr('kick', this.format_ns(namespace), { 'u': user }, reason || null));

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

    this.send(wsc_packetstr('kill', user, {}, reason || null));

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

    this.send(wsc_packetstr('set', this.format_ns(namespace), { 'p': property }, value));

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

