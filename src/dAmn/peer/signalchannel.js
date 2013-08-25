/**
 * This object represents a signalling channel used for transmitting connection data
 * between two peers.
 *
 * @class wsc.dAmn.BDS.Peer.SignalChannel
 * @constructor
 * @param client {Object} An instance of wsc.
 * @param bds {String} dAmn channel used for this.bds commands
 * @param pns {String} Peer namespace associated with the signals
 * @param application {String} Application name for the thingy
 * @param version {Integer} Application version number
 * @since 0.0.0
 */
wsc.dAmn.BDS.Peer.SignalChannel = function( client, call, bds, pns, application, version ) {
    
    this.user = client.settings.username;
    this.nse = ns ? ',' + ns : '';
    this.bds = bds;
    this.pns = pns;
    this.ns = ns;
    this.app = application;
    this.app_ver = version;
    this.client = client;
    this.call = call;

};

/**
 * Send a command for the current signal channel.
 * 
 * @method command
 * @param command {String} Command to send
 * @param [arg1..n] {String} Arguments
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.command = function(  ) {

    var args = Array.prototype.slice.call(arguments);
    var command = args.shift();
    
    //args.unshift( this.pns );
    var arg = this.pns;
    
    for( var i = 0; i < args.length; i++ ) {
        if( !args.hasOwnProperty(i) || !args[i] )
            continue;
        arg+= ',' + args[i];
    }
    
    this.client.npmsg( this.bds, 'BDS:PEER:' + command + ':' + arg );

};


/**
 * Request a peer connection with a particular user.
 * 
 * @method request
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.request = function( app, ver ) {

    var call = this.call;
    
    call.timeout = setTimeout(
        function( ) {
            call.timedout();
        }, 10000);
    
    this.command( 'REQUEST', this.user, app || this.app, ( ver || this.app_ver ).toString() );

};


/**
 * Acknowledge a PEER request.
 * 
 * @method ack
 * @param user {String} User to acknowledge
 * @param app {String} Application for the connection
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.ack = function( user, app, ver ) {

    this.command( 'ACK', user, app || this.app, ( ver || this.app_ver ).toString() );

};


/**
 * Accept a peer connection request.
 * 
 * @method accept
 * @param auser {String} user to open a peer connection with
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.accept = function( user, app, ver ) {

    this.command( 'ACCEPT', user, app || this.app, ( ver || this.app_ver ).toString() );

};

/**
 * Send a connection offer.
 * 
 * @method offer
 * @param peer {Object} WebRTC peer object
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.offer = function( peer ) {

    this.command( 'OFFER', this.user, peer.user, JSON.stringify( peer.offer ) );

};

/**
 * Send a WebRTC peer answer to open a connection
 * 
 * @method answer
 * @param peer {Object} WebRTC peer object
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.answer = function( peer ) {

    this.command( 'ANSWER', this.user, peer.user, JSON.stringify( peer.offer ) );

};


/**
 * Send a candidate
 * 
 * @method candidate
 * @param peer {Object} WebRTC peer object
 * @param candidate {Object} WebRTC candidate object
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.candidate = function( peer, candidate ) {

    this.command( 'CANDIDATE', this.user, peer.user, JSON.stringify( candidate ) );

};


/**
 * Reject a peer request
 * 
 * @method reject
 * @param ruser {String} Remote user to reject
 * @param [reason] {String} Reason for rejecting the request
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.reject = function( ruser, reason ) {

    this.command( 'REJECT', ruser, reason );

};


/**
 * Close a peer connection
 * 
 * @method close
 * @param cuser {String} User to close the connection for
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.close = function( cuser ) {

    this.command( 'CLOSE', ( cuser || this.user ) );

};


/**
 * Request a list of available connections
 * 
 * @method list
 * @param [channel] {String} Find connections associated with this channel
 */
wsc.dAmn.BDS.Peer.SignalChannel.prototype.list = function( channel ) {

    channel = channel ? ':' + channel : '';
    this.client.npmsg( this.bds, 'BDS:PEER:LIST' + channel );

};
