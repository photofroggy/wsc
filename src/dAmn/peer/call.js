/**
 * Call object. Maybe a bit over the top here.
 * @class wsc.dAmn.BDS.Peer.Call
 * @constructor
 * @param phone {Object} Phone the call is being made on
 * @param bds {String} dAmn channel being used for bds messages
 * @param ns {String} dAmn channel the call is connected to
 * @param pns {String} Peer namespace the call is associated with
 * @param [user=pns.user] {String} User who started the call
 * @since 0.0.0
 */
wsc.dAmn.BDS.Peer.Call = function( phone, bds, ns, pns, user ) {

    this.phone = phone;
    this.bds = bds;
    this.pns = pns;
    this.ns = ns;
    this.user = '';
    this.peers = {};
    
    this.spns = this.pns.split('-');
    this.ans = this.spns.shift();
    this.rns = this.spns.join(' ');
    this.group = wsc.dAmn.BDS.Peer.bots.indexOf( this.ns.substr( 1 ) ) != -1;
    
    this.user = user || this.spns[0].substr(1);
    
    this.dans = phone.client.deform_ns( this.ans );
    
    this.signal = new wsc.dAmn.BDS.Peer.SignalChannel( this.phone.client, bds, pns, ns );
    
    if( this.phone.stream == null ) {
        this.phone.get_media();
    }

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
 * @param pns {String} Peer namespace for the call
 * @param user {String} Name of the peer
 * @return {Object} New peer connection object or null if failed
 */
wsc.dAmn.BDS.Peer.Call.prototype.new_peer = function( pns, user ) {
    
    if( this.pns != pns )
        return null;
    
    if( !this.group ) {
    
        if( this.dans.substr(1).toLowerCase() != user.toLowerCase() )
            return null;
    
    }
    
    var peer = {
        user: user,
        conn: wsc.dAmn.BDS.peer_connection( user ),
        stream: null,
        url: null
    };
    
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
