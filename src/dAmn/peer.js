
/**
 * Implements BDS Peer.
 * 
 * This allows the client to negotiate and open peer to peer network
 * connections with other clients. These connections can be used to stream
 * video, audio, and, in the future, data.
 * 
 * @class wsc.dAmn.BDS.Peer
 * @constructor
 * @param client {Object} Reference to the client
 * @param storage {Object} Reference to the dAmn extension storage
 * @param settings {Object} Reference to the dAmn extension settings
 */
wsc.dAmn.BDS.Peer = function( client, storage, settings ) {

    var init = function(  ) {
    
        // BDS events.
        client.bind( 'BDS.PEER.REQUEST', function( event, client ) { handle.signal.request( event, client ); } );
        client.bind( 'BDS.PEER.ACK', function( event, client ) { handle.signal.ack( event, client ); } );
        client.bind( 'BDS.PEER.REJECT', function( event, client ) { handle.signal.reject( event, client ); } );
        client.bind( 'BDS.PEER.ACCEPT', function( event, client ) { handle.signal.accept( event, client ); } );
        client.bind( 'BDS.PEER.OPEN', function( event, client ) { handle.signal.open( event, client ); } );
        client.bind( 'BDS.PEER.END', function( event, client ) { handle.signal.end( event, client ); } );
        client.bind( 'BDS.PEER.OFFER', function( event, client ) { handle.signal.offer( event, client ); } );
        client.bind( 'BDS.PEER.ANSWER', function( event, client ) { handle.signal.answer( event, client ); } );
        client.bind( 'BDS.PEER.CLOSE', function( event, client ) { handle.signal.close( event, client ); } );
        // dAmn events.
        client.bind('pkt.join', handler.join);
        client.bind('pkt.part', handler.part);
        client.bind('pkt.recv_join', handler.recv_join);
        client.bind('pkt.recv_part', handler.recv_part);

    };
    
    init();

};


/**
 * Array containing bots used to manage calls.
 * 
 * We could have Botdom doing this, but I dunno. Maybe a different bot would be 
 * a better idea.
 * @property bots
 * @type Array
 * @default [ 'botdom' , 'damnphone', ]
 */
wsc.dAmn.BDS.Peer.bots = [ 'botdom', 'damnphone' ];


/**
 * Options for peer candidates.
 * @property peer_options
 * @type Object
 * @default { iceServers: [ { url: 'stun:stun.l.google.com:19302' } ] }
 */
wsc.dAmn.BDS.Peer.peer_options = {
    iceServers: [
        { url: 'stun:stun.l.google.com:19302' }
    ]
};


/**
 * WebRTC Objects.
 * @property RTC
 * @type Object
 * @default { PeerConnection: null, SessionDescription: null, IceCandidate: null }
 */
wsc.dAmn.BDS.Peer.RTC = {
    PeerConnection: null,
    SessionDescription: null,
    IceCandidate: null,
}

wsc.dAmn.BDS.Peer._gum = function() {};

/**
 * Get a webcam and/or microphone stream.
 * @method getUserMedia
 * @param options {Object} Media options
 * @param [success] {Function} Callback to fire on success
 * @param [error] {Function} Callback to fire on failure
 */
wsc.dAmn.BDS.Peer.getUserMedia = function( options, success, error ) {

    return wsc.dAmn.BDS.Peer._gum( options, success, error );

};

if( window.mozRTCPeerConnection ) {
    wsc.dAmn.BDS.Peer.RTC.PeerConnection = mozRTCPeerConnection;
    wsc.dAmn.BDS.Peer.RTC.SessionDescription = mozRTCSessionDescription;
    wsc.dAmn.BDS.Peer.RTC.IceCandidate = mozRTCIceCandidate;
    
    wsc.dAmn.BDS.Peer._gum = function( options, success, error ) {
    
        return navigator.mozGetUserMedia( options, success, error );
    
    };
    
}

if( window.webkitRTCPeerConnection ) {
    wsc.dAmn.BDS.Peer.RTC.PeerConnection = webkitRTCPeerConnection;
    
    wsc.dAmn.BDS.Peer._gum = function( options, success, error ) {
    
        return navigator.webkitGetUserMedia( options, success, error );
    
    };
}

if( window.RTCPeerConnection ) {
    wsc.dAmn.BDS.Peer.RTC.PeerConnection = RTCPeerConnection;
    
    wsc.dAmn.BDS.Peer._gum = function( options, success, error ) {
    
        return navigator.getUserMedia( options, success, error );
    
    };
}

if( window.RTCSessionDescription ) {

    wsc.dAmn.BDS.Peer.RTC.SessionDescription = RTCSessionDescription;
    wsc.dAmn.BDS.Peer.RTC.IceCandidate = RTCIceCandidate;

}




/**
 * lol
 *
 * Make a peer connection.
 */
wsc.dAmn.BDS.Peer.connection = function( user, remote ) {

    if( !wsc.dAmn.BDS.Peer.RTC.PeerConnection )
        return null;
    
    return new wsc.dAmn.BDS.Peer.Connection( user, remote );

};


/**
 * Our own wrapper for RTCPeerConnection objects.
 * 
 * Because boilerplate? Yeah, that.
 *
 * @class wsc.dAmn.BDS.Peer.PeerConnection
 * @constructor
 * @param user {String} User the connection is associated with
 * @param [remote_offer=null] {String} Descriptor for a remote offer.
 */
