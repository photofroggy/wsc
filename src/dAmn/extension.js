
/**
 * dAmn extension makes the client work with dAmn.
 * 
 * @class Extension
 * @constructor
 */
wsc.dAmn.Extension = function( client ) {

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
    
    client.protocol.tablumps.extend(wsc.dAmn.Tablumps());
    
    client.flow.dAmnServer = client.flow.chatserver;
    
    client.ui.on( 'userinfo.before', function( event, ui ) {
        event.user.avatar = wsc.dAmn.avatar.link(event.user.name, event.user.member.usericon);
        
        if( event.user.member.realname )
            event.user.info.push(event.user.member.realname);
        
        if( event.user.member.typename )
            event.user.info.push(event.user.member.typename);
    });

};
