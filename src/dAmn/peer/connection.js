/**
 * lol
 *
 * Make a peer connection.
 */
wsc.dAmn.BDS.peer_connection = function( call, user, remote, constraints ) {

    if( !wsc.dAmn.BDS.Peer.RTC.PeerConnection )
        return null;
    
    return new wsc.dAmn.BDS.Peer.Connection( call, user, remote, constraints );

};


/**
 * Our own wrapper for RTCPeerConnection objects.
 * 
 * Because boilerplate? Yeah, that.
 *
 * @class wsc.dAmn.BDS.Peer.Connection
 * @constructor
 * @param user {String} User the connection is associated with
 * @param [remote_offer=null] {String} Descriptor for a remote offer.
 * @since 0.0.0
 */
wsc.dAmn.BDS.Peer.Connection = function( call, user, remote_offer, constraints, stream ) {

    this.call = call;
    this.user = user;
    this.pc = new wsc.dAmn.BDS.Peer.RTC.PeerConnection( wsc.dAmn.BDS.Peer.peer_options, constraints );
    this.offer = '';
    this.remote_offer = remote_offer || null;
    this.remote_set = false;
    this.responding = this.remote_offer != null;
    this.streamed = false;
    this.remote_stream = null;
    this.stream = null;
    this.connected = false;
    
    this.bindings();
    
    if( this.remote_offer )
        this.set_remote_description( this.remote_offer );
    
    if( stream )
        this.set_local_stream( stream );

};

/**
 * Set up event bindings for the peer connection.
 * @method bindings
 */
wsc.dAmn.BDS.Peer.Connection.prototype.bindings = function(  ) {

    var pc = this;
    var user = this.user;
    
    // For those things that still do things in ice candidate mode or whatever.
    this.pc.onicecandidate = function( event ) {
        pc.call.signal.candidate( pc, event.candidate );
    };
    
    // Do something when a remote stream arrives.
    this.pc.onaddstream = function( event ) {
        pc.set_remote_stream( event );
    };
    
    // Negotiation is needed!
    this.pc.onnegotiationneeded = function( event ) {
        pc.onnegotiationneeded( event );
    };
    
    // Connection closed
    this.pc.onclose = function(  ) {
        pc._closed();
    };
    
    // Stub event handler
    var stub = function() {};
    this.onready = stub;
    this.onopen = stub;
    this.onclose = stub;
    this.onreject = stub;
    this.onremotedescription = stub;
    this.onlocaldescription = stub;
    this.onicecompleted = stub;
    this.onremotestream = stub;
    this.onlocalstream = stub;
    this.onnegotiationneeded = stub;

};


/**
 * Close a connection
 * @method close
 */
wsc.dAmn.BDS.Peer.Connection.prototype.close = function(  ) {

    try {
        this.pc.close();
    } catch( err ) {
    }
    this._closed();

};

wsc.dAmn.BDS.Peer.Connection.prototype._closed = function( ) {
    
    this.onclose();
    
};


/**
 * Peer request rejected.
 * 
 * @method reject
 * @param reason {String} Reason given for rejecting the request
 */
wsc.dAmn.BDS.Peer.Connection.prototype.reject = function( reason ) {

    console.log( 'reject',this.user,reason );
    //this.call.remove( this.user );
    this.onreject( reason );

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

    //if( !this.connected )
    //    return;
    this.pc.addIceCandidate( candidate );

};


/**
 * Called when ice gathering is done.
 * 
 * @method ice_completed
 */
wsc.dAmn.BDS.Peer.Connection.prototype.ice_completed = function(  ) {

    // this method is here in case it turns out that more needs to be done.
    // rather than only having onicecompleted, I mean.
    this.onicecompleted();

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
    
    this.pc.setLocalDescription( this.offer , function(  ) { pc.local_description_set( 0 ); }, this.onerror );

};

/**
 * Set the descriptor for the remote connection.
 * @method set_remote_description
 * @param description {String} Descriptor for the remote connection
 * @param type {Integer} Offer (0) or answer (1)
 */
wsc.dAmn.BDS.Peer.Connection.prototype.set_remote_description = function( description, type ) {

    this.remote_offer = description;
    this.responding = this.pc.signalingState == 'stable';
    var pc = this;
    
    this.pc.setRemoteDescription( this.remote_offer , function(  ) { pc.remote_description_set( type ); }, this.onerror );

};

/**
 * A local description as been set. Handle it!
 * @method local_description_set
 * @param type {Integer} Offer (0) or answer (1)
 */
wsc.dAmn.BDS.Peer.Connection.prototype.local_description_set = function( type ) {
    
    if( this.responding ) {
        this.connected = true;
        this.responding = false;
    }
    
    this.onlocaldescription( type );

};

/**
 * A local description as been set. Handle it!
 * @method remote_description_set
 * @param type {Integer} Offer (0) or answer (1)
 */
wsc.dAmn.BDS.Peer.Connection.prototype.remote_description_set = function( type ) {

    this.responding = type == 0;
    this.remote_set = true;
    
    if( !this.responding ) {
        this.connected = true;
    }
    
    this.onremotedescription( type );

};

/**
 * Create an answer for a remote offer.
 * @method answer
 */
wsc.dAmn.BDS.Peer.Connection.prototype.create_answer = function(  ) {

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
        function(  ) { pc.local_description_set( 1 ); },
        function( err ) { pc.onerror( err ); }
    );

};

/**
 * Do something with the remote stream when it arrives.
 * 
 * @method set_remote_stream
 * @param event {Object} Event data
 */
wsc.dAmn.BDS.Peer.Connection.prototype.set_remote_stream = function( event ) {

    this.remote_stream = event.stream;
    this.onremotestream();

};

/**
 * Store the local media stream and add it to the peer connection.
 * 
 * @method set_local_stream
 * @param stream {Object} Local media stream
 */
wsc.dAmn.BDS.Peer.Connection.prototype.set_local_stream = function( stream ) {

    this.pc.addStream( stream );
    this.stream = stream;
    this.onlocalstream();

};


/**
 * Keep responding to offers and answers as though your life depends on it.
 *
 * @method persist
 */
wsc.dAmn.BDS.Peer.Connection.prototype.persist = function(  ) {

    var peer = this;
    var call = this.call;
    
    // Send an answer to an offer.
    peer.onremotedescription = function( type ) {
        if( type != 0 )
            return;
        
        peer.create_answer();
    };
    
    // Send our offers and answers
    peer.onlocaldescription = function( type ) {
        switch( type ) {
            case 0:
                call.signal.offer( peer );
                break;
            case 1:
                call.signal.answer( peer );
                break;
            default:
                break;
        }    
    };
    
    // Make it happen.
    peer.onnegotiationneeded = function(  ) {
        peer.create_offer();
    };

};