/**
 * Chat channel object.
 * Manages channel events and data, and acts as a thin wrapper for the
 * channel's UI object.
 * 
 * @class wsc.Channel
 * @constructor
 * @param client {Object} Wsc chat client object.
 * @param ns {String} Channel namespace.
 * @param hidden {Boolean} Should the channel tab be hidden?
 */
wsc.Channel = function( client, ns, hidden, monitor ) {

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
    this.monitor = ( monitor == undefined ? false : monitor );
    this.ui = null;
    this.raw = client.format_ns(ns);
    this.selector = (this.raw.substr(0, 2) == 'pc' ? 'pc' : 'c') + '-' + client.deform_ns(ns).slice(1).toLowerCase();
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
    this.client.ui.create_channel(this.raw, this.hidden);
    this.ui = this.client.ui.channel(this.raw);
};

/**
 * Remove this channel from the screen entirely.
 * 
 * @method remove
 */
wsc.Channel.prototype.remove = function( ) {
    if( this.ui == null )
        return;
    this.ui.manager.remove_channel(this.raw);
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
wsc.Channel.prototype.clear = function( user ) {
    if( this.ui == null )
        return;
    if( !user ) {
        this.ui.clear();
    } else {
        this.ui.clear_user( user );
    }
};

/**
 * Display a user's whois info.
 * 
 * @method log_whois
 * @param data {Object} Object containing a user's information.
 */
wsc.Channel.prototype.log_whois = function( data ) {
    if( this.ui == null )
        return;
    this.ui.log_whois(data);
};

/**
 * Display some information relating to a privilege class.
 * 
 * @method log_pc
 * @param privileges {Boolean} Are we showing privileges or users?
 * @param data {Array} Array containing information.
 */
wsc.Channel.prototype.log_pc = function( privileges, data ) {
    if( this.ui == null )
        return;
    this.ui.log_pc(privileges, data);
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
            // If we already had the title/topic for this channel, then it was changed. Output a message.
            if ( this.info[prop].content.length != 0 ) {
                if ( ( e.pkt.arg.ts - this.info[prop].ts ) != 0 ) {
                    this.server_message(prop + " set by " + e.pkt["arg"]["by"]);
                }
            }
                
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
    this.info[head]["content"] = e.value.text() || '';
    this.info[head]["by"] = e.by;
    this.info[head]["ts"] = e.ts;
    
    if( this.ui == null )
        return;
    
    this.ui.set_header(head, e.value || (new wsc.MessageString) );
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
    var bits = [];
    for(var i in lines) {
        if( !lines.hasOwnProperty(i) )
            continue;
        bits = lines[i].split(":");
        if( bits.length == 1 )
            continue;
        this.info["pc_order"].push(parseInt(bits[0]));
        this.info["pc"][parseInt(bits[0])] = bits[1];
    }
    this.info["pc_order"].sort(function(a, b){ return b - a });
    
    var names = this.info.pc;
    var orders = this.info.pc_order.slice(0);
    
    if( this.namespace[0] == '@' ) {
        names[100] = 'Room Members';
        orders.unshift( 'Room Members' );
    }
    
    this.ui.build_user_list( names, orders );
};

/**
 * Get the order of a given privilege class.
 * 
 * @method get_privclass_order
 * @param name {String} Name of the privilege class to get the order of.
 * @return {Integer} The order of the privilege class.
 */
wsc.Channel.prototype.get_privclass_order = function( name ) {
    name = name.toLowerCase();
    for( var i in this.info.pc ) {
        if( !this.info.pc.hasOwnProperty(i) )
            continue;
        if( this.info.pc[i].toLowerCase() == name )
            return i;
    }
};

/**
 * Store each member of the this.
 *
 * @method set_members
 * @param e {Object} Event data for the property packet.
 */
wsc.Channel.prototype.set_members = function( e ) {
    this.info.members = {};
    
    for( var i in e.pkt.sub ) {
        if( !e.pkt.sub.hasOwnProperty(i) )
            continue;
        this.register_user(e.pkt.sub[i], true);
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
    
    var names = this.get_usernames();
    var users = [];
    var uinfo = null;
    
    for( var i in names ) {
        
        if( !names.hasOwnProperty(i) )
            continue;
        
        users.push( this.info.members[names[i]] );
    
    }
    
    this.client.trigger(this.namespace + '.user.list', {
        'name': 'set.userlist',
        'ns': this.info['namespace'],
        'users': users
    });
};

/**
 * Generate user info for the user list.
 * 
 * @method user_info
 * @param user {String} User name
 * @return {Object} User info
 */
wsc.Channel.prototype.user_info = function( user ) {
        
    var member = this.info.members[user];
    var s = member.symbol;
    
    return {
        'name': user,
        'pc': member['pc'],
        'symbol': s,
        'conn': member.conn,
        'hover': {
            'member': member,
            'name': user,
            'avatar': '<img class="avatar" src="" height="50" width="50" />',
            'link': s + '<a target="_blank" href="http://' + user + '.'+ this.client.settings['domain'] + '/">' + user + '</a>',
            'info': []
        }
    };

};

/**
 * Register a user with the channel.
 * 
 * @method register_user
 * @param pkt {Object} User data
 * @param suppress {Boolean} Set to true to suppress events
 */
wsc.Channel.prototype.register_user = function( pkt, suppress ) {
    var un = pkt["param"];
    
    if(this.info.members[un] == undefined) {
        this.info.members[un] = pkt["arg"];
        this.info.members[un]["username"] = un;
        this.info.members[un]["conn"] = 1;
        this.info.members[un] = this.user_info( un );
    } else {
        for( i in pkt.arg ) {
            this.info.members[un][i] = pkt.arg[i];
        }
        this.info.members[un]["conn"]++;
    }
    if( !('pc' in this.info.members[un]) ) 
        this.info.members[un]['pc'] = 'Room Members';
    
    suppress = suppress || false;
    
    if( suppress )
        return;
    
    this.client.trigger(this.namespace + '.user.registered', {
        name: this.namespace + '.user.registered',
        user: un
    });
    
};

/**
 * Return a list of usernames, sorted alphabetically.
 * 
 * @method get_usernames
 */
wsc.Channel.prototype.get_usernames = function(  ) {

    var names = [];
    for( var name in this.info.members ) {
        names.push(name);
    }
    names.sort( caseInsensitiveSort );
    return names;

};

/**
 * Remove a user from the channel.
 * 
 * @method remove_user
 * @param user {String} Name of the user to remove.
 */
wsc.Channel.prototype.remove_user = function( user, force ) {
    force = force || false;
    var member = this.info.members[user];
    
    if( member == undefined )
        return;
    
    member.conn--;
    
    if( member.conn == 0 || force) {
        delete this.info.members[user];
        this.client.cascade( this.namespace + '.user.remove', function( user ) {}, member.name);
    } else {
        this.ui.register_user( user );
    }
};

/**
 * Process a recv_join event.
 * 
 * @method recv_join
 * @param e {Object} Event data for recv_join packet.
 */
wsc.Channel.prototype.recv_join = function( e ) {
    var info = new wsc.Packet('user ' + e.user + '\n' + e['info']);
    this.register_user( info );
};

/**
 * Process a recv_part event.
 * 
 * @method recv_part
 * @param e {Object} Event data for recv_part packet.
 */
wsc.Channel.prototype.recv_part = function( e ) {
    
    this.remove_user(e.user);
    
};

/**
 * Process a recv_msg event.
 * 
 * @method recv_msg
 * @param e {Object} Event data for recv_msg packet.
 */
wsc.Channel.prototype.recv_msg = function( e ) {
    
    var u = this.client.settings['username'].toLowerCase();
    
    if( u == e.user.toLowerCase() )
        return;
    
    var msg = e['message'].toLowerCase();
    var hlight = msg.indexOf(u) != -1;
    
    if( !hlight && e.sns[0] != '@' )
        return;
    
    if( this.ui != null) {
        if( hlight ) {
            this.ui.highlight( );
        } else {
            this.ui.highlight( false );
        }
    }
    
    this.client.trigger( 'pkt.recv_msg.highlighted', e );

};

/**
 * Process a recv_privchg event.
 * 
 * @method recv_privchg
 * @param e {Object} Event data for recv_privhcg packet.
 */
wsc.Channel.prototype.recv_privchg = function( e ) {
    var c = this;
    
    this.client.cascade(this.namespace + '.user.privchg', function( data ) {
        var member = c.info.members[data.user];
        
        if( !member )
            return;
        
        member['pc'] = data.pc;
    }, e);
    
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

