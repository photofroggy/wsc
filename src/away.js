/**
 * Away extension.
 */
wsc.defaults.Extension.Away = function( client ) {

    var storage = client.storage.folder('away');
    var settings = {
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
    client.away = settings;
    
    var init = function(  ) {
    
        load();
        save();
        
        client.bind('cmd.setaway', cmd_setaway);
        client.bind('cmd.setback', cmd_setback);
        client.ui.on('tabbed', pkt_highlighted);
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var strips = function( data ) {
            data = replaceAll(data, '<', '&lt;');
            data = replaceAll(data, '>', '&gt;');
            data = replaceAll(data, '"', '&quot;');
            return data;
        };
        var unstrips = function( data ) {
            data = replaceAll(data, '&lt;', '<');
            data = replaceAll(data, '&gt;', '>');
            data = replaceAll(data, '&quot;', '"');
            return data;
        };
        var page = event.settings.page('Away');
        var orig = {};        
        orig.away = settings.format.away;
        orig.sa = settings.format.setaway;
        orig.sb = settings.format.setback;
        orig.intr = settings.interval;
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Away Messages',
            'text': 'Use away messages when you are away from the chats.\n\n\
                    You can set yourself away using the \
                    <code>/setaway [reason]</code> command. When you get back,\
                    use <code>/setback</code>. While you are away, the client\
                    will automatically respond when people try to talk to you,\
                    telling them you\'re away.',
        });
        
        page.item('Form', {
            'ref': 'msgs',
            'title': 'Messages',
            'text': 'Here you can set the messages displayed when you set\
                    yourself away or back. You can also change the away message\
                    format.',
            'hint': '<b>{user}</b><br/>This is replaced with the username of the person trying to talk to you\n\n<b>{reason}</b>\
                    <br/>This is replaced by your reason for being away.\n\n<b>{timesince}</b>\
                    <br/>Use this to show how long you have been away for.',
            'fields': [
                ['Textfield', {
                    'ref': 'away',
                    'label': 'Away',
                    'default': strips(orig.away)
                }],
                ['Textfield', {
                    'ref': 'setaway',
                    'label': 'Setaway',
                    'default': strips(orig.sa)
                }],
                ['Textfield', {
                    'ref': 'setback',
                    'label': 'Setback',
                    'default': strips(orig.sb)
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.format.away = unstrips(event.data.away);
                    settings.format.setaway = unstrips(event.data.setaway);
                    settings.format.setback = unstrips(event.data.setback);
                    save();
                }
            }
        });
        
        page.item('Form', {
            'ref': 'interval',
            'title': 'Message Interval',
            'text': 'Here you can set the amount of time to wait before \
                    displaying another away message. The interval is in seconds.',
            'fields': [
                ['Textfield', {
                    'ref': 'interval',
                    'label': 'Interval',
                    'default': (orig.intr / 1000).toString()
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.interval = parseInt(event.data.interval) * 1000;
                    save();
                }
            }
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
        
        client.ui.control.add_state({
            'ref': 'away',
            'label': 'Away, reason: <i>' + ( settings.reason || '[silent away]' ) + '</i>'
        });
    
    };
    
    var cmd_setback = function( event, client ) {
    
        if( !settings.on )
            return;
        
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
        
        client.ui.control.rem_state('away');
    };
    
    var pkt_highlighted = function( event ) {
    
        if( !settings.on )
            return;
        
        if( settings.reason.length == 0 )
            return;
        
        if( event.user == client.settings.username )
            return;
        
        if( client.exclude.contains( event.ns ) )
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
    
        settings.format.setaway = storage.get('setaway', '/me is away: {reason}');
        settings.format.setback = storage.get('setback', '/me is back');
        settings.format.away = storage.get('away', '{user}: I\'ve been away for {timesince}. Reason: {reason}');
        settings.interval = parseInt(storage.get('interval', 60000));
    
    };
    
    var save = function(  ) {
    
        storage.set('interval', settings.interval);
        storage.set('setaway', settings.format.setaway);
        storage.set('setback', settings.format.setback);
        storage.set('away', settings.format.away);
    
    };
    
    init();

};

