
/**
 * The dAmn extension makes the client work with dAmn. This extension also implements
 * various other features to improve on the user experience.
 * 
 * @class dAmn.Extension
 * @constructor
 */
wsc.dAmn.Extension = function( client ) {

    client.settings.client = 'dAmnClient';
    client.settings.clientver = '0.3';
    client.settings.domain = 'deviantart.com';
    client.settings.agent+= ' wsc/dAmn/' + wsc.dAmn.VERSION;
    
    var storage = client.storage.folder('dAmn');
    storage.bds = storage.folder('bds');
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
    /*
    client.protocol.extend_messages({
        'dAmnServer': ['<span class="servermsg">** Connected to dAmnServer {version} *</span>', false, true ]
    });
    */
    client.protocol.mparser = new wsc.dAmn.TablumpParser;
    
    client.flow.dAmnServer = client.flow.chatserver;
    
    client.exclude.add( 'chat:devart' );
    client.exclude.add( 'chat:damnidlers' );
    /*
    client.ui.middle( 'user.hover', function( data, done ) {
        data.avatar = wsc.dAmn.avatar.link(data.name, data.member.usericon);
        
        if( data.member.realname && data.info.indexOf( data.member.realname ) == -1 )
            data.info.push(data.member.realname);
        
        if( data.member.typename && data.info.indexOf( data.member.typename ) == -1 )
            data.info.push(data.member.typename);
        
        done( data );
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
    } );*/
    
    /**
     * Implements the Data Sharing Protocol.
     * 
     * @method BDS
     */
    wsc.dAmn.BDS( client, storage.bds, settings );
    
    /**
     * Implements Data Sharing Links. Links are private chats between two clients that
     * are used for exchanging information autonomously.
     *
     * @method BDS.Link
     */
    wsc.dAmn.BDS.Link( client, storage.bds, settings );
    
    /**
     * Implements Data Sharing Peers. BDS Peers are signalling channels for
     * peer to peer WebRTC connections.
     * 
     * @method BDS.Peer
     */
    wsc.dAmn.BDS.Peer( client, storage.bds, settings );
    
    /**
     * Implements custom colours.
     * 
     * @method Colours
     */
    //wsc.dAmn.Colours( client, storage.colours, settings );
    
    /**
     * Implements custom emoticons.
     *
     * @method Emotes
     */
    //wsc.dAmn.Emotes( client, storage.emotes, settings );
    
    /**
     * Implements Sta.sh thumbnails.
     * 
     * @method Stash
     */
    //wsc.dAmn.Stash( client, storage.emotes, settings );

};
