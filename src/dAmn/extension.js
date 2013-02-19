
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
    
    var storage = client.storage.folder('dAmn');
    storage.bds = storage.folder('bds');
    storage.bds.channel = storage.bds.folder('channel');
    storage.emotes = storage.folder('emotes');
    storage.colours = storage.folder('colours');
    var settings = {
        'emotes': {
            'on': false,
            'emote': []
        },
        'colours': {
            'on': false,
            'send': false,
            'msg': '000000',
            'user': '000000'
        }
    };
    
    settings.save = function(  ) {
        
        storage.emotes.set('on', settings.emotes.on);
        storage.colours.set('on', settings.colours.on);
        storage.colours.set('send', settings.colours.send);
        storage.colours.set('msg', settings.colours.msg);
        storage.colours.set('user', settings.colours.user);
        
    };
    
    settings.load = function(  ) {
    
        settings.emotes.on = (storage.emotes.get('on', 'false') == 'true');
        settings.colours.on = (storage.colours.get('on', 'false') == 'true');
        settings.colours.send = (storage.colours.get('send', 'false') == 'true');
        settings.colours.msg = storage.colours.get('msg', '');
        settings.colours.user = storage.colours.get('user', '');
    
    };
    
    settings.load();
    settings.save();
    
    client.protocol.extend_maps({
        'dAmnServer': ['version']
    });
    
    client.protocol.extend_messages({
        'dAmnServer': ['<span class="servermsg">** Connected to dAmnServer {version} *</span>', false, true ]
    });
    
    client.protocol.mparser = new wsc.dAmn.TablumpParser;
    
    client.flow.dAmnServer = client.flow.chatserver;
    
    client.exclude.add( 'chat:devart' );
    
    client.ui.on( 'userinfo.before', function( event, ui ) {
        event.user.avatar = wsc.dAmn.avatar.link(event.user.name, event.user.member.usericon);
        
        if( event.user.member.realname )
            event.user.info.push(event.user.member.realname);
        
        if( event.user.member.typename )
            event.user.info.push(event.user.member.typename);
    });
    
    client.ui.on( 'settings.save', settings.save );
    client.ui.on( 'settings.close', settings.load );
    
    client.ui.on( 'log_whois.before', function( event, ui ) {
        event.avatar = wsc.dAmn.avatar.link( event.raw.username, event.raw.usericon );
        event.username = event.raw.symbol + '<b><a href="http://' + event.raw.username + '.deviantart.com/">' + event.raw.username + '</a></b>';
        
        if( event.raw.realname )
            event.info.push(event.raw.realname);
        
        if( event.raw.typename )
            event.info.push(event.raw.typename);
    } );
    
    wsc.dAmn.BDS( client, storage.bds, settings );
    wsc.dAmn.BDS.Link( client, storage.bds, settings );
    wsc.dAmn.BDS.Channel( client, storage.bds, settings );
    wsc.dAmn.Colours( client, storage.colours, settings );
    wsc.dAmn.Emotes( client, storage.emotes, settings );

};
