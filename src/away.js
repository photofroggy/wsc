/**
 * Away extension.
 */
wsc.defaults.Extension.Away = function( client, ext ) {

    var storage = client.storage.folder('away');
    ext.away = {
        'on': false,
        'reason': '',
        'last': {},
        'since': 0,
        'interval': 60000,
        'format': {
            'setaway': '/me is away: {reason}',
            'setback': '/me is back',
            'away': "{user}: I've been away for {timesince}. Reason: {reason}"
        }
    };
    client.away = ext.away;
    
    var init = function(  ) {
    
        ext.away.load();
        ext.away.save();
        
        client.bind('cmd.setaway', cmd_setaway);
        client.bind('cmd.setback', cmd_setback);
        client.bind('pkt.recv_msg', msg_pkt);
        client.bind('pkt.recv_action', msg_pkt);
    
    };
    
    ext.away.away = function( reason ) {
    
        ext.away.on = true;
        ext.away.last = {};
        ext.away.since = new Date();
        ext.away.reason = reason || '';
        
        var method = client.say;
        var announce = replaceAll(
            ext.away.format.setaway,
            '{reason}',
            ext.away.reason || '[silent away]'
        );
        
        if( announce.indexOf('/me ') == 0 ) {
            announce = announce.substr(4);
            method = client.action;
        }
        
        
        client.each_channel( function( ns ) {
            method.call( client, ns, announce );
        } );
        
        client.trigger( 'ext.away.away', {
            name: 'ext.away.away',
            reason: ext.away.reason || '[silent away]'
        });
    
    };
    
    ext.away.back = function(  ) {
    
        if( !ext.away.on )
            return;
        
        ext.away.on = false;
        var method = client.say;
        var announce = ext.away.format.setback;
        
        if( announce.indexOf('/me ') == 0 ) {
            announce = announce.substr(4);
            method = client.action;
        }
        
        client.each_channel( function( ns ) {
            method.call( client, ns, announce );
        } );
        
        client.trigger( 'ext.away.back', { name: 'ext.away.back' } );
    
    };
    
    // Away message stuff.
    var cmd_setaway = function( event, client ) {
    
        ext.away.away( event.args );
    
    };
    
    var cmd_setback = function( event, client ) {
    
        ext.away.back();
    };
    
    var msg_pkt = function( event ) {
    
        if( !ext.away.on )
            return;
        
        if( ext.away.reason.length == 0 )
            return;
        
        if( client.exclude.contains( event.ns ) )
            return;
        
        var eu = event.user.toLowerCase();
        var cu = client.settings.username.toLowerCase();
        
        if( eu == cu )
            return;
        
        if( event.message.text().toLowerCase().indexOf( cu ) == -1 )
            return;
        
        var t = new Date();
        var ns = event.sns.toLowerCase();
        
        if( ns in ext.away.last )
            if( (t - ext.away.last[ns]) <= ext.away.interval )
                return;
        
        var tl = timeLengthString( (t - ext.away.since) / 1000 );
        var msg = replaceAll( ext.away.format.away, '{user}', event.user );
        msg = replaceAll( msg, '{timesince}', tl );
        client.say(event.ns, replaceAll( msg, '{reason}', ext.away.reason ));
        ext.away.last[ns] = t;
    
    };
    
    
    ext.away.load = function(  ) {
    
        ext.away.format.setaway = storage.get('setaway', '/me is away: {reason}');
        ext.away.format.setback = storage.get('setback', '/me is back');
        ext.away.format.away = storage.get('away', '{user}: I\'ve been away for {timesince}. Reason: {reason}');
        ext.away.interval = parseInt(storage.get('interval', 60000));
    
    };
    
    ext.away.save = function(  ) {
    
        storage.set('interval', ext.away.interval);
        storage.set('setaway', ext.away.format.setaway);
        storage.set('setback', ext.away.format.setback);
        storage.set('away', ext.away.format.away);
    
    };
    
    init();

};

