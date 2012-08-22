/**
 * WebSocket Chat client module.
 * 
 * @module wsc
 */
var wsc = {};
wsc.VERSION = '0.7.39';
wsc.STATE = 'beta';
wsc.defaults = {};
wsc.defaults.theme = 'wsct_default';
wsc.defaults.themes = [ 'wsct_default', 'wsct_test' ];
// Taken from dAmnAIR by philo23
// dAmnAIR - http://botdom.com/wiki/DAmnAIR
// philo23 on deviantART - http://philo23.deviantart.com/
/**
 * EventEmitter
 * Simple event framework, based off of NodeJS's EventEmitter
 * @class EventEmitter
 * @constructor
 **/
function EventEmitter() {
    var events = {}, self = this;

    function addListener(event, listener) {
        var callbacks = events[event] || false;
        if(callbacks === false) {
            events[event] = [listener];
            return self;
        }
        events[event].unshift(listener);
        return self;
    }

    function removeListeners(event) {
        events[event] = [];
        return self;
    }

    function emit() {
        var args = Array.prototype.slice.call(arguments);
        var event = args.shift();
        var callbacks = events[event] || false;
        if(callbacks === false) {
            return self;
        }
        for(var i in callbacks) {
            if(callbacks.hasOwnProperty(i)) {
                bubble = callbacks[i].apply({}, args);
                if( bubble === false )
                    break;
            }
        }
        return self;
    }

    function listeners(event) {
        return events[event] || [];
    }


    this.addListener = addListener;
    this.removeListeners = removeListeners;
    this.emit = emit;
    this.listeners = listeners;
}/**
 * Client transport.
 * Acts as a basic wrapper around a transport.
 * 
 * @class Transport
 * @constructor
 * @param server {String} Address for the server to connect to.
 * @param [open=wsc.Transport.sopen] {Method} This method will be called when
 *   a connection is established with the server.
 * @param [message=wsc.Transport.smessage] {Method} When a message is received
 *   on the transport, this method will be called.
 * @param [disconnect=wsc.Transport.sdisconnect] {Method} The method to be
 *   called when the connection has been closed.
 */
wsc.Transport = function( server, open, message, disconnect ) {

    this.sock = null;
    this.conn = null;
    this.server = server;
    this.open( open );
    this.message( message );
    this.disconnect( disconnect );

};

/**
 * Static class method.
 * Create a new client transport object.
 * 
 * @method Create
 */
wsc.Transport.Create = function( server, open, message, disconnect ) {

    if( typeof io !== 'undefined' ) {
        return new wsc.SocketIO( server, open, message, disconnect );
    }
    
    if(!window["WebSocket"]) {
        throw "This browser does not support websockets.";
    }
    
    return new wsc.WebSocket( server, open, message, disconnect );

};

/**
 * Register open event callback.
 * 
 * @method open
 * @param [callback=wsc.Transport.sopen] {Method} This method will be called
 *   when a connection is established with the server.
 */
wsc.Transport.prototype.open = function( callback ) {

    this._open = callback || this.sopen;

};

/**
 * Register message event callback.
 * 
 * @method message
 * @param [callback=wsc.Transport.smessage] {Method} When a message is received
 *   on the transport, this method will be called.
 */
wsc.Transport.prototype.message = function( callback ) {

    this._message = callback || this.smessage;

};

/**
 * Register disconnect event callback.
 * 
 * @method disconnect
 * @param [callback=wsc.Transport.sdisconnect] {Method} The method to be called
 *   when the connection has been closed.
 */
wsc.Transport.prototype.disconnect = function( callback ) {

    this._disconnect = callback || this.sdisconnect;

};

/**
 * Open connection event stub.
 * 
 * @method sopen
 */
wsc.Transport.prototype.sopen = function(  ) {};

/**
 * Message event stub.
 * 
 * @method smessage
 */
wsc.Transport.prototype.smessage = function(  ) {};

/**
 * Close connection event stub.
 * 
 * @method sdisconnect
 */
wsc.Transport.prototype.sdisconnect = function(  ) {};

wsc.Transport.prototype._open = function( event, sock ) {};
wsc.Transport.prototype._message = function( event ) {};
wsc.Transport.prototype._disconnect = function( event ) {};

/**
 * Connect to the server.
 * 
 * @method connect
 */
wsc.Transport.prototype.connect = function(  ) {};

/**
 * Send a message to the server.
 * 
 * @method send
 * @param message {String} message to send to the server.
 */
wsc.Transport.prototype.send = function( message ) {};

/**
 * Close the connection.
 * 
 * @method close
 */
wsc.Transport.prototype.close = function(  ) {};


/**
 * WebSocket transport object.
 * 
 * @class WebSocket
 * @constructor
 * @param server {String} Address for the server to connect to.
 * @param [open=wsc.WebSocket.sopen] {Method} This method will be called when
 *   a connection is established with the server.
 * @param [message=wsc.WebSocket.smessage] {Method} When a message is received
 *   on the transport, this method will be called.
 * @param [disconnect=wsc.WebSocket.sdisconnect] {Method} The method to be
 *   called when the connection has been closed.
 */
wsc.WebSocket = function( server, open, message, disconnect ) {

    this.sock = null;
    this.conn = null;
    this.server = server;
    this.open( open );
    this.message( message );
    this.disconnect( disconnect );

};

wsc.WebSocket.prototype = new wsc.Transport;
wsc.WebSocket.prototype.constructor = wsc.WebSocket;

/**
 * Called when the connection is opened.
 * Sets the `sock` attribute.
 * 
 * @method onopen
 * @param event {Object} WebSocket event object.
 * @param sock {Object} Transport object.
 */
wsc.WebSocket.prototype.onopen = function( event, sock ) {

    this.sock = sock || this.conn;
    this._open( event, this );

};

/**
 * Called when the connection is closed.
 * Resets `sock` and `conn` to null.
 * 
 * @method ondisconnect
 * @param event {Object} WebSocket event object.
 */
wsc.WebSocket.prototype.ondisconnect = function( event ) {

    this.sock = null;
    this.conn = null;
    this._disconnect( event );

};

/**
 * Connect to the server.
 * 
 * @method connect
 */
wsc.WebSocket.prototype.connect = function(  ) {

    var tr = this;
    this.conn = new WebSocket( this.server );
    this.conn.onopen = function(event, sock) { tr.onopen( event, sock ) };
    this.conn.onmessage = function(event) { tr._message( event ); };
    this.conn.onclose = function(event) { tr.ondisconnect( event ); };

};

/**
 * Send a message to the server.
 * 
 * @method send
 * @param message {String} message to send to the server.
 */
wsc.WebSocket.prototype.send = function( message ) {

    if( this.sock == null )
        return -1;
    
    return this.sock.send(message);

};

/**
 * Close the connection.
 * 
 * @method close
 */
wsc.WebSocket.prototype.close = function(  ) {

    if( this.sock == null )
        return;
    
    this.sock.close();

};


/**
 * SocketIO wrapper.
 * 
 * @class SocketIO
 * @constructor
 * @param server {String} Address for the server to connect to.
 * @param [open=wsc.SocketIO.sopen] {Method} This method will be called when
 *   a connection is established with the server.
 * @param [message=wsc.SocketIO.smessage] {Method} When a message is received
 *   on the transport, this method will be called.
 * @param [disconnect=wsc.SocketIO.sdisconnect] {Method} The method to be
 *   called when the connection has been closed.
 */
wsc.SocketIO = function(  ) {};
wsc.SocketIO.prototype = new wsc.Transport('');
wsc.SocketIO.prototype.constructor = wsc.SocketIO;




/* wsc lib - photofroggy
 * Generic useful functions or something.
 */

// Function scope binding. Convoluted weirdness. Lol internet.
Function.prototype.bind = function( scope ) {
    var _function = this;
    
    return function () {
        return _function.apply( scope, arguments );
    };
}; 

// Some other constructor type thing?
function scope_methods( scope, methods ) {

    for( cbn in methods ) {
        scope[cbn] = methods[cbn].bind( scope );
    }

}

Function.prototype.scope_methods = function( scope, methods ) {

    for( cbn in methods ) {
        scope[cbn] = methods[cbn].bind( scope );
    }

};

// Alternate binding interface
function bind( scope, cb ) {
    return cb.bind( scope );
}

// Fetch url GET variable. 
function $_GET( q, s ) {
    s = s || window.location.search;
    var re = new RegExp('&'+q+'(?:=([^&]*))?(?=&|$)','i'); 
    s = s.replace(/^\?/,'&').match(re); 
    if(s) 
        return typeof s[1] != 'undefined' ? decodeURIComponent(s[1].replace(/\+/g, '%20')) : ''; 
}

//This returns the unix time stamp as a JS Date object in the local timezone.
function UnixTimestamp(ts) {
    ret = new Date(ts * 1000)
    return ret
}

var Months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

function PosEnd( end ) {
    return end == '1' ? 'st' : ( end == '2' ? 'nd' : ( end == '3' ? 'rd' : 'th' ) );
}

// Date stamp
function DateStamp(ts) {
    ts = UnixTimestamp(ts);
    date = String(ts.getDate()); month = ts.getMonth();
    df = date[date.length-1];
    return date + PosEnd( df ) + ' of ' + Months[month] + ', ' + ts.getFullYear();
}

// Case insensitive sort function.
function caseInsensitiveSort( a, b ) {
    a = a.toLowerCase(); b = b.toLowerCase();
    return ( ( a > b ) ? 1 : ( a < b ? -1 : 0 ) );
}

function CanCreateWebsocket() {
    if(window["WebSocket"]) {
        return true
    }
    return false
}

// TODO: use fallbacks?
function CreateWebSocket(url, onclose, onmessage, onopen) {
    if(!CanCreateWebsocket()) {
        throw "This browser does not support websockets.";
    }
    var sock = null;
    if( typeof io === 'undefined' ) {
        sock = new WebSocket(url)
        sock.onclose = onclose;
        sock.onmessage = onmessage;
        sock.onopen = onopen;
    } else {
        sock = io.connect();
        onopen({}, sock);
        sock.on('message', onmessage);
        sock.on('disconnect', onclose);
    }
    return sock;
}

// Escape special characters for regexes.
function EscapeRegExp( text ) {
    return text.replace((new RegExp('(\\' + [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ].join('|\\') + ')', 'g')), '\\$1');
}

// Replace all occurances of `search` with `replace`.
String.prototype.replacePArg = function( search, replace ) {
    return replaceAll(this, search, replace);
};

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

String.prototype.replaceAll = function ( search, replace ) {
    return replaceAllRaw( this, search, replace );
};

// Replace all stuff with some shit idk.
replaceAllRaw = function ( text, search, replace ) {
    while( text.indexOf( search ) > -1 ) {
        text = text.replace( search, replace );
    }
    return text;
};

replaceAll = function( text, search, replace ) {
    search = new RegExp(EscapeRegExp(search), 'g');
    return text.replace(search, replace || '');
};

// Size of an associative array, wooo!
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.steal = function( a, b ) {
    for( index in b )
        a[index] = b[index];
};

Object.extend = function( a, b ) {
    obj = {};
    Object.steal(obj, a);
    Object.steal(obj, b);
    return obj;
};
/* wsc packets - photofroggy
 * Methods to parse and create packets for the chat protocol.
 */

var chains = [["recv", "admin"]];

wsc.Packet = function( data, separator ) {

    if(!( data )) {
        return null;
    }
    
    var pkt = { cmd: null, param: null, arg: {}, body: null, sub: [], raw: data };
    separator = separator || '=';
    
    try {
        // Crop the body.
        idx = data.indexOf('\n\n');
        if( idx > -1 ) {
            pkt.body = data.substr(idx + 2);
            data = data.substr( 0, idx );
        }
        
        args = data.split('\n');
        
        if( args[0].indexOf( separator ) == -1 ) {
            cline = args.shift().split(' ');
            pkt.cmd = cline.shift() || null;
            if( cline.length > 0 )
                pkt.param = cline.join(' ');
        }
        
        for( n in args ) {
            arg = args[n];
            si = arg.search(separator);
            
            if( si == -1 )
                continue;
            
            pkt.arg[arg.substr( 0, si )] = arg.substr( si + separator.length ) || '';
        }
        
        if( pkt.body != null ) {
            subs = pkt.body.split('\n\n');
            for(i in subs) {
                sub = wsc.Packet( subs[i], separator );
                if( sub == null )
                    break;
                pkt.sub.push( sub );
            }
        }
        
    } catch(e) {
        return null;
    }
    
    pkt.toString = function() { return packetToString(pkt); };
    pkt.name = packetEvtName(pkt);
    
    return pkt;

};

// Make a packet string from some given data.
function wsc_packetstr( cmd, param, args, body ) {
    var ret = '';
    if(cmd) {
        ret = cmd
        if(param) {
            ret = ret + " " + param;
        }
    }
    if(args) {
        for(var key in args) {
            ret = ret + "\n" + key + "=" + args[key];
        }
    }
    ret = ret + "\n";
    if(body) {
        ret = ret + "\n" + body;
    }
    return ret;
}

function packetToString(pkt) {
    return wsc_packetstr(pkt.cmd, pkt.param, pkt.arg, pkt.body);
}

