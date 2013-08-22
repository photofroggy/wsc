/**
 * webRTC objects
 */
wsc.dAmn.BDS.Peer.RTC = {
    PeerConnection: null,
    SessionDescription: null,
    IceCandidate: null,
}

if( window.mozRTCPeerConnection ) {
    wsc.dAmn.BDS.Peer.RTC.PeerConnection = mozRTCPeerConnection;
    wsc.dAmn.BDS.Peer.RTC.SessionDescription = mozRTCSessionDescription;
    wsc.dAmn.BDS.Peer.RTC.IceCandidate = mozRTCIceCandidate;
}

if( window.webkitRTCPeerConnection ) {
    wsc.dAmn.BDS.Peer.RTC.PeerConnection = webkitRTCPeerConnection;
}

if( window.RTCPeerConnection && !wsc.dAmn.BDS.Peer.RTC.PeerConnection ) {
    wsc.dAmn.BDS.Peer.RTC.PeerConnection = RTCPeerConnection;
}

if( window.RTCSessionDescription ) {

    wsc.dAmn.BDS.Peer.RTC.SessionDescription = RTCSessionDescription;
    wsc.dAmn.BDS.Peer.RTC.IceCandidate = RTCIceCandidate;

}