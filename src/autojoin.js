/**
 * Autojoin extension.
 */
wsc.defaults.Extension.Autojoin = function( client ) {

    var settings = client.autojoin;
    /*
    client.ui.nav.add_button( {
        'icon': 'chat',
        'label': '',
        'title': 'Join your autojoin channels',
        'href': '#autojoin-do',
        'handler': function(  ) {
            for( var i in client.autojoin.channel ) {
                if( !client.autojoin.channel.hasOwnProperty(i) )
                    continue;
                client.join(client.autojoin.channel[i]);
            }
        }
    });
    */
    
    var init = function(  ) {
    
        client.bind('cmd.autojoin', cmd_autojoin);
        //client.ui.on('settings.open', settings.page);
    
    };
    /*
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Autojoin');
        var ul = '<ul>';
        var orig = {};
        orig.ajon = client.autojoin.on;
        orig.chan = client.autojoin.channel;
        
        if( client.autojoin.channel.length == 0 ) {
            ul+= '<li><i>No autojoin channels set</i></li></ul>';
        } else {
            for( var i in client.autojoin.channel ) {
                if( !client.autojoin.channel.hasOwnProperty( i ) )
                    continue;
                ul+= '<li>' + client.autojoin.channel[i] + '</li>';
            }
            ul+= '</ul>';
        }
        
        page.item('Checkbox', {
            'ref': 'eaj',
            'title': 'Autojoin',
            'text': 'Turn on autojoin to automatically join selected channels\
                    when you connect to the chat server.',
            'items': [
                { 'value': 'yes', 'title': 'On', 'selected': orig.ajon }
            ],
            'event': {
                'change': function( event ) {
                    if( event.target.value == 'yes' )
                        client.autojoin.on = event.target.checked;
                },
                'save': function( event ) {
                    orig.ajon = client.autojoin.on;
                    client.config_save();
                },
                'close': function( event ) {
                    client.autojoin.on = orig.ajon;
                }
            }
        });
        
        var imgr = page.item('Items', {
            'ref': 'channelss',
            'title': 'Channels',
            'text': 'Add any channels you want to join automatically when you\
                    connect to the chat server.',
            'items': client.autojoin.channel,
            'prompt': {
                'title': 'Add Channel',
                'label': 'Channel:',
            },
            'event': {
                'up': function( event ) {
                    var swap = event.args.swap;
                    client.autojoin.channel[swap['this'].index] = swap.that.item;
                    client.autojoin.channel[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.autojoin.channel;
                },
                'down': function( event ) {
                    var swap = event.args.swap;
                    client.autojoin.channel[swap['this'].index] = swap.that.item;
                    client.autojoin.channel[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.autojoin.channel;
                },
                'add': function( event ) {
                    var item = client.deform_ns(event.args.item).toLowerCase();
                    var index = client.autojoin.channel.indexOf(item);
                    
                    if( index != -1 )
                        return;
                    
                    client.autojoin.channel.push( item );
                    imgr.options.items = client.autojoin.channel;
                },
                'remove': function( event ) {
                    client.autojoin.channel.splice( event.args.index, 1 );
                    imgr.options.items = client.autojoin.channel;
                },
                'save': function( event ) {
                    orig.chan = client.autojoin.channel;
                    client.config_save();
                },
                'close': function( event ) {
                    client.config_load();
                }
            }
        });
    
    };
    */
    
    settings.join = function(  ) {
        for( var i in client.autojoin.channel ) {
            if( !client.autojoin.channel.hasOwnProperty(i) )
                continue;
            client.join(client.autojoin.channel[i]);
        }
    };
    
    settings.add = function( item ) {
        if( client.autojoin.channel.indexOf( item ) != -1 )
            return false;
        
        client.autojoin.channel.push( item );
        client.config_save();
        return true;
    };
    
    settings.remove = function( item ) {
        var ci = client.autojoin.channel.indexOf( item );
        if( ci == -1 )
            return false;
        
        client.autojoin.channel.splice( ci, 1 );
        client.config_save();
        return true;
    };
    
    var cmd_autojoin = function( cmd ) {
    
        var args = cmd.args.split(' ');
        
        if( !args )
            return;
        
        var subcmd = args.shift().toLowerCase();
        var meth = null;
        var success = '';
        var fail = '';
        var mod = false;
        var chan = client.channel(cmd.ns);
        
        switch( subcmd ) {
        
            case 'add':
                meth = settings.add;
                success = 'Added {item} to your autojoin.';
                fail = 'Already have {item} on your autojoin.';
                break;
            case 'rem':
            case 'remove':
                meth = settings.remove;
                success = 'Removed {item} from your autojoin.';
                fail = item + ' is not on your autojoin list.';
                break;
            case 'on':
                client.trigger( 'log',
                    {
                        name: 'log',
                        ns: 'server:current',
                        sns: '~current',
                        msg: 'Autojoin on'
                    }
                );
                if( !client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = true;
                }
                break;
            case 'off':
                client.trigger( 'log',
                    {
                        name: 'log',
                        ns: 'server:current',
                        sns: '~current',
                        msg: 'Autojoin off'
                    }
                );
                if( client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = false;
                }
                break;
            default:
                settings.join();
                break;
        
        }
        
        var item = '';
        var res = false;
        
        if( meth != null ) {
            for( var i in args ) {
            
                if( !args.hasOwnProperty(i) )
                    continue;
                
                item = client.deform_ns(args[i]).toLowerCase();
                res = meth( item );
                
                client.trigger( 'log',
                    {
                        name: 'log',
                        ns: 'server:current',
                        sns: '~current',
                        msg: replaceAll( ( res ? success : fail ), '{item}', item )
                    }
                );
            
            }
        }
        
        if( mod )
            client.config_save();
    
    };
    
    init();

};