// Get the event name of a given packet.
function packetEvtName( pkt ) {
    
    var name = pkt["cmd"];
    var cmds = null;
    for(var index in chains) {
        
        cmds = chains[index];
        
        if(cmds[0] != name)
            continue;
        
        var sub = pkt.sub[0];
        name = name + '_' + sub["cmd"];
        
        if(cmds.length > 1 && sub["param"] != undefined) {
            if(cmds[1] == sub["cmd"])
                return name + '_' + sub["param"];
        }
    
    }
    
    return name;
}
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

/**
 * Represents a string that possibly contains tablumps.
 * Use different object methods to render the tablumps differently.
 * 
 * @example
 *   // Parse something.
 *   msg = new wsc.TablumpString('hey, check &b\t&a\thttp://google.com\tgoogle.com\tgoogle&/a\t&/b\t for answers.');
 *   console.log(msg.raw); // 'hey, check &b\t&a\thttp://google.com\tgoogle.com\tgoogle&/a\t&/b\t for answers.'
 *   console.log(msg.text()); // 'hey, check [link:http://google.com]google[/link] for answers.'
 *   console.log(msg.html()); // 'hey, check <b><a href="http://google.com">google</a></b> for answers.'
 *   console.log(msg.ansi()); // 'hey, check \x1b[1m[link:http://google.com]google[/link]\x1b[22m for answers.'
 * 
 * @class TablumpString
 * @constructor
 * @param data {String} String possibly containing tablumps.
 * @param parser {Object} A reference to a tablumps parser. Not required.
 */
wsc.TablumpString = function(data, parser) {
    this._parser = parser || new wsc.Tablumps();
    this.raw = data;
    this._text = null;
    this._html = null;
    this._ansi = null;
};

with(wsc.TablumpString.prototype = new String) {
    constructor = wsc.TablumpString;
    toString = valueOf = function() { return this.raw; };
}

/**
 * @function html
 * 
 * Render the tablumps as HTML entities.
 */
wsc.TablumpString.prototype.html = function() {
    if(this._html == null)
        this._html = this._parser.render(1, this.raw);
    return this._html;
};

/**
 * @function text
 *
 * Render the tablumps in plain text where possible. Some tablumps appear as
 * HTML entities even through this.
 */
wsc.TablumpString.prototype.text = function() {
    if(this._text == null)
        this._text = this._parser.render(0, this.raw);
    return this._text;
};

/**
 * @function ansi
 * 
 * Render the tablumps with ANSI escape sequences.
 * 
 * For this rendering method to really be worth it, I'll actually have to move
 * away from the simple regex.
 */
wsc.TablumpString.prototype.ansi = function() {
    if(this._ansi == null)
        this._ansi = this._parser.render(2, this.raw);
    return this._ansi;
};


/**
 * @object wsc.Tablumps
 *
 * Constructor for the tablumps parser.
 */
wsc.Tablumps = function(  ) {

    this.lumps = this.defaultMap();
    this._list = [];
    this._dent = 0;

};

/**
 * @function registerMap
 *
 * I should probably deprecate this. Sets the rendering map to the given map.
 */
wsc.Tablumps.prototype.registerMap = function( map ) {
    this.lumps = map;
};

/**
 * @function extend
 *
 * Add the given rendering items to the parser's render map.
 */
wsc.Tablumps.prototype.extend = function( map ) {
    for(index in map) {
        this.lumps[index] = map[index];
    }
};

/**
 * @function _list_start
 * Initiate a list.
 */
wsc.Tablumps.prototype._list_start = function( ol ) {
    list = {};
    list.ol = ol || false;
    list.count = 0;
    ret = this._list[0] ? '' : '\n';
    this._dent++;
    this._list.unshift(list);
    return ret;
};

/**
 * @function _list_end
 * Finish a list.
 */
wsc.Tablumps.prototype._list_end = function( ) {
    if( this._list.length == 0 ) {
        return '';
    }
    
    list = this._list.shift();
    this._dent--;
    return ( this._dent == 0 && list.count == 0 ) ? '\n' : '';
};

/**
 * @function defaultMap
 * 
 * Get all the default nonsense.
 */
wsc.Tablumps.prototype.defaultMap = function () {
    /* Tablumps formatting rules.
     * This object can be defined as follows:
     *     lumps[tag] => [ arguments, render[, render[, ...]] ]
     * ``tag`` is the tablumps-formatted tag to process.
     * ``arguments`` is the number of arguments contained in the tablump.
     * ``render`` defines a rendering for the tablump. The render argument
     *            can be a formatting string or a function that returns a
     *            string. The first render method should render plain text;
     *            the second, html; the third, ansi escape sequences.
     */
    
    return {
        // There are a lot of 0 arg things here...
        // Would use regex but that'd be less flexible.
        '&b\t': [0, '', '<b>', '\x1b[1m'],
        '&/b\t': [0, '', '</b>', '\x1b[22m'],
        '&i\t': [0, '', '<i>', '\x1b[3m'],
        '&/i\t': [0, '', '</i>', '\x1b[23m'],
        '&u\t': [0, '', '<u>', '\x1b[4m'],
        '&/u\t': [0, '', '</u>', '\x1b[24m'],
        '&s\t': [0, '', '<s>', '\x1b[9m'],
        '&/s\t': [0, '', '</s>', '\x1b[29m'],
        '&sup\t': [0, '/', '<sup>'],
        '&/sup\t': [0, '/', '</sup>'],
        '&sub\t': [0, '\\', '<sub>'],
        '&/sub\t': [0, '\\', '</sub>'],
        '&code\t': [0, '``', '<code>'],
        '&/code\t': [0, '``', '</code>'],
        '&p\t': [0, '\n', '<p>'],
        '&/p\t': [0, '\n', '</p>'],
        '&ul\t': [0, function( data ) { return this._list_start(); }, '<ul>'],
        '&/ul\t': [0, function( data ) { return this._list_end(); }, '</ul>'],
        '&ol\t': [0, function( data ) { return this._list_start(true); }, '<ol>'],
        '&li\t': [0, function( data ) {
                list = this._list[0] || {count: 0, ol: false};
                list.count++;
                buf = '\n';
                for(var ind = 0; ind < this._dent; ind++) {
                    buf = buf + '  ';
                }
                if( list.ol ) {
                    buf = buf + String(list.count) + '.';
                } else {
                    buf = buf + '*';
                }
                return buf + ' ';
            }, '<li>' ],
        '&/li\t': [0, '\n', '</li>'],
        '&/ol\t': [0, function( data ) { return this._list_end(true); }, '</ol>'],
        '&link\t': [ 3,
            function( data ) {
                return '[link:' + data[0] + ']' + (data[1] || '') + '[/link]';
            },
            function( data ) {
                t = data[1];
                return '<a target="_blank" href="'+data[0]+'" title="'+( t || data[0] )+'">'+( t || '[link]' )+'</a>';
            }
        ],
        '&acro\t': [ 1, '[acro:{0}]', '<acronym title="{0}">' ],
        '&/acro\t': [0, '[/acro]', '</acronym>'],
        '&abbr\t': [ 1, '[abbr:{0}]', '<abbr title="{0}">'],
        '&/abbr\t': [ 0, '[/abbr]', '</abbr>'],
        '&img\t': [ 3, '`{2}`({0})', '<img src="{0}" alt="{1}" title="{2}" />'],
        '&iframe\t': [ 3, '[iframe:{0}]', '<iframe src="{0}" width="{1}" height="{2}" />'],
        '&/iframe\t': [ 0, '', '</iframe>'],
        '&a\t': [ 2, '[link:{0}]', '<a target="_blank" href="{0}" title="{1}">' ],
        '&/a\t': [ 0, '[/link]', '</a>'],
        '&br\t': [ 0, '\n', '<br/>' ],
        '&bcode\t': [0, '\n', '<span><pre><code>'],
        '&/bcode\t': [0, '\n', '</code></pre></span>'],
        // Used to terminate a line.
        // Allows us to reset graphic rendition parameters.
        'EOF': [0, '', null, '\x1b[m']
    };

};


/**
 * @function parse
 *
 * Create a wsc.TablumpString obejct and return it.
 */
wsc.Tablumps.prototype.parse = function( data, sep ) {
    return new wsc.TablumpString(data, this);
};

/**
 * @function render
 *
 * Render tablumps in a given format.
 * 
 * Here, the flag should be a number, and defines the index of the renderer
 * to use when rendering a tablump. Setting `flag` to 0 will result in the
 * first renderer being used. In the render map, the plain text renderers come
 * first, and also act as a default.
 * 
 * Setting `flag` to 1 causes the parser to render tablumps as HTML elements
 * where possible. Setting `flag` to 2 causes the parser to render tablumps as
 * ANSI escape sequence formatted strings where possible.
 */
wsc.Tablumps.prototype.render = function( flag, data ) {
    if( !data )
        return '';
    
    sep = '\t';
    flag = flag + 1;
    
    for( var i = 0; i < data.length; i++ ) {
        
        // All tablumps start with &!
        if( data[i] != '&' )
            continue;
        
        // We want to work on extracting the tag. First thing is split
        // the string at the current index. We don't need to parse
        // anything to the left of the index.
        primer = data.substring(0, i);
        working = data.substring(i);
        
        // Next make sure there is a tab character ending the tag.
        ti = working.indexOf('\t');
        if( ti == -1 )
            continue;
        
        // Now we can crop the tag.
        tag = working.substring(0, ti + 1);
        working = working.substring(ti + 1);
        
        // Render the tablump.
        rendered = this.renderOne(flag, tag, working);
        
        // Didn't manage to render?
        if( rendered === null ) {
            i++;
            continue;
        }
        
        // Glue everything back together.
        data = primer + rendered[0];
        i = i + (rendered[1] - 1);
        
    }
    
    // Replace the simpler tablumps which do not have arguments.
    //data = data.replace(this.repl[0], this.repl[1]);
    
    return data + this.renderOne( flag, 'EOF', '' )[0];
};

/**
 * @function renderOne
 * Render a single tablump.
 */
wsc.Tablumps.prototype.renderOne = function( type, tag, working ) {
    lump = this.lumps[tag];
    
    // If we don't know how to parse the tag, leave it be!
    if( lump === undefined ) {
        return null;
    }

    // Crop the rest of the tablump!
    if( lump[0] == 0 )
        cropping = [[], working];
    else
        cropping = this.tokens(working, lump[0], sep);
    
    // Get our renderer.
    renderer = lump[type] || lump[1];
    
    // Parse the tablump if we can.
    if( typeof(renderer) == 'string' )
        parsed = renderer.format.apply(renderer, cropping[0]);
    else
        parsed = renderer.call(this, cropping[0]);
    
    return [parsed + cropping[1], parsed.length];
};

/**
 * @function tokens
 * Return n tokens from any given input.
 *
 * Tablumps contain arguments which are separated by tab characters. This
 * method is used to crop a specific number of arguments from a given
 * input.
 */
wsc.Tablumps.prototype.tokens = function( data, limit, sep, end ) {
    sep = sep || '\t';
    end = end || '&';
    tokens = [];
    
    for( i = limit; i > 0; i-- ) {
        find = data.indexOf(sep);
        
        if( find == -1 )
            break;
        
        tokens.push( data.substring(0, find) );
        data = data.substring(find + 1);
        
        if( tokens[tokens.length - 1] == end ) {
            tokens.pop();
            break;
        }
    }
    
    return [tokens, data];
};

var dAmn_avext = [ 'gif', 'gif', 'jpg', 'png' ];

function dAmn_avatar( un, icon ) {
    icon = parseInt(icon);
    cachebuster = (icon >> 2) & 15;
    icon = icon & 3;
    ext = dAmn_avext[icon] || 'gif';
    
    if (cachebuster) {
        cachebuster = '?' + cachebuster;
    }
    else {
        cachebuster = '';
    }
    
    if( icon == 0 ) { 
        ico = 'default';
    } else {
        ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
        
        ico = '$un[0]/$un[1]/{un}'.replace(ru, function ( m, s, i ) {
            return un[i].toLowerCase();
        });
        ico = ico.replacePArg( '{un}', un.toLowerCase() );
    }
    
    return '<a target="_blank" title=":icon'+un+':" href="http://'+un+'.deviantart.com/"><img class="avatar"\
            alt=":icon'+un+':" src="http://a.deviantart.net/avatars/'+ico+'.'+ext+cachebuster+'" height="50" width="50" /></a>';
}

wsc.dAmnLumps = function(  ) {

    console.log(this);
    this.lumps = this.defaultMap();
    this._list = [];
    this._dent = 0;
    this.extend(dAmnLumps);

};

wsc.dAmnLumps.prototype = new wsc.Tablumps;
wsc.dAmnLumps.prototype.constructor = wsc.dAmnLumps;

/**
 * @function dAmnLumps
 * dAmn tablumps map.
 *
 * This function returns a map which can be used by the tablumps parser to parse
 * dAmn's tablumps.
 */
