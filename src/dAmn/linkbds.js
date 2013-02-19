
wsc.dAmn.BDS.Link = function( client, storage, settings ) {

    var init = function(  ) {
        client.bind('BDS.LINK.REQUEST', handler.request);
        client.bind('BDS.LINK.REJECT', handler.reject);
        client.bind('BDS.LINK.ACCEPT', handler.accept);
        client.bind('BDS.LINK.CLOSE', handler.close);
    };
    
    // Putting helper functions in here means other extensions can use them.
    settings.bds.link = {
        connections: {},
        
        // Indicates the state of a connection.
        // Closed isn't really needed as the connection will be destroyed when closed.
        state: {
            closed: 0,
            opening: 1,
            open: 2
        },
        
        open: function( user ) {
            user = user.toLowerCase();
            var uns = client.format_ns( '@' + user );
            
            if( user in settings.bds.link.connections ) {
                return null;
            }
            
            settings.bds.link.connections[user] = {
                state: settings.bds.link.state.opening,
                ns: uns,
                un: user,
                close: function(  ) {
                    settings.bds.link.close( client.deform_ns( user ) );
                },
                send: function( message ) {
                    if( settings.bds.link.connections[user].state != settings.bds.link.status.open )
                        return false;
                    client.npmsg( uns, message );
                    return true;
                }
            };
            
            settings.bds.channel.add(uns);
            client.hidden.add(uns);
            client.exclude.add(uns);
            client.join(uns);
            
            return settings.bds.link.connections[user];
        },
        
        close: function( user, suppress ) {
            user = user.toLowerCase();
            
            if( !( user in settings.bds.link.connections ) ) {
                return false;
            }
            
            var link = settings.bds.link.connections[user];
            
            if( suppress !== true )
                link.send( 'BDS:LINK:CLOSE' );
            
            client.part(user);
            link.state = settings.bds.link.state.closed;
            
            return true;
        }
    };
    
    var handler = {
        request: function( event ) {
            // TODO: some sort of check to prevent accepts?
            settings.bds.link.open( event.user );
            client.npmsg( event.ns, 'BDS:LINK:ACCEPT:' + event.user );
        },
        
        reject: function( event ) {
            // Ok fine... not sure why this is needed.
            var user = event.user.toLowerCase();
            
            if( !( user in settings.bds.link.connections ) )
                return;
            
            settings.bds.link.connections[user].close();
        },
        
        accept: function( event ) {
            // TODO: Stuff to make sure we're not just randomly accepting links.
            settings.bds.link.open( event.user );
        },
        
        close: function( event ) {
            settings.bds.link.close( event.user, true );
        }
    };
    
    init();

};