wsc.dAmn.BDS.Peer.Connection = function( user, remote_offer ) {

    this.user = user;
    this.pc = new wsc.dAmn.BDS.Peer.RTC.PeerConnection( wsc.dAmn.BDS.Peer.peer_options );
    this.offer = '';
    this.remote_offer = remote_offer || null;
    this.responding = this.remote_offer != null;
    this.streamed = false;
    
    this.bindings();
    
    if( this.remote_offer )
        this.set_remote_description( this.remote_offer );

};

/**
 * Set up event bindings for the peer connection.
 * @method bindings
 */
wsc.dAmn.BDS.Peer.Connection.prototype.bindings = function(  ) {

    var pc = this;
    var user = this.user;
    
    // For those things that still do things in ice candidate mode or whatever.
    this.pc.onicecandidate = function( candidate ) {
        wsc.dAmn.BDS.Peer.signal.candidate( wsc.dAmn.BDS.Peer.phone.call.peer( user ), candidate );
    };
    
    // Stub event handler
    var stub = function() {};
    this.onready = stub;
    this.onopen = stub;

};

/**
 * Ready the connection.
 * 
 * Callback fired when the connection is ready to be opened. IE, when a local
 * offer is set. Signalling channels should be used to transfer offer information.
 * 
 * If a remote offer is provided, then the object generates an answer for the
 * offer.
 * 
 * @method ready
 * @param onready {Function} Callback to fire when the connection is ready
 * @param [remote=null] {String} Descriptor for a remote offer
 */
wsc.dAmn.BDS.Peer.Connection.prototype.ready = function( onready, remote ) {

    this.onready = onready || this.onready;
    this.remote_offer = remote || this.remote_offer;
    this.responding = this.remote_offer != null;
    
    if( this.responding ) {
        var onopen = this.onopen;
        var pc = this;
        
        this.onopen = function( ) {
        
            pc.answer();
            pc.onopen = onopen;
        
        };
        
        this.set_remote_description( this.remote_offer );
        return;
    }
    
    this.create_offer();

};

/**
 * Open a connection to a remote peer.
 *
 * @method open
 * @param onopen {Function} Callback to fire when the connection is open
 * @param [offer=null] {String} Descriptor for the remote connection
 */
wsc.dAmn.BDS.Peer.Connection.prototype.open = function( onopen, offer ) {

    if( !this.offer )
        return;
    
    this.remote_offer = offer || this.remote_offer;
    this.onopen = onopen;
    
    if( !this.remote_offer )
        return;
    
    this.set_remote_description( this.remote_offer );

};

/**
 * Close a connection
 * @method close
 */
wsc.dAmn.BDS.Peer.Connection.prototype.close = function(  ) {

    this.pc.close();

};

/**
 * Method usually called on errors.
 * @method onerror
 */
wsc.dAmn.BDS.Peer.Connection.prototype.onerror = function( err ) {

    console.log( '>> Got an error:', '"', err.message, '"', err );

};

/**
 * Add an Ice Candidate to the peer connection.
 * 
 * @method candidate
 * @param candidate {Object} Ice Candidate
 */
wsc.dAmn.BDS.Peer.Connection.prototype.candidate = function( candidate ) {

    this.pc.addIceCandidate( candidate );

};

/**
 * Create an offer for a connection.
 *
 * Helper method.
 * @method create_offer
 */
wsc.dAmn.BDS.Peer.Connection.prototype.create_offer = function(  ) {

    var pc = this;
    
    this.pc.createOffer(
        function( description ) { pc.offer_created( description ); },
        function( err ) { pc.onerror( err ); }
    );

};

/**
 * An offer has been created! Set it as our local description.
 * @method offer_created
 * @param description {String} Descriptor for the offer.
 */
wsc.dAmn.BDS.Peer.Connection.prototype.offer_created = function( description ) {

    this.offer = description;
    var pc = this;
    
    this.pc.setLocalDescription( this.offer , function(  ) { pc.local_description_set(); }, this.onerror );

};

/**
 * Set the descriptor for the remote connection.
 * @method set_remote_description
 * @param description {String} Descriptor for the remote connection
 */
wsc.dAmn.BDS.Peer.Connection.prototype.set_remote_description = function( description ) {

    this.remote_offer = description;
    var pc = this;
    
    this.pc.setRemoteDescription( this.remote_offer , function(  ) { pc.remote_description_set(); }, this.onerror );

};

/**
 * A local description as been set. Handle it!
 * @method local_description_set
 */
wsc.dAmn.BDS.Peer.Connection.prototype.local_description_set = function(  ) {

    this.onready();

};

/**
 * A local description as been set. Handle it!
 * @method remote_description_set
 */
wsc.dAmn.BDS.Peer.Connection.prototype.remote_description_set = function(  ) {

    this.onopen();

};

/**
 * Create an answer for a remote offer.
 * @method answer
 */
wsc.dAmn.BDS.Peer.Connection.prototype.answer = function(  ) {

    var pc = this;
    this.responding = true;
    
    this.pc.createAnswer( 
        function( answer ) { pc.answer_created( answer ); },
        function( err ) { pc.onerror( err ); }
    );

};

/**
 * Answer has been created. Send away, or something.
 * @method answer_created
 * @param answer {String} Descriptor for answer.
 */
wsc.dAmn.BDS.Peer.Connection.prototype.answer_created = function( answer ) {

    this.offer = answer;
    var pc = this;
    
    this.pc.setLocalDescription( this.offer,
        function(  ) { pc.local_description_set(); },
        function( err ) { pc.onerror( err ); }
    );

};
