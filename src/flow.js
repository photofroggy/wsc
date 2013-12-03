/**
 * Control the client's program flow. This object determines how the client responds to
 * certain events.
 * 
 * @class wsc.Flow
 * @constructor
 * @param protocol {Object} Protocol object.
 */
wsc.Flow = function( protocol ) {

    this.protocol = protocol || new wsc.Protocol();

};

// Established a WebSocket connection.
wsc.Flow.prototype.open = function( client, event, sock ) {
    client.trigger('connected', {name: 'connected', pkt: new wsc.Packet('connected\n\n')});
    client.connected = true;
    client.handshake();
    client.attempts = 0;
};

// WebSocket connection closed!
wsc.Flow.prototype.close = function( client, event ) {
    var evt = {
        name: 'closed',
        pkt: new wsc.Packet('connection closed\n\n'),
        reason: '',
        evt: event,
        // Were we fully connected or did we fail to connect?
        connected: client.connected,
        // Are we using SocketIO?
        sio: client.conn instanceof wsc.SocketIO,
        cause: event.cause || null,
        reconnect: true
    };
    
    var logevt = {
        name: 'log',
        ns: '~System',
        msg: '',
        info: ''
    };
    
    client.trigger( 'closed', evt );
    
    if(client.connected) {
        logevt.msg = 'Connection closed';
        client.trigger( 'log', logevt );
        client.connected = false;
        if( client.conn instanceof wsc.SocketIO ) {
            logevt.msg = 'At the moment there is a problem with reconnecting with socket.io';
            logevt.info = 'Refresh to connect';
            client.trigger( 'log', logevt );
            logevt.info = '';
            return;
        }
    } else {
        logevt.msg = 'Connection failed';
        client.trigger( 'log', logevt );
    }
    
    evt.name = 'quit';
    
    // Tried more than twice? Give up.
    if( client.attempts > 2 ) {
        //client.ui.server_message("Can't connect. Try again later.");
        evt.reconnect = false;
        client.attempts = 0;
        client.trigger( 'quit', evt );
        return;
    }
    
    // If login failure occured, don't reconnect
    if( event.cause ) {
        if( event.cause.hasOwnProperty( 'name' ) && event.cause.name == 'login' ) {
            client.trigger( 'quit', evt );
            return;
        }
    }
    
    // Notify everyone we'll be reconnecting soon
    //client.ui.server_message("Connecting in 2 seconds");
    
    setTimeout(function () {
        client.connect();
    }, 2000);

}; 

// Received data from WebSocket connection.
wsc.Flow.prototype.message = function( client, event ) {
    var pack = new wsc.Packet(unescape(replaceAll(event.data, '+', ' ')));
    
    if(pack == null)
        return;
    
    var pevt = this.protocol.parse(pack);
    
    if( pevt.ns == null )
        pevt.ns = client.mns;
    
    pevt.sns = client.deform_ns(pevt.ns);
    
    this.handle(client, pevt);
    
    client.trigger('pkt', pevt);
    client.trigger('pkt.'+pevt.name, pevt);
    //this.monitor(data);
};

/**
 * Handle a packet event.
 * 
 * @method handle
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.handle = function( client, event ) {

    try {
        this[event.name](event, client);
    } catch( err ) {}

};

/**
 * Respond to pings from the server.
 * 
 * @method ping
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.ping = function( event, client ) {
    client.pong();
};

/**
 * Respond to a llama-style handshake.
 * 
 * @method chatserver
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.chatserver = function( event, client ) {
    client.login();
};

/**
 * Process a login packet
 * 
 * @method login
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.login = function( event, client ) {
    
    if(event.pkt.arg.e == "ok") {
        // Use the username returned by the server!
        var info = event.pkt.sub[0];
        client.settings["username"] = event.pkt["param"];
        client.settings['symbol'] = info.arg.symbol;
        client.settings['userinfo'] = info.arg;
        
        var joiner = function(  ) {
            client.join(client.settings["autojoin"]);
            if( client.autojoin.on ) {
                for( var i in client.autojoin.channel ) {
                    if( !client.autojoin.channel.hasOwnProperty(i) )
                        continue;
                    client.join(client.autojoin.channel[i]);
                }
            }
        };
        
    } else {
        client.close( event );
    }
    
    if( client.fresh )
        client.fresh = false;
    
    
};

/**
 * Received a join packet.
 * 
 * @method join
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.join = function( event, client ) {
    if(event.pkt["arg"]["e"] == "ok") {
        var ns = client.deform_ns(event.pkt["param"]);
        client.create_ns(ns, client.hidden.contains(event.pkt['param']));
    } else {
        client.trigger( 'log',
            {
                name: 'log',
                ns: 'server:current',
                sns: '~current',
                msg: "Failed to join " + client.deform_ns(event.pkt["param"]),
                info: event.pkt["arg"]["e"]
            }
        );
    }
};

/**
 * Received a part packet.
 * 
 * @method part
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.part = function( event, client ) {
    var ns = client.deform_ns(event.ns);
    var c = client.channel(ns);
    
    if(event.e == "ok") {
        info = '';
        
        if( event.r.length > 0 )
            info = '[' + event.r + ']';
        else
            client.remove_ns(event.ns);
        
        msg = 'You have left ' + ns;
        c.server_message(msg, info);
        
        if( client.channels() == 0 ) {
            switch( event.r ) {
                case 'bad data':
                case 'bad msg':
                case 'msg too big':
                    break;
                default:
                    if( event.r.indexOf('killed:') < 0 )
                        return;
                    break;
            }
            this.message( client, { data: 'disconnect\ne='+e.r+'\n' } );
        }
    } else {
        client.trigger( 'log',
            {
                name: 'log',
                ns: 'server:current',
                sns: '~current',
                msg: "Couldn't leave " + ns,
                info: event.e
            }
        );
    }
    
};

/**
 * Client has been kicked from a channel.
 * 
 * @method kicked
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.kicked = function( event, client ) {

    if( event.r.toLowerCase().indexOf('autokicked') > -1 )
        return;
    client.join(event.ns);

};

/**
 * Process a property packet.
 * 
 * @method property
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.property = function( event, client ) {
    //console.log(event.pkt["arg"]["p"]);
    chan = client.channel(event.pkt["param"]);
    
    if( !chan )
        return;
    
    chan.property( event );
};

/**
 * User join or part.
 * 
 * @method recv_joinpart
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_joinpart = function( event, client ) {
    c = client.channel(event.ns);
    if( event.name == 'recv_join')
        c.recv_join( event );
    else
        c.recv_part( event );
};

/**
 * A user joined a channel.
 * 
 * @method recv_join
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_join = wsc.Flow.prototype.recv_joinpart;

/**
 * A user left a channel.
 * 
 * @method recv_part
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_part = wsc.Flow.prototype.recv_joinpart;

/**
 * A message was received in a channel.
 * 
 * @method recv_msg
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_msg = function( event, client ) {
    client.channel(event.ns).recv_msg( event );
};

/**
 * A different kind of message.
 * 
 * @method recv_action
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_action = wsc.Flow.prototype.recv_msg;

/**
 * A non-parsed message.
 * 
 * @method recv_npmsg
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_npmsg = wsc.Flow.prototype.recv_msg;

/**
 * Someone was promoted or demoted.
 * 
 * @method recv_privchg
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_privchg = function( event, client ) {
    client.channel(event.ns).recv_privchg( event );
};

/**
 * Some sucka got kicked foo.
 * 
 * @method recv_kicked
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_kicked = function( event, client ) {
    client.channel(event.ns).recv_kicked( event );
};


