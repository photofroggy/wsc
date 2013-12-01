

wsc.dAmn.wsc.Colours = function( client, storage, ext ) {
    
    ext.colours.send_colour = function( data, done ) {
        if( !ext.colours.send ) {
            done( data );
            return;
        }
        
        data.input+= '<abbr title="colors:' + ext.colours.user + ':' + ext.colours.msg + '"></abbr>';
        done( data );
    };
    
    client.middle('send.msg', ext.colours.send_colour);
    client.middle('send.action', ext.colours.send_colour);

};


wsc.dAmn.chatterbox.Colours = function( client, ui, ext ) {

    var settings = client.ext.dAmn;
    ext.colours.page = null;
    
    
    ext.colours.configure_page = function( event, ui ) {
    
        var page = event.settings.page('Colours');
        ext.colours.page = page;
        
        var orig = {};
        orig.on = settings.colours.on;
        orig.send = settings.colours.send;
        orig.msg = settings.colours.msg;
        orig.user = settings.colours.user;
        
        page.item('Form', {
            'ref': 'switch',
            'title': 'Enable Chromacity Colours',
            'text': 'Here you can turn chromacity colours on and off.\n\nYou\
                    can choose to parse other people\'s colours, and send your\
                    own colours.',
            'fields': [
                ['Checkbox', {
                    'ref': 'enabled',
                    'items': [
                        { 'value': 'parse', 'title': 'Parse colours', 'selected': orig.on },
                        { 'value': 'send', 'title': 'Send colours', 'selected': orig.send }
                    ]
                }]
            ],
            'event': {
                'change': function( event ) {
                    settings.colours.on = (event.data.enabled.indexOf('parse') != -1);
                    settings.colours.send = (event.data.enabled.indexOf('send') != -1);
                },
                'save': function( event ) {
                    orig.on = settings.colours.on;
                    orig.send = settings.colours.send;
                },
                'close': function( event ) {
                    settings.colours.on = orig.on;
                    settings.colours.send = orig.send;
                }
            }
        });
        
        page.item('Form', {
            'ref': 'colours',
            'title': 'Custom Colours',
            'text': 'Here you can set your own username colour and message colour.',
            'fields': [
                ['Colour', {
                    'ref': 'usr',
                    'label': 'Username Colour',
                    'default': '#' + orig.user
                }],
                ['Colour', {
                    'ref': 'msg',
                    'label': 'Message Colour',
                    'default': '#' + orig.msg
                }]
            ],
            'event': {
                'change': function( event ) {
                    settings.colours.user = event.data.usr.substr(1).toUpperCase();
                    settings.colours.msg = event.data.msg.substr(1).toUpperCase();
                },
                'save': function( event ) {
                    orig.user = settings.colours.user;
                    orig.msg = settings.colours.msg;
                },
                'close': function( event ) {
                    settings.colours.user = orig.user;
                    settings.colours.msg = orig.msg;
                    ext.colours.page = null;
                },
            }
        });
    
    };
    
    ext.colours.parse_colour = function( event ) {
        if( !settings.colours.on )
            return;
        
        var abbr = event.item.find('abbr');
        
        if( abbr.length == 0 )
            return;
        
        abbr = abbr.last();
        var m = abbr.prop('title').match( /colors:([A-F0-9]{6}):([A-F0-9]{6})/ );
        
        if( m == null )
            return;
        
        abbr.remove();
        event.item.find('.cmsg, .caction').css('color', '#' + m[2]);
        event.item.find('.cmsg.user, .caction.user').css('color', '#' + m[1]);
    };
    
    ui.on('settings.open', ext.colours.configure_page);
    ui.on('log_item.after', ext.colours.parse_colour);

};
