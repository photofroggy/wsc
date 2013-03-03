
wsc.dAmn.BDS = function( client, storage, settings ) {

    var pchats = {};
    settings.bds = {
        // Main DSP channel.
        mns: 'chat:datashare',
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
    
    var init = function(  ) {
        client.hidden.add(settings.bds.mns);
        client.exclude.add(settings.bds.mns);
        client.bind('pkt.login', pkt_login);
        client.bind('pkt.recv_msg', bds_msg);
        client.bind('pkt.join', handle.join);
        // BOTCHECK
        client.bind('BDS.BOTCHECK.DIRECT', handle.botcheck);
        client.bind('BDS.BOTCHECK.ALL', handle.botcheck);
        // pchats
        client.bind('CDS.LINK.REQUEST', handle.clreq);
        client.bind('CDS.LINK.REJECT', handle.clrj);
        client.bind('CDS.LINK.ACK', handle.clra);
        client.bind('pkt.recv_join', handle.pcrj);
        client.bind('pkt.property', handle.pcp);
    };
    
    var pkt_login = function( event ) {
        if( event.pkt.arg.e != 'ok' )
            return;
        
        if( client.channel(settings.bds.mns) )
            return;
        
        client.join('#datashare');
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
            'head': ''
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
        
        client.trigger( head[0], bdse );
        client.trigger( head[0] + '.' + head[1], bdse );
        client.trigger( bdse.name, bdse );
    };
    
    var handle = {
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
            var ver = wsc.VERSION + '/' + client.ui.VERSION + '/' + wsc.dAmn.VERSION;
            var hash = CryptoJS.MD5( ( 'wsc.dAmn' + ver + client.settings.username + event.user ).toLowerCase() );
            client.npmsg( event.ns, 'BDS:BOTCHECK:CLIENT:' + event.user + ',wsc.dAmn,' + ver + ',' + hash );
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
            
            console.log( client.channel(event.ns).info.members[event.user] );
            
            client.ui.pager.notice({
                'ref': 'clink-' + event.user,
                'icon': '<img src="' + wsc.dAmn.avatar.src(event.user,
                    client.channel(event.ns).info.members[event.user].usericon) + '" />',
                'heading': 'Chat ' + event.user,
                'content': event.user + ' wants to talk in private.\nType <code>/chat '+event.user+'</code> to talk to them'
            }, true );
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
            if( client.channel(event.ns).get_usernames().length == 2 )
                return;
            
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
            try {
                clearTimeout( pchats[event.user.toLowerCase()] );
            } catch(err) {}
        }
    };

    init();

};
