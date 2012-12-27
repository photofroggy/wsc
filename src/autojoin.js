/**
 * Autojoin extension.
 */
wsc.defaults.Extension.Autojoin = function( client ) {

    var settings = client.autojoin
    
    var init = function(  ) {
    
        client.bind('cmd.autojoin', cmd_autojoin);
        //client.bind('cmd.setback', cmd_setback);
        //client.bind('pkt.recv_msg.highlighted', pkt_highlighted);
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Autojoin', true);
        var ul = '<ul>';
        var orig = {};
        orig.ajon = client.autojoin.on;
        
        if( client.autojoin.count == 0 ) {
            ul+= '<li><i>No autojoin channels set</i></li></ul>';
        } else {
            for( var i in client.autojoin.channel ) {
                if( !client.autojoin.channel.hasOwnProperty( i ) )
                    continue;
                ul+= '<li>' + client.autojoin.channel[i] + '</li>';
            }
            ul+= '</ul>';
        }
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Autojoin',
            'text': 'Add any channels you want to join automatically when you\
                    connect to the chat server.'
        });
        
        /**
         * FORM STUFF HERE!
         */
        
        var uf = page.item('Form', {
            'ref': 'autojoin',
            'wclass': 'boxed-ff-indv',
            'title': 'Channels',
            'text': 'This is the list of channels on your autojoin.\n\nUse the\
                    command <code>/autojoin</code> to edit the list.',
            'fields': [
                ['Checkbox', {
                    'ref': 'enabled',
                    'label': 'Autojoin',
                    'items': [
                        { 'value': 'yes', 'title': 'On', 'selected': orig.ajon }
                    ]
                }],
                ['Text', {
                    'ref': 'channels',
                    'text': ul
                }]
            ],
            'event': {
                'change': function( event ) {},
                'save': function( event ) {}
            }
        });
    
    };
    
    var cmd_autojoin = function( cmd ) {};
    
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
    
    init();

};

