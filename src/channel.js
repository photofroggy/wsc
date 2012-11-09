/**
 * Chat channel object.
 * Manages channel events and data, and acts as a thin wrapper for the
 * channel's UI object.
 * 
 * @class Channel
 * @constructor
 * @param client {Object} Wsc chat client object.
 * @param ns {String} Channel namespace.
 * @param hidden {Boolean} Should the channel tab be hidden?
 */
wsc.Channel = function( client, ns, hidden ) {

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

};

/**
 * Create a UI view for this channel.
 * 
 * @method build
 */
wsc.Channel.prototype.build = function( ) {
    this.info.members = {};
    this.client.ui.create_channel(this.namespace, this.hidden);
    this.ui = this.client.ui.channel(ns);
};

/**
 * Remove this channel from the screen entirely.
 * 
 * @method remove
 */
wsc.Channel.prototype.remove = function( ) {
    if( this.ui == null )
        return;
    this.ui.remove();
};

/**
 * Hide the channel view in the UI.
 * 
 * @method hide
 */
wsc.Channel.prototype.hide = function( ) {
    if( this.ui == null )
        return;
    this.ui.hide();
};

/**
 * Show the channel view in the UI.
 * 
 * @method show
 */
wsc.Channel.prototype.show = function( ) {
    if( this.ui == null )
        return;
    this.ui.show();
};

/**
 * Display a log message.
 * 
 * @method log
 * @param msg {String} Log message to display.
 */
wsc.Channel.prototype.log = function( msg ) {
    if( this.ui == null )
        return;
    this.ui.log(msg);
};

/**
 * Send a message to the log window.
 * 
 * @method log_item
 * @param msg {String} Message to send.
 */
wsc.Channel.prototype.logItem = function( msg ) {
    if( this.ui == null )
        return;
    this.ui.log_item(msg);
};

/**
 * Send a server message to the log window.
 * 
 * @method server_message
 * @param msg {String} Server message.
 * @param [info] {String} Extra information for the message.
 */
wsc.Channel.prototype.server_message = function( msg, info ) {
    if( this.ui == null )
        return;
    this.ui.server_message(msg, info);
};

/**
 * Clear all log messages from the log window.
 * 
 * @method clear
 */
wsc.Channel.prototype.clear = function(  ) {
    if( this.ui == null )
        return;
    this.ui.clear();
};

/**
 * Process a channel property packet.
 * 
 * @method property
 * @param e {Object} Event data for the property packet.
 */
wsc.Channel.prototype.property = function( e ) {
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

/**
 * Set the channel header.
 * This can be the title or topic, determined by `head`.
 * 
 * @method set_header
 * @param e {Object} Event data for the property packet.
 */
wsc.Channel.prototype.set_header = function( head, e ) {
    this.info[head]["content"] = e.value || '';
    this.info[head]["by"] = e.by;
    this.info[head]["ts"] = e.ts;
    
    if( this.ui == null )
        return;
    
    this.ui.set_header(head, e.value.html() || '');
};

/**
 * Set the channel's privclasses.
 * 
 * @method set_privclasses
 * @param e {Object} Event data for the property packet.
 */
wsc.Channel.prototype.set_privclasses = function( e ) {
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

/**
 * Store each member of the this.
 *
 * @method set_members
 * @param e {Object} Event data for the property packet.
 */
wsc.Channel.prototype.set_members = function( e ) {
    pack = new wsc.Packet(e.pkt["body"]);
    this.info.members = {};
    this.info.users = [];
    
    while(pack["cmd"] == "member") {
        this.register_user(pack);
        pack = new wsc.Packet(pack.body);
        if(pack == null)
            break;
    }
    this.set_user_list();
};

/**
 * Set the channel user list.
 * 
 * @method set_user_list
 */
wsc.Channel.prototype.set_user_list = function( ) {
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

/**
 * Register a user with the channel.
 * 
 * @method register_user
 * @param pkt {Object} User data.
 */
wsc.Channel.prototype.register_user = function( pkt ) {
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

/**
 * Remove a user from the channel.
 * 
 * @method remove_user
 * @param user {String} Name of the user to remove.
 */
wsc.Channel.prototype.remove_user = function( user, force ) {
    force = force || false;
    member = this.info.members[user];
    
    if( member == undefined )
        return;
    
    member['conn']--;
    
    if( member['conn'] > 0 && !force)
        return;
    
    this.info.users.splice(this.info.users.indexOf(user), 1);
    delete this.info.members[user];
};

/**
 * Process a recv_join event.
 * 
 * @method recv_join
 * @param e {Object} Event data for recv_join packet.
 */
wsc.Channel.prototype.recv_join = function( e ) {
    info = new wsc.Packet('user ' + e.user + '\n' + e['info']);
    this.register_user( info );
    this.set_user_list();
};

/**
 * Process a recv_part event.
 * 
 * @method recv_part
 * @param e {Object} Event data for recv_part packet.
 */
wsc.Channel.prototype.recv_part = function( e ) {
    
    this.remove_user(e.user);
    this.set_user_list();
    
};

/**
 * Process a recv_msg event.
 * 
 * @method recv_msg
 * @param e {Object} Event data for recv_msg packet.
 */
wsc.Channel.prototype.recv_msg = function( e ) {
    
    u = this.client.settings['username'].toLowerCase();
    msg = e['message'].toLowerCase();
    
    if( msg.indexOf(u) < 0 )
        return;
    
    if( this.ui != null)
        this.ui.highlight();

};

/**
 * Process a recv_privchg event.
 * 
 * @method recv_privchg
 * @param e {Object} Event data for recv_privhcg packet.
 */
wsc.Channel.prototype.recv_privchg = function( e ) {
    member = this.info.members[e.user];
    
    if( !member )
        return;
    
    member['pc'] = event.pc;
    this.set_user_list();
};

/**
 * Process a recv_kicked event.
 * 
 * @method recv_kicked
 * @param e {Object} Event data for recv_kicked packet.
 */
wsc.Channel.prototype.recv_kicked = function( e ) {
    
    this.remove_user(e.user, true);
    this.set_user_list();
    
};

