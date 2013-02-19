
wsc.dAmn.BDS.Link = function( client, storage, settings ) {

    var init = function(  ) {
        // BDS events.
        client.bind('BDS', handler.cmd);
        client.bind('BDS.LINK.REQUEST', handler.request);
        client.bind('BDS.LINK.REJECT', handler.reject);
        client.bind('BDS.LINK.ACCEPT', handler.accept);
        client.bind('BDS.LINK.CLOSE', handler.close);
        // dAmn events.
        client.bind('pkt.join', handler.join);
        client.bind('pkt.part', handler.part);
        client.bind('pkt.recv_join', handler.recv_join);
        client.bind('pkt.recv_part', handler.recv_part);
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
        
        // Get a link thing.
        conn: function( user, oncmd ) {
            user = user.toLowerCase();
            
            if( user in settings.bds.link.connections )
                return settings.bds.link.connections[user];
            
            var uns = client.format_ns('@' + user);
            
            var link = {
                state: settings.bds.link.state.closed,
                ns: uns,
                un: user,
                close: function(  ) {
                    settings.bds.link.close( link.un );
                },
                
                send: function( message ) {
                    if( link.state != settings.bds.link.state.open )
                        return false;
                    client.npmsg( link.ns, message );
                    return true;
                },
                
                oncmd: ( oncmd || function( message ) {} )
            };
            
            return link;
        },
        
        request: function( user, suppress, oncmd ) {
            var link = settings.bds.link.open( user, oncmd );
            
            if( link == null )
                return null;
            
            if( suppress === true )
                return link;
            
            client.npmsg( settings.bds.mns, 'BDS:LINK:REQUEST:' + user );
            return link;
        },
        
        open: function( user, oncmd ) {
            user = user.toLowerCase();
            
            if( user in settings.bds.link.connections ) {
                return null;
            }
            
            var link = settings.bds.link.conn( user, oncmd );
            link.state = settings.bds.link.state.opening;
            
            settings.bds.link.connections[user] = link;
            settings.bds.channel.add(link.ns);
            client.hidden.add(link.ns);
            client.exclude.add(link.ns);
            client.join(link.ns);
            
            return link;
        },
        
        close: function( user, suppress ) {
            user = user.toLowerCase();
            
            if( !( user in settings.bds.link.connections ) ) {
                return false;
            }
            
            var link = settings.bds.link.conn( user );
            
            if( suppress !== true )
                link.send( 'BDS:LINK:CLOSE' );
            
            client.part(link.ns);
            link.state = settings.bds.link.state.closed;
            
            return true;
        }
    };
    
    var handler = {
        
        /**
         * BDS Event handlers.
         */
        
        cmd: function( event ) {
            if( !settings.bds.channel.contains(event.ns) )
                return;
            settings.bds.link.conn( event.sns.substr(1), event, client );
        },
        
        request: function( event ) {
            // TODO: some sort of check to prevent accepts?
            if( event.payload.toLowerCase() != client.settings.username.toLowerCase() )
                return;
            
            settings.bds.link.open( event.user );
            client.npmsg( event.ns, 'BDS:LINK:ACCEPT:' + event.user );
        },
        
        reject: function( event ) {
            // Dealing with rejection is never nice.
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
        },
        
        /**
         * dAmn Event handlers
         */
        
        join: function( event ) {
            if( event.pkt.arg.e != 'ok' )
                return;
            
            if( !settings.bds.channel.contains(event.ns) )
                return;
            
            var link = settings.bds.link.conn( event.sns.substr(1) );
            
            if( client.channel(event.ns).get_usernames().length == 1 )
                return;
            
            link.state = settings.bds.link.state.open;
            client.trigger('BDS.LINK.OPEN', {
                name: 'BDS.LINK.OPEN',
                link: link,
                ns: link.ns
            });
        },
        
        part: function( event ) {
            if( !settings.bds.channel.contains(event.ns) )
                return;
            
            var link = settings.bds.link.conn( event.sns.substr(1) );
            
            link.state = settings.bds.link.state.closed;
            client.trigger('BDS.LINK.CLOSED', {
                name: 'BDS.LINK.CLOSED',
                link: link,
                ns: link.ns
            });
            
            delete settings.bds.link.connections[link.un];
        },
        
        recv_join: function( event ) {
            if( !settings.bds.channel.contains(event.ns) )
                return;
            
            var link = settings.bds.link.conn( event.sns.substr(1) );
            
            if( link.state != settings.bds.link.state.opening )
                return;
            
            link.state = settings.bds.link.state.open;
            client.trigger('BDS.LINK.OPEN', {
                name: 'BDS.LINK.OPEN',
                link: link,
                ns: link.ns
            });
        },
        
        recv_part: function( event ) {
            if( !settings.bds.channel.contains(event.ns) )
                return;
            
            var link = settings.bds.link.conn( event.sns.substr(1) );
            link.close( true );
        },
        
    };
    
    init();

};