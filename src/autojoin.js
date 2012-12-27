/**
 * Autojoin extension.
 */
wsc.defaults.Extension.Autojoin = function( client ) {

    var storage = client.storage.folder('away');
    storage.channel = storage.folder('channel');
    var settings = {
        'on': false,
        'channel': [],
        'count': 0
    };
    
    var init = function(  ) {
    
        load();
        save();
        
        //client.bind('cmd.setaway', cmd_setaway);
        //client.bind('cmd.setback', cmd_setback);
        //client.bind('pkt.recv_msg.highlighted', pkt_highlighted);
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Autojoin', true);
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Autojoin',
            'text': 'Add any channels you want to join automatically when you\
                    connect to the chat server.',
        });
    
    };
    
    
    
    // Away message stuff.
    var cmd_setaway = function( event, client ) {
    
        settings.on = true;
        settings.last = {};
        settings.since = new Date();
        settings.reason = event.args;
        
        var method = client.say;
        var announce = replaceAll(
            settings.format.setaway,
            '{reason}',
            settings.reason || '[silent away]'
        );
        
        if( announce.indexOf('/me ') == 0 ) {
            announce = announce.substr(4);
            method = client.action;
        }
        
        
        client.each_channel( function( ns ) {
            method.call( client, ns, announce );
        } );
    
    };
    
    var cmd_setback = function( event, client ) {
        settings.on = false;
        var method = client.say;
        var announce = settings.format.setback;
        
        if( announce.indexOf('/me ') == 0 ) {
            announce = announce.substr(4);
            method = client.action;
        }
        
        client.each_channel( function( ns ) {
            method.call( client, ns, announce );
        } );
    };
    
    var pkt_highlighted = function( event, client ) {
    
        if( !settings.on )
            return;
        
        if( settings.reason.length == 0 )
            return;
        
        if( event.user == client.settings.username )
            return;
        
        if( client.exclude.indexOf( event.sns.toLowerCase() ) != -1 )
            return;
        
        var t = new Date();
        var ns = event.sns.toLowerCase();
        
        if( ns in settings.last )
            if( (t - settings.last[ns]) <= settings.interval )
                return;
        
        var tl = timeLengthString( (t - settings.since) / 1000 );
        var msg = replaceAll( settings.format.away, '{user}', event.user );
        msg = replaceAll( msg, '{timesince}', tl );
        client.say(event.ns, replaceAll( msg, '{reason}', settings.reason ));
        settings.last[ns] = t;
    
    };
    
    
    var load = function(  ) {
    
        settings.on = (storage.get('on', 'true') == 'true');
        settings.count = (parseInt(storage.get('count', '0')));
        
        var tc = null;
        var c = 0;
        for( var i = 0; i < settings.count; i++ ) {
            tc = storage.channel.get( i, null );
            if( tc == null )
                continue;
            c++;
            settings.channel.push(tc);
        }
        
        settings.count = c;
    
    };
    
    var save = function(  ) {
    
        storage.set('on', settings.on.toString());
        storage.set('count', settings.count);
        
        for( var i = 0; i < settings.count; i++ ) {
            storage.channel.remove(i)
        }
        
        if( settings.channel.length == 0 ) {
            storage.set('count', 0);
        } else {
            var c = -1;
            for( var i in settings.channel ) {
                if( !settings.channel.hasOwnProperty(i) )
                    continue;
                c++;
                storage.channel.set( c.toString(), settings.channel[i] );
            }
            c++;
            storage.set('count', c);
        }
    
    };
    
    init();

};

