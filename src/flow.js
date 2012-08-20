/**
 * Control the client's program flow in relation to the chat protocol.
 * 
 * @class Flow
 * @constructor
 */
wsc.Flow = function(  ) {

};

/**
 * Handle a packet event.
 * 
 * @method handle
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.handle = function( event, client ) {

    if( !this.hasOwnProperty(event.name) )
        return;
    
    this[event.name](event, client);

};

// Respond to pings from the server.
wsc.Flow.prototype.ping: function( event, client ) {
    client.pong();
};

// Respond to a llama-style handshake.
wsc.Flow.prototype.chatserver: function ( e ) {
    //protocol.client.monitor(
    //    "Connected to " + e.pkt["cmd"] + " " + e.pkt["arg"]["server"] + " version " +e.pkt["arg"]["version"]+".");
    protocol.client.login();
};

// Process a login packet
wsc.Flow.prototype.login: function( e ) {
    
    if(e.pkt["arg"]["e"] == "ok") {
        //protocol.client.monitor("Logged in as " + e.pkt["param"] + '.');
        // Use the username returned by the server!
        info = new WscPacket('info\n' + e.data);
        protocol.client.settings["username"] = e.pkt["param"];
        protocol.client.settings['symbol'] = info.arg.symbol;
        protocol.client.settings['userinfo'] = info.arg;
        // Autojoin!
        // TODO: multi-channel?
        if ( protocol.client.fresh )
            protocol.client.join(client.settings["autojoin"]);
        else {
            for( key in protocol.client.channelo ) {
                if( protocol.client.channelo[key].info['namespace'][0] != '~' )
                    protocol.client.join(key);
            }
        }
    } else {
        //protocol.client.monitor("Failed to log in: \"" + e.pkt["arg"]["e"] + '"');
    }
    
    if( protocol.client.fresh )
        protocol.client.fresh = false;
    
    
};

// Received a join packet.
wsc.Flow.prototype.join: function( e ) {
    if(e.pkt["arg"]["e"] == "ok") {
        ns = protocol.client.deform_ns(e.pkt["param"]);
        //protocol.client.monitor("You have joined " + ns + '.');
        protocol.client.create_channel(ns);
        protocol.client.ui.channel(ns).server_message("You have joined " + ns);
    } else {
        protocol.client.ui.chatbook.current.server_message("Failed to join " + protocol.client.deform_ns(e.pkt["param"]), e.pkt["arg"]["e"]);
    }
};

// Received a part packet.
wsc.Flow.prototype.part: function( e ) {
    ns = protocol.client.deform_ns(e.ns);
    c = protocol.client.channel(ns);
    
    if(e.e == "ok") {
        info = '';
        if( e.r )
            info = '[' + e.r + ']';
        
        msg = 'You have left ' + ns;
        c.server_message(msg, info);
        
        if( info == '' )
            protocol.client.remove_channel(ns);
        
        if( protocol.client.channels() == 0 ) {
            switch( e.r ) {
                case 'bad data':
                case 'bad msg':
                case 'msg too big':
                    break;
                default:
                    if( e.r.indexOf('killed:') < 0 )
                        return;
                    break;
            }
            protocol.process_data( { data: 'disconnect\ne='+e.r+'\n' } );
        }
    } else {
        protocol.client.monitor('Couldn\'t leave ' + ns, e.e);
        c.server_message("Couldn't leave "+ns, e.e);
    }
    
};

wsc.Flow.prototype.kicked: function( e, client ) {

    if( e.r.toLowerCase().indexOf('autokicked') > -1 )
        return;
    client.join(e.ns);

};

// Process a property packet.
wsc.Flow.prototype.property: function( e ) {
    //console.log(e.pkt["arg"]["p"]);
    chan = protocol.client.channel(e.pkt["param"]);
    
    if( !chan )
        return;
    
    chan.property(e);
};

// User join or part.
wsc.Flow.prototype.recv_joinpart: function( e ) {
    c = protocol.client.channel(e.ns);
    if( e.name == 'recv_join')
        c.recv_join(e);
    else
        c.recv_part(e);
};

// Display a message received from a channel.
wsc.Flow.prototype.recv_msg: function( e ) {
    protocol.client.channel(e.ns).recv_msg(e);
};

// Someone was promoted or demoted.
wsc.Flow.prototype.recv_privchg: function( e ) {
    protocol.client.channel(e.ns).recv_privchg(e);
};

// Some sucka got kicked foo.
wsc.Flow.prototype.recv_kicked: function( e ) {
    protocol.client.channel(e.ns).recv_kicked(e);
};