function dAmnLumps( opts ) {
    return {
        '&avatar\t': [ 2,
            ':icon{0}:',
            function( data ) { return dAmn_avatar( data[0], data[1] ); }
        ],
        '&emote\t': [ 5,
            '{0}',
            '<img alt="{0}" width="{1}" height="{2}" title="{3}" src="http://e.deviantart.com/emoticons/{4}" />'
        ],
        '&dev\t': [ 2,
            ':dev{1}:',
            '{0}<a target="_blank" alt=":dev{1}:" href="http://{1}.deviantart.com/">{1}</a>',
            '{0}\x1b[36m{1}\x1b[39m'
        ],
        '&thumb\t': [ 7,
            ':thumb{0}:',
            function( data ) {
                id = data[0];
                user = data[2];
                dim = data[3].split('x'); w = parseInt(dim[0]); h = parseInt(dim[1]);
                f = data[5];
                flags = data[6].split(':');
                lu = user.substring(1).replace(/^[^a-zA-Z0-9\-_]/, '');
                // Deviation title.
                t = data[1];
                ut = (t.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+/, '').replace(/-+$/, '') || '-') + '-' + id;
                // Deviation link tag. First segment only.
                title = t + ' by ' + user + ', ' + w + 'x' + h;
                dal = '<a target="_blank" href="http://' + lu + '.deviantart.com/art/' + ut + '" title="' + title + '"';
                
                // Time to go through the flags.
                if( flags[1] != '0' )
                    return dal + '>[mature deviation: ' + t + ']</a>';
                
                if( flags[2] != '0' )
                    return dal + '>[deviation: ' + t + ']</a>';
                
                shadow = flags[0] == '0';
                isgif = f.match( /\.gif$/i );
                
                if( isgif && ( w > 100 || h > 100 ) )
                    return dal + '>[deviation: ' + t + ']</a>';
                
                server = parseInt(data[4]);
                
                if( w/h > 1) {
                    th = parseInt((h * 100) / w);
                    tw = 100;
                } else {
                    tw = parseInt((w * 100) / h);
                    th = 100;
                }
                
                if( tw > w || th > h ) {
                    tw = w;
                    th = h;
                }
                
                if( isgif ) {
                    f = f.replace(/:/, '/');
                    path = 'http://fc0' + server + '.deviantart.net/' + f;
                    det = f.split('/');
                    if( det.length > 1 ) {
                        det = det['.'];
                        if( det && det.length > 2 )
                            path = 'http://' + file;
                    }
                    return dal + '><img class="thumb" title="' + title +
                        '" width="'+tw+'" height="'+th+'" alt=":thumb'+id+':" src="' + path +'" /></a>';
                }
                path = 'http://backend.deviantart.com/oembed?url=http://www.deviantart.com/deviation/'+id+'&format=thumb150';
                
                if( f.match(/.png$/i) )
                    shadow = false;
                
                return dal + '><img class="thumb' + ( shadow ? ' shadow' : '' ) + '" width="'+tw+'" height="'+
                    th+'" alt=":thumb'+id+':" src="'+path+'" /></a>';
            }
        ],
    };

}/**
 * Parser for dAmn-like protocols.
 * 
 * @class Protocol
 * @constructor
 * @param [tablumps=wsc.Tablumps] {Object} Tablumps parser instance.
 */
wsc.Protocol = function( tablumps ) {

    this.tablumps = tablumps || new wsc.Tablumps;
    this.chains = [["recv", "admin"]];
    
    // Mappings for every packet.
    this.maps = {
        'chatserver': ['version'],
        'login': ['username', ['e'], 'data'],
        'join': ['ns', ['e'] ],
        'part': ['ns', ['e', '*r'] ],
        'property': ['ns', ['p', 'by', 'ts'], '*value' ],
        'recv_msg': [null, [['from', 'user']], '*message'],
        'recv_npmsg': [null, [['from', 'user']], 'message'],
        'recv_action': [null, ['s', ['from', 'user']], '*message'],
        'recv_join': ['user', ['s'], '*info'],
        'recv_part': ['user', ['s', 'r']],
        'recv_privchg': ['user', ['s', 'by', 'pc']],
        'recv_kicked': ['user', [['i', 's'], 'by'], '*r'],
        'recv_admin_create': [null, ['p', ['by', 'user'], ['name', 'pc'], 'privs']],
        'recv_admin_update': [null, ['p', ['by', 'user'], ['name', 'pc'], 'privs']],
        'recv_admin_rename': [null, ['p', ['by', 'user'], 'prev', ['name', 'pc']]],
        'recv_admin_move': [null, ['p', ['by', 'user'], 'prev', ['name', 'pc'], ['n', 'affected']]],
        'recv_admin_remove': [null, ['p', ['by', 'user'], ['name', 'pc'], ['n', 'affected']]],
        'recv_admin_show': [null, ['p'], 'info'],
        'recv_admin_showverbose': [null, ['p'], 'info'],
        'recv_admin_privclass': [null, ['p', 'e'], 'command'],
        'kicked': ['ns', [['by', 'user']], '*r'],
        'ping': [],
        'disconnect': [null, ['e']],
        'send': ['ns', ['e']],
        'kick': ['ns', [['u', 'user'], 'e']],
        'get': ['ns', ['p', 'e']],
        'set': ['ns', ['p', 'e']],
        'kill': ['ns', ['e']],
        'unknown': [null, null, null, 'packet'],
    };
    
    // Mapping callbacks!
    var p = this;
    this.mapper = {
        "recv": function( packet, args, mapping ) {
            args.ns = packet.param;
            sub = new wsc.Packet( packet.body );
            
            if( sub.cmd == 'admin' ) {
                ssub = new wsc.Packet( sub.body );
                return p.map(ssub, args, mapping);
            }
            
            return p.map(sub, args, mapping);
        }
        
    };
    
    this.messages = {
        'chatserver': ['<span class="servermsg">** Connected to llama {version} *</span>', false, true ],
        'login': ['<span class="servermsg">** Login as {username}: "{e}" *</span>', false, true],
        'join': ['<span class="servermsg">** Join {ns}: "{e}" *</span>', true],
        'part': ['<span class="servermsg">** Part {ns}: "{e}" * <em>{*r}</em></span>', true],
        'property': ['<span class="servermsg">** Got {p} for {ns} *</span>', true],
        'recv_msg': ['<span class="cmsg user"><strong>&lt;{user}&gt;</strong></span><span class="cmsg">{message}</span>'],
        'recv_action': ['<span class="caction user"><em>* {user}</em></span><span class="caction">{message}</span>'],
        'recv_join': ['<span class="cevent bg">** {user} has joined *</span>'],
        'recv_part': ['<span class="cevent bg">** {user} has left * <em>{r}</em></span>'],
        'recv_privchg': ['<span class="cevent">** {user} has been made a member of {pc} by {by} *</span>'],
        'recv_kicked': ['<span class="cevent">** {user} has been kicked by {by} * <em>{*r}</em></span>'],
        'recv_admin_create': ['<span class="cevent admin">** Privilege class {pc} has been created by {user} with: {privs} *</span>'],
        'recv_admin_update': ['<span class="cevent admin">** Privilege class {pc} has been updated by {user} with: {privs} *</span>'],
        'recv_admin_rename': ['<span class="cevent admin">** Privilege class {prev} has been renamed to {name} by {user} *</span>'],
        'recv_admin_move': ['<span class="cevent admin">** All members of {prev} have been moved to {pc} by {user} -- {affected} affected user(s) *</span>'],
        'recv_admin_remove': ['<span class="cevent admin">** Privilege class {pc} has been removed by {user} -- {affected} affected user(s) *</span>'],
        'recv_admin_show': null,
        'recv_admin_showverbose': null,
        'recv_admin_privclass': ['<span class="cevent admin">** Admin command "{command}" failed: {e} *</span>'],
        'kicked': ['<span class="servermsg">** You have been kicked by {user} * <em>{r}</em></span>'],
        'ping': null, //['<span class="servermsg">** Ping...</span>', true],
        'disconnect': ['<span class="servermsg">** You have been disconnected * <em>{e}</em></span>', false, true],
        // Stuff here is errors, yes?
        'send': ['<span class="servermsg">** Send error: <em>{e}</em></span>'],
        'kick': ['<span class="servermsg">** Could not kick {user}: <em>{e}</em></span>'],
        'get': ['<span class="servermsg">** Could not get {p} info for {ns}: <em>{e}</em></span>'],
        'set': ['<span class="servermsg">** Could not set {p}: <em>{e}</em></span>'],
        'kill': ['<span class="servermsg">** Kill error: <em>{e}</em></span>'],
        'unknown': ['<span class="servermsg">** Received unknown packet in {ns}: <em>{packet}</em></span>', true],
    };

};

/**
 * Extend the protocol maps.
 * 
 * @method extend_maps
 * @param maps {Object} An object containing packet mappings.
 */
wsc.Protocol.prototype.extend_maps = function( maps ) {

    for( key in maps ) {
        this.maps[key] = maps[key];
    }

};

/**
 * Extend the protocol message renderers.
 * 
 * @method extend_messages
 * @param messages {Object} An object containing packet rendering methods.
 */
wsc.Protocol.prototype.extend_messages = function( messages ) {

    for( key in messages ) {
        this.messages[key] = messages[key];
    }

};

/**
 * Parse a packet.
 * 
 * @method parse
 * @param packet {Object} Packet object.
 */
wsc.Protocol.prototype.parse = function( packet ) {

    name = this.event( packet );
    
    if( !(name in this.maps) ) {
        console.log('unknown: ',name);
        console.log(this.maps);
        mapping = this.maps.unknown;
        name = 'unknown';
    } else {
        mapping = this.maps[name];
    }
    
    var args = { 'name': name, 'pkt': packet, 'ns': null };
    cmd = packet.cmd;
    
    if( this.mapper[cmd] )
        this.mapper[cmd](packet, args, mapping);
    else
        this.map(packet, args, mapping);
    
    return args;

};

/**
 * Get the event name of a packet.
 * 
 * @method event
 * @param pkt {Object} Packet object.
 * @return {String} Packet event name.
 */
wsc.Protocol.prototype.event = function( pkt ) {

    var name = pkt["cmd"];
    var cmds = null;
    for(var index in this.chains) {
        
        cmds = this.chains[index];
        
        if(cmds[0] != name)
            continue;
        
        var sub = pkt.sub[0];
        name = name + '_' + sub["cmd"];
        
        if(cmds.length > 1 && sub["param"] != undefined) {
            if(cmds[1] == sub["cmd"])
                return name + '_' + sub["param"];
        }
    
    }
    
    return name;

};

/**
 * Map a packet to an event object.
 * 
 * @method map
 * @param packet {Object} Packet object.
 * @param event {Object} Event data object.
 * @param map {Object} Packet mapping data.
 */
wsc.Protocol.prototype.map = function( packet, event, map ) {

    for(var i in mapping) {
        if( mapping[i] == null)
            continue;
        
        key = mapping[i];
        skey = key;
        switch(parseInt(i)) {
            // e.<map[event][0]> = packet.param
            case 0:
                event[key] = packet['param'];
                break;
            // for n in map[event][1]: e.<map[event][1][n]> = packet.arg.<map[event][1][n]>
            case 1:
                if( mapping[1] instanceof Array ) {
                    for( n in mapping[1] ) {
                        key = mapping[1][n];
                        if( key instanceof Array ) {
                            event[key[1]] = packet['arg'][key[0]];
                            skey = key[1];
                        } else {
                            k = key[0] == '*' ? key.slice(1) : key;
                            event[key] = packet['arg'][k] || '';
                            skey = key;
                        }
                    }
                }
                
                if( typeof mapping[1] == 'string' ) {
                    // Here we want to accept the packet args as they are. All of them.
                    event[key] = packet.arg.slice(0);
                }
                break;
            // e.<map[event][2]> = packet.body
            case 2:
                if( key instanceof Array ) {
                    this.mapPacket(event, new wsc.Packet(packet['body']), key);
                } else {
                    event[key] = packet['body'];
                }
                break;
            case 3:
                event[key] = packet.raw;
                break;
        }
        
        if( skey[0] != '*' )
            continue;
        
        k = skey.slice(1);
        val = this.tablumps.parse( event[skey] );
        event[k] = val;
    }

};

/**
 * Render a protocol message in the given format.
 * 
 * @method render
 * @param format {String} Format to render the event in.
 * @param event {Object} Event data.
 * @return {String} Rendered event.
 */
wsc.Protocol.prototype.render = function( event, format ) {

    msgm = this.messages[event.name];
    
    if( !msgm )
        return '';
    
    msg = msgm[0];
    
    for( key in event ) {
        d = event[key];
        
        if( key == 'ns' || key == 'sns' ) {
            key = 'ns';
            d = event['sns'];
        }
        if( d.hasOwnProperty('_parser') ) {
            switch(format) {
                case 'text':
                    d = d.text();
                    break;
                case 'html':
                    d = d.html();
                    break;
                case 'ansi':
                    d = d.ansi();
                    break;
                default:
                    d = d.text();
                    break;
            }
        }
        msg = replaceAll(msg, '{'+key+'}', d);
    }
    
    return msg;

};


wsc.Protocol.prototype.log = function( client, event ) {

    msgm = this.messages[event.name];
    
    if( !msgm )
        return;
    
    if( event.s == '0' ) {
        return;
    }
    
    msg = this.render(event, 'html');
    
    if( !msgm[2] ) {
        if( !msgm[1] )
            client.ui.channel(event.ns).log_item(msg);
        else
            client.ui.channel(client.mns).log_item(msg);
    } else {
        client.ui.log_item(msg);
    }

};

/**
 * Control the client's program flow in relation to the chat this.
 * 
 * @class Flow
 * @constructor
 * @param protocol {Object} Protocol object.
 */
