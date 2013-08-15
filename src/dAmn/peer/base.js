
/**
 * Implements BDS Peer.
 * 
 * This allows the client to negotiate and open peer to peer network
 * connections with other clients. These connections can be used to stream
 * video, audio, and, in the future, data.
 * 
 * @class dAmn.BDS.Peer
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
        client.bind( 'BDS.PEER.CANDIDATE', function( event, client ) { handle.signal.candidate( event, client ); } );
        client.bind( 'BDS.PEER.CLOSE', function( event, client ) { handle.signal.close( event, client ); } );
        // dAmn events.
        // client.bind('pkt.join', handler.join);
        // client.bind('pkt.part', handler.part);
        // client.bind('pkt.recv_join', handler.recv_join);
        // client.bind('pkt.recv_part', handler.recv_part);

    };
    
    //init();

};


/**
 * Array containing bots used to manage calls.
 * 
 * TODO: change things so that instead of using this, the extension recognises bots in
 * the privilege class ServiceBots. If implementing things so that normal bots can
 * declare themselves as service bots for specific channels, then take that into account
 * as well, though that would probably be done in wsc, not here.
 */
wsc.dAmn.BDS.Peer.bots = [ 'botdom', 'damnphone' ];


/**
 * Options for peer candidates.
 */
wsc.dAmn.BDS.Peer.peer_options = {
    iceServers: [
        { url: 'stun:stun.l.google.com:19302' }
    ]
};


/**
 * Holds a reference to the phone.
 */
wsc.dAmn.BDS.Peer.phone = null;


/**
 * Signaling channel object
 */
wsc.dAmn.BDS.Peer.signal = null;


/**
 * Object detailing the local peer.
 */
wsc.dAmn.BDS.Peer.local = {};
wsc.dAmn.BDS.Peer.local.stream = null;
wsc.dAmn.BDS.Peer.local.url = null;

/**
 * Objects detailing remote peers.
 */
wsc.dAmn.BDS.Peer.remote = {};
wsc.dAmn.BDS.Peer.remote._empty = {
    video: null,
    audio: null,
    conn: null
};


/**
 * Current channel stuff.
 */
wsc.dAmn.BDS.Peer.chan = {};
wsc.dAmn.BDS.Peer.chan.group = false;
wsc.dAmn.BDS.Peer.chan.calls = [];

