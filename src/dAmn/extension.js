
/**
 * dAmn extension makes the client work with dAmn.
 * 
 * @class Extension
 * @constructor
 */
wsc.dAmn.Extension = function( client ) {

    var storage = client.storage.folder('dAmn');
    client.settings.client = 'dAmnClient';
    client.settings.clientver = '0.3';
    client.settings.domain = 'deviantart.com';
    client.settings.agent+= ' wsc/dAmn/' + wsc.dAmn.VERSION;
    
    client.protocol.extend_maps({
        'dAmnServer': ['version']
    });
    
    client.protocol.extend_messages({
        'dAmnServer': ['<span class="servermsg">** Connected to dAmnServer {version} *</span>', false, true ]
    });
    
    client.protocol.mparser = new wsc.dAmn.TablumpParser;
    
    client.flow.dAmnServer = client.flow.chatserver;
    
    client.exclude.push( '#devart' );
    
    client.ui.on( 'userinfo.before', function( event, ui ) {
        event.user.avatar = wsc.dAmn.avatar.link(event.user.name, event.user.member.usericon);
        
        if( event.user.member.realname )
            event.user.info.push(event.user.member.realname);
        
        if( event.user.member.typename )
            event.user.info.push(event.user.member.typename);
    });
    
    client.ui.on( 'log_whois.before', function( event, ui ) {
        event.avatar = wsc.dAmn.avatar.link( event.raw.username, event.raw.usericon );
        event.username = event.raw.symbol + '<b><a href="http://' + event.raw.username + '.deviantart.com/">' + event.raw.username + '</a></b>';
        
        if( event.raw.realname )
            event.info.push(event.raw.realname);
        
        if( event.raw.typename )
            event.info.push(event.raw.typename);
    } );

};