wsc.Flow = function( protocol ) {

    this.protocol = protocol || new wsc.Protocol();

};

// Established a WebSocket connection.
wsc.Flow.prototype.open = function( client, event, sock ) {
    client.trigger('connected', {name: 'connected', pkt: new wsc.Packet('connected\n\n')});
    client.connected = true;
    client.handshake();
    client.attempts = 0;
};

// WebSocket connection closed!
wsc.Flow.prototype.close = function( client, event ) {
    client.trigger('closed', {name: 'closed', pkt: new wsc.Packet('connection closed\n\n')});
    
    if(client.connected) {
        client.ui.server_message("Connection closed");
        client.connected = false;
    } else {
        client.ui.server_message("Connection failed");
    }
    
    // For now we want to automatically reconnect.
    // Should probably be more intelligent about this though.
    if( client.attempts > 2 ) {
        client.ui.server_message("Can't connect. Try again later.");
        client.attempts = 0;
        return;
    }
    
    client.ui.server_message("Connecting in 2 seconds");
    
    setTimeout(function () {
        client.conn.connect();
        client.ui.server_message('Opening connection');
    }, 2000);

}; 

// Received data from WebSocket connection.
wsc.Flow.prototype.message = function( client, event ) {
    var pack = new wsc.Packet(event.data);
    
    if(pack == null)
        return;
    
    var pevt = this.protocol.parse(pack);
    
    if( pevt.ns == null )
        pevt.ns = client.mns;
    
    pevt.sns = client.deform_ns(pevt.ns);
    this.protocol.log(client, pevt);
    this.handle(client, pevt);
    
    client.trigger('pkt', pevt);
    client.trigger('pkt.'+pevt.name, pevt);
    //this.monitor(data);
};

/**
 * Handle a packet event.
 * 
 * @method handle
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.handle = function( client, event ) {

    this[event.name](event, client);

};

/**
 * Respond to pings from the server.
 * 
 * @method ping
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.ping = function( event, client ) {
    client.pong();
};

/**
 * Respond to a llama-style handshake.
 * 
 * @method chatserver
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.chatserver = function( event, client ) {
    client.login();
};

/**
 * Process a login packet
 * 
 * @method login
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.login = function( event, client ) {
    
    if(event.pkt["arg"]["e"] == "ok") {
        // Use the username returned by the server!
        info = new wsc.Packet('info\n' + event.data);
        client.settings["username"] = event.pkt["param"];
        client.settings['symbol'] = info.arg.symbol;
        client.settings['userinfo'] = info.arg;
        // Autojoin!
        // TODO: multi-channel?
        if ( client.fresh )
            client.join(client.settings["autojoin"]);
        else {
            for( key in client.channelo ) {
                if( client.channelo[key].namespace[0] != '~' )
                    client.join(key);
            }
        }
    } else {
        //client.close();
    }
    
    if( client.fresh )
        client.fresh = false;
    
    
};

/**
 * Received a join packet.
 * 
 * @method join
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.join = function( event, client ) {
    if(event.pkt["arg"]["e"] == "ok") {
        ns = client.deform_ns(event.pkt["param"]);
        //client.monitor("You have joined " + ns + '.');
        client.create_ns(ns);
        client.ui.channel(ns).server_message("You have joined " + ns);
    } else {
        client.ui.chatbook.current.server_message("Failed to join " + client.deform_ns(event.pkt["param"]), event.pkt["arg"]["e"]);
    }
};

/**
 * Received a part packet.
 * 
 * @method part
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.part = function( event, client ) {
    ns = client.deform_ns(event.ns);
    c = client.channel(ns);
    
    if(event.e == "ok") {
        info = '';
        if( event.r )
            info = '[' + event.r + ']';
        
        msg = 'You have left ' + ns;
        c.server_message(msg, info);
        
        if( info == '' )
            client.remove_channel(ns);
        
        if( client.channels() == 0 ) {
            switch( event.r ) {
                case 'bad data':
                case 'bad msg':
                case 'msg too big':
                    break;
                default:
                    if( event.r.indexOf('killed:') < 0 )
                        return;
                    break;
            }
            this.process_data( { data: 'disconnect\ne='+e.r+'\n' } );
        }
    } else {
        client.monitor('Couldn\'t leave ' + ns, event.e);
        c.server_message("Couldn't leave "+ns, event.e);
    }
    
};

/**
 * Client has been kicked from a channel.
 * 
 * @method kicked
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.kicked = function( event, client ) {

    if( event.r.toLowerCase().indexOf('autokicked') > -1 )
        return;
    client.join(event.ns);

};

/**
 * Process a property packet.
 * 
 * @method property
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.property = function( event, client ) {
    //console.log(event.pkt["arg"]["p"]);
    chan = client.channel(event.pkt["param"]);
    
    if( !chan )
        return;
    
    chan.property( event );
};

/**
 * User join or part.
 * 
 * @method recv_joinpart
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_joinpart = function( event, client ) {
    c = client.channel(event.ns);
    if( event.name == 'recv_join')
        c.recv_join( event );
    else
        c.recv_part( event );
};

/**
 * A user joined a channel.
 * 
 * @method recv_join
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_join = wsc.Flow.prototype.recv_joinpart;

/**
 * A user left a channel.
 * 
 * @method recv_part
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_part = wsc.Flow.prototype.recv_joinpart;

/**
 * A message was received in a channel.
 * 
 * @method recv_msg
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_msg = function( event, client ) {
    client.channel(event.ns).recv_msg( event );
};

/**
 * A different kind of message.
 * 
 * @method recv_action
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_action = wsc.Flow.prototype.recv_msg;

/**
 * A non-parsed message.
 * 
 * @method recv_npmsg
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_npmsg = wsc.Flow.prototype.recv_msg;

/**
 * Someone was promoted or demoted.
 * 
 * @method recv_privchg
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_privchg = function( event, client ) {
    client.channel(event.ns).recv_privchg( event );
};

/**
 * Some sucka got kicked foo.
 * 
 * @method recv_kicked
 * @param event {Object} Packet event data.
 * @param client {Object} Client object.
 */
wsc.Flow.prototype.recv_kicked = function( event, client ) {
    client.channel(event.ns).recv_kicked( event );
};




wsc.defaults.Extension = function( client ) {

    /**
     * @object extension
     * The default extension implements the client's default commands.
     */
    var extension = {
    
        /**
         * @constructor init
         * Initialises the extension.
         * 
         * Here, the extension stores a reference to the client and binds the
         * extension's command handlers to their respective command events.
         * 
         * @param [Object] client A reference to a {wsc_client.client wsc client object}.
         */
        init: function( client ) {
            this.client = client;
            // Commands.
            this.client.bind('cmd.set', this.setter.bind(extension) );
            this.client.bind('cmd.connect', this.connect.bind(extension) );
            this.client.bind('cmd.join', this.join.bind(extension) );
            this.client.bind('cmd.part', this.part.bind(extension) );
            this.client.bind('cmd.title', this.title.bind(extension) );
            this.client.bind('cmd.promote', this.promote.bind(extension) );
            this.client.bind('cmd.me', this.action.bind(extension) );
            this.client.bind('cmd.kick', this.kick.bind(extension) );
            this.client.bind('cmd.raw', this.raw.bind(extension) );
            this.client.bind('cmd.say', this.say.bind(extension) );
            this.client.bind('cmd.npmsg', this.npmsg.bind(extension) );
            this.client.bind('cmd.clear', this.clear.bind(extension) );
            // userlistings
            //this.client.bind('set.userlist', this.setUsers.bind(extension) );
            this.client.ui.on('userinfo.before', this.userinfo.bind(extension) );
            // lol themes
            this.client.bind('cmd.theme', this.theme.bind(extension));
        },
        
        theme: function( e, client) {
            theme = client.settings.theme;
            select = e.args.split(' ').shift();
            if( client.default_themes.indexOf(select) == -1 || theme == select)
                return;
            client.view.removeClass( theme ).addClass( select );
            client.settings.theme = select;
        },
        
        /**
         * @function setter
         * @cmd set set configuration options
         * This command allows the user to change the settings for the client through
         * the input box.
         */
        setter: function( e ) {
            data = e.args.split(' ');
            setting = data.shift().toLowerCase();
            data = data.join(' ');
            if( data.length == 0 ) {
                this.client.cchannel.serverMessage('Could not set ' + setting, 'No data supplied');
                return;
            }
            
            if( !( setting in this.client.settings ) ) {
                this.client.cchannel.serverMessage('Unknown setting "' + setting + '"');
                return;
            }
            
            this.client.settings[setting] = data;
            this.client.cchannel.serverMessage('Changed ' + setting + ' setting', 'value: ' + data);
            this.client.control.setLabel();
            
        },
        
        /**
         * @function connect
         * This command allows the user to force the client to connect to the server.
         */
        connect: function( e ) {
            this.client.connect();
        },
        
        // Join a channel
        join: function( e ) {
            chans = e.args.split(' ');
            chans = chans.toString() == '' ? [] : chans;
            
            if( e.ns != e.target )
                chans.unshift(e.target);
            
            if( chans.toString() == '' )
                return;
            
            for( index in chans )
                extension.client.join(chans[index]);
        },
        
        // Leave a channel
        part: function( e ) {
            chans = e.args.split(' ');
            if( e.ns != e.target )
                chans.unshift(e.target);
            //console.log(chans);
            //console.log(chans.length + ', ' + (chans.toString() == ''));
            if( chans.toString() == '' ) {
                extension.client.part(e.ns);
                return;
            }
            for( index in chans )
                extension.client.part(chans[index]);
        },
        
        // Set the title
        title: function( e ) {
            extension.client.title(e.target, e.args);
        },
        
        // Promote user
        promote: function( e ) {
            bits = e.args.split(' ');
            extension.client.promote(e.target, bits[0], bits[1]);
        },
        
        // Send a /me action thingy.
        action: function( e ) {
            extension.client.action(e.target, e.args);
        },
        
        // Send a raw packet.
        raw: function( e ) {
            extension.client.send( e.args.replace(/\\n/gm, "\n") );
        },
        
        // Kick someone.
        kick: function( e ) {
            d = e.args.split(' ');
            u = d.shift();
            r = d.length > 0 ? d.join(' ') : null;
            extension.client.kick( e.target, u, r );
        },
        
        // Say something.
        say: function( e ) {
            extension.client.say( e.target, e.args );
        },
        
        // Say something without emotes and shit. Zomg.
        npmsg: function( e ) {
            extension.client.npmsg( e.target, e.args );
        },
        
        // Clear the channel's log.
        clear: function( e ) {
            this.client.cchannel.logpanel.find('p.logmsg').remove();
            this.client.cchannel.resize();
        },
        
        // Set users, right?
        userinfo: function( event, ui ) {
            event.user.avatar = dAmn_avatar(event.user.name, event.user.member.usericon);
            
            if( event.user.member.realname )
                event.user.info.push(event.user.member.realname);
            
            if( event.user.member.typename )
                event.user.info.push(event.user.member.typename);
        },
    };
    
    extension.init(client);
    return extension;

};
/**
 * Chat client.
 *
 * @class Client
 * @constructor
 * @param view {Object} The client's container element.
 * @param options {Object} Configuration options for the client.
 * @param mozilla {Object} Is firefox being used?
 */
wsc.Client = function( view, options, mozilla ) {

    this.mozilla = mozilla;
    this.fresh = true;
    this.attempts = 0;
    this.protocol = null;
    this.flow = null;
    this.ui = null;
    this.events = new EventEmitter();
    this.conn = null;
    this.channelo = {};
    this.cchannel = null;
    this.cmds = [];
    this.settings = {
        "domain": "website.com",
        "server": "ws://website.com/wsendpoint",
        "symbol": "",
        "username": "",
        "userinfo": {},
        "pk": "",
        // Monitor: `ns`
        "monitor": ['~Monitor', true],
        "welcome": "Welcome to the wsc web client!",
        "autojoin": "chat:channel",
        "control": wsc.Control,
        "protocol": wsc.Protocol,
        "tablumps": wsc.Tablumps,
        "flow": wsc.Flow,
        "ui": Chatterbox.UI,
        "extend": [wsc.defaults.Extension],
        "client": 'chatclient',
        "clientver": '0.3',
        "theme": wsc.defaults.theme,
        "themes": wsc.defaults.themes,
    };
    
    view.extend( this.settings, options );
    this.settings.agent = 'wsc/' + wsc.VERSION + ' (' + this.settings.username + '; ' + navigator.language + '; ' + navigator.platform + ') Chatterbox/' + Chatterbox.VERSION;
    
    //view.append('<div class="wsc '+this.settings['theme']+'"></div>');
    this.ui = new this.settings.ui( view, {
        'themes': this.settings.themes,
        'theme': this.settings.theme,
        'monitor': this.settings.monitor,
        'username': this.settings.username,
        'domain': this.settings.domain
    }, mozilla );
    
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.protocol = new this.settings.protocol( new this.settings.tablumps() );
    this.flow = new this.settings.flow(this.protocol);
    
    this.build();
    
    for(var index in this.settings["extend"]) {
        this.settings["extend"][index](this);
    }
    
    // Welcome!
    this.monitor(this.settings["welcome"]);

};

