/**
 * Call object. Maybe a bit over the top here.
 * @class wsc.dAmn.BDS.Peer.Call
 * @constructor
 * @param pns {String} Peer namespace the call is associated with
 * @since 0.0.0
 */
wsc.dAmn.BDS.Peer.Call = function( client, bds, pns, user, application, version, constraints, stream ) {

    this.client = client;
    
    this.bds = bds;
    this.ns = '';
    this.pns = pns;
    this.user = user;
    this.app = application;
    this.app_ver = version;
    this.title = '';
    this.pc = '';
    this.localstream = null;
    this.localurl = null;
    this.constraints = constraints;
    this.peers = {};
    this.closing = false;
    
    this.group = user.substr(0, 5) == 'chat:';
    
    var boom = this.pns.split(':');
    var h = boom.shift();
    
    if( h == 'chat' ) {
        this.ns = 'chat:' + boom.shift();
    } else if( h == 'pchat' ) {
        this.ns = 'pchat:' + boom.shift() + ':' + boom.shift();
    }
    
    if( boom[0] == 'pc' ) {
        boom.shift();
        this.pc = boom.shift();
    }
    
    this.title = boom.join(':');
    this.group = wsc.dAmn.BDS.Peer.bots.indexOf( this.ns.substr( 1 ) ) != -1;
    
    this.signal = new wsc.dAmn.BDS.Peer.SignalChannel( client, bds, pns, application, version );
    this.onlocalstream = function(){};
    
    if( stream ) {
        this.localstream = stream;
        this.localurl = URL.createObjectURL( stream );
    }
    
    this.onclose = function() {};
    
    var call = this;
    
    this._closed = function( ) {
        call.onclose();
    };

};


/**
 * Set the local stream.
 * 
 * @method set_local_stream
 * @param stream {Object} Local media stream
 */
wsc.dAmn.BDS.Peer.Call.prototype.set_local_stream = function( stream ) {

    this.localstream = stream;
    this.localurl = URL.createObjectURL( stream );
    this.onlocalstream();

};


/**
 * Close the call.
 * @method close
 */
wsc.dAmn.BDS.Peer.Call.prototype.close = function(  ) {

    if( this.closing )
        return;
    
    this.closing = true;
    this.signal.close( );
    
    for( var p in this.peers ) {
    
        if( !this.peers.hasOwnProperty( p ) )
            continue;
        
        this.remove( p );
    
    }
    
    this.client.bds.peer.remove( this.pns );
    this._closed();
    this.closing = false;

};

/**
 * Add a new peer to the call.
 * @method new_peer
 * @param user {String} Name of the peer
 * @return {Object} New peer connection object or null if failed
 */
wsc.dAmn.BDS.Peer.Call.prototype.new_peer = function( user, offer ) {

    /*
    if( !this.group ) {
    
        if( this.dans.substr(1).toLowerCase() != user.toLowerCase() )
            return null;
    
    }
    */
    var peer = wsc.dAmn.BDS.peer_connection( this, user, offer, this.constraints, this.localstream );
    
    this.peers[user] = peer;
    
    return peer;

};

/**
 * Get a peer.
 * @method peer
 * @param peer {String} Name of the peer
 * @return {Object} Peer connection object or null
 */
wsc.dAmn.BDS.Peer.Call.prototype.peer = function( peer ) {

    return this.peers[peer] || null;

};


/**
 * Remove a peer from the call.
 *
 * @method remove
 * @param user {String} Name of the peer
 */
wsc.dAmn.BDS.Peer.Call.prototype.remove = function( user ) {

    var peer = this.peer( user );
    
    if( !peer )
        return;
    
    delete this.peers[ peer ];
    peer.close();

};

