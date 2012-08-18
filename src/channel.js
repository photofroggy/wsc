/* wsc channel - photofroggy
 * Provides a JavaScript representation of a chat channel and handles the UI
 * for the channel.
 */

function WscChannel( client, ns, hidden ) {

    var selector = client.deform_ns(ns).slice(1).toLowerCase();
    this.client = client;
    this.hidden = hidden;
    
    this.info = {
        'raw': null,
        'selector': null,
        'namespace': null,
        'members': {},
        'pc': {},
        'pc_order': [],
        'title': {
            'content': '',
            'by': '',
            'ts': ''
        },
        'topic': {
            'content': '',
            'by': '',
            'ts': ''
        },
    };

    this.info.raw = client.format_ns(ns);
    this.info.selector = selector;
    this.info['namespace'] = this.info.ns = client.deform_ns(ns);
    
    //this.property = this.property.bind( this );
    scope_methods( this, WscChannel.prototype );

}

WscChannel.prototype.property = function( e ) {
    var prop = e.pkt["arg"]["p"];
    switch(prop) {
        case "title":
        case "topic":
            this.setHeader(prop, e);
            break;
        case "privclasses":
            this.setPrivclasses(e);
            break;
        case "members":
            this.setMembers(e);
            break;
        default:
            this.client.monitor("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
            break;
    }
};

// Set the channel header.
// This can be the title or topic, determined by `head`.
WscChannel.prototype.setHeader = function( head, e ) {
    this.info[head]["content"] = e.value || '';
    this.info[head]["by"] = e.by;
    this.info[head]["ts"] = e.ts;
    //console.log("set " + head);
    if(!this.info[head]["content"]) {
        /*
        this.setHeader('title', { pkt: {
                    "arg": { "by": "", "ts": "" },
                    "body": '<p>sample title</p>'
                }
            }
        );
        /**/
        /*
        this.setHeader('topic', { pkt: {
                    'arg': { 'by': '', 'ts': '' },
                    'body': '<p>sample topic</p>'
                }
            }
        );
        /**/
        /*
        return;/**/
    }
    //this.ui.setHeader();
};

// Set the channel's privclasses.
// TODO: Draw UI componentories!
WscChannel.prototype.setPrivclasses = function( e ) {
    this.info["pc"] = {};
    this.info["pc_order"] = [];
    var lines = e.pkt["body"].split('\n');
    //console.log(lines);
    for(var i in lines) {
        if( !lines[i] )
            continue;
        bits = lines[i].split(":");
        this.info["pc_order"].push(parseInt(bits[0]));
        this.info["pc"][parseInt(bits[0])] = bits[1];
    }
    this.info["pc_order"].sort(function(a,b){return b-a});
    /* 
    console.log("got privclasses");
    console.log(this.info["pc"]);
    console.log(this.info["pc_order"]);
    /* */
};

// Store each member of the this.
// TODO: GUI stuffs!
WscChannel.prototype.setMembers = function( e ) {
    pack = new WscPacket(e.pkt["body"]);
    this.info['members'] = {};
    this.info['users'] = [];
    
    while(pack["cmd"] == "member") {
        this.registerUser(pack);
        pack = new WscPacket(pack.body);
        if(pack == null)
            break;
    }
    //console.log("registered users");
    this.setUserList();
};

// Register a user with the this.
WscChannel.prototype.registerUser = function( pkt ) {
    //delete pkt['arg']['s'];
    un = pkt["param"];
    
    if(this.info["members"][un] == undefined) {
        this.info["members"][un] = pkt["arg"];
        this.info["members"][un]["username"] = un;
        this.info["members"][un]["conn"] = 1;
    } else {
        this.info["members"][un]["conn"]++;
    }
};

// Unregister a user.
WscChannel.prototype.removeUser = function( user ) {
    member = this.info['members'][user];
    
    if( member == undefined )
        return;
    
    member['conn']--;
    
    if( member['conn'] == 0 )
        delete this.info['members'][user];
};

// Joins
WscChannel.prototype.recv_join = function( e ) {
    info = new WscPacket('user ' + e.user + '\n' + e['*info']);
    this.registerUser( info );
    this.setUserList();
};

// Process someone leaving or whatever.
WscChannel.prototype.recv_part = function( e ) {
    
    this.removeUser(e.user);
    this.setUserList();
    
};
/*
// Display a message sent by a user.
WscChannel.prototype.recv_msg = function( e ) {

    tabl = this.tab.find('a');
    
    if( !this.tab.hasClass('active') )
        tabl.css({'font-weight': 'bold'});
    
    u = channel.client.settings['username'].toLowerCase();
    msg = e['message'].toLowerCase();
    p = channel.window.find('p.logmsg').last();
    
    if( msg.indexOf(u) < 0 || p.html().toLowerCase().indexOf(u) < 0 )
        return;
    
    p.addClass('highlight');
    
    if( this.tab.hasClass('active') )
        return;
    
    console.log(tabl);
    tabl
        .animate( { 'backgroundColor': '#990000' }, 500)
        .animate( { 'backgroundColor': '#EDF8FF' }, 250)
        .animate( { 'backgroundColor': '#990000' }, 250)
        .animate( { 'backgroundColor': '#EDF8FF' }, 250)
        .animate( { 'backgroundColor': '#990000' }, 250)
        .animate( { 'backgroundColor': '#EDF8FF' }, 250)
        .animate( { 'backgroundColor': '#990000' }, 250);

};
*/
// Changed privclass buddy?
WscChannel.prototype.recv_privchg = function( e ) {
    member = this.info['members'][e.user];
    
    if( !member )
        return;
    
    member['pc'] = event.pc;
    this.setUserList();
};

// Process a kick event thingy.
WscChannel.prototype.recv_kicked = function( e ) {
    if( !this.info['members'][e.user] )
        return;
    
    delete this.info['members'][e.user];
    this.setUserList();
};

// Create a screen for channel `ns` in the UI, and initialise data
// structures or some shit idk. The `selector` parameter defines the
// channel without the `chat:` or `#` style prefixes. The `ns`
// parameter is the string to use for the tab.
function wsc_channel( client, ns, hidden ) {
    
    var channel = {
        
        client: null,
        info: {
            "raw": "",
            "selector": "",
            "namespace": "",
            "members": {},
            "users": [],
            "pc": {},
            "pc_order": [],
            "title": {
                "content": "",
                "by": "",
                "ts": ""
            },
            "topic": {
                "content": "",
                "by": "",
                "ts": ""
            }
        },
        
        window: null,
        logpanel: null,
        wrap: null,
        userpanel: null,
        tab: null,
        hidden: false,
        monitor: false,
        thresh: null,
        
        // Initialise! Create a new channel mofo!
        init: function( client, ns, hidden ) {
            var selector = client.deform_ns(ns).slice(1).toLowerCase();
            this.client = client;
            this.hidden = hidden;
        
            this.info["raw"] = client.format_ns(ns);
            this.info["selector"] = selector;
            this.info["namespace"] = client.deform_ns(ns);
            
            this.monitor = Object.size(this.client.channelo) == 0;
        },
        
        // Draw channel on screen and store the different elements in attributes.
        build: function( ) {
            this.info['members'] = {};
            this.client.ui.create_channel(ns, hidden);
            this.ui = this.client.ui.channel(ns);
        },
        
        // Remove a channel from the screen entirely.
        remove: function( ) {
            this.ui.remove();
        },
        
        // Toggle the visibility of the channel.
        hide: function( ) {
            this.ui.hide();
        },
        
        show: function( ) {
            this.ui.show();
        },
        
        // Toggle a class on the chat tab.
        toggleTabClass: function( cls ) {
            this.ui.tab.toggleClass(cls);
        },
        
        // Display a log message.
        log: function( msg ) {
            this.ui.log(msg);
        },
        
        // Send a message to the log window.
        logItem: function( msg ) {
            this.ui.log_item(msg);
        },
        
        // Send a server message to the log window.
        server_message: function( msg, info ) {
            this.ui.server_message(msg, info);
        },
        
        // Set a channel property.
        property: function( e ) {
            var prop = e.pkt["arg"]["p"];
            switch(prop) {
                case "title":
                case "topic":
                    this.setHeader(prop, e);
                    break;
                case "privclasses":
                    this.setPrivclasses(e);
                    break;
                case "members":
                    this.setMembers(e);
                    break;
                default:
                    client.monitor("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
                    break;
            }
        },
        
        // Set the channel header.
        // This can be the title or topic, determined by `head`.
        setHeader: function( head, e ) {
            this.info[head]["content"] = e.value || '';
            this.info[head]["by"] = e.by;
            this.info[head]["ts"] = e.ts;
            this.ui.set_header(head, e.value || '');
        },
        
        // Set the channel user list.
        setUserList: function( ) {
            if( Object.size(this.info['members']) == 0 )
                return;
            
            pcs = {};
            
            for( i in this.info['users'] ) {
                un = this.info['users'][i];
                member = this.info['members'][un];
                
                if( !( member['pc'] in pcs ) )
                    pcs[member['pc']] = {'name': member['pc'], 'users': []};
                
                conn = member['conn'] == 1 ? '' : '[' + member['conn'] + ']';
                s = member.symbol;
                uinfo = {
                    'name': un,
                    'symbol': s,
                    'conn': member.conn,
                    'hover': {
                        'member': member,
                        'name': un,
                        'avatar': '<img class="avatar" src="" height="50" width="50" />',
                        'link': s + '<a target="_blank" href="http://' + un + '.'+ this.client.settings['domain'] + '/">' + un + '</a>',
                        'info': []
                    }
                };
                
                pcs[member['pc']].users.push(uinfo);
            }
            
            ulist = [];
            //this.info['members'].sort( caseInsensitiveSort );
            //console.log(this.info["pc_order"])
            for(var index in this.info["pc_order"]) {
                pc = this.info['pc'][this.info["pc_order"][index]];
                
                if( !( pc in pcs ) )
                    continue;
                
                ulist.push(pcs[pc]);
            }
            
            this.ui.set_user_list(ulist);
            
            this.client.trigger('set.userlist', {
                'name': 'set.userlist',
                'ns': this.info['namespace']
            });
        },
        
        // Set the channel's privclasses.
        // TODO: Draw UI componentories!
        setPrivclasses: function( e ) {
            this.info["pc"] = {};
            this.info["pc_order"] = [];
            var lines = e.pkt["body"].split('\n');
            //console.log(lines);
            for(var i in lines) {
                if( !lines[i] )
                    continue;
                bits = lines[i].split(":");
                this.info["pc_order"].push(parseInt(bits[0]));
                this.info["pc"][parseInt(bits[0])] = bits[1];
            }
            this.info["pc_order"].sort(function(a,b){return b-a});
        },
        
        // Store each member of the this.
        // TODO: GUI stuffs!
        setMembers: function( e ) {
            pack = new WscPacket(e.pkt["body"]);
            
            while(pack["cmd"] == "member") {
                this.registerUser(pack);
                pack = new WscPacket(pack.body);
                if(pack == null)
                    break;
            }
            
            this.info['users'] = [];
            
            for( i in this.info['members'] )
                this.info['users'].push(i);
            
            this.info['users'].sort( caseInsensitiveSort );
            this.setUserList();
        },
        
        // Register a user with the this.
        registerUser: function( pkt ) {
            //delete pkt['arg']['s'];
            un = pkt["param"];
            
            if(this.info["members"][un] == undefined) {
                this.info["members"][un] = pkt["arg"];
                this.info["members"][un]["username"] = un;
                this.info["members"][un]["conn"] = 1;
            } else {
                this.info["members"][un]["conn"]++;
            }
        },
        
        // Unregister a user.
        removeUser: function( user ) {
            member = this.info['members'][user];
            
            if( member == undefined )
                return;
            
            member['conn']--;
            
            if( member['conn'] > 0 )
                return;
            
            for( index in this.info.users ) {
                uinfo = this.info.users[index];
                if( uinfo.username == user ) {
                    break;
                }
            }
            
            delete this.info['members'][user];
        },
        
        // Joins
        recv_join: function( e ) {
            info = new WscPacket('user ' + e.user + '\n' + e['info']);
            channel.registerUser( info );
            if( this.info.users.indexOf(e.user) == -1 ) {
                this.info.users.push( e.user );
                this.info.users.sort( caseInsensitiveSort );
            }
            channel.setUserList();
        },
        
        // Process someone leaving or whatever.
        recv_part: function( e ) {
            
            channel.removeUser(e.user);
            channel.setUserList();
            
        },
        
        // Display a message sent by a user.
        recv_msg: function( e ) {
            
            u = this.client.settings['username'].toLowerCase();
            msg = e['message'].toLowerCase();
            
            if( msg.indexOf(u) < 0 )
                return;
            
            this.ui.highlight();
        
        },
        
        // Changed privclass buddy?
        recv_privchg: function( e ) {
            member = channel.info['members'][e.user];
            
            if( !member )
                return;
            
            member['pc'] = event.pc;
            channel.setUserList();
        },
        
        // Process a kick event thingy.
        recv_kicked: function( e ) {
            this.removeUser(e.user);
            channel.setUserList();
        }
        
    };
    
    channel.init(client, ns, hidden);
    return channel;
}