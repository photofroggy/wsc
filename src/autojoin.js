/**
 * Autojoin extension.
 */
wsc.defaults.Extension.Autojoin = function( client, ext ) {

    ext.autojoin = {
        on: false,
        channel: []
    };
    
    var fresh_client = true;
    var storage = client.storage.folder('autojoin');
    
    var init = function(  ) {
    
        ext.autojoin.load();
        ext.autojoin.save();
        
        client.bind('cmd.autojoin', cmd_autojoin);
        client.bind('pkt.login', on_login);
    
    };
    
    ext.autojoin.load = function(  ) {
    
        ext.autojoin.on = ( storage.get('on', 'true') == 'true' );
        ext.autojoin.channel = JSON.parse( storage.get('channel', '[]') );
    
    };
    
    ext.autojoin.save = function(  ) {
    
        storage.set('on', ext.autojoin.on.toString());
        storage.set('channel', JSON.stringify( ext.autojoin.channel ));
    
    };
    
    ext.autojoin.join = function(  ) {
        for( var i in ext.autojoin.channel ) {
            if( !ext.autojoin.channel.hasOwnProperty(i) )
                continue;
            client.join(ext.autojoin.channel[i]);
        }
    };
    
    ext.autojoin.add = function( item ) {
        if( ext.autojoin.channel.indexOf( item ) != -1 )
            return false;
        
        ext.autojoin.channel.push( item );
        ext.autojoin.save();
        return true;
    };
    
    ext.autojoin.remove = function( item ) {
        var ci = ext.autojoin.channel.indexOf( item );
        if( ci == -1 )
            return false;
        
        ext.autojoin.channel.splice( ci, 1 );
        ext.autojoin.save();
        return true;
    };
    
    var on_login = function( event, client ) {
    
        if( event.e != 'ok' )
            return;
        
        if ( fresh_client ) {
            client.join( client.settings.autojoin );
            ext.autojoin.join();
        } else {
            var joined = false;
            
            for( key in client.channelo ) {
                if( client.channelo[key].namespace[0] != '~' ) {
                    client.join(key);
                    joined = true;
                }
            }
            
            if( !joined )
                ext.autojoin.join();
            
        }
        
        fresh_client = false;
    
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
                meth = ext.autojoin.add;
                success = 'Added {item} to your autojoin.';
                fail = 'Already have {item} on your autojoin.';
                break;
            case 'rem':
            case 'remove':
                meth = ext.autojoin.remove;
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
                if( !ext.autojoin.on ) {
                    mod = true;
                    ext.autojoin.on = true;
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
                if( ext.autojoin.on ) {
                    mod = true;
                    ext.autojoin.on = false;
                }
                break;
            default:
                ext.autojoin.join();
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
            ext.autojoin.save();
    
    };
    
    init();

};

