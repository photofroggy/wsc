/**
 * webRTC objects
 */
wsc.dAmn.BDS.Peer.RTC = {
    PeerConnection: null,
    SessionDescription: null,
    IceCandidate: null,
}

wsc.dAmn.BDS.Peer._gum = function() {};

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