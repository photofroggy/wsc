/* wsc channel - photofroggy
 * Provides a JavaScript representation of a chat channel and handles the UI
 * for the channel.
 */

/**
 * Chat channel object.
 * Manages channel events and data.
 * 
 * @class WscChannel
 * @constructor
 * @param client {Object} Wsc chat client object.
 * @param ns {String} Channel namespace.
 * @param hidden {Boolean} Should the channel tab be hidden?
 */
function WscChannel( client, ns, hidden ) {

    this.info = {
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
    
    this.client = client;
    this.hidden = hidden;
    this.ui = null;
    this.raw = client.format_ns(ns);
    this.selector = client.deform_ns(ns).slice(1).toLowerCase();
    this.namespace = client.deform_ns(ns);
    this.monitor = Object.size(this.client.channelo) == 0;

}

// Draw channel on screen and store the different elements in attributes.
WscChannel.prototype.build = function( ) {
    this.info.members = {};
    this.client.ui.create_channel(this.namespace, this.hidden);
    this.ui = this.client.ui.channel(ns);
};

// Remove a channel from the screen entirely.
WscChannel.prototype.remove = function( ) {
    if( this.ui == null )
        return;
    this.ui.remove();
};

// Toggle the visibility of the channel.
WscChannel.prototype.hide = function( ) {
    if( this.ui == null )
        return;
    this.ui.hide();
};

WscChannel.prototype.show = function( ) {
    if( this.ui == null )
        return;
    this.ui.show();
};

// Toggle a class on the chat tab.
WscChannel.prototype.toggleTabClass = function( cls ) {
    if( this.ui == null )
        return;
    this.ui.tab.toggleClass(cls);
};

// Display a log message.
WscChannel.prototype.log = function( msg ) {
    if( this.ui == null )
        return;
    this.ui.log(msg);
};

// Send a message to the log window.
WscChannel.prototype.logItem = function( msg ) {
    if( this.ui == null )
        return;
    this.ui.log_item(msg);
};

// Send a server message to the log window.
WscChannel.prototype.server_message = function( msg, info ) {
    if( this.ui == null )
        return;
    this.ui.server_message(msg, info);
};

WscChannel.prototype.property = function( e ) {
    var prop = e.pkt["arg"]["p"];
    switch(prop) {
        case "title":
        case "topic":
            this.set_header(prop, e);
            break;
        case "privclasses":
            this.set_privclasses(e);
            break;
        case "members":
            this.set_members(e);
            break;
        default:
            this.server_message("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
            break;
    }
};

// Set the channel header.
// This can be the title or topic, determined by `head`.
WscChannel.prototype.set_header = function( head, e ) {
    this.info[head]["content"] = e.value || '';
    this.info[head]["by"] = e.by;
    this.info[head]["ts"] = e.ts;
    
    if( this.ui == null )
        return;
    
    this.ui.set_header(head, e.value || '');
};

// Set the channel's privclasses.
// TODO: Draw UI componentories!
WscChannel.prototype.set_privclasses = function( e ) {
    this.info["pc"] = {};
    this.info["pc_order"] = [];
    var lines = e.pkt["body"].split('\n');
    for(var i in lines) {
        if( !lines[i] )
            continue;
        bits = lines[i].split(":");
        this.info["pc_order"].push(parseInt(bits[0]));
        this.info["pc"][parseInt(bits[0])] = bits[1];
    }
    this.info["pc_order"].sort(function(a,b){return b-a});
};

// Store each member of the this.
WscChannel.prototype.set_members = function( e ) {
    pack = new WscPacket(e.pkt["body"]);
    this.info.members = {};
    this.info.users = [];
    
    while(pack["cmd"] == "member") {
        this.register_user(pack);
        pack = new WscPacket(pack.body);
        if(pack == null)
            break;
    }
    this.set_user_list();
};

// Set the channel user list.
WscChannel.prototype.set_user_list = function( ) {
    if( Object.size(this.info.members) == 0 )
        return;
    
    pcs = {};
    this.info.users.sort( caseInsensitiveSort );
    
    for( i in this.info.users ) {
        un = this.info.users[i];
        member = this.info.members[un];
        
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
    
    for(var index in this.info["pc_order"]) {
        pc = this.info['pc'][this.info["pc_order"][index]];
        
        if( !( pc in pcs ) )
            continue;
        
        ulist.push(pcs[pc]);
    }
    
    if( this.ui != null ) {
        this.ui.set_user_list(ulist);
    }
    
    this.client.trigger('set.userlist', {
        'name': 'set.userlist',
        'ns': this.info['namespace']
    });
};

// Register a user with the this.
WscChannel.prototype.register_user = function( pkt ) {
    un = pkt["param"];
    
    if(this.info.members[un] == undefined) {
        this.info.members[un] = pkt["arg"];
        this.info.members[un]["username"] = un;
        this.info.members[un]["conn"] = 1;
    } else {
        for( i in pkt.arg ) {
            this.info.members[un][i] = pkt.arg[i];
        }
        this.info.members[un]["conn"]++;
    }
    
    if( this.info.users.indexOf(un) == -1 ) {
        this.info.users.push( un );
    }
};

// Unregister a user.
WscChannel.prototype.remove_user = function( user ) {
    member = this.info.members[user];
    
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
    
    delete this.info.members[user];
};

// Joins
WscChannel.prototype.recv_join = function( e ) {
    info = new WscPacket('user ' + e.user + '\n' + e['info']);
    this.register_user( info );
    this.set_user_list();
};

// Process someone leaving or whatever.
WscChannel.prototype.recv_part = function( e ) {
    
    this.remove_user(e.user);
    this.set_user_list();
    
};

// Display a message sent by a user.
WscChannel.prototype.recv_msg = function( e ) {
    
    u = this.client.settings['username'].toLowerCase();
    msg = e['message'].toLowerCase();
    
    if( msg.indexOf(u) < 0 )
        return;
    
    if( this.ui != null)
        this.ui.highlight();

};

// Changed privclass buddy?
WscChannel.prototype.recv_privchg = function( e ) {
    member = this.info.members[e.user];
    
    if( !member )
        return;
    
    member['pc'] = event.pc;
    this.set_user_list();
};

// Process a kick event thingy.
WscChannel.prototype.recv_kicked = function( e ) {
    
    this.remove_user(e.user);
    this.set_user_list();
    
};

