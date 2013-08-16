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
    
    /*
    // Away or ignored
    if( client.ui.umuted.indexOf( user.toLowerCase() ) != -1 ) {
        client.npmsg(event.ns, 'BDS:PEER:REJECT:' + pns + ',' + user + ',You have been blocked');
        return false;
    }
    
    if( client.away.on ) {
        client.npmsg(event.ns, 'BDS:PEER:REJECT:'+pns+','+user+',Away; ' + client.away.reason);
        return false;
    }
    /*
    if( phone.call != null ) {
        if( !phone.call.group ) {
            client.npmsg( event.ns, 'BDS:PEER:REJECT:' + pns + ',' + user + ',Already in a call' );
            return false;
        }
    }
    */
    client.npmsg(event.ns, 'BDS:PEER:ACK:' + pns + ',' + user);
    
    client.trigger( 'peer.request', {
        name: 'peer.request',
        ns: event.ns,
        pns: pns,
        user: user,
        app: app
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
wsc.dAmn.BDS.Peer.SignalHandler.prototype.ack = function( event, client ) {};


/**
 * handle a reject
 * 
 * @method reject
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.reject = function( event, client ) {
    
    if( event.sns[0] != '@' )
        return;
    
    client.trigger( 'peer.reject', {
        name: 'peer.reject',
        ns: event.ns,
        pns: event.param[0],
        user: event.param[1],
        reason: event.param[2]
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
    
    if( user.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    if( !call.group ) {
    
        var peer = call.new_peer( event.user );
        
        if( !peer ) {
            return;
        }
        
        client.trigger( 'peer.new', {
            name: 'peer.new',
            ns: event.ns,
            pns: call.pns,
            peer: peer
        } );
        
        peer.ready(
            function(  ) {
                call.signal.offer( peer );
            }
        );
    
    }
    
    client.trigger( 'peer.accept', {
        name: 'peer.accept',
        ns: event.ns,
        pns: event.param[0],
        user: event.param[1],
        reason: event.param[2]
    } );

};


wsc.dAmn.BDS.Peer.SignalHandler.prototype.open = function( event, client ) {};

wsc.dAmn.BDS.Peer.SignalHandler.prototype.end = function( event, client ) {};


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
    
    var pns = event.param[0];
    var user = event.param[1];
    var target = event.param[2];
    var offer = new wsc.dAmn.BDS.Peer.RTC.SessionDescription( JSON.parse( event.param.slice(3).join(',') ) );
    
    if( target.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    /*
    // Away or ignored
    if( client.ui.umuted.indexOf( user.toLowerCase() ) != -1 ) {
        wsc.dAmn.BDS.Peer.signal.reject( user, 'You have been blocked' );
        return;
    }
    
    if( client.away.on ) {
        wsc.dAmn.BDS.Peer.signal.reject( user, 'Away, reason: ' + client.away.reason );
        return;
    }
    */
    
    var peer = call.peer( user );
    
    if( !peer ) {
        if( !call.group )
            return;
        
        peer = call.new_peer( user );
        
        client.trigger( 'peer.new', {
            name: 'peer.new',
            ns: event.ns,
            pns: call.pns,
            peer: peer
        } );
    }
    
    peer.ready( null, offer );

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
    
    var target = event.param[2];
    var offer = new wsc.dAmn.BDS.Peer.RTC.SessionDescription( JSON.parse( event.param.slice(3).join(',') ) );
    
    if( target.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    var peer = call.peer( user );
    
    if( !peer )
        return;
    
    peer.open( null, offer );

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
    
    var target = event.param[2];
    var candidate = new wsc.dAmn.BDS.Peer.RTC.SessionDescription( JSON.parse( event.param.slice(3).join(',') ) );
    
    if( target.toLowerCase() != client.settings.username.toLowerCase() )
        return;
    
    var peer = call.peer( user );
    
    if( !peer )
        return;
    
    peer.candidate( candidate );

};


/**
 * Handle a close command
 *
 * @method close
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.SignalHandler.prototype.close = function( event, client ) {};