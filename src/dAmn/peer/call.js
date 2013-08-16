/**
 * Call object. Maybe a bit over the top here.
 * @class wsc.dAmn.BDS.Peer.Call
 * @constructor
 * @param pns {String} Peer namespace the call is associated with
 * @since 0.0.0
 */
wsc.dAmn.BDS.Peer.Call = function( client, bds, pns, user, application ) {

    this.client = client;
    
    this.bds = bds;
    this.ns = '';
    this.pns = pns;
    this.user = user;
    this.app = application;
    this.title = '';
    this.pc = '';
    
    this.peers = {};
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
    
    this.signal = new wsc.dAmn.BDS.Peer.SignalChannel( client, bds, pns );

};

/**
 * Close the call.
 * @method close
 */
wsc.dAmn.BDS.Peer.Call.prototype.close = function(  ) {

    for( var p in this.peers ) {
    
        if( !this.peers.hasOwnProperty( p ) )
            continue;
        
        this.peers[p].conn.close();
    
    }

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
    var peer = wsc.dAmn.BDS.peer_connection( this, user, offer );
    
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