/**
 * Build the client interface and hook up any required event handlers for the
 * interface. In particular, event handlers are hooked for switching and
 * closing channel tabs.
 * 
 * @method build
 */
wsc.Client.prototype.build = function(  ) {

    this.ui.build();
    this.control = new this.settings.control( this );
    var client = this;
    
    this.ui.on( 'channel.selected', function( event, ui ) {
        client.cchannel = client.channel(event.ns);
        client.control.cache_input(event);
    } );
    
    this.ui.on('tab.close.clicked', function( event, ui ) {
        if( event.chan.monitor )
            return;
        client.part(event.ns);
    } );

};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
wsc.Client.prototype.loop = function(  ) {

    for( key in this.channelo ) {
        c = this.channelo[key];
        msgs = c.ui.logpanel.find( '.logmsg' );
        
        if( msgs.length < 200 )
            continue;
        
        while( msgs.length > 200 ) {
            msgs.slice(0, 10).remove();
            msgs = c.ui.logpanel.find( '.logmsg' );
        }
        
        c.ui.resize();
    }

};

/**
 * Add an extension to the client.
 * 
 * @method add_extension
 * @param extension {Method} Extension constructor. Not called with `new`.
 */
wsc.Client.prototype.add_extension = function( extension ) {

    if( container === undefined )
        return;
    this.settings['extend'].push( extension );
    extension( this );

};

/**
 * Bind a method to an event.
 * 
 * @method bind
 * @param event {String} Name of the event to listen for.
 * @param handler {Method} Method to call when the given event is triggered.
 */
wsc.Client.prototype.bind = function( event, handler ) {

    this.events.addListener(event, handler);
    
    if( event.indexOf('cmd.') != 0 || event.length <= 4 )
        return;
    
    cmd = event.slice(4).toLowerCase();
    this.cmds.push(cmd);

};

/**
 * Clear event listeners for a given event.
 *
 * @method clear_listeners
 * @param event {String} Event to clear listeners for.
 */
wsc.Client.prototype.clear_listeners = function( event ) {

    this.events.removeListeners(event);

};

/**
 * Trigger an event.
 * 
 * @method trigger
 * @param event {String} Name of the event to trigger.
 * @param data {Object} Event data.
 */
wsc.Client.prototype.trigger = function( event, data ) {

    this.events.emit( event, data, this );

};

/**
 * Open a connection to the chat server.
 * If the client if already connected, nothing happens.
 * 
 * @method connect
 */
wsc.Client.prototype.connect = function(  ) {

    if( this.connected )
        return;
    
    this.attempts++;
    
    // Start connecting!
    try {
        var client = this;
        this.conn = wsc.Transport.Create(this.settings.server);
        this.conn.open(function( evt, sock ) { client.flow.open( client, evt, sock ); });
        this.conn.disconnect(function( evt ) { client.flow.close( client, evt ); });
        this.conn.message(function( evt ) { client.flow.message( client, evt ); });
        this.conn.connect();
        this.trigger('start', new wsc.Packet('client connecting\ne=ok\n\n'));
    } catch(err) {
        this.monitor("Your browser does not support WebSockets. Sorry.");
        this.trigger('start', new wsc.Packet('client connecting\ne=no websockets available\n\n'));
    }

};

/**
 * Close the connection foo.
 * 
 * @method close
 */
wsc.Client.prototype.close = function(  ) {

    this.conn.close();

};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} Channel namespace to get or set.
 * @param [channel] {Object} Channel object to use for the given namespace.
 * @return {Object} Channel object associated with the given namespace.
 */
wsc.Client.prototype.channel = function( namespace, channel ) {

    namespace = this.deform_ns(namespace).slice(1).toLowerCase();
    
    if( !this.channelo[namespace] && channel )
        this.channelo[namespace] = channel;
    
    return this.channelo[namespace];

};

/**
 * Get a count of the number of channels the client has open.
 * Channels with their tabs hidden are not counted.
 * 
 * @method channels
 * @return {Integer} Number of channels open.
 */
wsc.Client.prototype.channels = function(  ) {

    chans = -1;
    for(ns in this.channelo) {
        if( this.channelo[ns].hidden )
            continue;
        chans++;
    }
    return chans;

};

/**
 * Deform a channel namespace to its shorthand form.
 * 
 * @method deform_ns
 * @param namespace {String} Namespace to deform.
 * @return {String} Shorthand channel namespace.
 */
wsc.Client.prototype.deform_ns = function( namespace ) {

    if(namespace.indexOf("chat:") == 0)
        return '#' + namespace.slice(5);
    
    if(namespace.indexOf("server:") == 0)
        return '~' + namespace.slice(7);
    
    if(namespace.indexOf("pchat:") == 0) {
        var names = namespace.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    if( namespace.indexOf('login:') == 0 )
        return '@' + namespace.slice(6);
    
    if(namespace[0] != '#' && namespace[0] != '@' && namespace[0] != '~')
        return '#' + namespace;
    
    return namespace;

};

/**
 * Format a channel namespace in its longhand form.
 * 
 * @method format_ns
 * @param namespace {String} Channel namespace to format.
 * @return {String} Formatted namespace.
 */
wsc.Client.prototype.format_ns = function( namespace ) {

    if(namespace.indexOf('#') == 0) {
        return 'chat:' + namespace.slice(1);
    }
    if(namespace.indexOf('@') == 0) {
        var names = [namespace.slice(1), this.lun];
        names.sort(caseInsensitiveSort)
        names.unshift("pchat");
        return names.join(':');
    }
    if(namespace.indexOf('~') == 0) {
        return "server:" + namespace.slice(1);
    }
    if(namespace.indexOf('chat:') != 0 && namespace.indexOf('server:') != 0 && namespace.indexOf('pchat:') != 0)
        return 'chat:' + namespace;
    
    return namespace;

};

/**
 * Create a channel object for the client.
 * 
 * @method create_ns
 * @param namespace {String} Namespace to use for the channel.
 * @param hidden {Boolean} Should the channel tab be hidden?
 */
wsc.Client.prototype.create_ns = function( namespace, hidden ) {

    chan = this.channel(namespace, new wsc.Channel(this, namespace, hidden));
    chan.build();

};

/**
 * Remove a channel object from the client.
 * 
 * @method remove_ns
 * @param namespace {String} Namespace of the channel to remove.
 */
wsc.Client.prototype.remove_ns = function( namespace ) {

    this.ui.remove_channel(namespace);

};

/**
 * Write a log message to a channel's log view.
 * 
 * @method log
 * @param namespace {String} Namespace of the channel to log to.
 * @param data {String} Message to display.
 */
wsc.Client.prototype.log = function( namespace, data ) {

    var chan = this.channel(namespace);
    
    if( !chan )
        return;
    
    chan.log(data);

};

/**
 * Write a message to the client monitor.
 * 
 * @method monitor
 * @param message {String} Message to display.
 */
wsc.Client.prototype.monitor = function( message ) {

    this.ui.monitor(message);

};

// Client packets

/**
 * Send a packet to the server.
 * 
 * @method send
 * @param data {String} Packet to send.
 * @return {Integer} Number of characters written to the server.
 *   -1 for failure.
 */
wsc.Client.prototype.send = function( data ) {

    return this.conn.send(data);

};

/**
 * Send a handshake packet.
 * 
 * @method handshake
 */
wsc.Client.prototype.handshake = function(  ) {

    this.send(wsc_packetstr(this.settings.client, this.settings.clientver, {
        "agent": this.settings.agent
    }));

};

/**
 * Send a login packet.
 * 
 * @method login
 */
wsc.Client.prototype.login = function(  ) {

    pkt = 'login ' + this.settings.username + '\npk=' + this.settings.pk + '\n';
    this.send( pkt );

};

/**
 * Send a pong packet to the server.
 * 
 * @method pong
 */
wsc.Client.prototype.pong = function(  ) {

    this.send(wsc_packetstr("pong"));

};

/**
 * Join a channel.
 * 
 * @method join
 * @param namespace {String} Channel to join.
 */
wsc.Client.prototype.join = function( namespace ) {

    this.send(wsc_packetstr("join", this.format_ns(namespace)));

};

/**
 * Leave a channel.
 * 
 * @method part
 * @param namespace {String} Channel to leave.
 */
wsc.Client.prototype.part = function( namespace ) {

    this.send(wsc_packetstr('part', this.format_ns(namespace)));

};

/**
 * Send a message to a channel.
 * 
 * @method say
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.say = function( namespace, message ) {

    e = { name: 'send.msg.before', 'msg': message, 'ns': namespace };
    this.trigger( e );
    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('msg', 'main', {}, e.msg)
    ));

};

/**
 * Send a non-parsed message to a channel.
 * 
 * @method npmsg
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.npmsg = function( namespace, message ) {

    e = { name: 'send.npmsg.before', 'msg': message, 'ns': namespace };
    this.trigger( e );
    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('npmsg', 'main', {}, e.msg)
    ));

};

/**
 * Send an action message to a channel.
 * 
 * @method action
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.action = function( namespace, action ) {

    e = { name: 'send.action.before', 'msg': action, 'ns': namespace };
    this.trigger( e );
    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('action', 'main', {}, e.msg)
    ));

};

/**
 * Promote a user in a channel.
 * 
 * @method promote
 * @param namespace {String} Channel to promote someone in.
 * @param user {String} User to promote.
 * @param [pc] {String} Privclass to promote the user to.
 */
wsc.Client.prototype.promote = function( namespace, user, pc ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('promote', user, {}, ( !pc ? '' : pc ))));

};

/**
 * Demote a user in a channel.
 * 
 * @method demote
 * @param namespace {String} Channel to demote someone in.
 * @param user {String} User to demote.
 * @param [pc] {String} Privclass to demote the user to.
 */
wsc.Client.prototype.demote = function( namespace, user, pc ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('demote', user, {}, ( !pc ? '' : pc ))));

};

/**
 * Ban a user from a channel.
 * 
 * @method ban
 * @param namespace {String} Channel to ban someone from.
 * @param user {String} User to ban.
 */
wsc.Client.prototype.ban = function( namespace, user ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('ban', user, {}, ( !pc ? '' : pc ))));

};

/**
 * Unban a user from a channel.
 * 
 * @method unban
 * @param namespace {String} Channel to unban someone from.
 * @param user {String} User to unban.
 */
wsc.Client.prototype.unban = function( namespae, user ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('unban', user, {}, ( !pc ? '' : pc ))));

};

/**
 * Kick a user from a channel.
 * 
 * @method kick
 * @param namespace {String} Channel to kick someone from.
 * @param user {String} User to kick.
 * @param [reason] {String} Reason for the kick.
 */
wsc.Client.prototype.kick = function( namespace, user, reason ) {

    this.send(wsc_packetstr('kick', this.format_ns(namespace), { 'u': user }, reason || null));

};

/**
 * Kill a user's connection to the server.
 * Only message network admins have access to this packet on the server.
 * 
 * @method kill
 * @param user {String} User to kill.
 * @param [reason] {String} Reason for the kill.
 */
wsc.Client.prototype.kill = function( user, reason ) {

    this.send(wsc_packetstr('kill', user, {}, reason || null));

};

/**
 * Send an admin comment to a channel.
 * 
 * @method admin
 * @param namespace {String} Channel to use for the admin command.
 * @param command {String} Command to run.
 */
wsc.Client.prototype.admin = function( namespace, command ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('admin', '', {}, command)
    ));

};

/**
 * Request a channel property from the server.
 * 
 * @method property
 * @param namespace {String} Namespace of the channel to get a property for.
 * @param property {String} Name of the property to get.
 */
wsc.Client.prototype.property = function( namespace, property ) {

    this.send(wsc_packetstr('get', this.format_ns(namespace), { 'p': property }));

};

/**
 * Get whois information for a user.
 * 
 * @method whois
 * @param user {String} User to get information for.
 */
wsc.Client.prototype.whois = function( user ) {

    this.send(wsc_packetstr('get', 'login:' + user, { 'p': property }));

};

/**
 * Send a disconnect packet.
 * 
 * @method disconnect
 */
wsc.Client.prototype.disconnect = function(  ) {

    this.send(wsc_packetstr('disconnect'));

};

/**
 * Controls the input panel of the client.
 * 
 * @class Control
 * @constructor
 * @param client {Object} wsc.Client object.
 */
wsc.Control = function( client ) {

    this.client = client;
    this.ui = this.client.ui.control;
    this.history = {};
    this.tab = {
        hit: false,
        cache: '',
        matched: [],
        index: -1,
        type: 0,
        prefix: ['', '/', ''],
    };
    
    this.set_input();

};

/**
 * Steal the lime light. Brings the cursor to the input panel.
 *
 * @method focus
 */
wsc.Control.prototype.focus = function(  ) {

    this.ui.focus();

};

/**
 * Set the input handlers for the input panel.
 * 
 * @method set_input
 */
wsc.Control.prototype.set_input = function(  ) {

    var o = this;
    
    this.ui.set_handlers(
        function( event ) {
            return o.keypress(event);
        },
        function( event ) {
            return o.submit(event);
        }
    );

};

/**
 * Save current input in a cache.
 * 
 * @method cache_input
 * @param event {Object} Event data.
 */
