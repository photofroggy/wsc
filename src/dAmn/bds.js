
wsc.dAmn.BDS = function( client, storage, settings ) {

    var pchats = {};
    var pns = {};
    
    settings.bds = {
        // Main DSP channel.
        version: '0.4',
        mns: 'chat:datashare',
        gate: 'chat:dsgateway',
        channel: ( new StringSet() ),
        // Because it's fun spamming #ds
        'provides': [
            'BOTCHECK',
            'CLINK'
        ]
    };
    // Allow other parts of client to use bds functionality.
    client.bds = settings.bds;
    settings.bds.channel.add(settings.bds.mns);
    settings.bds.channel.add(settings.bds.gate);
    
    var init = function(  ) {
        client.hidden.add(settings.bds.mns);
        client.exclude.add(settings.bds.mns);
        client.hidden.add(settings.bds.gate);
        client.exclude.add(settings.bds.gate);
        client.bind('pkt.login', pkt_login);
        client.bind('pkt.recv_msg', bds_msg);
        client.bind('pkt.join', handle.join);
        // BOTCHECK
        client.bind('BDS.BOTCHECK.DIRECT', handle.botcheck);
        client.bind('BDS.BOTCHECK.ALL', handle.botcheck);
        client.bind('BDS.BOTCHECK.OK', handle.checkresp);
        client.bind('BDS.BOTCHECK.DENIED', handle.checkresp);
        // pchats
        client.bind('CDS.LINK.REQUEST', handle.clreq);
        client.bind('CDS.LINK.REJECT', handle.clrj);
        client.bind('CDS.LINK.ACK', handle.clra);
        client.bind('pkt.recv_join', handle.pcrj);
        client.bind('pkt.recv_part', handle.pcrp);
        client.bind('pkt.property', handle.pcp);
        client.bind('closed', handle.closed);
        
        // Filter BDS commands
        client.ui.middle( 'log_item', function( data, done ) { handle.filter( data, done ); } );
        client.middle( 'chan.recv_msg', function( data, done ) { handle.hfilter( data, done ); } );
    };
    
    var pkt_login = function( event ) {
        if( event.pkt.arg.e != 'ok' )
            return;
        
        client.join(settings.bds.gate);
    };
    
    
    var bds_msg = function( event ) {
        if( event.user.toLowerCase() == client.settings.username.toLowerCase() )
            return;
        
        if( !settings.bds.channel.contains(event.ns) )
            return;
        
        var bdse = {
            'ns': event.ns,
            'sns': event.sns,
            'message': event.message,
            'user': event.user,
            'name': '',
            'payload': '',
            'head': [null, null, null],
            'params': []
        };
        
        var msg = event.message.split(':');
        var head = [null, null, null];
        var payload = null;
        
        for( var i in head ) {
            head[i] = msg.shift() || null;
            if( head[i] == null )
                return;
        }
        
        payload = msg.join(':');
        bdse.name = head.join('.');
        bdse.payload = payload;
        bdse.head = head;
        bdse.param = payload.split(',');
        
        client.trigger( head[0], bdse );
        client.trigger( head[0] + '.' + head[1], bdse );
        client.trigger( bdse.name, bdse );
    };
    
    var handle = {
        // Filter
        filter: function( data, done ) {
            
            // Are we in developer mode?
            if( client.settings.developer ) {
                done( data );
                return;
            }
            
            // Is this a private chat?
            if( data.ns[0] != '@' ) {
                done( data );
                return;
            }
            
            // Find a message
            var msg = data.message.match( /<span class="cmsg u-([^"]+)">(.*)<\/span>/ );
            
            if( !msg ) {
                done( data );
                return;
            }
            
            // Find a BDS message
            if( msg[2].match( /^([A-Z0-9-_]+):([A-Z0-9-_]+):([A-Z0-9-_]+)(:.*|)$/ ) ) {
            
                return;
            
            }
            
            done( data );
        },
        
        hfilter: function( data, done ) {
            
            // Are we in developer mode?
            if( client.settings.developer ) {
                done( data );
                return;
            }
            
            // Is this a private chat?
            if( data.sns[0] != '@' ) {
                done( data );
                return;
            }
            console.log( data );
            // Find a BDS message
            if( data.message.match( /^([A-Z0-9-_]+):([A-Z0-9-_]+):([A-Z0-9-_]+)(:.*|)$/ ) ) {
            
                return;
            
            }
            done( data );
        
        },
        
        // Connection closed.
        closed: function( event ) {
            client.remove_ns( settings.bds.mns );
            client.remove_ns( settings.bds.gate );
        },
        
        // Provider
        join: function( event ) {
            if( event.ns.toLowerCase() != settings.bds.mns )
                return;
            
            if( event.pkt.arg.e != 'ok' )
                return;
            
            client.npmsg( event.ns, 'BDS:PROVIDER:CAPS:' + settings.bds.provides.join(',') );
        },
        
        // Botcheck
        botcheck: function( event ) {
            // Make this actually work.
            if( event.head[2] != 'ALL' && event.payload != client.settings.username ) {
                return;
            }
            var ver = wsc.VERSION + '/' + client.ui.VERSION + '/' + wsc.dAmn.VERSION + '/' + settings.bds.version;
            var hash = CryptoJS.MD5( ( 'wsc.dAmn' + ver + client.settings.username + event.user ).toLowerCase() );
            client.npmsg( event.ns, 'BDS:BOTCHECK:CLIENT:' + event.user + ',wsc.dAmn,' + ver + ',' + hash );
        },
        
        // BDS:BOTCHECK:OK||DENIED
        checkresp: function( event ) {
            if( event.ns.toLowerCase() != settings.bds.gate )
                return;
            
            if( event.param[0].toLowerCase() != client.settings.username.toLowerCase() )
                return;
            
            if( client.channel( event.ns ).info.members[client.settings.username].pc == 'Visitors' )
                client.part( event.ns );
            
            if( event.head[2] == 'OK' ) {
                client.join( settings.bds.mns );
                return;
            }
            
            client.ui.pager.notice({
                'ref': 'botcheckdenied',
                'heading': 'BDS Error',
                'content': 'Denied entry to backend channel.\nReason provided: <code>' + event.param.slice(1).join(',') + '</code>'
            });
        },
        
        // CDS:LINK:REQUEST
        clreq: function( event ) {
            if( event.payload.toLowerCase() != client.settings.username.toLowerCase() )
                return;
            // Away or ignored
            
            if( client.ui.umuted.indexOf( event.user.toLowerCase() ) != -1 ) {
                client.npmsg(event.ns, 'CDS:LINK:REJECT:' + event.user + ',You have been blocked');
                return;
            }
            
            if( client.away.on ) {
                var t = new Date();
                var ns = event.sns.toLowerCase();
                
                var tl = timeLengthString( (t - client.away.since) / 1000 );
                var msg = replaceAll( client.away.format.away, '{user}', event.user );
                msg = replaceAll( msg, '{timesince}', tl );
                client.npmsg(event.ns, 'CDS:LINK:REJECT:'+event.user+',Away; ' + client.away.reason);
                return;
            }
            
            client.npmsg(event.ns, 'CDS:LINK:ACK:' + event.user);
            
            var pnotice = client.ui.pager.notice({
                'ref': 'clink-' + event.user,
                'icon': '<img src="' + wsc.dAmn.avatar.src(event.user,
                    client.channel(event.ns).info.members[event.user].usericon) + '" />',
                'heading': 'Chat ' + event.user,
                'content': event.user + ' wants to talk in private.\nType <code>/chat '+event.user+'</code> to talk to them, or use the buttons below.',
                'buttons': {
                    'accept': {
                        'ref': 'accept',
                        'target': 'accept',
                        'label': 'Accept',
                        'title': 'Join the private chat',
                        'click': function(  ) {
                            client.ui.pager.remove_notice( pnotice );
                            client.join('@' + event.user);
                            return false;
                        }
                    },
                    'reject': {
                        'ref': 'reject',
                        'target': 'reject',
                        'label': 'Reject',
                        'title': 'Reject the private chat',
                        'click': function(  ) {
                            client.npmsg(event.ns, 'CDS:LINK:REJECT:' + event.user);
                            client.ui.pager.remove_notice( pnotice );
                            return false;
                        }
                    }
                }
            }, true );
            
            pns[event.user] = pnotice;
            
            pnotice.onclose = function(  ) {
                client.npmsg( event.ns, 'CDS:LINK:REJECT:' + event.user );
            };
        },
        
        // CDS:LINK:REJECT
        clrj: function( event ) {
            var user = event.user.toLowerCase();
            var p = event.payload.split(',');
            var t = p.shift();
            p = p.join(',');
            
            if( t.toLowerCase() != client.settings.username.toLowerCase() )
                return;
            
            if( !(user in pchats) )
                return;
            
            clearTimeout( pchats[user] );
            client.channel( '@' + user ).server_message('Chat request rejected', p);
        },
        
        // CDS:LINK:ACK
        clra: function( event ) {
            var user = event.user.toLowerCase();
            var p = event.payload.split(',');
            var t = p.shift();
            if( t.toLowerCase() != client.settings.username.toLowerCase() )
                return;
            clearTimeout( pchats[user] );
        },
        
        // pchat property
        pcp: function( event ) {
            // Not a pchat
            if( event.ns.indexOf('pchat') != 0 ) {
                return;
            }
            
            if( client.bds.channel.contains( event.ns ) )
                return;
            
            // Not members property.
            if( event.pkt.arg.p != 'members' ) {
                return;
            }
            
            // Other guy is already here.
            if( client.channel(event.ns).get_usernames().length == 2 ) {
                client.bds.channel.add( event.ns );
                return;
            }
            
            // Send notice...
            var user = event.sns.substr(1);
            var ns = event.ns;
            client.channel(ns).server_message(user + ' has not yet joined', 'Sending them a notice...');
            client.npmsg( 'chat:datashare', 'CDS:LINK:REQUEST:' + user );
            pchats[user.toLowerCase()] = setTimeout(function() {
                try {
                    client.channel(ns).server_message( 'Notification failed', user + ' does not seem to be using a client that supports pchat notices.' );
                } catch( err ) {}
            }, 10000);
        },
        
        // pchat recv_join
        pcrj: function( event ) {
            if( event.sns[0] != '@' )
                return;
            
            try {
                clearTimeout( pchats[event.user.toLowerCase()] );
            } catch(err) {}
            
            client.bds.channel.add( event.ns );
            
            if( !( event.user in pns ) )
                return;
            
            client.ui.pager.remove_notice( pns[event.user] );
        },
        
        // pchat recv_part
        pcrp: function( event ) {
            if( event.sns[0] != '@' )
                return;
            
            client.bds.channel.remove( event.ns );
        }
    };

    init();

};
