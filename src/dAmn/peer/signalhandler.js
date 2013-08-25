/**
 * Signal handling class.
 *
 * Provides a collection of event handlers which allow the extension to respond to
 * appropriate BDS commands.
 *
 * @class wsc.dAmn.BDS.Peer.SignalHandler
 * @constructor
 * @param client {Object} Reference to a wsc instance
 */
wsc.dAmn.BDS.Peer.SignalHandler = function( client ) {

    var handle = this;
    
    client.bind( 'BDS.PEER.REQUEST', function( event, client ) { handle.request( event, client ); } );
    client.bind( 'BDS.PEER.ACK', function( event, client ) { handle.ack( event, client ); } );
    client.bind( 'BDS.PEER.REJECT', function( event, client ) { handle.reject( event, client ); } );
    client.bind( 'BDS.PEER.ACCEPT', function( event, client ) { handle.accept( event, client ); } );
    client.bind( 'BDS.PEER.OPEN', function( event, client ) { handle.open( event, client ); } );
    client.bind( 'BDS.PEER.END', function( event, client ) { handle.end( event, client ); } );
    client.bind( 'BDS.PEER.OFFER', function( event, client ) { handle.offer( event, client ); } );
    client.bind( 'BDS.PEER.ANSWER', function( event, client ) { handle.answer( event, client ); } );
    client.bind( 'BDS.PEER.CANDIDATE', function( event, client ) { handle.candidate( event, client ); } );
    client.bind( 'BDS.PEER.CLOSE', function( event, client ) { handle.close( event, client ); } );

};


// EVENT HANDLERS

/**
 * Handle a peer request
 * 
 * @method request
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.request = function( event, client ) {
    
    
    if( event.sns[0] != '@' )
        return;
    
    var pns = event.param[0];
    var user = event.param[1];
    var app = event.param[2];
    var ver = parseInt(event.param[3]);
    
    var call = client.bds.peer.call( pns );
    
    if( !call )
        call = client.bds.peer.open( event.ns, pns, user, app, ver );
    
    call.signal.ack( user, app, ver );
    
    var peer = call.peer( user );
    
    if( !peer )
        peer = call.new_peer( user );
    
    client.trigger( 'peer.request', {
        name: 'peer.request',
        ns: event.ns,
        call: call,
        user: user,
        app: app,
        version: ver,
        peer: peer
    });
    
    return true;

},

/**
 * Handle an ack
 * Don't really need to do anything here
 * Unless we set a timeout for requests
 * 
 * @method ack
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.ack = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    var call = client.bds.peer.call( event.param[0] );
    
    if( !call )
        return;
    
    var user = event.param[1];
    var app = event.param[2];
    var ver = parseInt(event.param[3]);
    
    if( call.timeout != null ) {
        clearTimeout( call.timeout );
        call.timeout = null;
    }

};


/**
 * handle a reject
 * 
 * @method reject
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.reject = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    var call = client.bds.peer.call( event.param[0] );
    var user = event.param[1];
    var reason = event.param[2];
    
    if( !call )
        return;
    
    if( user.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    var peer = call.peer( event.user );
    
    if( !peer )
        peer = call.new_peer( event.user );
    
    peer.reject( reason );
    
    client.trigger( 'peer.reject', {
        name: 'peer.reject',
        ns: event.ns,
        pns: event.param[0],
        user: event.user,
        reason: reason
    } );

};


/**
 * Handle an accept
 *
 * @method accept
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.accept = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    var call = client.bds.peer.call( event.param[0] );
    
    if( !call )
        return;
    
    var user = event.param[1];
    var app = event.param[2];
    var ver = parseInt(event.param[3]);
    
    if( user.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    var peer = call.peer( event.user );
    
    if( !peer )
        peer = call.new_peer( event.user );
    
    client.trigger( 'peer.accept', {
        name: 'peer.accept',
        ns: event.ns,
        pns: event.param[0],
        app: app,
        version: ver,
        call: call,
        peer: peer
    } );

};


/**
 * Handle an OPEN command. OPEN commands provide information about open connections.
 * 
 * @method open
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.open = function( event, client ) {



};


/**
 * Handle an END command. END commands are given at the end of connection listing.
 * 
 * @method end
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.end = function( event, client ) {



};


/**
 * Handle an offer
 * 
 * @method offer
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.offer = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    var call = client.bds.peer.call( event.param[0] );
    
    if( !call )
        return;
    
    var pns = call.pns;
    var user = event.param[1];
    var target = event.param[2];
    var offer = new wsc.dAmn.BDS.Peer.RTC.SessionDescription( JSON.parse( event.param.slice(3).join(',') ) );
    
    if( target.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    var peer = call.peer( user );
    
    if( !peer )
        peer = call.new_peer( user );
    
    client.trigger( 'peer.offer', {
        name: 'peer.offer',
        ns: event.ns,
        pns: call.pns,
        call: call,
        peer: peer,
        offer: offer
    } );
    
    peer.set_remote_description( offer, 0 );

};

/**
 * Handle an answer
 * 
 * @method answer
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.answer = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    var call = client.bds.peer.call( event.param[0] );
    
    if( !call )
        return;
    
    var user = event.param[1]
    var target = event.param[2];
    var answer = new wsc.dAmn.BDS.Peer.RTC.SessionDescription( JSON.parse( event.param.slice(3).join(',') ) );
    
    if( target.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    var peer = call.peer( user );
    
    if( !peer )
        peer = call.new_peer( user );
    
    client.trigger( 'peer.answer', {
        name: 'peer.answer',
        ns: event.ns,
        pns: call.pns,
        call: call,
        peer: peer,
        answer: answer
    } );
    
    peer.set_remote_description( answer, 1 );

};


/**
 * Handle a candidate
 * 
 * @method candidate
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.candidate = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    var call = client.bds.peer.call( event.param[0] );
    
    if( !call )
        return;
    
    var peer = call.peer( event.param[1] );
    
    if( !peer )
        return;
    
    var target = event.param[2];
    
    if( target.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    var candidate = JSON.parse( event.param.slice(3).join(',') );
    
    if( !candidate ) {
        peer.ice_completed();
        return;
    }
    
    var ice = new wsc.dAmn.BDS.Peer.RTC.IceCandidate( candidate );
    
    peer.candidate( ice );
    
    client.trigger( 'peer.candidate', {
        name: 'peer.candidate',
        ns: event.ns,
        pns: call.pns,
        call: call,
        peer: peer,
        candidate: candidate,
        ice: ice
    } );

};


/**
 * Handle a close command
 *
 * @method close
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.close = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    var call = client.bds.peer.call( event.param[0] );
    
    if( !call )
        return;
    
    var peer = call.peer( event.param[1] );
    
    if( !peer )
        return;
    
    if( peer.user.toLowerCase() == client.settings.username.toLowerCase() )
        return;
    
    call.remove( peer.user );
    
    client.trigger( 'peer.close', {
        name: 'peer.close',
        ns: event.ns,
        evt: event,
        call: call,
        peer: peer
    });

};