wsc.Control.prototype.cache_input = function( event ) {

    h = this.get_history( event.prev.namespace );
    
    if( h.index > -1 )
        return;
    
    h.tmp = this.ui.get_text();
    this.ui.set_text(this.get_history( event.chan.namespace ).tmp);

};

/**
 * Get a channel's input history object.
 * If no history object exists for the given channel, a new object is created
 * and stored.
 * 
 * @method get_history
 * @param [namespace] {String} Channel to get the history of. If not given, the
 *   channel currently being viewed is used.
 * @return history {Object} Channel's input history data.
 */
wsc.Control.prototype.get_history = function( namespace ) {

    namespace = namespace || this.client.cchannel.namespace;
    
    if( !this.history[namespace] )
        this.history[namespace] = { index: -1, list: [], tmp: '' };
    
    return this.history[namespace];

};

/**
 * Append an item to the current channel's input history.
 * 
 * @method append_history
 * @param data {String} Input string to store.
 */
wsc.Control.prototype.append_history = function( data ) {

    if( !data )
        return;
    
    h = this.get_history();
    h.list.unshift(data);
    h.index = -1;
    
    if( h.list.length > 100 )
        h.list.pop();

};

/**
 * Scroll through the current channel's input history.
 * 
 * @method scroll_history
 * @param up {Boolean} Scroll up?
 */
wsc.Control.prototype.scroll_history = function( up ) {

    history = this.get_history();
    data = this.ui.get_text();
    
    if( history.index == -1 )
        if( data )
            history.tmp = data;
    else
        history.list[history.index] = data;
    
    if( up ) {
        if( history.list.length > 0 && history.index < (history.list.length - 1) )
            history.index++;
    } else {
        if( history.index > -1)
            history.index--;
    }
    
    this.ui.set_text(history.list[history.index] || history.tmp);

};

/**
 * Handle the tab character being pressed.
 * 
 * @method tab_item
 * @param event {Object} Event data.
 */
wsc.Control.prototype.tab_item = function( event ) {

    if( !this.tab.hit )
        this.start_tab(event);
    
    this.ui.chomp();
    this.tab.index++;
    
    if( this.tab.index >= this.tab.matched.length )
        this.tab.index = -1;
    
    if( this.tab.index == -1 ) {
        this.ui.unchomp(this.tab.prefix[this.tab.type] + this.tab.cache);
        return;
    }
    
    suf = this.ui.get_text() == '' ? ( this.tab.type == 0 ? ': ' : ' ' ) : '';
    this.ui.unchomp(this.tab.prefix[this.tab.type] + this.tab.matched[this.tab.index] + suf);

};

/**
 * Start tab complete capabilities by compiling a list of items that match the
 * current user input.
 * 
 * @method start_tab
 * @param event {Object} Event data.
 */
wsc.Control.prototype.start_tab = function( event ) {

    this.tab.hit = true;
    this.tab.index = -1;
    this.tab.matched = [];
    this.tab.type = 0;
    
    // We only tab the last word in the input. Slice!
    needle = this.ui.chomp();
    this.ui.unchomp(needle);
    
    // Check if we's dealing with commands here
    if( needle[0] == "/" || needle[0] == "#" ) {
        this.tab.type = needle[0] == '/' ? 1 : 2;
        needle = needle.slice(1);
    } else {
        this.tab.type = 0;
    }
    
    this.tab.cache = needle;
    needle = needle.toLowerCase();
    
    // Nows we have to find our matches. Fun.
    // Lets start with matching users.
    this.tab.matched = [];
    if( this.tab.type == 0 ) {
        for( user in this.client.cchannel.info['members'] )
            if( user.toLowerCase().indexOf(needle) == 0 )
                this.tab.matched.push(user);
    } else if( this.tab.type == 1 ) {
        // Matching with commands.
        for( i in this.client.cmds ) {
            cmd = this.client.cmds[i];
            if( cmd.indexOf(needle) == 0 )
                this.tab.matched.push(cmd);
        }
    } else if( this.tab.type == 2 ) {
        // Matching with channels.
        for( chan in this.client.channelo )
            if( chan.toLowerCase().indexOf(needle) == 0 )
                this.tab.matched.push(this.client.channel(chan).namespace);
    }

};

/**
 * Clear the tabbing cache.
 * 
 * @method end_tab
 * @param event {Object} Event data.
 */
wsc.Control.prototype.end_tab = function( event ) {

    this.tab.hit = false;
    this.tab.matched = [];
    this.tab.cache = '';
    this.tab.index = -1;

};

/**
 * Handle the send button being pressed.
 * 
 * @method submit
 * @param event {Object} Event data.
 */
wsc.Control.prototype.submit = function( event ) {

    msg = this.ui.get_text();
    this.append_history(msg);
    this.ui.set_text('');
    this.handle(event, msg);
    return false;

};
/**
 * A keypress happened. Process the keypress biatch.
 * 
 * @method keypress
 * @param event {Object} Event data.
 */
wsc.Control.prototype.keypress = function( event ) {

    key = event.which || event.keypress;
    ut = this.tab.hit;
    var bubble = false;
    
    switch( key ) {
        case 13: // Enter
            this.submit(event);
            break;
        case 38: // Up
            this.scroll_history(true);
            break;
        case 40: // Down
            this.scroll_history(false);
            break;
        case 9: // Tab
            this.tab_item( event );
            ut = false;
            break;
        default:
            bubble = true;
            break;
    }
    
    if( ut )
        this.end_tab( event );
    
    return bubble;

};

/**
 * Handle some user input.
 * 
 * @method handle
 * @param event {Object} Event data.
 * @param data {String} Input message given by the user.
 */
wsc.Control.prototype.handle = function( event, data ) {

    if( data == '' )
        return;
    
    if( data[0] != '/' ) {
        if( !this.client.cchannel )
            return;
    }
    
    data = (event.shiftKey ? '/npmsg ' : ( data[0] == '/' ? '' : '/say ' )) + data;
    data = data.slice(1);
    bits = data.split(' ');
    cmdn = bits.shift();
    ens = this.client.cchannel.namespace;
    etarget = ens;
    
    if( bits[0] ) {
        hash = bits[0][0];
        if( (hash == '#' || hash == '@') && bits[0].length > 1 ) {
            etarget = this.client.format_ns(bits.shift());
        }
    }
    
    arg = bits.join(' ');
    
    this.client.trigger('cmd.' + cmdn, {
        name: 'cmd',
        cmd: cmdn,
        args: arg,
        target: etarget,
        ns: ens
    });

};


/**
 * This is an alternate thing for the UI module.
 * Chatterbox is basically a thing.
 * 
 * @module Chatterbox
 */
var Chatterbox = {};

Chatterbox.VERSION = '0.3.0';
Chatterbox.STATE = 'beta';

/**
 * This object is the platform for the wsc UI. Everything can be used and
 * loaded from here.
 * 
 * @class UI
 * @constructor
 * @param view {Object} Base jQuery object to use for the UI. Any empty div will do.
 * @param options {Object} Custom settings to use for the UI.
 * @param mozilla {Boolean} Is the browser in use made by Mozilla?
 * @param [events] {Object} EventEmitter object.
 **/
Chatterbox.UI = function( view, options, mozilla, events ) {
    
    this.events = events || new EventEmitter();
    this.mozilla = mozilla;
    this.settings = {
        'themes': ['wsct_default', 'wsct_test'],
        'theme': 'wsct_default',
        'monitor': ['~Monitor', true],
        'username': '',
        'domain': 'website.com'
    };
    view.extend( this.settings, options );
    view.append('<div class="wsc '+this.settings['theme']+'"></div>');
    this.view = view.find('.wsc');
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.monitoro = null;
    
};

/**
 * Used to trigger events.
 *
 * @method trigger
 * @param event {String} Name of the event to trigger.
 * @param data {Object} Event data.
 **/
Chatterbox.UI.prototype.trigger = function( event, data ) {

    this.events.emit( event, data, this );

};

/**
 * Bind an event thingy.
 * 
 * @method on
 * @param event {String} The event name to listen for.
 * @param handler {Method} The event handler.
 */
Chatterbox.UI.prototype.on = function( event, handler ) {

    this.events.addListener( event, handler );

};

/**
 * Remove all of the event bindings.
 * 
 * @method remove_listeners
 */
Chatterbox.UI.prototype.remove_listeners = function(  ) {
    
    this.events.removeListeners();
    
};

/**
 * Deform a channel namespace.
 *
 * @method deform_ns
 * @param ns {String} Channel namespace to deform.
 * @return {String} The deformed namespace.
 **/
Chatterbox.UI.prototype.deform_ns = function( ns ) {
    if(ns.indexOf("chat:") == 0)
        return '#' + ns.slice(5);
    
    if(ns.indexOf("server:") == 0)
        return '~' + ns.slice(7);
    
    if(ns.indexOf("pchat:") == 0) {
        var names = ns.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    if( ns.indexOf('login:') == 0 )
        return '@' + ns.slice(6);
    
    if(ns[0] != '#' && ns[0] != '@' && ns[0] != '~')
        return '#' + ns;
    
    return ns;
};

/**
 * Format a channel namespace.
 *
 * @method format_ns
 * @param ns {String} Channel namespace to format.
 * @return {String} ns formatted as a channel namespace.
 */
Chatterbox.UI.prototype.format_ns = function( ns ) {
    if(ns.indexOf('#') == 0) {
        return 'chat:' + ns.slice(1);
    }
    if(ns.indexOf('@') == 0) {
        var names = [ns.slice(1), this.lun];
        names.sort(caseInsensitiveSort)
        names.unshift("pchat");
        return names.join(':');
    }
    if(ns.indexOf('~') == 0) {
        return "server:" + ns.slice(1);
    }
    if(ns.indexOf('chat:') != 0 && ns.indexOf('server:') != 0 && ns.indexOf('pchat:') != 0)
        return 'chat:' + ns;
    
    return ns;
};

Chatterbox.UI.prototype.set_events = function( events ) {
    this.events = events || this.events;
};

/**
 * Build the GUI.
 * 
 * @method build
 * @param [control=Chatterbox.Control] {Class} UI control panel class.
 * @param [navigation=Chatterbox.Navigation] {Class} UI navigation panel
 *   class.
 * @param [chatbook=Chatterbox.Chatbook] {Class} Chatbook panel class.
 */
Chatterbox.UI.prototype.build = function( control, navigation, chatbook ) {
    
    this.view.append( Chatterbox.template.ui );
    this.control = new ( control || Chatterbox.Control )( this );
    this.nav = new ( navigation || Chatterbox.Navigation )( this );
    this.chatbook = new ( chatbook || Chatterbox.Chatbook )( this );
    // The monitor channel is essentially our console for the chat.
    hide = this.settings.monitor[1];
    this.monitoro = this.chatbook.create_channel(this.mns, hide, true);
    //this.control.setInput();
    this.control.focus();
    
};

/**
 * Resize the UI to fit the containing element.
 * 
 * @method resize
 */
Chatterbox.UI.prototype.resize = function() {

    this.control.resize();
    this.view.height( this.view.parent().height() );
    this.view.width( '100%' );
    this.chatbook.resize( this.view.parent().height() - this.nav.height() - this.control.height() );

};

/**
 * Create a screen for channel `ns` in the UI, and initialise data
 * structures or some shit idk.
 * 
 * @method create_channel
 * @param ns {String} Short name for the channel.
 * @param hidden {Boolean} Should this channel's tab be hidden?
 */
Chatterbox.UI.prototype.create_channel = function( ns, toggle ) {
    this.chatbook.create_channel( ns, toggle );
};

/**
 * Remove a channel from the GUI.
 * We do this when we leave a channel for any reason.
 * Note: last channel is never removed and when removing a channel
 * we switch to the last channel in the list before doing so.
 *
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
Chatterbox.UI.prototype.remove_channel = function( ns ) {
    this.chatbook.remove_channel(ns);
};

/**
 * Select which channel is currently being viewed.
 * 
 * @method toggle_channel
 * @param ns {String} Name of the channel to select.
 */
Chatterbox.UI.prototype.toggle_channel = function( ns ) {
    return this.chatbook.toggle_channel(ns);
};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} The namespace to set or get.
 * @param [chan] {Object} A wsc channel object representing the channel specified.
 * @return {Object} The channel object representing the channel defined by `namespace`
 */
Chatterbox.UI.prototype.channel = function( namespace, chan ) {
    return this.chatbook.channel( namespace, chan );
};

/**
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
 * @method channels
 * @return {Integer} Number of channels open in the ui.
 */
Chatterbox.UI.prototype.channels = function( ) {
    return this.chatbook.channels();
};

/**
 * Display a log message in the monitor channel.
 * 
 * @method monitor
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.UI.prototype.monitor = function( msg, info ) {

    this.monitoro.server_message(msg, info);

};

/**
 * Display a server message across all open channels.
 * 
 * @method server_message
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.UI.prototype.server_message = function( msg, info ) {

    this.chatbook.server_message(msg, info);

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param msg {String} Message to display.
 */
Chatterbox.UI.prototype.log_item = function( msg ) {

    this.chatbook.log_item(msg);

};

/**
 * Display a log message across all open channels.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.UI.prototype.log = function( msg ) {

    this.chatbook.log_item(wsc_html_logmsg.replacePArg('{message}', msg));

};

/**
 * Set the theme for the UI.
 * 
 * @method theme
 * @param theme {String} Name of the theme.
 */
