/**
 * Control the client's program flow in relation to the chat this.
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
wsc.Flow.prototype.ping = function( event, client ) {
    client.pong();
};

// Respond to a llama-style handshake.
wsc.Flow.prototype.chatserver = function ( e ) {
    //client.monitor(
    //    "Connected to " + event.pkt["cmd"] + " " + event.pkt["arg"]["server"] + " version " +e.pkt["arg"]["version"]+".");
    client.login();
};

// Process a login packet
wsc.Flow.prototype.login = function( event, client ) {
    
    if(e.pkt["arg"]["e"] == "ok") {
        //client.monitor("Logged in as " + event.pkt["param"] + '.');
        // Use the username returned by the server!
        info = new wsc.Packet('info\n' + event.data);
        client.settings["username"] = event.pkt["param"];
        client.settings['symbol'] = info.arg.symbol;
        client.settings['userinfo'] = info.arg;
        // Autojoin!
        // TODO: multi-channel?
        if ( client.fresh )
            client.join(client.settings["autojoin"]);
        else {
            for( key in client.channelo ) {
                if( client.channelo[key].info['namespace'][0] != '~' )
                    client.join(key);
            }
        }
    } else {
        //client.close();
    }
    
    if( client.fresh )
        client.fresh = false;
    
    
};

// Received a join packet.
wsc.Flow.prototype.join = function( event, client ) {
    if(e.pkt["arg"]["e"] == "ok") {
        ns = client.deform_ns(e.pkt["param"]);
        //client.monitor("You have joined " + ns + '.');
        client.create_channel(ns);
        client.ui.channel(ns).server_message("You have joined " + ns);
    } else {
        client.ui.chatbook.current.server_message("Failed to join " + client.deform_ns(e.pkt["param"]), event.pkt["arg"]["e"]);
    }
};

// Received a part packet.
wsc.Flow.prototype.part = function( event, client ) {
    ns = client.deform_ns(e.ns);
    c = client.channel(ns);
    
    if(e.e == "ok") {
        info = '';
        if( event.r )
            info = '[' + event.r + ']';
        
        msg = 'You have left ' + ns;
        c.server_message(msg, info);
        
        if( info == '' )
            client.remove_channel(ns);
        
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
            this.process_data( { data: 'disconnect\ne='+e.r+'\n' } );
        }
    } else {
        client.monitor('Couldn\'t leave ' + ns, event.e);
        c.server_message("Couldn't leave "+ns, event.e);
    }
    
};

wsc.Flow.prototype.kicked = function( e, client ) {

    if( event.r.toLowerCase().indexOf('autokicked') > -1 )
        return;
    client.join(e.ns);

};

// Process a property packet.
wsc.Flow.prototype.property = function( event, client ) {
    //console.log(e.pkt["arg"]["p"]);
    chan = client.channel(e.pkt["param"]);
    
    if( !chan )
        return;
    
    chan.property(e);
};

// User join or part.
wsc.Flow.prototype.recv_joinpart = function( event, client ) {
    c = client.channel(e.ns);
    if( event.name == 'recv_join')
        c.recv_join(e);
    else
        c.recv_part(e);
};

wsc.Flow.prototype.recv_join = wsc.Flow.prototype.recv_joinpart;
wsc.Flow.prototype.recv_part = wsc.Flow.prototype.recv_joinpart;

// Display a message received from a channel.
wsc.Flow.prototype.recv_msg = function( event, client ) {
    client.channel(e.ns).recv_msg(e);
};

// Someone was promoted or demoted.
wsc.Flow.prototype.recv_privchg = function( event, client ) {
    client.channel(e.ns).recv_privchg(e);
};

// Some sucka got kicked foo.
wsc.Flow.prototype.recv_kicked = function( event, client ) {
    client.channel(e.ns).recv_kicked(e);
};