Chatterbox.UI.prototype.theme = function( theme ) {
    if( this.settings.themes.indexOf(theme) == -1 || this.settings.theme == theme)
        return;
    this.view.removeClass( this.settings.theme ).addClass( theme );
    this.settings.theme = theme;
};

/**
 * Add a new theme to the client.
 * 
 * @method add_theme
 * @param theme {String} Name of the theme to add.
 */
Chatterbox.UI.prototype.add_theme = function( theme ) {

    if( this.settings.themes.indexOf(theme) > -1 )
        return;
    
    this.settings.themes.push(theme);

};


/**
 * Object for managing channel interfaces.
 * 
 * @class Channel
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
Chatterbox.Channel = function( ui, ns, hidden, monitor ) {

    var selector = ui.deform_ns(ns).slice(1).toLowerCase();
    this.manager = ui;
    this.hidden = hidden;
    this.monitor = monitor || false;
    this.built = false;
    this.selector = selector;
    this.raw = ui.format_ns(ns);
    this.namespace = ui.deform_ns(ns);

};

/**
 * Draw channel on screen and store the different elements in attributes.
 * 
 * @method build
 */
Chatterbox.Channel.prototype.build = function( ) {
    
    if( this.built )
        return;
    
    var selector = this.selector;
    ns = this.namespace;
    
    // Draw.
    this.tab = this.manager.nav.add_tab( selector, ns );
    this.tabl = this.tab.find('.tab');
    this.tabc = this.tab.find('.close');
    this.manager.chatbook.view.append(Chatterbox.render('channel', {'selector': selector, 'ns': ns}));
    // Store
    this.window = this.manager.chatbook.view.find('#' + selector + '-window');
    this.logpanel = this.window.find('#' + selector + "-log");
    this.wrap = this.logpanel.find('ul.logwrap');
    this.userpanel = this.window.find('#' + selector + "-users");
    var chan = this;
    
    this.tabl.click(function () {
        chan.manager.toggle_channel(selector);
        return false;
    });
    
    this.tabc.click(function ( e ) {
        chan.manager.trigger( 'tab.close.clicked', {
            'ns': chan.namespace,
            'chan': chan,
            'e': e
        } );
    });
    
    var focus = true;
    
    this.window.click(
        function( e ) {
            if( focus )
                chan.manager.control.focus();
            else
                focus = true;
        }
    );
    
    this.logpanel.select(
        function( ) {
            focus = false;
        }
    );
    
    if( this.hidden ) {
        this.tab.toggleClass('hidden');
    }
    
    this.built = true;
};

/**
 * Hide the channel from view.
 * 
 * @method hide
 */
Chatterbox.Channel.prototype.hide = function( ) {
    //console.log("hide " + this.info.selector);
    this.window.css({'display': 'none'});
    this.tab.removeClass('active');
};

/**
 * Display the channel.
 * 
 * @method show
 */
Chatterbox.Channel.prototype.show = function( ) {
    //console.log("show  " + this.info.selector);
    this.window.css({'display': 'block'});
    this.tab.addClass('active');
    this.tab.removeClass('noise tabbed fill');
    this.resize();
};

/**
 * Remove the channel from the UI.
 * 
 * @method remove
 */
Chatterbox.Channel.prototype.remove = function(  ) {
    this.tab.remove();
    this.window.remove();
};

/**
 * Scroll the log panel downwards.
 * 
 * @method scroll
 */
Chatterbox.Channel.prototype.scroll = function( ) {
    this.pad();
    this.wrap.scrollTop(this.wrap.prop('scrollHeight') - this.wrap.innerHeight());
};

/**
 * Add padding to the channel log's wrapping ul.
 * This is done to make sure messages always appear at the bottom first.
 * 
 * @method pad
 */
Chatterbox.Channel.prototype.pad = function ( ) {
    // Add padding.
    this.wrap.css({'padding-top': 0});
    wh = this.wrap.innerHeight();
    lh = this.logpanel.innerHeight() - this.logpanel.find('header').height() - 3;
    pad = lh - wh;
    
    if( pad > 0 )
        this.wrap.css({'padding-top': pad});
    else
        this.wrap.css({
            'padding-top': 0,
            'height': lh});
};

/**
 * Fix the dimensions of the log window.
 * 
 * @method resize
 */
Chatterbox.Channel.prototype.resize = function( ) {
    this.wrap.css({'padding-top': 0});
    // Height.
    wh = this.manager.chatbook.height();
    this.window.height(wh);
    // Width.
    cw = this.window.width();
    cu = this.window.find('div.chatusers');
    // Header height
    title = this.window.find('header div.title');
    topic = this.window.find('header div.topic');
    
    // Log width.
    if( cu.css('display') != 'none')
        cw = cw - cu.outerWidth();
    
    if( title.css('display') == 'block' )
        wh = wh - title.outerHeight(true);
        
    // Log panel dimensions
    this.logpanel.css({
        height: wh + 1,
        width: cw});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    cu.css({height: this.logpanel.innerHeight() - 3});
};

/**
 * Display a log message.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.Channel.prototype.log = function( msg ) {
    data = {
        'ns': this.namespace,
        'message': msg};
    this.manager.trigger( 'log.before', data );
    this.log_item(Chatterbox.render('logmsg', {'message': data.message}));
};

/**
 * Send a message to the log window.
 * 
 * @method log_item
 * @param msg {String} Message to send.
 */
Chatterbox.Channel.prototype.log_item = function( msg ) {
    var ts = new Date().toTimeString().slice(0, 8);
    // Add content.
    this.wrap.append(Chatterbox.render('logitem', {'ts': ts, 'message': msg}));
    // Scrollio
    this.scroll();
    this.noise();
};

/**
 * Send a server message to the log window.
 * 
 * @method server_message
 * @param msg {String} Server message.
 * @param [info] {String} Extra information for the message.
 */
Chatterbox.Channel.prototype.server_message = function( msg, info ) {
    data = {
        'ns': this.namespace,
        'message': msg,
        'info': info};
    this.manager.trigger( 'server_message.before', data );
    this.log_item(Chatterbox.render('servermsg', {'message': data.message, 'info': data.info}));
};

/**
 * Set the channel header.
 * This can be the title or topic, determined by `head`.
 * 
 * @method set_header
 * @param head {String} Should be 'title' or 'topic'.
 * @param content {String} HTML to use for the header.
 */
Chatterbox.Channel.prototype.set_header = function( head, content ) {
    headd = this.window.find("header div." + head);
    headd.replaceWith(
        Chatterbox.render('header', {'head': head, 'content': content || ''})
    );
    headd = this.window.find('header div.' + head);
    
    if( content ) {
        headd.css({display: 'block'});
    } else {
        this.window.find('header div.' + head).css({display: 'none'});
    }
        
    this.resize();
};

/**
 * Get a channel header's contents.
 * 
 * @method get_header
 * @param head {String} Should be 'title' or 'topic'.
 * @return {Object} Content of the header.
 */
Chatterbox.Channel.prototype.get_header = function( head ) {

    return this.window.find('header div.' + head);

};

/**
 * Set the channel user list.
 * 
 * @method set_user_list
 * @param userlist {Array} Listing of users in the channel.
 */
Chatterbox.Channel.prototype.set_user_list = function( userlist ) {
    
    if( Object.size(userlist) == 0 )
        return;
    
    infoboxes = [];
    html = '';
    
    for( order in userlist ) {
        pc = userlist[order];
        html += '<div class="pc"><h3>' + pc.name + '</h3><ul>';
        for( un in pc.users ) {
            user = pc.users[un];
            conn = user.conn == 1 ? '' : '[' + user.conn + ']';
            html+= '<li><a target="_blank" id="' + user.name + '" href="http://' + user.name + '.' + this.manager.settings['domain'] + '"><em>' + user.symbol + '</em>' + user.name + '</a>' + conn + '</li>'
            if( user.hover )
                infoboxes.push(user.hover);
        }
        html+= '</ul></div>';
    }
    
    this.window.find('div.chatusers').html(html);
    this.userpanel = this.window.find('div.chatusers');
    this.userpanel.css({display: 'block'});
    
    for( index in infoboxes ) {
        this.userinfo(infoboxes[index]);
    }
    this.resize();
    
};

/**
 * The user has been highlighted in this channel.
 * Highlights the last log message in the channel's log and animates the
 * channel tab if the channel is not visible.
 * 
 * @method highlight
 * @param [message] {Object} jQuery object for an html element. If provided,
 *   this element will be highlighted instead of the channel's last log
 *   message.
 */
Chatterbox.Channel.prototype.highlight = function( message ) {
    
    var tab = this.tab;
    ( message || this.window.find('.logmsg').last() ).addClass('highlight');
    
    if( tab.hasClass('active') )
        return;
    
    if( tab.hasClass('tabbed') )
        return;
    
    var runs = 0;
    tab.addClass('tabbed');
    
    function toggles() {
        runs++;
        tab.toggleClass('fill');
        if( runs == 6 )
            return;
        setTimeout( toggles, 1000 );
    }
    
    toggles();
    
};

/**
 * There has been activity in this channel.
 * Modifies the channel tab slightly, if the channel is not currently being
 * viewed.
 * 
 * @method noise
 */
Chatterbox.Channel.prototype.noise = function(  ) {
    
    if( !this.tab.hasClass('active') )
        this.tab.addClass('noise');
    
};

/**
 * Display a user info hover box.
 * 
 * @method userinfo
 * @param user {Object} Information about a user.
 * @return {Object} jQuery object representing the information box.
 */
Chatterbox.Channel.prototype.userinfo = function( user ) {

    var link = this.window.find( 'a#' + user.name );
    
    if( link.length == 0 )
        return;

    var chan = this;
    var box = null;
    
    link.hover(
        function( e ) {
            user.info = [];
            ed = { 'ns': chan.namespace, 'user': user};
            chan.manager.trigger( 'userinfo.before', ed );
            user = ed.user;
            infoli = '';
            for( index in user.info ) {
                infoli+= '<li>' + user.info[index] + '</li>';
            }
            
            chan.window.append(Chatterbox.render('userinfo', {
                'username': user.name,
                'avatar': user.avatar,
                'link': user.link,
                'info': infoli}));
            
            box = chan.window.find('.userinfo#'+user.name);
            chan.window.find('div.userinfo:not(\'#' + user.name + '\')').remove();
            pos = link.offset();
            box.css({ 'top': (pos.top - link.height()) + 10, 'left': (pos.left - (box.width())) - 6 });
            
            box.hover(
                function(){ box.data('hover', 1); },
                function( e ) {
                    box.data('hover', 0);
                    chan.unhover_user( box, event );
                }
            );
            
            box.data('hover', 0);
        },
        function( e ) {
            link.data('hover', 0);
            chan.unhover_user(box, event);
        }
    );

};

/**
 * This method tries to get rid of the given user information box.
 * The information box can only be removed if the cursor is outside the
 * bounds of the information box AND outside of the bounds of the user link in
 * the user list.
 * 
 * @method unhover_user
 * @param box {Object} A jQuery object representing the information box.
 * @param event {Object} jQuery event object.
 */
Chatterbox.Channel.prototype.unhover_user = function( box, event ) {

    o = box.offset();
    eb = box.outerHeight(true) + o.top;
    er = box.outerWidth(true) + o.left;
    x = event.pageX; y = event.pageY;
    
    if( x > o.left
        && x < er
        && y > o.top
        && y < eb)
        return;
    
    if( x < (er + 10)
        && x > o.left
        && y > o.top
        && y < (o.top + 10) )
        return;
    
    box.remove();

};


/**
 * Object for managing the chatbook portion of the UI.
 *
 * @class Chatbook
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Chatbook = function( ui ) {
    
    this.manager = ui;
    this.view = this.manager.view.find('div.chatbook');
    this.chan = {};
    this.trail = [];
    this.current = null;
    this.manager.on( 'tab.close.clicked', function( event, ui ) {
        ui.chatbook.remove_channel(event.ns);
    });
    
};

/**
 * Return the height of the chatbook.
 *
 * @method height
 */
Chatterbox.Chatbook.prototype.height = function() {
    return this.view.height();
};

/**
 * Resize the chatbook view pane.
 * 
 * @method resize
 * @param [height=600] {Integer} The height to set the view pane to.
 */
Chatterbox.Chatbook.prototype.resize = function( height ) {
    height = height || 600;
    this.view.height(height);
    
    for( select in this.chan ) {
        var chan = this.chan[select];
        chan.resize();
    }
};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} The namespace to set or get.
 * @param [chan] {Object} A wsc channel object representing the channel specified.
 * @return {Object} The channel object representing the channel defined by `namespace`
 */
Chatterbox.Chatbook.prototype.channel = function( namespace, chan ) {
    namespace = this.manager.deform_ns(namespace).slice(1).toLowerCase();
    
    if( !this.chan[namespace] && chan )
        this.chan[namespace] = chan;
    
    return this.chan[namespace];
};

/**
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
 * @method channels
 * @return [Integer] Number of channels open in the ui.
 */
Chatterbox.Chatbook.prototype.channels = function( ) {
    chans = -1;
    for(ns in this.chan) {
        if( this.chan[ns].hidden )
            continue;
        chans++;
    }
    return chans;
};

/**
 * Create a channel in the UI.
 * 
 * @method create_channel
 * @param ns {String} Namespace of the channel to create.
 * @param hidden {Boolean} Should the tab be hidden?
 * @param monitor {Boolean} Is this channel the monitor?
 * @return {Object} WscUIChannel object.
 */
Chatterbox.Chatbook.prototype.create_channel = function( ns, hidden, monitor ) {
    chan = this.channel(ns, this.channel_object(ns, hidden, monitor));
    chan.build();
    this.toggle_channel(ns);
    this.manager.resize();
    return chan;
};

/**
 * Create a new channel panel object.
 * Override this method to use a different type of channel object.
 * 
 * @method channel_object
 * @param ns {String} Namespace of the channel.
 * @param hidden {Boolean} Should the tab be hidden?
 * @return {Object} An object representing a channel UI.
 */
Chatterbox.Chatbook.prototype.channel_object = function( ns, hidden ) {
    return new Chatterbox.Channel( this.manager, ns, hidden );
};

/**
 * Select which channel is currently being viewed.
 * 
 * @method toggle_channel
 * @param ns {String} Namespace of the channel to view.
 */
Chatterbox.Chatbook.prototype.toggle_channel = function( ns ) {
    chan = this.channel(ns);
    prev = chan;
    
    if( !chan )
        return;
    
    if(this.current) {
        if(this.current == chan)
            return;
        // Hide previous channel, if any.
        this.current.hide();
        prev = this.current;
    }
    
    // Show clicked channel.
    chan.show();
    this.manager.control.focus();
    this.current = chan;
    this.manager.resize();
    
    // Update the paper trail.
    pos = this.trail.indexOf(chan.namespace);
    if( pos >= 0 )
        this.trail.splice(pos, 1);
    this.trail.push(chan.namespace);
    
    this.manager.trigger( 'channel.selected', {
        'ns': chan.namespace,
        'chan': chan,
        'prev': prev
    } );
};

/**
 * Remove a channel from the UI.
 * 
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
Chatterbox.Chatbook.prototype.remove_channel = function( ns ) {
    if( this.channels() == 0 ) 
        return;
    
    chan = this.channel(ns);
    chan.remove();
    delete this.chan[chan.selector];
    
    rpos = this.trail.indexOf(chan.namespace);
    this.trail.splice(rpos, 1);
    
    if( this.current != chan )
        return;
    
    select = this.trail[this.trail.length - 1];
    this.toggle_channel(select);
    this.channel(select).resize();
};

/**
 * Display a server message across all open channels.
 * 
 * @method server_message
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.Chatbook.prototype.server_message = function( msg, info ) {

    for( ns in this.chan ) {
        this.chan[ns].server_message(msg, info);
    }

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param msg {String} Message to display.
 */
Chatterbox.Chatbook.prototype.log_item = function( msg ) {

    for( ns in this.chan ) {
        this.chan[ns].log_item(msg);
    }

};

/**
 * This object provides an interface for the chat input panel.
 * 
 * @class Control
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Control = function( ui ) {

    this.manager = ui;
    this.manager.view.append( Chatterbox.template.control );
    this.view = this.manager.view.find('div.chatcontrol');
    this.form = this.view.find('form.msg');
    this.input = this.form.find('input.msg');

};

/**
 * Steal the lime light. Brings the cursor to the input panel.
 * 
 * @method focus
 */
Chatterbox.Control.prototype.focus = function( ) {
    this.input.focus();
};

/**
 * Resize the control panel.
 *
 * @method resize
 */
Chatterbox.Control.prototype.resize = function( ) {
    w = this.manager.view.width();
    this.view.css({
        width: '100%'});
    // Form dimensionals.
    this.form.css({'width': this.manager.view.width() - 20});
    this.input.css({'width': this.manager.view.width() - 80});
};


/**
 * Get the height of the input panel.
 * 
 * @method height
 */
Chatterbox.Control.prototype.height = function( ) {
    return this.view.height();
};


/**
 * Set the handlers for the UI input.
 *
 * @method set_handlers
 * @param [onkeypress=this._onkeypress] {Method} Method to call on input event
 *   `keypress`.
 * @param [onsubmite=this._onsubmit] {Method} Method to call on input even
 *   `submit`.
 */
Chatterbox.Control.prototype.set_handlers = function( onkeypress, onsubmit ) {
    if( this.manager.mozilla )
        this.input.keypress( onkeypress || this._onkeypress );
    else
        this.input.keydown( onkeypress || this._onkeypress );
    
    this.form.submit( onsubmit || this._onsubmit );
};

Chatterbox.Control.prototype._onkeypress = function( event ) {};
Chatterbox.Control.prototype._onsubmit = function( event ) {};

/**
 * Get the last word from the input box.
 * 
 * @method chomp
 * @return {String} The last word in the input box.
 */
Chatterbox.Control.prototype.chomp = function( ) {
    d = this.input.val();
    i = d.lastIndexOf(' ');
    
    if( i == -1 ) {
        this.input.val('');
        return d;
    }
    
    chunk = d.slice(i + 1);
    this.input.val( d.slice(0, i) );
    
    if( chunk.length == 0 )
        return this.chomp();
    
    return chunk;
};

/**
 * Append text to the end of the input box.
 * 
 * @method unchomp
 * @param data {String} Text to append.
 */
Chatterbox.Control.prototype.unchomp = function( data ) {
    d = this.input.val();
    if( !d )
        this.input.val(data);
    else
        this.input.val(d + ' ' + data);
};

/**
 * Get the text in the input box.
 * 
 * @method get_text
 * @return {String} The text currently in the input box.
 */
Chatterbox.Control.prototype.get_text = function(  ) {

    return this.input.val();

};

/**
 * Set the text in the input box.
 * 
 * @method set_text
 * @param text {String} The text to put in the input box.
 */
Chatterbox.Control.prototype.set_text = function( text ) {

    this.input.val( text || '' );

};

/**
 * Navigation UI element. Provides helpers for controlling the chat navigation.
 *
 * @class Navigation
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Navigation = function( ui ) {

    this.manager = ui;
    this.nav = this.manager.view.find('nav.tabs');
    this.tabs = this.manager.view.find('#chattabs');

};

/**
 * Get the height of the navigation bar.
 *
 * @method height
 * @return {Integer} The height of the navigation bar in pixels.
 */
Chatterbox.Navigation.prototype.height = function(  ) {
    return this.nav.height();
};

/**
 * Add a channel tab to the navigation bar.
 * 
 * @method add_tab
 * @param selector {String} Shorthand lower case name for the channel with no prefixes.
 * @param ns {String} Shorthand namespace for the channel. Used as the label
 *   for the tab.
 */
Chatterbox.Navigation.prototype.add_tab = function( selector, ns ) {
    this.tabs.append(Chatterbox.render('tab', {'selector': selector, 'ns': ns}));
    return this.tabs.find('#' + selector + '-tab');
};
/**
 * Container object for HTML5 templates for the chat UI.
 * 
 * @class template
 */
Chatterbox.template = {};

/**
 * Helper method to render templates.
 * This method is actually a static method on the Chatterbox module.
 * 
 * @method render
 * @param template {String} Name of the template to render.
 * @param fill {Object} Variables to render the template with.
 */
Chatterbox.render = function( template, fill ) {

    if( !Chatterbox.template.hasOwnProperty(template) )
        return '';
    
    html = Chatterbox.template[template];
    
    for( key in fill ) {
        if( !fill.hasOwnProperty(key) )
            continue;
        html = replaceAll(html, '{'+key+'}', fill[key]);
    }
    
    return html;

};

/**
 * This template provides the HTML for a chat client's main view.
 *
 * @property ui
 * @type String
 */
Chatterbox.template.ui = '<nav class="tabs"><ul id="chattabs"></ul>\
        <ul id="tabnav">\
            <li><a href="#left" class="button">&laquo;</a></li>\
            <li><a href="#right" class="button">&raquo;</a></li>\
        </ul>\
        </nav>\
        <div class="chatbook"></div>';

/**
 * HTML for an input panel.
 * 
 * @property control
 * @type String
 */
Chatterbox.template.control = '<div class="chatcontrol">\
            <form class="msg">\
                <input type="text" class="msg" />\
                <input type="submit" value="Send" class="sendmsg" />\
            </form>\
        </div>';

/**
 * HTML for a channel tab.
 * 
 * @property tab
 * @type String
 */
Chatterbox.template.tab = '<li id="{selector}-tab"><a href="#{selector}" class="tab">{ns}</a><a href="#{selector}" class="close">x</a></li>';

/**
 * HTML template for a channel view.
 * 
 * @property channel
 * @type String
 */
Chatterbox.template.channel = '<div class="chatwindow" id="{selector}-window">\
                    <header>\
                        <div class="title"></div>\
                    </header>\
                    <div class="chatlog" id="{selector}-log">\
                        <header>\
                            <div class="topic"></div>\
                        </header>\
                        <ul class="logwrap"></ul>\
                    </div>\
                    <div class="chatusers" id="{selector}-users">\
                </div>\
            </div>';

/**
 * Channel header HTML template.
 * 
 * @property header
 * @type String
 */
Chatterbox.template.header = '<div class="{head}">{content}</div>';

/**
 * Log message template.
 * 
 * @property logmsg
 * @type String
 */
Chatterbox.template.logmsg = '<span class="message">{message}</span>';

/**
 * Simple log template.
 * 
 * @property logitem
 * @type String
 */
Chatterbox.template.logitem = '<li class="logmsg"><span class="ts">{ts}</span> {message}</li>';

/**
 * Server message template.
 * 
 * @property servermsg
 * @type String
 */
Chatterbox.template.servermsg = '<span class="servermsg">** {message} * <em>{info}</em></span>';

/**
 * User message template.
 * 
 * @property usermsg
 * @type String
 */
Chatterbox.template.usermsg = '<strong class="user">&lt;{user}&gt;</strong> {message}';

/**
 * User info box (userlist hover)
 * 
 * @property userinfo
 * @type String
 */
Chatterbox.template.userinfo = '<div class="userinfo" id="{username}">\
                            <div class="avatar">\
                                {avatar}\
                            </div><div class="info">\
                            <strong>\
                            {link}\
                            </strong>\
                            <ul>{info}</ul></div>\
                        </div>';
// @include templates.js
// @include lib.js
// @include packet.js
// @include channel.js
// @include tablumps.js
// @include protocol.js
// @include commands.js
// @include client.js
// @include control.js
// @include ui.js


/*
 * wsc - photofroggy
 * jQuery plugin allowing an HTML5/CSS chat client to connect to llama-like
 * chat servers and interact with them.
 */

(function( $ ) {
    
    // Client containment.
    //var client = null;
    
    $('*').hover(
        function( e ) {
            $(this).data('hover', true);
        },
        function( e ) {
            $(this).data('hover', false);
        }
    );
    
    /**
     * @function wsc
     * 
     * This function is the plugin method allowing you to run wsc using jQuery.
     * The client is designed to work with jQuery, but the objects are
     * abstracted out of this file/function to make it easier to maintain and
     * such.
     * 
     * This function generates a new {wsc_client.client wsc_client object} if there is no client
     * present in the window. Apart from that, this function can be used to
     * invoke functions on the client object. 
     * 
     * @example
     *  // Create a client inside div.container
     *  $('.container').wsc( 'init' );
     *  
     *  // The above code will create a new chat client which will draw itself
     *  // inside div.container on the page. This example is not too good as no
     *  // configuration options have been supplied. The example connecting is an
     *  // example of a simple configuration using dummy values. In this example,
     *  // we also start a connection to the WebSocket chat server.
     *  
     *  $('.container').wsc( 'init', {
     *      // Connection information.
     *      'domain': 'mywebsite.com',
     *      'server': 'ws://website.com/my/wsproxy:0000',
     *      // Login details.
     *      'username': 'username',
     *      'pk': 'token'
     *  });
     *  
     *  // After creating our client, we can start connecting to the server.
     *  $('.container').wsc( 'connect' );
     * 
     * @param [String] method Name of the method to call on the client object.
     * @param [Object] options Use this to pass arguments to the method being called.
     * @return [Object] Client object on init, something else on different methods.
     */
    $.fn.wsc = function( method, options ) {
        
        client = $(window).data('wscclient');
        
        if( method == 'init' || client === undefined ) {
            if( client == undefined ) {
                client = new wsc.Client( $(this), options, ($.browser.mozilla || false) );
                $(window).resize(function( ) { client.ui.resize(); });
                $(window).focus(function( ) { client.ui.control.focus(); });
                setInterval(function(  ) { client.loop(); }, 120000);
            }
            $(window).data('wscclient', client);
        }
        
        if( method != 'init' && method != undefined ) {
            method = 'jq_' + method;
            if( method in client )
                client[method]( $(this), options);
        }
        
        return client;
        
    };
    $.fn.wscui = function( method, options ) {
        
        ui = $(window).data('wscui');
        
        if( method == 'init' || ui === undefined ) {
            if( ui == undefined ) {
                ui = new WscUI( $(this), options, ($.browser.mozilla || false) );
                $(window).resize(ui.resize);
            }
            $(window).data('wscui', ui);
        }
        
        if( method != 'init' && method != undefined ) {
            method = 'jq_' + method;
            if( method in ui )
                ui[method]( $(this), options);
        }
        
        return ui;
        
    };
    
})( jQuery );
