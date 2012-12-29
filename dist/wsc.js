/**
 * WebSocket Chat client module.
 * 
 * @module wsc
 */
var wsc = {};
wsc.VERSION = '1.1.8';
wsc.STATE = 'release candidate';
wsc.REVISION = '0.15.93';
wsc.defaults = {};
wsc.defaults.theme = 'wsct_default';
wsc.defaults.themes = [ 'wsct_default', 'wsct_dAmn' ];
// Taken from dAmnAIR by philo23
// dAmnAIR - http://botdom.com/wiki/DAmnAIR
// philo23 on deviantART - http://philo23.deviantart.com/

/*
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
    this.conn.onmessage = this._message;
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
    
    return this.sock.send(replaceAll(escape(message), '+', '%2B'));

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
wsc.SocketIO = function( server, open, message, disconnect ) {

    this.sock = null;
    this.conn = null;
    this.server = server;
    this.open( open );
    this.message( message );
    this.disconnect( disconnect );

};

wsc.SocketIO.prototype = new wsc.Transport('');
wsc.SocketIO.prototype.constructor = wsc.SocketIO;

/**
 * Connect to the server.
 * 
 * @method connect
 */
wsc.SocketIO.prototype.connect = function(  ) {

    var tr = this;
    this.conn = io.connect( this.server );
    this.conn.on('connect', function(event, sock) { tr.onopen( event, sock ) });
    this.conn.on('message', function( message ) { tr._message( { 'data': message } ) } );
    this.conn.on('close', function(event) { tr.ondisconnect( event ); });

};

/**
 * Called when the connection is opened.
 * Sets the `sock` attribute.
 * 
 * @method onopen
 * @param event {Object} SocketIO event object.
 * @param sock {Object} Transport object.
 */
wsc.SocketIO.prototype.onopen = function( event, sock ) {

    this.sock = sock || this.conn;
    this._open( event, this );

};

/**
 * Called when the connection is closed.
 * Resets `sock` and `conn` to null.
 * 
 * @method ondisconnect
 * @param event {Object} SocketIO event object.
 */
wsc.SocketIO.prototype.ondisconnect = function( event ) {

    this.sock = null;
    this.conn = null;
    this._disconnect( event );

};

/**
 * Send a message to the server.
 * 
 * @method send
 * @param message {String} message to send to the server.
 */
wsc.SocketIO.prototype.send = function( message ) {

    if( this.sock == null )
        return -1;
    
    return this.sock.send(replaceAll(encodeURIComponent(message), ' ', '+'));

};

/**
 * Close the connection.
 * 
 * @method close
 */
wsc.SocketIO.prototype.close = function(  ) {

    if( this.sock == null )
        return;
    
    this.sock.close();

};




/* wsc lib - photofroggy
 * Generic useful functions or something.
 */


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
    return ret;
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

// Escape special characters for regexes.
function EscapeRegExp( text ) {
    return text.replace((new RegExp('(\\' + [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ].join('|\\') + ')', 'g')), '\\$1');
}

String.format = function() {
  var args = Array.prototype.slice.call(arguments);
  var content = args.shift();
  args = args.shift();
  if( args.length == 0 )
    return content;
  var argsl = args.length;
  
  return content.replace(/{(\d+)}/g, function(match, number) {
    if(argsl <= parseInt(number))
        return match;
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

// Replace all stuff with some shit idk.
replaceAllRaw = function ( text, search, replace ) {
    while( text.indexOf( search ) > -1 ) {
        text = text.replace( search, replace );
    }
    return text;
};

replaceAll = function( text, search, replace ) {
    return text.split(search).join(replace);
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
    for( var index in b ) {
        if( !a.hasOwnProperty(index) && !b.hasOwnProperty(index) )
            continue;
        if( typeof a[index] == 'object' ) {
            a[index] = Object.extend(a[index], b[index]);
        } else {
            a[index] = b[index];
        }
    }
};

Object.extend = function( a, b ) {
    var obj = {};
    Object.steal(obj, a);
    Object.steal(obj, b);
    return obj;
};

function zeroPad( number, width ) {
    width = width || 2;
    width -= number.toString().length;
    if ( width > 0 ) {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + "";
}

function formatTime( format, date ) {
    date = date || new Date();
    
    HH = date.getHours();
    hh = HH;
    format = replaceAll(format, '{mm}', zeroPad(date.getMinutes(), 2));
    format = replaceAll(format, '{ss}', zeroPad(date.getSeconds(), 2));
    mr = 'am';
    
    if( hh > 11 ) {
        mr = 'pm';
        if( hh > 12 )
            hh = hh - 12;
    } else if( hh == 0 ) {
        hh = '12';
    }
    
    format = replaceAll(format, '{hh}', zeroPad(hh, 2));
    format = replaceAll(format, '{HH}', zeroPad(HH, 2));
    format = replaceAll(format, '{mr}', mr);
    return format;
}

function oxlist( sequence ) {
    last = sequence.pop();
    ret = sequence.join(', ');
    return ret + ( ret.length > 0 ? ', and ' : '' ) + last;
}

function pluralise( measure, num ) {
    return measure + ( num == 1 ? '' : 's' );
}

function timeLengthString( length ) {
    var elapsed = length;
    var elarr = [];
    elarr.unshift([ 'second', Math.round(elapsed % 60) ]);
    elapsed /= Math.round(60);
    elarr.unshift([ 'minute', Math.round(elapsed % 60) ]);
    elapsed /= Math.round(60);
    elarr.unshift([ 'hour', Math.round(elapsed % 24) ]);
    elapsed /= Math.round(24);
    elarr.unshift([ 'day', elapsed ]);
    
    var ret = [];
    for( i in elarr ) {
        lapse = elarr[i];
        if( lapse[1] < 1 )
            continue;
        ret.push( lapse[1].toString() + ' ' + pluralise(lapse[0], lapse[1]) ); 
    }
    
    return oxlist(ret);
}
/**
 * Storage object.
 * Allows you to save stuffs yo.
 */
wsc.Storage = function( namespace, parent ) {

    this.ns = namespace || null;
    this.parent = parent || null;

};

/**
 * Get a "folder".
 */
wsc.Storage.prototype.folder = function( namespace ) {

    if( this.ns != null )
        namespace = this.ns + '.' + namespace;
    
    return new wsc.Storage( namespace, this );

};

/**
 * Get an item from storage.
 */
wsc.Storage.prototype.get = function( key, default_val ) {

    if( this.ns != null )
        key = this.ns + '.' + key;
    
    try {
        if( !localStorage.hasOwnProperty(key) )
            return default_val;
        return localStorage[key];
    } catch(err) {
        return default_val;
    }

};

/**
 * Store an item.
 */
wsc.Storage.prototype.set = function( key, value ) {

    if( this.ns != null )
        key = this.ns + '.' + key;
    
    try {
        localStorage[key] = value;
    } catch(err) {  }

};

/**
 * Remove an item.
 */
wsc.Storage.prototype.remove = function( key ) {

    if( this.ns != null )
        key = this.ns + '.' + key;
    
    try {
        if( !localStorage.hasOwnProperty( key ) )
            return false;
        return delete localStorage[key];
    } catch(err) {  }
    
    return false;

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
                sub.body = subs.slice(i + 1).join('\n\n');
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
    this.ui.manager.remove_channel(this.namespace);
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
};

/**
 * Get the order of a given privilege class.
 * 
 * @method get_privclass_order
 * @param name {String} Name of the privilege class to get the order of.
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
        this.register_user(e.pkt.sub[i]);
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
    var pcs = {};
    
    for( var i in names ) {
        if( !names.hasOwnProperty(i) )
            continue;
        var un = names[i];
        var member = this.info.members[un];
        
        if( !( member['pc'] in pcs ) )
            pcs[member['pc']] = {'name': member['pc'], 'users': []};
        
        var conn = member['conn'] == 1 ? '' : '[' + member['conn'] + ']';
        var s = member.symbol;
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
    
    var ulist = [];
    
    for(var index in this.info["pc_order"]) {
        var pc = this.info['pc'][this.info["pc_order"][index]];
        
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
    var un = pkt["param"];
    
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
    
    member['conn']--;
    
    if( member['conn'] > 0 && !force)
        return;
    
    delete this.info.members[user];
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
    
    var u = this.client.settings['username'].toLowerCase();
    
    if( u == e.user.toLowerCase() )
        return;
    
    var msg = e['message'].toLowerCase();
    
    if( msg.indexOf(u) < 0 )
        return;
    
    if( this.ui != null)
        this.ui.highlight();
    
    this.client.trigger( 'pkt.recv_msg.highlighted', e );

};

/**
 * Process a recv_privchg event.
 * 
 * @method recv_privchg
 * @param e {Object} Event data for recv_privhcg packet.
 */
wsc.Channel.prototype.recv_privchg = function( e ) {
    var member = this.info.members[e.user];
    
    if( !member )
        return;
    
    member['pc'] = e.pc;
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
 * Rendered message object.
 */
wsc.MessageString = function( data, parser ) {
    this._parser = parser || new wsc.MessageParser();
    this.raw = data;
};

with(wsc.MessageString.prototype = new String) {
    constructor = wsc.MessageParser;
    toString = valueOf = function() { return this.raw; };
}

wsc.MessageString.prototype.html = function(  ) {
    return this.raw;
};

/**
 * @function text
 *
 * Render the tablumps in plain text where possible. Some tablumps appear as
 * HTML entities even through this.
 */
wsc.MessageString.prototype.text = function() {
    return this.raw;
};

/**
 * @function ansi
 * 
 * Render the tablumps with ANSI escape sequences.
 * 
 * For this rendering method to really be worth it, I'll actually have to move
 * away from the simple regex.
 */
wsc.MessageString.prototype.ansi = function() {
    return this.raw;
};

wsc.MessageParser = function(  ) {};

wsc.MessageParser.prototype.parse = function( data ) {

    return new wsc.MessageString(data, this);

};

wsc.MessageParser.prototype.render = function( mode, data ) {

    return data.raw;

};



/**
 * Parser for dAmn-like protocols.
 * 
 * @class Protocol
 * @constructor
 * @param [mparser=wsc.MessageParser] {Object} Message parser instance.
 */
wsc.Protocol = function( mparser ) {

    this.mparser = mparser || new wsc.MessageParser;
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
            return p.map(packet.sub[0], args, mapping);
        }
        
    };
    //  'event': [ template, monitor, global ]
    this.messages = {
        'chatserver': ['<span class="servermsg">** Connected to llama {version} *</span>', false, true ],
        'login': ['<span class="servermsg">** Login as {username}: "{e}" *</span>', false, true],
        'join': ['<span class="servermsg">** Join {ns}: "{e}" *</span>', true],
        'part': ['<span class="servermsg">** Part {ns}: "{e}" * <em>{r}</em></span>', true],
        'property': ['<span class="servermsg">** Got {p} for {ns} *</span>', true],
        'recv_msg': ['<span class="cmsg user u-{user}"><strong>&lt;{user}&gt;</strong></span><span class="cmsg u-{user}">{message}</span>'],
        'recv_npmsg': ['<span class="cmsg user u-{user}"><strong>&lt;{user}&gt;</strong></span><span class="cmsg u-{user}">{message}</span>'],
        'recv_action': ['<span class="caction user u-{user}"><em>* {user}</em></span><span class="caction u-{user}">{message}</span>'],
        'recv_join': ['<span class="cevent bg">** {user} has joined *</span>'],
        'recv_part': ['<span class="cevent bg">** {user} has left * <em>{r}</em></span>'],
        'recv_privchg': ['<span class="cevent">** {user} has been made a member of {pc} by {by} *</span>'],
        'recv_kicked': ['<span class="cevent">** {user} has been kicked by {by} * <em>{r}</em></span>'],
        'recv_admin_create': ['<span class="cevent admin">** Privilege class {pc} has been created by {user} * <em>{privs}</em></span>'],
        'recv_admin_update': ['<span class="cevent admin">** Privilege class {pc} has been updated by {user} * <em>{privs}</em></span>'],
        'recv_admin_rename': ['<span class="cevent admin">** Privilege class {prev} has been renamed to {pc} by {user} *</span>'],
        'recv_admin_move': ['<span class="cevent admin">** All members of {prev} have been moved to {pc} by {user} * <em>{affected} affected user(s)</em></span>'],
        'recv_admin_remove': ['<span class="cevent admin">** Privilege class {pc} has been removed by {user} * <em>{affected} affected user(s)</em></span>'],
        'recv_admin_show': null,
        'recv_admin_showverbose': null,
        'recv_admin_privclass': ['<span class="cevent admin">** Admin command "{command}" failed * <em>{e}</em></span>'],
        'kicked': ['<span class="servermsg">** You have been kicked by {user} * <em>{r}</em></span>'],
        'ping': null, //['<span class="servermsg">** Ping...</span>', true],
        'disconnect': ['<span class="servermsg">** You have been disconnected * <em>{e}</em></span>', false, true],
        // Stuff here is errors, yes?
        'send': ['<span class="servermsg">** Send error: <em>{e}</em></span>'],
        'kick': ['<span class="servermsg">** Could not kick {user} * <em>{e}</em></span>'],
        'get': ['<span class="servermsg">** Could not get {p} info for {ns} * <em>{e}</em></span>'],
        'set': ['<span class="servermsg">** Could not set {p} * <em>{e}</em></span>'],
        'kill': ['<span class="servermsg">** Kill error * <em>{e}</em></span>'],
        'unknown': ['<span class="servermsg">** Received unknown packet in {ns} * <em>{packet}</em></span>', true],
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
 * @param mapping {Object} Packet mapping data.
 */
wsc.Protocol.prototype.map = function( packet, event, mapping ) {

    for(var i in mapping) {
        if( mapping[i] == null)
            continue;
        
        var key = mapping[i];
        var skey = key;
        switch(parseInt(i)) {
            // e.<map[event][0]> = packet.param
            case 0:
                event[key] = packet['param'];
                break;
            // for n in map[event][1]: e.<map[event][1][n]> = packet.arg.<map[event][1][n]>
            case 1:
                if( mapping[1] instanceof Array ) {
                    for( var n in mapping[1] ) {
                        key = mapping[1][n];
                        if( key instanceof Array ) {
                            event[key[1]] = packet['arg'][key[0]];
                            skey = key[1];
                        } else {
                            var k = key[0] == '*' ? key.slice(1) : key;
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
                    packet.sub[0].sub = packet.sub.slice(1);
                    this.map(packet.sub[0], event, key);
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
        val = this.mparser.parse( event[skey] );
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
        if( !event.hasOwnProperty(key) || key == 'pkt' )
            continue;
        
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
    
    event.html = this.render(event, 'html');
    
    try {
        if( !msgm[2] ) {
            if( !msgm[1] ) {
                client.ui.channel(event.ns).log_item(event);
            } else {
                client.ui.channel(client.mns).log_item(event);
            }
        } else {
            client.ui.log_item(event);
        }
    } catch(err) {
        console.log('>> Failed to log message for ' + event.sns + '::');
        console.log('>> ' + event.html);
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
        if( client.conn instanceof wsc.SocketIO ) {
            client.ui.server_message("At the moment there is a problem with reconnecting under socket.io.");
            client.ui.server_message("Refresh the page to connect.");
            return;
        }
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
        client.connect();
    }, 2000);

}; 

// Received data from WebSocket connection.
wsc.Flow.prototype.message = function( client, event ) {
    var pack = new wsc.Packet(unescape(replaceAll(event.data, '+', ' ')));
    
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

    try {
        this[event.name](event, client);
    } catch( err ) {}

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
        if ( client.fresh ) {
            client.join(client.settings["autojoin"]);
            if( client.autojoin.on ) {
                for( var i in client.autojoin.channel ) {
                    if( !client.autojoin.channel.hasOwnProperty(i) )
                        continue;
                    client.join(client.autojoin.channel[i]);
                }
            }
        } else {
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
    var ns = client.deform_ns(event.ns);
    var c = client.channel(ns);
    
    if(event.e == "ok") {
        info = '';
        
        if( event.r.length > 0 )
            info = '[' + event.r + ']';
        else
            client.remove_ns(ns);
        
        msg = 'You have left ' + ns;
        c.server_message(msg, info);
        
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
            this.message( client, { data: 'disconnect\ne='+e.r+'\n' } );
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




/**
 * This extension implements most of the default commands for wsc.
 */
wsc.defaults.Extension = function( client ) {

    var ext = {};
    ext.away = {
        'on': false,
        'reason': '',
        'last': {},
        'since': 0,
        'store': client.storage.folder('away'),
        'format': {
            'setaway': '/me is away: {reason}',
            'setback': '/me is back',
            'away': '{from}: I am away, reason: {reason}'
        }
    };
    
    var init = function(  ) {
        // Commands.
        client.bind('cmd.connect', cmd_connection );
        client.bind('cmd.set', cmd_setter );
        
        // standard dAmn commands.
        client.bind('cmd.join', cmd_join );
        client.bind('cmd.part', cmd_part );
        // send ...
        client.bind('cmd.say', cmd_say );
        client.bind('cmd.npmsg', cmd_npmsg );
        client.bind('cmd.me', cmd_action );
        client.bind('cmd.promote', cmd_chgpriv );
        client.bind('cmd.demote', cmd_chgpriv );
        client.bind('cmd.ban', cmd_ban );
        client.bind('cmd.unban', cmd_ban );
        client.bind('cmd.kick', cmd_killk );
        //client.bind('cmd.get', cmd_get );
        client.bind('cmd.whois', cmd_whois );
        client.bind('cmd.title', cmd_title );
        client.bind('cmd.topic', cmd_title );
        client.bind('cmd.admin', cmd_admin );
        client.bind('cmd.disconnect', cmd_connection );
        client.bind('cmd.kill', cmd_killk );
        client.bind('cmd.raw', cmd_raw );
        
        client.bind('cmd.clear', cmd_clear );
        client.bind('cmd.clearall', cmd_clearall );
        client.bind('cmd.close', cmd_close );
        
        client.bind('pkt.property', pkt_property );
        client.bind('pkt.recv_admin_show', pkt_admin_show );
        client.bind('pkt.recv_admin_showverbose', pkt_admin_show );
        client.bind('pkt.get', pkt_get );
        
        
        // Non-standard commands.
        client.bind('cmd.gettitle', cmd_gett);
        client.bind('cmd.gettopic', cmd_gett);
        
        // lol themes
        client.bind('cmd.theme', cmd_theme);
        // some ui business.
        client.ui.on('settings.open', settings_page);
        client.ui.on('settings.open.ran', about_page);
        client.ui.on('settings.save', settings_save);
    };
    
    var settings_save = function( e, ui ) {
        client.settings.ui.theme = e.theme;
        client.settings.ui.clock = e.clock;
        client.settings.ui.tabclose = e.tabclose;
        client.config_save();
    };
    
    var settings_page = function( e, ui ) {
    
        var page = e.settings.page('Main', true);
        var orig = {};
        orig.username = client.settings.username;
        orig.pk = client.settings.pk;
        
        page.item('Form', {
            'ref': 'login',
            'title': 'Login',
            'text': 'Here you can change the username and token used to\
                    log into the chat server.',
            'fields': [
                ['Textfield', {
                    'ref': 'username',
                    'label': 'Username',
                    'default': orig.username
                }],
                ['Textfield', {
                    'ref': 'token',
                    'label': 'Token',
                    'default': orig.pk
                }]
            ],
            'event': {
                'save': function( event ) {
                    client.settings.username = event.data.username;
                    client.settings.pk = event.data.token;
                }
            }
        }, true);
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Main',
            'text': 'Use this window to view and change your settings.\n\nCheck\
                    the different pages to see what settings can be changed.',
        }, true);
        
        page.item('Text', {
            'ref': 'debug',
            'wclass': 'faint',
            'title': 'Debug Information',
            'text': 'Chat Agent: <code>' + client.settings.agent + '</code>\n\nUser\
                    Agent: <code>' + navigator.userAgent + '</code>'
        });
    
    };
        
    var about_page = function( e, ui ) {
    
        var page = e.settings.page('About', true);
        page.item('Text', {
            'ref': 'about-wsc',
            'title': 'Wsc',
            'text': 'Currently using <a href="http://github.com/photofroggy/wsc/">wsc</a>\
                    version ' + wsc.VERSION + ' ' + wsc.STATE + '.\n\nWsc\
                    works using HTML5, javascript, and CSS3. WebSocket is used for the connection\
                    where possible. The source code for this client is pretty huge.\n\nWsc was created\
                    by ~<a href="http://photofroggy.deviantart.com/">photofroggy</a>'
        });
    
    };
    
    var cmd_theme = function( e, client) {
        client.ui.theme(e.args.split(' ').shift());
    };
        
    /**
     * @function setter
     * @cmd set set configuration options
     * This command allows the user to change the settings for the client through
     * the input box.
     */
    var cmd_setter = function( e ) {
        var data = e.args.split(' ');
        var setting = data.shift().toLowerCase();
        var data = data.join(' ');
        if( data.length == 0 ) {
            client.cchannel.serverMessage('Could not set ' + setting, 'No data supplied');
            return;
        }
        
        if( !( setting in client.settings ) ) {
            client.cchannel.serverMessage('Unknown setting "' + setting + '"');
            return;
        }
        
        client.settings[setting] = data;
        client.cchannel.serverMessage('Changed ' + setting + ' setting', 'value: ' + data);
        client.control.setLabel();
        
    };
    
    /**
     * @function connect
     * This command allows the user to force the client to connect to the server.
     */
    var cmd_connection = function( e ) {
        client[e.cmd]();
    };
    
    // Join a channel
    var cmd_join = function( e ) {
        var chans = e.args.split(' ');
        var chans = chans.toString() == '' ? [] : chans;
        
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' )
            return;
        
        for( index in chans )
            client.join(chans[index]);
    };
    
    // Leave a channel
    var cmd_part = function( e ) {
        var chans = e.args.split(' ');
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' ) {
            client.part(e.ns);
            return;
        }
        
        for( index in chans )
            client.part(chans[index]);
    };
    
    // Set the title
    var cmd_title = function( e ) {
        client.set(e.target, e.cmd, e.args);
    };
    
    // Promote or demote user
    var cmd_chgpriv = function( e ) {
        var bits = e.args.split(' ');
        client[e.cmd.toLowerCase()](e.target, bits[0], bits[1]);
    };
    
    // Ban user
    var cmd_ban = function( e, client ) {
        var args = e.args.split(' ');
        var user = args.shift();
        var cmd = e.cmd;
        if( cmd == 'ban' && args.length > 0 ) {
            client.kick( e.target, user, args.join(' ') );
        }
        client[cmd](e.target, user);
    };
    
    // Send a /me action thingy.
    var cmd_action = function( e ) {
        client.action(e.target, e.args);
    };
    
    // Send a raw packet.
    var cmd_raw = function( e ) {
        client.send( e.args.replace(/\\n/gm, "\n") );
    };
    
    // Kick or kill someone.
    var cmd_killk = function( e, client ) {
        var d = e.args.split(' ');
        var u = d.shift();
        var r = d.length > 0 ? d.join(' ') : null;
        if( e.cmd == 'kick' )
            client.kick( e.target, u, r );
        else
            client.kill( u, r );
    };
    
    // Say something.
    var cmd_say = function( e ) {
        client.say( e.target, e.args );
    };
    
    // Say something without emotes and shit. Zomg.
    var cmd_npmsg = function( e ) {
        client.npmsg( e.target, e.args );
    };
    
    // Clear the channel's log.
    var cmd_clear = function( e, client ) {
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            for( var i in users ) {
                if( !users.hasOwnProperty(i) )
                    continue;
                client.channel(e.target).clear(users[i]);
            }
        } else {
            client.channel(e.target).clear();
        }
    };
    
    // Clear all channel logs.
    var cmd_clearall = function( e, client ) {
        var method = null;
        
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            method = function( ns, channel ) {
                for( var i in users ) {
                    if( !users.hasOwnProperty(i) )
                        continue;
                    channel.clear( users[i] );
                }
            };
        } else {
            method = function( ns, channel ) {
                channel.clear();
            };
        }
        
        client.each_channel( method, true );
    };
    
    var cmd_close = function( cmd ) {
        client.part(cmd.target);
        client.remove_ns(cmd.target);
    };
    
    // Send a whois thingy.
    var cmd_whois = function( event, client ) {
        client.whois( event.args.split(' ')[0] );
    };
    
    // Send an admin packet.
    var cmd_admin = function( event, client ) {
        client.admin( event.target, event.args );
    };
    
    // Send an disconnect packet.
    var cmd_disconnect = function( event, client ) {
        client.disconnect(  );
    };
    
    // Get the title or topic.
    var cmd_gett = function( event, client ) {
        var which = event.cmd.indexOf('title') > -1 ? 'title' : 'topic';
        client.control.ui.set_text('/' + which + ' ' + client.channel(event.target).info[which].content);
    };
    
    // Process a property packet, hopefully retreive whois info.
    var pkt_property = function( event, client ) {
        if(event.p != 'info')
            return;
        
        var subs = event.pkt.sub;
        var data = subs.shift().arg;
        data.username = event.sns.substr(1);
        data.connections = [];
        var conn = {};
        
        while( subs.length > 0 ) {
            conn = subs.shift().arg;
            conn.channels = [];
            while( subs.length > 0 ) {
                if( subs[0].cmd != 'ns' )
                    break;
                conn.channels.unshift( client.deform_ns(subs.shift().param) );
            }
            data.connections.push(conn);
        }
        
        client.cchannel.log_whois(data);
    };
    
    var pkt_get = function( event, client ) {
    
        if( event.ns.indexOf('login:') != 0 )
            return;
        
        client.cchannel.server_message( 'Whois failed for ' + (event.sns.substr(1)), 'not online');
    
    };
    
    var pkt_admin_show = function( event, client ) {
    
        var chan = client.channel(event.ns);
        var lines = event.info.split('\n');
        var info = '';
        var pcs = [];
        var pc = '';
        
        for( var i in lines ) {
            if( !lines.hasOwnProperty(i) )
                continue;
            
            info = lines[i].split(' ');
            
            if( event.p == 'privclass' ) {
                pcs.push([ info.shift(), info.shift().split('=')[1], info.join(' ') ]);
            } else if( event.p == 'users' ) {
                pc = info.shift().split(':', 1)[0];
                pcs.push([ pc, chan.get_privclass_order( pc ), info.join(' ') ]);
            }
        }
        
        chan.log_pc(event.p == 'privclass', pcs);
    
    };
    
    init();
    wsc.defaults.Extension.Autojoin(client);
    wsc.defaults.Extension.Away(client);
    wsc.defaults.Extension.Ignore(client);

};
/**
 * Autojoin extension.
 */
wsc.defaults.Extension.Autojoin = function( client ) {

    var settings = client.autojoin
    
    var init = function(  ) {
    
        client.bind('cmd.autojoin', cmd_autojoin);
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Autojoin', true);
        var ul = '<ul>';
        var orig = {};
        orig.ajon = client.autojoin.on;
        orig.chan = client.autojoin.channel;
        
        if( client.autojoin.channel.length == 0 ) {
            ul+= '<li><i>No autojoin channels set</i></li></ul>';
        } else {
            for( var i in client.autojoin.channel ) {
                if( !client.autojoin.channel.hasOwnProperty( i ) )
                    continue;
                ul+= '<li>' + client.autojoin.channel[i] + '</li>';
            }
            ul+= '</ul>';
        }
        
        page.item('Checkbox', {
            'ref': 'eaj',
            'title': 'Autojoin',
            'text': 'Turn on autojoin to automatically join selected channels\
                    when you connect to the chat server.',
            'items': [
                { 'value': 'yes', 'title': 'On', 'selected': orig.ajon }
            ],
            'event': {
                'change': function( event ) {
                    if( event.target.value == 'yes' )
                        client.autojoin.on = event.target.checked;
                },
                'save': function( event ) {
                    orig.ajon = client.autojoin.on;
                    client.config_save();
                },
                'close': function( event ) {
                    client.autojoin.on = orig.ajon;
                }
            }
        });
        
        var imgr = page.item('Items', {
            'ref': 'channelss',
            'title': 'Channels',
            'text': 'Add any channels you want to join automatically when you\
                    connect to the chat server.',
            'items': client.autojoin.channel,
            'prompt': {
                'title': 'Add Channel',
                'label': 'Channel:',
            },
            'event': {
                'up': function( event ) {
                    var swap = event.args.swap;
                    client.autojoin.channel[swap['this'].index] = swap.that.item;
                    client.autojoin.channel[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.autojoin.channel;
                },
                'down': function( event ) {
                    var swap = event.args.swap;
                    client.autojoin.channel[swap['this'].index] = swap.that.item;
                    client.autojoin.channel[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.autojoin.channel;
                },
                'add': function( event ) {
                    var item = client.deform_ns(event.args.item).toLowerCase();
                    var index = client.autojoin.channel.indexOf(item);
                    
                    if( index != -1 )
                        return;
                    
                    client.autojoin.channel.push( item );
                    imgr.options.items = client.autojoin.channel;
                },
                'remove': function( event ) {
                    client.autojoin.channel.splice( event.args.index, 1 );
                    imgr.options.items = client.autojoin.channel;
                },
                'save': function( event ) {
                    orig.chan = client.autojoin.channel;
                    client.config_save();
                },
                'close': function( event ) {
                    client.config_load();
                }
            }
        });
    
    };
    
    var cmd_autojoin = function( cmd ) {
    
        var args = cmd.args.split(' ');
        
        if( !args )
            return;
        
        var subcmd = args.shift().toLowerCase();
        var meth = function( item ) {};
        var mod = false;
        var chan = client.channel(cmd.ns);
        
        switch( subcmd ) {
        
            case 'add':
                meth = function( item ) {
                    if( client.autojoin.channel.indexOf( item ) == -1 ) {
                        mod = true;
                        client.autojoin.channel.push( item );
                        chan.server_message('Added ' + item + ' to your autojoin.');
                    } else {
                        chan.server_message('Already have ' + item + ' on your autojoin.');
                    }
                };
                break;
            case 'rem':
            case 'remove':
                meth = function( item ) {
                    var ci = client.autojoin.channel.indexOf( item );
                    if( ci != -1 ) {
                        mod = true;
                        client.autojoin.channel.splice( ci, 1 );
                        chan.server_message('Removed ' + item + ' from your autojoin.');
                    } else {
                        chan.server_message(item + ' is not on your autojoin list.');
                    }
                };
                break;
            case 'on':
                chan.server_message('Autojoin on.');
                if( !client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = true;
                }
                break;
            case 'off':
                chan.server_message('Autojoin off.');
                if( client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = false;
                }
                break;
        
        }
        
        var item = '';
        
        for( var i in args ) {
        
            if( !args.hasOwnProperty(i) )
                continue;
            item = client.deform_ns(args[i]).toLowerCase();
            meth( item );
        
        }
        
        if( mod )
            client.config_save();
    
    };
    
    init();

};

/**
 * Away extension.
 */
wsc.defaults.Extension.Away = function( client ) {

    var storage = client.storage.folder('away');
    var settings = {
        'on': false,
        'reason': '',
        'last': {},
        'since': 0,
        'interval': 60000,
        'format': {
            'setaway': '/me is away: {reason}',
            'setback': '/me is back',
            'away': '{user}: I\'ve been away for {timesince}. Reason: {reason}'
        }
    };
    
    var init = function(  ) {
    
        load();
        save();
        
        client.bind('cmd.setaway', cmd_setaway);
        client.bind('cmd.setback', cmd_setback);
        client.bind('pkt.recv_msg.highlighted', pkt_highlighted);
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Away', true);
        var orig = {};
        orig.away = settings.format.away;
        orig.sa = settings.format.setaway;
        orig.sb = settings.format.setback;
        orig.intr = settings.interval;
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Away Messages',
            'text': 'Use away messages when you are away from the chats.\n\n\
                    You can set yourself away using the \
                    <code>/setaway [reason]</code> command. When you get back,\
                    use <code>/setback</code>. While you are away, the client\
                    will automatically respond when people try to talk to you,\
                    telling them you\'re away.',
        });
        
        page.item('Form', {
            'ref': 'msgs',
            'title': 'Messages',
            'text': 'Here you can set the messages displayed when you set\
                    yourself away or back. You can also change the away message\
                    format.',
            'hint': '<b>{user}</b><br/>This is replaced with the username of the person trying to talk to you\n\n<b>{reason}</b>\
                    <br/>This is replaced by your reason for being away.\n\n<b>{timesince}</b>\
                    <br/>Use this to show how long you have been away for.',
            'fields': [
                ['Textfield', {
                    'ref': 'away',
                    'label': 'Away',
                    'default': orig.away
                }],
                ['Textfield', {
                    'ref': 'setaway',
                    'label': 'Setaway',
                    'default': orig.sa
                }],
                ['Textfield', {
                    'ref': 'setback',
                    'label': 'Setback',
                    'default': orig.sb
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.format.away = event.data.away;
                    settings.format.setaway = event.data.setaway;
                    settings.format.setback = event.data.setback;
                    save();
                }
            }
        });
        
        page.item('Form', {
            'ref': 'interval',
            'title': 'Message Interval',
            'text': 'Here you can set the amount of time to wait before \
                    displaying another away message. The interval is in seconds.',
            'fields': [
                ['Textfield', {
                    'ref': 'interval',
                    'label': 'Interval',
                    'default': (orig.intr / 1000).toString()
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.interval = parseInt(event.data.interval) * 1000;
                    save();
                }
            }
        });
    
    };
    
    
    
    // Away message stuff.
    var cmd_setaway = function( event, client ) {
    
        settings.on = true;
        settings.last = {};
        settings.since = new Date();
        settings.reason = event.args;
        
        var method = client.say;
        var announce = replaceAll(
            settings.format.setaway,
            '{reason}',
            settings.reason || '[silent away]'
        );
        
        if( announce.indexOf('/me ') == 0 ) {
            announce = announce.substr(4);
            method = client.action;
        }
        
        
        client.each_channel( function( ns ) {
            method.call( client, ns, announce );
        } );
    
    };
    
    var cmd_setback = function( event, client ) {
        settings.on = false;
        var method = client.say;
        var announce = settings.format.setback;
        
        if( announce.indexOf('/me ') == 0 ) {
            announce = announce.substr(4);
            method = client.action;
        }
        
        client.each_channel( function( ns ) {
            method.call( client, ns, announce );
        } );
    };
    
    var pkt_highlighted = function( event, client ) {
    
        if( !settings.on )
            return;
        
        if( settings.reason.length == 0 )
            return;
        
        if( event.user == client.settings.username )
            return;
        
        if( client.exclude.indexOf( event.sns.toLowerCase() ) != -1 )
            return;
        
        var t = new Date();
        var ns = event.sns.toLowerCase();
        
        if( ns in settings.last )
            if( (t - settings.last[ns]) <= settings.interval )
                return;
        
        var tl = timeLengthString( (t - settings.since) / 1000 );
        var msg = replaceAll( settings.format.away, '{user}', event.user );
        msg = replaceAll( msg, '{timesince}', tl );
        client.say(event.ns, replaceAll( msg, '{reason}', settings.reason ));
        settings.last[ns] = t;
    
    };
    
    
    var load = function(  ) {
    
        settings.format.setaway = storage.get('setaway', '/me is away: {reason}');
        settings.format.setback = storage.get('setback', '/me is back');
        settings.format.away = storage.get('away', '{user}: I\'ve been away for {timesince}. Reason: {reason}');
        settings.interval = parseInt(storage.get('interval', 60000));
    
    };
    
    var save = function(  ) {
    
        storage.set('interval', settings.interval);
        storage.set('setaway', settings.format.setaway);
        storage.set('setback', settings.format.setback);
        storage.set('away', settings.format.away);
    
    };
    
    init();

};

/**
 * Ignore extension.
 * 
 * Implements the ignore functionality.
 */
wsc.defaults.Extension.Ignore = function( client ) {

    var settings = {};
    var storage = client.storage.folder('ignore');
    var istore = storage.folder('ignored');
    
    var init = function(  ) {
    
        load();
        save(); // Just in case we don't have the stuff stored in the first place.
        
        // Commands
        client.bind('cmd.ignore', cmd_ignore);
        client.bind('cmd.unignore', cmd_unignore);
        
        // Settings window
        client.ui.on('settings.open', settings.page);
    
    };
    
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Ignores', true);
        var orig = {};
        orig.im = settings.ignore;
        orig.uim = settings.unignore;
        orig.usr = client.ui.umuted;
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Ignores',
            'text': 'Use <code>ignore</code> to ignore people.\n\n\
                    You can "ignore" other users of the chat server using the\n\
                    <code>/ignore</code> command. Ignoring a user hides their\
                    messages from you in the channel log.',
        });
        
        page.item('Form', {
            'ref': 'msgs',
            'title': 'Messages',
            'text': 'Here you can set the messages displayed when you ignore or\
                    unignore a user.\n\nThe text <code>{user}</code> is replaced\
                    with the name of the user your are ignoring or unignoring.',
            'fields': [
                ['Textfield', {
                    'ref': 'ignore',
                    'label': 'Ignore',
                    'default': orig.im
                }],
                ['Textfield', {
                    'ref': 'unignore',
                    'label': 'Unignore',
                    'default': orig.uim
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.ignore = event.data.ignore;
                    settings.unignore = event.data.unignore;
                    save();
                }
            }
        });
        
        var imgr = page.item('Items', {
            'ref': 'ignoreds',
            'title': 'Users',
            'text': 'This is the list of users that you have silenced.\n\nUse the\
                    commands <code>/ignore</code> and <code>/unignore</code>\
                    to edit the list.',
            'items': orig.usr,
            'prompt': {
                'title': 'Add User',
                'label': 'User:',
            },
            'event': {
                'up': function( event ) {
                    var swap = event.args.swap;
                    client.ui.umuted[swap['this'].index] = swap.that.item;
                    client.ui.umuted[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.ui.umuted;
                },
                'down': function( event ) {
                    var swap = event.args.swap;
                    client.ui.umuted[swap['this'].index] = swap.that.item;
                    client.ui.umuted[swap.that.index] = swap['this'].item;
                    imgr.options.items = client.ui.umuted;
                },
                'add': function( event ) {
                    client.mute_user( event.args.item );
                    imgr.options.items = client.ui.umuted;
                },
                'remove': function( event ) {
                    client.unmute_user( event.args.item );
                    imgr.options.items = client.ui.umuted;
                },
                'save': function( event ) {
                    orig.usr = client.ui.umuted;
                    save();
                },
                'close': function( event ) {
                    load();
                }
            }
        });
    
    };
    
    var cmd_ignore = function( cmd ) {
    
        var users = cmd.args.split(' ');
        var user = '';
        var msg = '';
        var mod = false;
        
        for( var i in users ) {
            if( !users.hasOwnProperty( i ) )
                continue;
            
            user = users[i];
            tmod = client.mute_user( user );
            if( !tmod )
                continue;
            
            mod = tmod;
            msg = replaceAll( settings.ignore, '{user}', user );
            if( msg.indexOf('/me ') == 0 ) {
                msg = msg.substr(4);
                client.action( cmd.target, msg );
            } else {
                client.say( cmd.target, msg );
            }
        }
        
        if( mod )
            save();
    
    };
    
    var cmd_unignore = function( cmd ) {
    
        var users = cmd.args.split(' ');
        var user = '';
        var msg = '';
        var mi = -1;
        var mod = false;
        var tmod = false;
        
        for( var i in users ) {
            if( !users.hasOwnProperty( i ) )
                continue;
            
            user = users[i];
            tmod = client.unmute_user( user );
            if( !tmod )
                continue;
            
            mod = tmod;
            msg = replaceAll( settings.unignore, '{user}', user );
            if( msg.indexOf('/me ') == 0 ) {
                msg = msg.substr(4);
                client.action( cmd.target, msg );
            } else {
                client.say( cmd.target, msg );
            }
        }
        
        if( mod )
            save();
    
    };
    
    var load = function(  ) {
        
        settings.ignore = storage.get('ignore', '/me is ignoring {user} now');
        settings.unignore = storage.get('unignore', '/me is not ignoring {user} anymore');
        settings.count = parseInt( storage.get( 'count', 0 ) );
        
        var tu = null;
        for( var i in client.ui.umuted ) {
            if( !client.ui.umuted.hasOwnProperty(i) ) {
                continue;
            }
            client.unmute_user( client.ui.umuted[i] );
        }
        
        client.ui.umuted = [];
        
        if( settings.count > 0 ) {
            tu = null;
            for( var i = 0; i < settings.count; i++ ) {
                client.mute_user( istore.get(i, null) );
                //client.ui.mute_user( tu );
            }
        }
        
    };
    
    var save = function(  ) {
    
        storage.set('ignore', settings.ignore);
        storage.set('unignore', settings.unignore);
        
        for( var i = 0; i < settings.count; i++ ) {
            istore.remove(i)
        }
        
        if( client.ui.umuted.length == 0 ) {
            storage.set('count', 0);
        } else {
            var c = -1;
            for( var i in client.ui.umuted ) {
            
                if( !client.ui.umuted.hasOwnProperty(i) )
                    continue;
                
                c++;
                istore.set( c.toString(), client.ui.umuted[i] );
            
            }
            
            c++;
            settings.count = c;
            storage.set('count', c);
        }
    
    };
    
    init();

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
    this.storage = new wsc.Storage;
    this.storage.ui = this.storage.folder('ui');
    this.storage.aj = this.storage.folder('autojoin');
    this.storage.aj.channel = this.storage.aj.folder('channel');
    this.fresh = true;
    this.attempts = 0;
    this.connected = false;
    this.protocol = null;
    this.flow = null;
    this.ui = null;
    this.events = new EventEmitter();
    this.conn = null;
    this.channelo = {};
    this.cchannel = null;
    this.exclude = [];
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
        "mparser": wsc.MessageParser,
        "flow": wsc.Flow,
        "ui_object": Chatterbox.UI,
        "extend": [wsc.defaults.Extension],
        "client": 'chatclient',
        "clientver": '0.3',
        "ui": {
            "theme": wsc.defaults.theme,
            "themes": wsc.defaults.themes,
            "tabclose": true,
            "clock": true
        }
    };
    this.autojoin = {
        'on': true,
        'count': 0,
        'channel': []
    };
    
    this.settings = Object.extend( this.settings, options );
    this.config_load();
    this.config_save();
    
    this.ui = new this.settings.ui_object( view, {
        'themes': this.settings.ui.themes,
        'theme': this.settings.ui.theme,
        'monitor': this.settings.monitor,
        'username': this.settings.username,
        'domain': this.settings.domain,
        'clock': this.settings.ui.clock,
        'tabclose': this.settings.ui.tabclose
    }, mozilla );
    
    this.settings.agent = this.ui.LIB + '/' + this.ui.VERSION + ' (' + navigator.appVersion.match(/\(([^)]+)\)/)[1] + ') wsc/' + wsc.VERSION + '-r' + wsc.REVISION;
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.protocol = new this.settings.protocol( new this.settings.mparser() );
    this.flow = new this.settings.flow(this.protocol);
    
    this.build();
    
    for(var index in this.settings["extend"]) {
        this.settings["extend"][index](this);
    }
    
    // Welcome!
    this.monitor(this.settings["welcome"]);

};

/**
 * Load configuration from localStorage.
 *
 * @method config_load
 */
wsc.Client.prototype.config_load = function(  ) {

    this.settings.ui.theme = this.storage.ui.get('theme', this.settings.ui.theme);
    this.settings.ui.clock = (this.storage.ui.get('clock', this.settings.ui.clock.toString()) == 'true');
    this.settings.ui.tabclose = (this.storage.ui.get('tabclose', this.settings.ui.tabclose.toString()) == 'true');
    
    this.autojoin.on = (this.storage.aj.get('on', 'true') == 'true');
    this.autojoin.count = parseInt(this.storage.aj.get('count', '0'));
    this.autojoin.channel = [];
    
    var tc = null;
    var c = 0;
    for( var i = 0; i < this.autojoin.count; i++ ) {
        tc = this.storage.aj.channel.get( i, null );
        if( tc == null )
            continue;
        c++;
        this.autojoin.channel.push(tc);
    }
    
    this.autojoin.count = c;

};

/**
 * Save configuration save localStorage.
 *
 * @method config_save
 */
wsc.Client.prototype.config_save = function(  ) {

    this.storage.ui.set('theme', this.settings.ui.theme);
    this.storage.ui.set('clock', this.settings.ui.clock.toString());
    this.storage.ui.set('tabclose', this.settings.ui.tabclose.toString());
    
    this.storage.aj.set('on', this.autojoin.on.toString());
    this.storage.aj.set('count', this.autojoin.count);
    
    for( var i = 0; i < this.autojoin.count; i++ ) {
        this.storage.aj.channel.remove(i)
    }
    
    if( this.autojoin.channel.length == 0 ) {
        this.storage.aj.set('count', 0);
    } else {
        var c = -1;
        for( var i in this.autojoin.channel ) {
            if( !this.autojoin.channel.hasOwnProperty(i) )
                continue;
            c++;
            this.storage.aj.channel.set( c.toString(), this.autojoin.channel[i] );
        }
        c++;
        this.storage.aj.set('count', c);
    }

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
            return false;
        client.part(event.ns);
        client.remove_ns(event.ns);
        return false;
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

    this.ui.loop();

};

/**
 * Add an extension to the client.
 * 
 * @method add_extension
 * @param extension {Method} Extension constructor. Not called with `new`.
 */
wsc.Client.prototype.add_extension = function( extension ) {

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
        this.ui.server_message('Opening connection');
        this.trigger('start', new wsc.Packet('client connecting\ne=ok\n\n'));
    } catch(err) {
        console.log(err);
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

    console.log(this.conn);
    this.conn.close();
    //this.conn = null;

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
 * @param names {Boolean} Return the names of the open channels?
 * @return {Integer} Number of channels open.
 */
wsc.Client.prototype.channels = function( names ) {

    var chann = [];
    for(ns in this.channelo) {
        if( !this.channelo.hasOwnProperty(ns) )
            continue;
        if( this.channelo[ns].hidden )
            continue;
        chann.push(this.channelo[ns].namespace);
    }
    return names ? chann : chann.length;

};

/**
 * Iterate through the different channels.
 * 
 * @method each_channel
 * @param method {Function} Function to call for each channel.
 */
wsc.Client.prototype.each_channel = function( method, include ) {
    
    var chan = null;
    
    for( var ns in this.channelo ) {
        if( !this.channelo.hasOwnProperty(ns) )
            continue;
        
        chan = this.channelo[ns];
        
        if( !include )
            if( this.exclude.indexOf( chan.namespace.toLowerCase() ) != -1 )
                continue;
        
        if( method( chan.namespace, chan ) === false )
            break;
    }
    
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

    if( !namespace )
        return;
    
    var chan = this.channel(namespace);
    if( !chan )
        return;
    
    chan.remove();
    delete this.channelo[chan.selector];

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

/**
 * Mute a user.
 * 
 * @method mute_user
 * @param user {String} User to mute.
 */
wsc.Client.prototype.mute_user = function( user ) {

    return this.ui.mute_user( user );

};

/**
 * Unmute a user.
 * 
 * @method unmute_user
 * @param user {String} User to unmute.
 */
wsc.Client.prototype.unmute_user = function( user ) {

    return this.ui.unmute_user( user );

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

    e = { 'msg': message, 'ns': namespace };
    this.trigger( 'send.msg.before', e );
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

    e = { 'msg': message, 'ns': namespace };
    this.trigger( 'send.npmsg.before', e );
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
        wsc_packetstr('ban', user)));

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
 * Set a channel property.
 * 
 * @method set
 * @param namespace {String} Namespace of the channel to set a property for.
 * @param property {String} Name of the property to set. Should be 'title' or
 *   'topic'.
 * @param value {String} Value to set the property to.
 */
wsc.Client.prototype.set = function( namespace, property, value ) {

    this.send(wsc_packetstr('set', this.format_ns(namespace), { 'p': property }, value));

};

/**
 * Get whois information for a user.
 * 
 * @method whois
 * @param user {String} User to get information for.
 */
wsc.Client.prototype.whois = function( user ) {

    this.send(wsc_packetstr('get', 'login:' + user, { 'p': 'info' }));

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

    var history = this.get_history();
    var data = this.ui.get_text();
    
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

    var key = event.which || event.keyCode;
    var ut = this.tab.hit;
    var bubble = false;
    
    switch( key ) {
        case 13: // Enter
            if( !this.ui.multiline() ) {
                this.submit(event);
            } else {
                if( event.shiftKey ) {
                    this.submit(event);
                } else {
                    bubble = true;
                }
            }
            break;
        case 38: // Up
            if( !this.ui.multiline() ) {
                this.scroll_history(true);
                break;
            }
            bubble = true;
            break;
        case 40: // Down
            if( !this.ui.multiline() ) {
                this.scroll_history(false);
                break;
            }
            bubble = true;
            break;
        case 9: // Tab
            if( event.shiftKey ) {
                this.client.ui.channel_right();
            } else {
                this.tab_item( event );
                ut = false;
            }
            break;
        case 219: // [
            if( event.ctrlKey ) {
                this.client.ui.channel_left();
            } else {
                bubble = true;
            }
            break;
        case 221: // ] (using instead of +)
            if( event.ctrlKey ) {
                this.client.ui.channel_right();
            } else {
                bubble = true;
            }
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
    cmdn = bits.shift().toLowerCase();
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

Chatterbox.VERSION = '0.7.52';
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
    this.umuted = [];
    this.settings = {
        'themes': ['wsct_default', 'wsct_dAmn'],
        'theme': 'wsct_default',
        'monitor': ['~Monitor', true],
        'username': '',
        'domain': 'website.com',
        'clock': true,
        'tabclose': true
    };
    
    view.extend( this.settings, options );
    view.append('<div class="wsc '+this.settings['theme']+'"></div>');
    
    this.view = view.find('.wsc');
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.monitoro = null;
    
    this.swidth = ( function() { 
        if ( $.browser.msie ) {
            var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                    .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
                $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                    .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
            scrollbarWidth = $textarea1.width() - $textarea2.width();
            $textarea1.add($textarea2).remove();
        } else {
            var $div = $('<div />')
                .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
                .prependTo('body').append('<div />').find('div')
                    .css({ width: '100%', height: 200 });
            scrollbarWidth = 100 - $div.width();
            $div.parent().remove();
        }
        return scrollbarWidth;
    } ) ();
    
    this.LIB = 'Chatterbox';
    this.VERSION = Chatterbox.VERSION;
    this.STATE = Chatterbox.STATE;
    
};

wsc.defaults.UI = Chatterbox.UI;

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

/**
 * Set the event emitter object in use by the UI lib.
 * 
 * @method set_events
 * @param events {Object} EventEmitter object.
 */
Chatterbox.UI.prototype.set_events = function( events ) {
    this.events = events || this.events;
};

/**
 * Set the clock to 24 hour or 12 hour. Or get the current mode.
 * True means 24 hour, false means 12 hour.
 * 
 * @method clock
 * @param [mode] {Boolean} What mode to set the clock to.
 * @return {Boolean} The mode of the clock.
 */
Chatterbox.UI.prototype.clock = function( mode ) {

    if( mode === undefined || mode == this.settings.clock )
        return this.settings.clock;
    
    this.settings.clock = mode;
    this.chatbook.retime();
    
    return this.settings.clock;

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
    this.monitoro = this.chatbook.create_channel(this.mns, this.settings.monitor[1], true);
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
    //this.view.width( '100%' );
    this.nav.resize(  );
    this.chatbook.resize( this.view.parent().height() - this.nav.height() - this.control.height() );

};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.UI.prototype.loop = function(  ) {

    this.chatbook.loop();

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
 * Switch to the channel left of the current channel.
 * 
 * @method channel_left
 */
Chatterbox.UI.prototype.channel_left = function(  ) {

    this.chatbook.channel_left();

};

/**
 * Switch to the channel right of the current channel.
 * 
 * @method channel_right
 */
Chatterbox.UI.prototype.channel_right = function(  ) {

    this.chatbook.channel_right();

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
 * @param item {Object} Item to display.
 */
Chatterbox.UI.prototype.log_item = function( item ) {

    this.chatbook.log_item(item);

};

/**
 * Display a log message across all open channels.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.UI.prototype.log = function( msg ) {

    this.chatbook.log(msg);

};

/**
 * Mute a user.
 * 
 * @method mute_user
 * @param user {String} User to mute.
 */
Chatterbox.UI.prototype.mute_user = function( user ) {

    if( !user )
        return false;
    
    user = user.toLowerCase();
    if( this.umuted.indexOf( user ) != -1 )
        return false;
    
    this.umuted.push( user );
    this.chatbook.each( function( ns, chan ) {
        chan.mute_user( user );
    } );
    
    return true;

};

/**
 * Unmute a user.
 * 
 * @method unmute_user
 * @param user {String} User to unmute.
 */
Chatterbox.UI.prototype.unmute_user = function( user ) {

    if( !user )
        return false;
    
    user = user.toLowerCase();
    var usri = this.umuted.indexOf( user );
    if( usri == -1 )
        return false;
    
    this.umuted.splice( usri, 1 );
    this.chatbook.each( function( ns, chan ) {
        chan.unmute_user( user );
    } );
    
    return true;

};

/**
 * Clear a user's messages from all channels.
 * 
 * @method clear_user
 * @param user {String} User to remove messages for.
 */
Chatterbox.UI.prototype.clear_user = function( user ) {

    this.chatbook.each( function( ns, chan ) {
        chan.clear_user( user );
    } );

};

/**
 * Set the theme for the UI.
 * 
 * @method theme
 * @param theme {String} Name of the theme.
 */
Chatterbox.UI.prototype.theme = function( theme ) {
    if( this.settings.theme == theme )
        return this.settings.theme;
    if( this.settings.themes.indexOf(theme) == -1 ) {
        theme = 'wsct_' + theme;
        if( this.settings.themes.indexOf(theme) == -1 )
            return this.settings.theme;
    }
    this.view.removeClass( this.settings.theme ).addClass( theme );
    this.settings.theme = theme;
    return this.settings.theme;
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
    this.visible = false;
    this.st = 0;

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
        return false;
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
    this.visible = false;
};

/**
 * Display the channel.
 * 
 * @method show
 */
Chatterbox.Channel.prototype.show = function( ) {
    //console.log("show  " + this.info.selector);
    this.visible = true;
    this.window.css({'display': 'block'});
    this.tab.addClass('active');
    this.tab.removeClass('noise chatting tabbed fill');
    this.resize();
    this.wrap.scrollTop(this.wrap.prop('scrollHeight') - this.wrap.innerHeight());
    this.scroll();
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
    var ws = this.wrap.prop('scrollWidth') - this.wrap.innerWidth();
    var hs = this.wrap.prop('scrollHeight') - this.wrap.innerHeight();
    if( ws > 0 )
        hs += ws;
    if( hs < 0 || (hs - this.wrap.scrollTop()) > 100 )
        return;
    this.wrap.scrollTop(hs);
};

/**
 * Add padding to the channel log's wrapping ul.
 * This is done to make sure messages always appear at the bottom first.
 * 
 * @method pad
 */
Chatterbox.Channel.prototype.pad = function ( ) {
    // Add padding.
    this.wrap.css({'padding-top': 0, 'height': 'auto'});
    wh = this.wrap.innerHeight();
    lh = this.logpanel.innerHeight() - this.logpanel.find('header').height() - 3;
    pad = lh - wh;
    
    if( pad > 0 )
        this.wrap.css({'padding-top': pad});
    else
        this.wrap.css({
            'padding-top': 0,
            'height': lh});
    this.wrap.scrollTop(this.st);
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
    if( cu.css('display') != 'none') {
        cu.width(1);
        userwidth = cu[0].scrollWidth + this.manager.swidth + 5;
        max = parseInt(cu.css('max-width').slice(0,-2));
        if( userwidth > max ) {
            userwidth = max;
        }
        cu.width(userwidth);
        cw = cw - cu.outerWidth();
    }
    
    if( title.css('display') == 'block' )
        wh = wh - title.outerHeight(true);
        
    // Log panel dimensions
    this.logpanel.css({
        height: wh - 3,
        width: cw - 3});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    cu.css({height: this.logpanel.innerHeight()});
};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Channel.prototype.loop = function(  ) {

    msgs = this.logpanel.find( '.logmsg' );
    
    if( msgs.length < 200 )
        return;
    
    msgs.slice(0, msgs.length - 200).remove();
    this.resize();

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
    this.log_item({ 'html': Chatterbox.render('logmsg', {'message': data.message}) });
};

/**
 * Send a message to the log window.
 * 
 * @method log_item
 * @param item {Object} Message to send.
 */
Chatterbox.Channel.prototype.log_item = function( item ) {
    var date = new Date();
    ts = '';
    
    if( this.manager.settings.clock ) {
        ts = formatTime('{HH}:{mm}:{ss}', date);
    } else {
        ts = formatTime('{hh}:{mm}:{ss} {mr}', date);
    }
        
    data = {
        'ts': ts,
        'ms': date.getTime(),
        'message': item.html,
        'user': (item.user || 'system' ).toLowerCase()
    };
    
    this.manager.trigger( 'log_item.before', data );
    if( this.visible ) {
        this.st = this.wrap.scrollTop();
    }
    
    // Add content.
    this.wrap.append(Chatterbox.render('logitem', data));
    this.manager.trigger( 'log_item.after', {'item': this.wrap.find('li').last() } );
    this.st+= 13;
    
    this.wrap.scrollTop( this.st );
    
    // Scrollio
    this.scroll();
    this.noise();
};

/**
 * Rewrite time signatures for all messages. Woo.
 * 
 * @method retime
 */
Chatterbox.Channel.prototype.retime = function(  ) {

    var tsf = '';
    var wrap = this.wrap;

    if( this.manager.settings.clock ) {
        tsf = '{HH}:{mm}:{ss}';
    } else {
        tsf = '{hh}:{mm}:{ss} {mr}';
    }

    wrap.find('span.ts').each(function( index, span ) {
    
        el = wrap.find(span);
        time = new Date(parseInt(el.prop('id')));
        el.text(formatTime(tsf, time));
    
    });

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
    this.log_item({ 'html': Chatterbox.render('servermsg', {'message': data.message, 'info': data.info}) });
};

/**
 * Clear all log messages from the log window.
 * 
 * @method clear
 */
Chatterbox.Channel.prototype.clear = function(  ) {
    this.logpanel.find('li.logmsg').remove();
    this.logpanel.find('li.loginfo').remove();
    this.wrap.height(0);
    this.resize();
};

/**
 * Display an info box in the channel log.
 * 
 * @method log_info
 * @param content {String} Infobox contents.
 */
Chatterbox.Channel.prototype.log_info = function( ref, content ) {
    data = {
        'ns': this.namespace,
        'ref': ref,
        'content': content
    };
    this.manager.trigger( 'log_info.before', data );
    delete data['ns'];
    var b = this.wrap.append(Chatterbox.render( 'loginfobox', data ));
    this.scroll();
    
    var ui = this;
    var box = this.wrap.find('li.' + data.ref);
    box.find('a.close').click(
        function( e ) {
            ui.wrap.find(this).parent().remove();
            ui.resize();
            return false;
        }
    );
    
    return box;
};

/**
 * Display a user's whois info.
 * 
 * @method show_whois
 * @param data {Object} Object containing a user's information.
 */
Chatterbox.Channel.prototype.log_whois = function( data ) {
    
    var whois = {
        'avatar': '<a href="#"><img height="50" width="50" alt="avatar"/></a>',
        'username': '<b>' + data.symbol + data.username + '</b>',
        'info': [],
        'conns': [],
        'raw': data,
    };
    
    for( var i in data.connections ) {
        var rcon = data.connections[i];
        var mcon = [];
        
        if( rcon.online ) {
            stamp = (new Date - (rcon.online * 1000));
            mcon.push([ 'online', DateStamp(stamp / 1000) + formatTime(' [{HH}:{mm}:{ss}]', new Date(stamp)) ]);
        }
        if( rcon.idle )
            mcon.push([ 'idle', timeLengthString(rcon.idle) ]);
        if( rcon.agent )
            mcon.push([ 'agent', rcon.agent ]);
        if( rcon.debug )
            mcon.push([ 'debug', rcon.debug ]);
        
        mcon.push([ 'chatrooms', rcon.channels.join(' ') ]);
        
        whois.conns.push(mcon);
    }
    
    this.manager.trigger( 'log_whois.before', whois );
    
    var conns = '';
    for( var i in whois.conns ) {
        var conn = whois.conns[i];
        var text = '<section class="conn"><p><em>connection ' + ((parseInt(i) + 1).toString()) + ':</em></p>';
        text+= '<ul>';
        for( x in conn ) {
            text+= '<li><strong>' + conn[x][0] + ':</strong> ' + conn[x][1] + '</li>';
        }
        text+= '</ul>'
        conns+= text + '</section>';
    }
    
    var info = '';
    for( var i in whois.info ) {
        info+= '<li>' + whois.info[i] + '</li>';
    }
    
    var box = this.log_info(
        'whois-'+data.username,
        Chatterbox.render('whoiswrap', {
            'avatar': whois.avatar,
            'info': Chatterbox.render('whoisinfo', {
                'username': whois.username,
                'info': info,
                'connections': conns
            })
        })
    );
    
    var av = box.find('div.avatar');
    var inf = box.find('div.info');
    inf.width( box.find('.whoiswrap').width() - 100 );
    av.height( box.height() - 10 );
    this.scroll();
};

/**
 * Display some information relating to a privilege class.
 * 
 * @method log_pc
 * @param privileges {Boolean} Are we showing privileges or users?
 * @param data {Array} Array containing information.
 */
Chatterbox.Channel.prototype.log_pc = function( privileges, data ) {

    contents = '';
    for( var i in data ) {
        if( !data.hasOwnProperty(i) )
            continue;
        var pc = data[i];
        var pcc = '';
        if( pc[2].length == 0 ) {
            pcc = '<em>' + ( privileges ? 'default privileges' : 'no members' ) + '</em>';
        } else {
            pcc = pc[2];
        }
        contents+= String.format('<li><em>{0}</em> <strong>{1}</strong>:<ul><li>{2}</li></ul></li>', [pc[1], pc[0], pcc ]);
    }
    
    var info = {
        'title': 'Privilege class ' + (privileges ? 'permissions' : 'members'),
        'info': '<ul>' + contents + '</ul>'
    };
    
    this.log_info(
        'pc-' + ( privileges ? 'permissions' : 'members' ),
        Chatterbox.render( 'pcinfo', info )
    );

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
    
    if( tab.hasClass('chatting') )
        tab.removeClass('chatting');
    
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
    
    var u = '';
    var si = 0;
    var msg = this.window.find('.logmsg').last();
    
    for( var i in this.manager.umuted ) {
        if( !this.manager.umuted.hasOwnProperty(i) )
            continue;
        
        if( msg.hasClass('u-' + this.manager.umuted[i]) ) {
            msg.css({'display': 'none'});
            this.scroll();
            return;
        }
    }
    
    if( !this.tab.hasClass('active') ) {
        this.tab.addClass('noise');
        if( !this.tab.hasClass('tabbed') ) {
            if( msg.find('.cevent').length == 0 ) {
                this.tab.addClass('chatting');
            }
        }
    }
    

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
            ed = { 'ns': chan.namespace, 'user': user };
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
            box.find('.info').height(box.height());
            
            box.hover(
                function(){ box.data('hover', 1); },
                function( e ) {
                    box.data('hover', 0);
                    chan.unhover_user( box, e );
                }
            );
            
            box.data('hover', 0);
        },
        function( e ) {
            link.data('hover', 0);
            chan.unhover_user(box, e);
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
    
    if( x < (er + 15)
        && x > o.left
        && y > o.top
        && y < (o.top + 15) )
        return;
    
    box.remove();

};

/**
 * Hide messages from a given user.
 * 
 * @method mute_user
 * @param user {String} User to hide messages for.
 */
Chatterbox.Channel.prototype.mute_user = function( user ) {

    if( !user )
        return;
    this.wrap.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'none'});
    this.scroll();

};

/**
 * Reveal messages received from a given user.
 *
 * @method unmute_user
 * @param user {String} Use to reveal messages for.
 */
Chatterbox.Channel.prototype.unmute_user = function( user ) {

    if( !user )
        return;
    this.wrap.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'list-item'});
    this.scroll();

};

/**
 * Remove a user's messages completely.
 * 
 * @method clear_user
 * @param user {String} User to remove messages for.
 */
Chatterbox.Channel.prototype.clear_user = function( user ) {

    if( !user )
        return;
    this.wrap.find('li.logmsg.u-' + user.toLowerCase()).remove();
    this.scroll();

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
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Chatbook.prototype.loop = function(  ) {

    for( select in this.chan ) {
        this.chan[select].loop();
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
    var chan = this.channel(ns);
    var prev = chan;
    
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
    if( this.trail.indexOf(chan.namespace) == -1 ) {
        this.trail.push(chan.namespace);
    }
    
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
    
    var chan = this.channel(ns);
    chan.remove();
    delete this.chan[chan.selector];
    
    if( this.current == chan )
        this.channel_left();
    
    rpos = this.trail.indexOf(chan.namespace);
    this.trail.splice(rpos, 1);
};

/**
 * Switch to the channel left of the current channel.
 * 
 * @method channel_left
 */
Chatterbox.Chatbook.prototype.channel_left = function(  ) {

    var ns = this.current.namespace;
    var index = this.trail.indexOf(ns);
    
    if( index < 0 )
        return;
    
    var nc = null;
    while( true ) {
        try {
            nc = this.channel(this.trail[--index]);
        } catch( err ) {
            index = this.trail.length - 1;
            nc = this.channel(this.trail[index]);
        }
        
        if( !nc.hidden )
            break;
    }
    
    this.toggle_channel(nc.namespace);

};

/**
 * Switch to the channel right of the current channel.
 * 
 * @method channel_right
 */
Chatterbox.Chatbook.prototype.channel_right = function(  ) {

    var ns = this.current.namespace;
    var index = this.trail.indexOf(ns);
    
    if( index == -1 )
        return;
    
    var nc = null;
    while( true ) {
        try {
            nc = this.channel(this.trail[++index]);
        } catch( err ) {
            index = 0;
            nc = this.channel(this.trail[0]);
        }
        if( !nc.hidden )
            break;
    }
    
    this.toggle_channel(nc.namespace);

};

/**
 * Iterate through the different channels.
 * 
 * @method each
 * @param method {Function} Function to call for each channel.
 */
Chatterbox.Chatbook.prototype.each = function( method ) {
    
    var chan = null;
    
    for( var ns in this.chan ) {
        if( !this.chan.hasOwnProperty(ns) )
            continue;
        
        chan = this.chan[ns];
        
        if( method( chan.namespace, chan ) === false )
            break;
    }
    
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
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param msg {String} Message to display.
 */
Chatterbox.Chatbook.prototype.log = function( msg ) {

    for( ns in this.chan ) {
        this.chan[ns].log(msg);
    }

};

/**
 * Rewrite timestamps for all open channels.
 * 
 * @method retime
 */
Chatterbox.Chatbook.prototype.retime = function(  ) {

    for( ns in this.chan ) {
        this.chan[ns].retime();
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
    this.mli = this.form.find('textarea.msg');
    this.ci = this.input;
    this.ml = false;
    this.mlb = this.view.find('a[href~=#multiline].button');
    
    var ctrl = this;
    this.mlb.click(function( event ) {
        ctrl.multiline( !ctrl.multiline() );
        return false;
    });

};

/**
 * Steal the lime light. Brings the cursor to the input panel.
 * 
 * @method focus
 */
Chatterbox.Control.prototype.focus = function( ) {
    this.ci.focus();
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
    this.input.css({'width': this.manager.view.width() - 100});
    this.mli.css({'width': this.manager.view.width() - 90});
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
    if( this.manager.mozilla ) {
        this.input.keypress( onkeypress || this._onkeypress );
        this.mli.keypress( onkeypress || this._onkeypress );
    } else {
        this.input.keydown( onkeypress || this._onkeypress );
        this.mli.keydown( onkeypress || this._onkeypress );
    }
    
    this.form.submit( onsubmit || this._onsubmit );
};

/**
 * Set or get multiline input mode.
 * 
 * @method multiline
 * @param [on] {Boolean} Use multiline input?
 * @return {Boolean} Current mode.
 */
Chatterbox.Control.prototype.multiline = function( on ) {

    if( on == undefined || this.ml == on )
        return this.ml;
    
    this.ml = on;
    
    if( this.ml ) {
        this.input.css('display', 'none');
        this.mli.css('display', 'inline-block');
        this.ci = this.mli;
        this.manager.resize();
        return this.ml;
    }
    
    this.mli.css('display', 'none');
    this.input.css('display', 'inline-block');
    this.ci = this.input;
    this.manager.resize();
    return this.mli;

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
    d = this.ci.val();
    i = d.lastIndexOf(' ');
    
    if( i == -1 ) {
        this.ci.val('');
        return d;
    }
    
    chunk = d.slice(i + 1);
    this.ci.val( d.slice(0, i) );
    
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
    d = this.ci.val();
    if( !d )
        this.ci.val(data);
    else
        this.ci.val(d + ' ' + data);
};

/**
 * Get the text in the input box.
 * 
 * @method get_text
 * @return {String} The text currently in the input box.
 */
Chatterbox.Control.prototype.get_text = function( text ) {

    if( text == undefined )
        return this.ci.val();
    this.ci.val( text || '' );
    return this.ci.val();

};

/**
 * Set the text in the input box.
 * 
 * @method set_text
 * @param text {String} The text to put in the input box.
 */
Chatterbox.Control.prototype.set_text = function( text ) {

    this.ci.val( text || '' );

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
    this.showclose = this.manager.settings.tabclose;
    this.nav = this.manager.view.find('nav.tabs');
    this.tabs = this.nav.find('#chattabs');
    this.buttons = this.nav.find('#tabnav');
    this.tableft = this.buttons.find('.arrow_left');
    this.tabright = this.buttons.find('.arrow_right');
    this.settingsb = this.buttons.find('#settings-button');
    this.settings = {};
    this.settings.open = false;
    
    if( !this.showclose ) {
        if( !this.tabs.hasClass('hc') )
            this.tabs.addClass('hc');
    }
    
    var nav = this;
    this.settingsb.click(
        function( event ) {
            if( nav.settings.open )
                return false;
            
            var evt = {
                'e': event,
                'settings': new Chatterbox.Settings.Config(nav.manager)
            };
            
            nav.configure_page( evt );
            nav.manager.trigger('settings.open', evt);
            nav.manager.trigger('settings.open.ran', evt);
            
            var about = evt.settings.page('About', true);
            about.item('text', {
                'ref': 'about-chatterbox',
                'wclass': 'centered faint',
                'text': 'Using <a href="http://github.com/photofroggy/wsc/">Chatterbox</a> version ' + Chatterbox.VERSION + ' ' + Chatterbox.STATE + ' by ~<a href="http://photofroggy.deviantart.com/">photofroggy</a>.'
            });
            
            nav.settings.window = new Chatterbox.Settings( nav.manager, evt.settings );
            nav.settings.window.build();
            nav.settings.open = true;
            return false;
        }
    );
    
    this.tableft.click(
        function(  ) {
            nav.manager.channel_left();
            return false;
        }
    );
    
    this.tabright.click(
        function(  ) {
            nav.manager.channel_right();
            return false;
        }
    );

};

/**
 * Configure the main settings page of the settings popup.
 *
 * @method configure_page
 * @param event {Object} Event object.
 */
Chatterbox.Navigation.prototype.configure_page = function( event ) {

    var ui = this.manager;
    var page = event.settings.page('Main', true);
    var orig = {};
    orig.theme = replaceAll(ui.settings.theme, 'wsct_', '');
    orig.clock = ui.clock();
    orig.tc = ui.nav.closer();
    
    var themes = [];
    for( i in ui.settings.themes ) {
        name = replaceAll(ui.settings.themes[i], 'wsct_', '');
        themes.push({ 'value': name, 'title': name, 'selected': orig.theme == name })
    }
    
    page.item('Form', {
        'ref': 'ui',
        'title': 'UI',
        'hint': '<b>Timestamp</b><br/>Choose between a 24 hour clock and\
                a 12 hour clock.\n\n<b>Theme</b><br/>Change the look of the\
                client.\n\n<b>Close Buttons</b><br/>Turn tab close buttons on/off.',
        'fields': [
            ['Dropdown', {
                'ref': 'theme',
                'label': 'Theme',
                'items': themes
            }],
            ['Dropdown', {
                'ref': 'clock',
                'label': 'Timestamp Format',
                'items': [
                    { 'value': '24', 'title': '24 hour', 'selected': orig.clock },
                    { 'value': '12', 'title': '12 hour', 'selected': !orig.clock }
                ]
            }],
            ['Checkbox', {
                'ref': 'tabclose',
                'label': 'Close Buttons',
                'items': [
                    { 'value': 'yes', 'title': 'On', 'selected': orig.tc }
                ]
            }],
        ],
        'event': {
            'change': function( event ) {
                ui.clock(event.data.clock == '24');
                ui.theme(event.data.theme);
                ui.nav.closer(event.data.tabclose.indexOf('yes') > -1);
            },
            'save': function( event ) {
                orig.clock = ui.clock();
                orig.theme = replaceAll(ui.theme(), 'wsct_', '');
                orig.tc = ui.nav.closer();
                
                ui.trigger('settings.save', {
                    'clock': orig.clock,
                    'tabclose': orig.tc,
                    'theme': 'wsct_' + orig.theme
                } );
            },
            'close': function( event ) {
                ui.clock(orig.clock);
                ui.theme(orig.theme);
                ui.nav.closer(orig.tc);
            }
        }
    });

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
 * Resize the tab bar.
 * 
 * @method resize
 */
Chatterbox.Navigation.prototype.resize = function(  ) {

    this.tabs.width( this.nav.width() - this.buttons.outerWidth() - 20 );
    if( this.settings.open ) {
        this.settings.window.resize();
    }

};

/**
 * Set or get the visibility of tab close buttons.
 * 
 * @method closer
 * @param [visible] {Boolean} Should the close buttons be shown?
 * @return {Boolean} Whether or not the close buttons are visible.
 */
Chatterbox.Navigation.prototype.closer = function( visible ) {

    if( visible == undefined || visible == this.showclose )
        return this.showclose;
    
    this.showclose = visible;
    if( this.showclose ) {
        if( !this.tabs.hasClass('hc') )
            return;
        this.tabs.removeClass('hc');
        return;
    }
    
    if( this.tabs.hasClass('hc') )
        return;
    this.tabs.addClass('hc');

};


/**
 * Popup window base class.
 * Should allow people to easily create popups... or something.
 * Subclasses of the popups should provide a way of closing the popup, or
 * maybe I could change things around a bit so there's always a close button in
 * the top right corner. That said, the settings window looks good with the
 * close button at the bottom. Maybe make that configurable. Use a flag to
 * determine whether or not this class applies the close function or not?
 * 
 * @class Popup
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Popup = function( ui, options ) {

    this.manager = ui;
    this.window = null;
    this.closeb = null;
    this.options = Object.extend({
        'ref': 'popup',
        'title': 'Popup',
        'close': true,
        'content': ''
    }, (options || {}));

};

/**
 * Build the popup window.
 * This should be pretty easy.
 *
 * @method build
 */
Chatterbox.Popup.prototype.build = function(  ) {

    var fill = this.options;
    
    if( this.options.close ) {
        fill.title+= '<a href="#close" class="button close medium iconic x"></a>';
    }
    
    this.manager.view.append(Chatterbox.render( 'popup', fill ));
    this.window = this.manager.view.find('.floater.' + fill.ref);
    
    if( this.options.close ) {
        this.closeb = this.window.find('a.close');
        var popup = this;

        this.closeb.click(
            function( event ) {
                popup.close();
                return false;
            }
        );
    }

};

/**
 * Close the popup.
 * 
 * @method close
 */
Chatterbox.Popup.prototype.close = function(  ) {
    
    this.window.remove();
    
};

/**
 * Prompt popup.
 * This should be used for retrieving input from the user.
 */
Chatterbox.Popup.Prompt = function( ui, options ) {

    options = options || {};
    options = Object.extend( {
        'position': [0, 0],
        'ref': 'prompt',
        'title': 'Input',
        'close': false,
        'label': '',
        'default': '',
        'submit-button': 'Submit',
        'event': {
            'submit': function(  ) {},
            'cancel': function(  ) {}
        }
    }, options );
    
    Chatterbox.Popup.call( this, ui, options );
    this.data = this.options['default'];

};

Chatterbox.Popup.Prompt.prototype = new Chatterbox.Popup();
Chatterbox.Popup.Prompt.prototype.constructor = Chatterbox.Popup.Prompt;

/**
 * Build the prompt.
 * 
 * @method build
 */
Chatterbox.Popup.Prompt.prototype.build = function(  ) {

    this.options.content = Chatterbox.template.prompt.main;
    Chatterbox.Popup.prototype.build.call(this);
    this.window.css({
        'left': this.options.position[0],
        'top': this.options.position[1]
    });
    
    var prompt = this;
    
    this.window.find('.button.close').click( function(  ) {
        prompt.options.event.cancel( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('.button.submit').click( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('form').submit( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );

};





/**
 * Settings popup window.
 * Provides stuff for doing things. Yay.
 *
 * @class Settings
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param config {Object} Chatterbox.Settings.Config object.
 */
Chatterbox.Settings = function( ui, config ) {

    Chatterbox.Popup.call( this, ui, {
        'ref': 'settings',
        'title': 'Settings',
        'close': false,
        'content': ''
    } );
    
    this.config = config;
    this.saveb = null;
    this.scb = null;
    this.tabs = null;
    this.book = null;
    this.changed = false;
    this.manager = ui;

};

Chatterbox.Settings.prototype = new Chatterbox.Popup();
Chatterbox.Settings.prototype.constructor = Chatterbox.Settings;

/**
 * Build the settings window.
 * 
 * @method build
 */
Chatterbox.Settings.prototype.build = function(  ) {

    this.options.content = Chatterbox.template.settings.main;
    Chatterbox.Popup.prototype.build.call(this);
    this.saveb = this.window.find('a.button.save');
    this.closeb = this.window.find('a.close');
    this.scb = this.window.find('a.button.saveclose');
    this.tabs = this.window.find('nav.tabs ul.tabs');
    this.book = this.window.find('div.book');
    
    this.config.build(this.manager, this);
    
    this.window.find('ul.tabs li').first().addClass('active');
    this.window.find('div.book div.page').first().addClass('active');
    
    var settings = this;
    this.window.find('form').bind('change', function(  ) { settings.changed = true; });
    
    this.config.each_page( function( index, page ) {
        page.each_item( function( index, item ) {
            item._onchange = function( event ) {
                settings.changed = true;
            };
        } );
    } );
    
    this.saveb.click(
        function( event ) {
            settings.save();
            return false;
        }
    );
    
    this.closeb.click(
        function( event ) {
            if( settings.changed ) {
                if( !confirm( 'Are you sure? You will lose any unsaved changes.') )
                    return false;
            }
            settings.close();
            return false;
        }
    );
    this.scb.click(
        function( event ) {
            settings.save();
            settings.close();
            return false;
        }
    );
    
    this.resize();

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.prototype.resize = function(  ) {

    var inner = this.window.find('.inner');
    var head = inner.find('h2');
    var wrap = inner.find('.bookwrap');
    var foot = inner.find('footer');
    wrap.height(inner.height() - foot.outerHeight() - head.outerHeight() - 15);
    this.book.height(wrap.innerHeight() - this.tabs.outerHeight() - 25);
    this.config.resize();

};

/**
 * Switch the window to view the given page.
 * 
 * @method switch_page
 * @param page {Object} Settings window page object. This should be the page
 *   that you want to bring into focus.
 */
Chatterbox.Settings.prototype.switch_page = function( page ) {

    var active = this.tabs.find('li.active').first();
    var activeref = active.prop('id').split('-', 1)[0];
    active = this.config.page(activeref.split('_').join(' '));
    active.hide();
    page.show();

};

/**
 * Save settings.
 * 
 * @method save
 */
Chatterbox.Settings.prototype.save = function(  ) {

    this.config.save(this);
    this.changed = false;

};

/**
 * Close settings.
 * 
 * @method close
 */
Chatterbox.Settings.prototype.close = function(  ) {

    this.window.remove();
    this.manager.nav.settings.open = false;
    this.manager.nav.settings.window = null;
    this.config.close(this);

};

/**
 * Settings options object.
 * Extensions can configure the settings window with this shit yo.
 * 
 * @class Settings.Config
 * @constructor
 */
Chatterbox.Settings.Config = function( ui ) {

    this.manager = ui || null;
    this.pages = [];

};

/**
 * Find a settings page that has the given name.
 * 
 * @method find_page
 * @param name {String} Settings page to search for.
 * @return {Chatterbox.Settings.Page} Settings page object. Returns null if
 *   no such page exists.
 */
Chatterbox.Settings.Config.prototype.find_page = function( name ) {

    var n = name.toLowerCase();
    var page;
    
    for( var index in this.pages ) {
    
        page = this.pages[index];
        if( page.lname == n )
            return page;
    
    }
    
    return null;

};

/**
 * Render and display the settings pages in the given settings window.
 * 
 * @method build
 * @param window {Object} Settings window object.
 */
Chatterbox.Settings.Config.prototype.build = function( ui, window ) {

    ui = ui || this.manager;
    
    for( var i in this.pages ) {
    
        this.pages[i].build(ui, window);
    
    }

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Config.prototype.resize = function(  ) {

    for( var i in this.pages ) {
    
        this.pages[i].resize();
    
    }

};

/**
 * Get a settings page.
 * 
 * @method page
 * @param name {String} Name of the page to get or set.
 * @param [push=false] {Boolean} When adding the page, should push be used in
 *   place of unshift? Default is `false`, meaning use unshift.
 * @return {Chatterbox.Settings.Page} Settings page associated with `name`.
 */
Chatterbox.Settings.Config.prototype.page = function( name, push ) {

    var page = this.find_page(name);
    push = push || false;
    
    if( page == null ) {
        page = new Chatterbox.Settings.Page(name, this.manager);
        if( push ) {
            this.pages.push(page);
        } else {
            this.pages.unshift(page);
        }
    }
    
    return page;

};


Chatterbox.Settings.Config.prototype.each_page = function( method ) {

    var page = null;
    var result = null;
    
    for( var i in this.pages ) {
    
        if( !this.pages.hasOwnProperty(i) )
            continue;
        
        page = this.pages[i];
        result = method( i, page );
        
        if( result === false )
            break;
    
    }

};

/**
 * Save settings.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Config.prototype.save = function( window ) {

    for( var i in this.pages ) {
    
        this.pages[i].save(window);
    
    }

};

/**
 * Close settings.
 * 
 * @method close
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Config.prototype.close = function( window ) {

    for( var i in this.pages ) {
    
        this.pages[i].close(window);
    
    }

};


/**
 * Settings page config object.
 * 
 * @class Settings.Page
 * @constructor
 * @param name {String} Name of the page.
 */
Chatterbox.Settings.Page = function( name, ui) {

    this.name = name;
    this.lname = name.toLowerCase();
    this.ref = replaceAll(this.lname, ' ', '_');
    //this.content = '';
    this.items = [];
    this.itemo = {};
    this.manager = ui;

};

/**
 * Render and display the settings page in the given settings window.
 * 
 * @method build
 * @param window {Object} Settings window object.
 */
Chatterbox.Settings.Page.prototype.build = function( ui, window ) {

    var tab = replaceAll(Chatterbox.template.settings.tab, '{ref}', this.ref);
    tab = replaceAll(tab, '{name}', this.name);
    var page = replaceAll(Chatterbox.template.settings.page, '{ref}', this.ref);
    page = replaceAll(page, '{page-name}', this.name);
    window.tabs.append(tab);
    window.book.append(page);
    
    this.view = window.book.find('div#' + this.ref + '-page');
    this.tab = window.tabs.find('li#' + this.ref + '-tab');
    
    var page = this;
    this.tab.find('a').click(
        function( event ) {
            if( page.tab.hasClass('active') )
                return false;
            window.switch_page(page);
            return false;
        }
    );
    
    this.content();

};

/**
 * Display the page's contents.
 * 
 * @method content
 */
Chatterbox.Settings.Page.prototype.content = function(  ) {
    
    for( var i in this.items ) {
    
        this.items[i].build(this.view);
    
    }

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Page.prototype.resize = function(  ) {

    for( var i in this.items ) {
    
        this.items[i].resize();
    
    }

};

/**
 * Bring the page into view.
 * 
 * @method show
 */
Chatterbox.Settings.Page.prototype.show = function(  ) {

    if( !this.tab.hasClass('active') )
        this.tab.addClass('active');
    
    if( !this.view.hasClass('active') )
        this.view.addClass('active');
    
    this.resize();

};

/**
 * Hide the page from view.
 * 
 * @method hide
 */
Chatterbox.Settings.Page.prototype.hide = function(  ) {

    if( this.tab.hasClass('active') )
        this.tab.removeClass('active');
    
    if( this.view.hasClass('active') )
        this.view.removeClass('active');

};

/**
 * Add an item to the page.
 * 
 * @method item
 * @param type {String} The type of item to add to the page.
 * @param options {Object} Item options.
 * @param [shift=false] {Boolean} Should unshift be used when adding the item?
 * @return {Object} A settings page item object.
 */
Chatterbox.Settings.Page.prototype.item = function( type, options, shift ) {

    shift = shift || false;
    var item = Chatterbox.Settings.Item.get( type, options, this.manager );
    
    if( shift ) {
        this.items.unshift(item);
    } else {
        this.items.push(item);
    }
    
    if( options.hasOwnProperty('ref') ) {
        this.itemo[options.ref] = item;
    }
    
    return item;

};

Chatterbox.Settings.Page.prototype.get = function( item ) {

    if( this.itemo.hasOwnProperty( item ) )
        return this.itemo[item];
    return null;

};

Chatterbox.Settings.Page.prototype.each_item = function( method ) {

    var item = null;
    var result = null;
    
    for( var i in this.items ) {
    
        if( !this.items.hasOwnProperty(i) )
            continue;
        
        item = this.items[i];
        result = method( i, item );
        
        if( result === false )
            break;
    
    }

};

/**
 * Save page data.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Page.prototype.save = function( window ) {

    for( var i in this.items ) {
    
        this.items[i].save(window, this);
    
    }

};

/**
 * Window closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Page.prototype.close = function( window ) {

    for( var i in this.items ) {
    
        this.items[i].close(window, this);
    
    }

};


/**
 * A base class for settings page items.
 * 
 * @class Settings.Item
 * @constructor
 * @param type {String} Determines the type of the item.
 * @param options {Object} Options for the item.
 */
Chatterbox.Settings.Item = function( type, options, ui ) {

    this.manager = ui || null;
    this.options = options || {};
    this.type = type || 'base';
    this.selector = this.type.toLowerCase();
    this.items = [];
    this.itemo = {};
    this.view = null;
    this.val = null;
    this._onchange = this._event_stub;

};

/**
 * Render and display the settings page item.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.prototype.build = function( page ) {

    if( !this.options.hasOwnProperty('ref') )
        return;
    var content = this.content();
    
    if( content.length == 0 )
        return;
    
    var wclass = '';
    if( this.options.hasOwnProperty('wclass') )
        wclass = ' ' + this.options.wclass;
    
    var item = Chatterbox.render('settings.item.wrap', {
        'type': this.type.toLowerCase().split('.').join('-'),
        'ref': this.options.ref,
        'class': wclass
    });
    
    item = replaceAll(item, '{content}', content);
    
    page.append(item);
    this.view = page.find('.item.'+this.options.ref);
    this.hooks(this.view);
    
    if( !this.options.hasOwnProperty('subitems') )
        return;
    
    var iopt;
    var type;
    var options;
    var cls;
    
    for( i in this.options.subitems ) {
    
        iopt = this.options.subitems[i];
        type = iopt[0];
        options = iopt[1];
        sitem = Chatterbox.Settings.Item.get( type, options );
        
        cls = [ 'stacked' ];
        if( sitem.options.wclass )
            cls.push(sitem.options.wclass);
        sitem.options.wclass = cls.join(' ');
        
        sitem.build(this.view);
        this.items.push(sitem);
        
        if( options.hasOwnProperty('ref') ) {
            this.itemo[options.ref] = sitem;
        }
    
    }

};

/**
 * Renders the contents of the settings page item.
 * 
 * @method content
 * @return {Boolean} Returns false if there is no content for this item.
 * @return {String} Returns an HTML string if there is content for this item.
 */
Chatterbox.Settings.Item.prototype.content = function(  ) {

    return Chatterbox.render('settings.item.' + this.selector, this.options);

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.prototype.resize = function(  ) {

    for( var i in this.items ) {
    
        this.items[i].resize();
    
    }

};

/**
 * Apply event callbacks to the page item.
 * 
 * @method hooks
 * @param item {Object} Page item jQuery object.
 */
Chatterbox.Settings.Item.prototype.hooks = function( item ) {

    if( !this.options.hasOwnProperty('event') )
        return;
    
    var events = this.options.event;
    var titem = Chatterbox.template.settings.item.get(this.selector);
    
    if( titem == false )
        return;
    
    if( !titem.hasOwnProperty('events') )
        return;
    
    var pair = [];
    
    for( var i in titem.events ) {
    
        pair = titem.events[i];
        
        if( !events.hasOwnProperty(pair[0]) )
            continue;
        
        item.find(pair[1]).bind(pair[0], events[pair[0]]);
    
    }

};

/**
 * Method stub for UI events.
 * 
 * @method _event_stub
 */
Chatterbox.Settings.Item.prototype._event_stub = function(  ) {};

/**
 * Get an item event callback.
 * 
 * @method _get_cb
 * @param event {String} Item event to get callbacks for.
 * @return {Function} Item event callback.
 */
Chatterbox.Settings.Item.prototype._get_cb = function( event ) {

    if( !this.options.hasOwnProperty('event') )
        return this._event_stub;
    
    return this.options.event[event] || this._event_stub;

};

/**
 * Get an item event pair.
 * 
 * @method _get_ep
 * @param event {String} Item event to get an event pair for.
 * @return {Function} Item event pair.
 */
Chatterbox.Settings.Item.prototype._get_ep = function( event ) {

    var titem = Chatterbox.template.settings.item.get(this.selector);
    
    if( titem == null )
        return false;
    
    if( !titem.hasOwnProperty('events') )
        return false;
    
    var pair = [];
    
    for( var i in titem.events ) {
    
        pair = titem.events[i];
        
        if( pair[0] == event )
            return pair;
    
    }

};

/**
 * Save page item data.
 * 
 * @method save
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.prototype.save = function( window, page ) {

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
            cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
        }
    }
    
    for( var i in this.items ) {
    
        this.items[i].save( window, page );
    
    }

};

/**
 * Called when the settings window is closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.prototype.close = function( window, page ) {

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
        return;
    }
    
    for( var i in cb ) {
        var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
        cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
    }
    
    for( var i in this.items ) {
    
        this.items[i].close( window, page );
    
    }

};

/* Create a new Settings Item object.
 * 
 * @method get
 * @param type {String} The type of item to create.
 * @param options {Object} Item options.
 * @param [base] {Object} Object to fetch the item from. Defaults to
     `Chatterbox.Settings.Item`.
 * @param [defaultc] {Class} Default class to use for the item.
 * @return {Object} Settings item object.
 */
Chatterbox.Settings.Item.get = function( type, options, ui, base, defaultc ) {

    var types = type.split('.');
    var item = base || Chatterbox.Settings.Item;
    var cls;
    
    for( var i in types ) {
        cls = types[i];
        if( !item.hasOwnProperty( cls ) ) {
            item = defaultc || Chatterbox.Settings.Item;
            break;
        }
        item = item[cls];
    }
    
    return new item( type, options, ui );

};


/**
 * HTML form as a single settings page item.
 * This item should be given settings items to use as form fields.
 * 
 * @class Form
 * @constructor
 * @param type {String} The type of item this item is.
 * @param options {Object} Item options.
 */
Chatterbox.Settings.Item.Form = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.form = null;
    this.fields = [];
    this.lsection = null;
    this.fsection = null;
    this.fieldo = {};

};

Chatterbox.Settings.Item.Form.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Form.prototype.constructor = Chatterbox.Settings.Item.Form;

/*
 * Create a form field object.
 * 
 * @method field
 * @param type {String} The type of form field to get.
 * @param options {Object} Field options.
 * @return {Object} Form field object.
 */
Chatterbox.Settings.Item.Form.field = function( type, options ) {

    return Chatterbox.Settings.Item.get( type, options, this.manager, Chatterbox.Settings.Item.Form, Chatterbox.Settings.Item.Form.Field );

};

/**
 * Build the form.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Form.prototype.build = function( page ) {

    Chatterbox.Settings.Item.prototype.build.call(this, page);
    
    if( this.view == null )
        return;
    
    this.lsection = this.view.find('section.labels');
    this.fsection = this.view.find('section.fields');
    
    if( !this.options.hasOwnProperty('fields') )
        return;
    
    var f;
    var field;
    
    for( var i in this.options.fields ) {
        f = this.options.fields[i];
        field = Chatterbox.Settings.Item.Form.field( f[0], f[1] );
        this.fields.push( field );
        field.build( this );
        if( f[1].hasOwnProperty('ref') ) {
            this.fieldo[f[1].ref] = field;
        }
    }
    
    this.form = this.view.find('form');
    var form = this;
    this.form.bind('change', function( event ) { form.change(); });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.prototype.resize = function(  ) {

    for( var i in this.fields ) {
    
        this.fields[i].resize();
    
    }

};

/**
 * Called when there is a change in the form.
 * 
 * @method change
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.change = function(  ) {

    var data = {};
    var field;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('change');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this } );
    } else {
        for( var i in cb ) {
            cb[i]( { 'data': data, 'form': this } );
        }
    }

};

/**
 * Save form data.
 * 
 * @method save
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this form belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.save = function( window, page ) {

    var data = {};
    var fields;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            cb[i]( { 'data': data, 'form': this, 'page': page, 'window': window } );
        }
    }

};

/**
 * Called when the settings window is closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.close = function( window, page ) {

    var data = {};
    var field;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            cb[i]( { 'data': data, 'form': this, 'page': page, 'window': window } );
        }
    }

};


/**
 * Base class for form fields.
 * 
 * @class Field
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Field = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.ref = this.options['ref'] || 'ref';
    this.label = null;
    this.field = null;
    this.value = '';

};

Chatterbox.Settings.Item.Form.Field.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Form.Field.prototype.constructor = Chatterbox.Settings.Item.Form.Field;

/**
 * Build the form field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Field.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || '',
            'class': (this.options['class'] ? ' ' + this.options['class'] : '')
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.' + this.selector, this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('.'+this.ref);
    this.view = this.fwrap;
    var field = this;
    this.value = this.field.val();
    this.field.bind('change', function( event ) {
        field.value = field.view.find(this).val();
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Field.prototype.resize = function(  ) {

    this.lwrap.height( this.field.height() );

};

/**
 * Get field data.
 * 
 * @method get
 * @return {Object} data.
 */
Chatterbox.Settings.Item.Form.Field.prototype.get = function(  ) {

    return this.value;

};


/**
 * Form radio field.
 * 
 * @class Radio
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Radio = function( type, options ) {

    options = options || {};
    options['class'] = ( options['class'] ? (options['class'] + ' ') : '' ) + 'box';
    Chatterbox.Settings.Item.Form.Field.call(this, type, options);
    this.items = {};
    this.value = '';

};

Chatterbox.Settings.Item.Form.Radio.prototype = new Chatterbox.Settings.Item.Form.Field();
Chatterbox.Settings.Item.Form.Radio.prototype.constructor = Chatterbox.Settings.Item.Form.Radio;

/**
 * Build the radio field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Radio.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || ''
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.ref;
            this.items[item.ref] = '';
        }
    }
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.radio', this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('input:radio');
    this.value = this.fwrap.find('input[checked]:radio').val();
    
    var radio = this;
    this.field.bind('change', function( event ) {
        radio.value = radio.fwrap.find(this).val();
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Radio.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.find('.radiobox').height() );

};

/**
 * Get field data.
 * 
 * @method get
 * @return {Object} data.
 */
Chatterbox.Settings.Item.Form.Radio.prototype.get = function(  ) {

    return this.value;

};


/**
 * Form checkbox field.
 * 
 * @class Check
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Checkbox = function( type, options ) {

    Chatterbox.Settings.Item.Form.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Form.Checkbox.prototype = new Chatterbox.Settings.Item.Form.Radio();
Chatterbox.Settings.Item.Form.Checkbox.prototype.constructor = Chatterbox.Settings.Item.Form.Checkbox;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Checkbox.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || ''
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.ref;
            this.items[item.ref] = '';
        }
    }
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.checkbox', this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('input:checkbox');
    var check = this;
    this.value = [];
    this.fwrap.find('input[checked]:checkbox').each(function(  ) {
        check.value.push(check.fwrap.find(this).val());
    });
    
    this.field.bind('change', function( event ) {
        check.value = [];
        check.fwrap.find('input[checked]:checkbox').each(function(  ) {
            check.value.push(check.fwrap.find(this).val());
        });
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Checkbox.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.find('.checkbox').height() );

};


/**
 * Radio box item.
 * 
 * @class Radio
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Radio = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.value = '';

};

Chatterbox.Settings.Item.Radio.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Radio.prototype.constructor = Chatterbox.Settings.Item.Radio;

/**
 * Build the radio field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Radio.prototype.build = function( page ) {

    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.options['ref'] || 'ref';
        }
    }
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    this.field = this.view.find('input:radio');
    this.value = this.view.find('input[checked]:radio').val();
    
    var radio = this;
    this.field.bind('change', function( event ) {
        radio.value = radio.view.find(this).val();
    });

};


/**
 * Check box item.
 * 
 * @class Check
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Checkbox = function( type, options ) {

    Chatterbox.Settings.Item.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Checkbox.prototype = new Chatterbox.Settings.Item.Radio();
Chatterbox.Settings.Item.Checkbox.prototype.constructor = Chatterbox.Settings.Item.Checkbox;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Checkbox.prototype.build = function( page ) {

    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.options['ref'] || 'ref';
        }
    }
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    this.field = this.view.find('input:checkbox');
    var check = this;
    this.value = [];
    this.view.find('input[checked]:checkbox').each(function(  ) {
        check.value.push(check.view.find(this).val());
    });
    
    this.field.bind('change', function( event ) {
        check.value = [];
        check.view.find('input[checked]:checkbox').each(function(  ) {
            check.value.push(check.view.find(this).val());
        });
    });

};


/**
 * Check box item.
 * 
 * @class Items
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Items = function( type, options, ui ) {

    options = Object.extend( {
        'prompt': {
            'title': 'Add Item',
            'label': 'Item:',
            'submit-button': 'Add'
        }
    }, ( options || {} ) );
    Chatterbox.Settings.Item.call(this, type, options, ui);
    this.selected = false;

};

Chatterbox.Settings.Item.Items.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Items.prototype.constructor = Chatterbox.Settings.Item.Items;

/**
 * Build the Items field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Items.prototype.build = function( page ) {
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    var mgr = this;
    this.list = this.view.find('ul');
    this.buttons = this.view.find('section.buttons p');
    
    var listing = this.list.find('li');
    
    listing.click( function( event ) {
        var el = mgr.list.find(this);
        mgr.list.find('li.selected').removeClass('selected');
        mgr.selected = el.find('.item').html();
        el.addClass('selected');
    } );
    
    listing.each( function( index, item ) {
        var el = mgr.list.find(item);
        el.find('a.close').click( function( event ) {
            mgr.list.find('li.selected').removeClass('selected');
            mgr.selected = el.find('.item').html();
            el.addClass('selected');
            mgr.remove_item();
            return false;
        } );
    } );
    
    this.buttons.find('a.button.up').click( function( event ) {
        mgr.shift_item( true );
        return false;
    } );
    this.buttons.find('a.button.down').click( function( event ) {
        mgr.shift_item();
        return false;
    } );
    this.buttons.find('a.button.add').click( function( event ) {
        var iprompt = new Chatterbox.Popup.Prompt( mgr.manager, {
            'position': [event.clientX - 100, event.clientY - 50],
            'title': mgr.options.prompt.title,
            'label': mgr.options.prompt.label,
            'submit-button': mgr.options.prompt['submit-button'],
            'event': {
                'submit': function( prompt ) {
                    var data = prompt.data;
                    if( !data ) {
                        prompt.options.event.cancel( prompt );
                        return;
                    }
                    
                    data = data.toLowerCase();
                    var index = mgr.options.items.indexOf(data);
                    if( index != -1 ) {
                        prompt.options.event.cancel( prompt );
                        return;
                    }
                    
                    mgr._fevent( 'add', {
                        'item': data
                    } );
                    
                    mgr.refresh();
                    mgr._onchange({});
                },
                'cancel': function( prompt ) {
                    mgr._fevent('cancel', {});
                    mgr.refresh();
                    mgr._onchange({});
                }
            }
        } );
        iprompt.build();
        return false;
    } );
    this.buttons.find('a.button.close').click( function( event ) {
        mgr.remove_item();
        return false;
    } );

};

Chatterbox.Settings.Item.Items.prototype.shift_item = function( direction ) {

    if( this.selected === false )
        return;
    
    var first = this.options.items.indexOf( this.selected );
    var second = first + 1;
    
    if( direction )
        second = first - 1;
    
    if( first == -1 || first >= this.options.items.length )
        return;
    
    if( second < 0 || second >= this.options.items.length )
        return;
    
    this._fevent(( direction ? 'up' : 'down' ), {
        'swap': {
            'this': { 'index': first, 'item': this.options.items[first] },
            'that': { 'index': second, 'item': this.options.items[second] }
        }
    });
    
    this.refresh();
    this._onchange({});
    return;

};

Chatterbox.Settings.Item.Items.prototype.remove_item = function(  ) {

    if( this.selected === false )
        return false;
    
    var index = this.options.items.indexOf( this.selected );
    if( index == -1 || index >= this.options.items.length )
        return;
    
    this._fevent( 'remove', {
        'index': index,
        'item': this.selected
    } );
    
    this.selected = false;
    this.refresh();
    this._onchange({});
};

Chatterbox.Settings.Item.Items.prototype.refresh = function(  ) {

    this.view.find('section.mitems').html(
        Chatterbox.template.settings.krender.manageditems(this.options.items)
    );
    this.list = this.view.find('ul');
    this.list.find('li[title=' + (this.selected || '').toLowerCase() + ']')
        .addClass('selected');
    
    var mgr = this;
    var listing = this.list.find('li');
    
    listing.click( function( event ) {
        var el = mgr.list.find(this);
        mgr.list.find('li.selected').removeClass('selected');
        mgr.selected = el.find('.item').html();
        el.addClass('selected');
    } );
    
    listing.each( function( index, item ) {
        var el = mgr.list.find(item);
        el.find('a.close').click( function( event ) {
            mgr.list.find('li.selected').removeClass('selected');
            mgr.selected = el.find('.item').html();
            el.addClass('selected');
            mgr.remove_item();
            return false;
        } );
    } );

};

Chatterbox.Settings.Item.Items.prototype._fevent = function( evt, args ) {

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb(evt);
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'args': args } );
    } else {
        for( var i in cb ) {
            var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
            cb[i]( { 'input': sinps, 'item': this, 'args': args } );
        }
    }

};

Chatterbox.Settings.Item.Items.prototype.save = function(  ) {

    this._fevent('save', {
        'items': this.options['items'] || []
    });

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

    var html = Chatterbox.template;
    var tparts = template.split('.');
    var renderer = {};
    var tmpl = null;
    
    for( ind in tparts ) {
        part = tparts[ind];
        if( !html.hasOwnProperty( part ) )
            return '';
        html = html[part];
    }
    
    if( html.hasOwnProperty('frame') ) {
        tmpl = html;
        renderer = html.render || {};
        html = html.frame;
        if( tmpl.hasOwnProperty('pre') ) {
            if( typeof tmpl.pre == 'function' ) {
                html = tmpl.pre( html, fill );
            } else {
                for( i in tmpl.pre ) {
                    html = tmpl.pre[i]( html, fill );
                }
            }
        }
    }
    
    for( key in fill ) {
        html = replaceAll(html, '{'+key+'}', ( renderer[key] || Chatterbox.template.render_stub )( fill[key] || '' ));
    }
    
    if( tmpl != null ) {
        if( tmpl.hasOwnProperty('post') ) {
            if( typeof tmpl.post == 'function' ) {
                html = tmpl.post( html, fill );
            } else {
                for( i in tmpl.post ) {
                    html = tmpl.post[i]( html, fill );
                }
            }
        }
    }
    
    return html;

};

Chatterbox.template.render_stub = function( data ) { return data; };
Chatterbox.template.clean = function( keys ) {

    return function( html, fill ) {
        for( i in keys ) {
            html = replaceAll( html, '{'+keys[i]+'}', '' );
        }
        return html;
    };

};


/**
 * This template provides the HTML for a chat client's main view.
 *
 * @property ui
 * @type String
 */
Chatterbox.template.ui = '<nav class="tabs"><ul id="chattabs" class="tabs"></ul>\
        <ul id="tabnav">\
            <li><a href="#left" class="button iconic arrow_left"></a></li>\
            <li><a href="#right" class="button iconic arrow_right"></a></li>\
            <li><a href="#settings" title="Change client settings" class="button iconic cog" id="settings-button"></a></li>\
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
            <p><a href="#multiline" title="Toggle multiline input" class="button iconic list"></a></p>\
            <form class="msg">\
                <input type="text" class="msg" />\
                <textarea class="msg"></textarea>\
                <input type="submit" value="Send" class="sendmsg" />\
            </form>\
        </div>';

/**
 * HTML for a channel tab.
 * 
 * @property tab
 * @type String
 */
Chatterbox.template.tab = '<li id="{selector}-tab"><a href="#{selector}" class="tab">{ns}<a href="#{selector}" class="close iconic x"></a></a></li>';

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
Chatterbox.template.logitem = '<li class="logmsg u-{user}"><span class="ts" id="{ms}">{ts}</span> {message}</li>';

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

                        
Chatterbox.template.loginfobox = '<li class="loginfo {ref}"><a href="#{ref}" class="close iconic x"></a>{content}</li>';
Chatterbox.template.whois = {};
Chatterbox.template.whoiswrap = '<div class="whoiswrap">\
                                <div class="avatar">{avatar}</div>\
                                <div class="info">{info}</div>\
                                </div>';
Chatterbox.template.whoisinfo = '<p>{username}</p><ul>{info}</ul>{connections}';
Chatterbox.template.pcinfo = '<section class="pcinfo"><strong>{title}</strong>{info}</section>';

/**
 * Container for popup shit.
 * 
 * @property popup
 * @type String
 */
Chatterbox.template.popup = '<div class="floater {ref}"><div class="inner"><h2>{title}</h2><div class="content">{content}</div></div></div>';

Chatterbox.template.prompt = {};
Chatterbox.template.prompt.main = '<span class="label">{label}</span>\
    <span class="input"><form><input type="text" value="{default}" /></form></span>\
    <span class="buttons">\
    <a href="#submit" class="button submit">{submit-button}</a>\
    <a href="#remove" class="button close big square iconic x"></a>\
    </span>';

/**
 * Settings stuff.
 *
 * @class settings
 */
Chatterbox.template.settings = {};
Chatterbox.template.settings.main = '<div class="bookwrap">\
                                <nav class="tabs">\
                                    <ul class="tabs"></ul>\
                                </nav>\
                                <div class="book"></div>\
                            </div>\
                            <footer>\
                                <a href="#save" class="button save">Save</a> <a href="#saveclose" class="button saveclose">Save & Close</a> <a href="#close" class="button close big square iconic x"></a>\
                            </footer>';

Chatterbox.template.settings.page = '<div class="page" id="{ref}-page"></div>';
Chatterbox.template.settings.tab = '<li id="{ref}-tab"><a href="#{ref}" class="tab" id="{ref}-tab">{name}</a></li>';

// Key renderers.
Chatterbox.template.settings.krender = {};
Chatterbox.template.settings.krender.title = function( title ) {
    if( title.length == 0 )
        return '';
    return '<h3>' + title + '</h3>';
};
Chatterbox.template.settings.krender.text = function( text ) { return replaceAll(text, '\n\n', '\n</p><p>\n'); };
Chatterbox.template.settings.krender.dditems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    
    for( i in items ) {
    
        item = items[i];
        render+= '<option value="' + item.value + '"';
        if( item.selected ) {
            render+= ' selected="yes"';
        }
        render+= '>' + item.title + '</option>';
    
    }
    return render;
};
Chatterbox.template.settings.krender.radioitems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    labels = [];
    fields = [];
    
    for( i in items ) {
    
        item = items[i];
        labels.push(Chatterbox.render('settings.item.form.label', {
            'ref': item.value,
            'label': item.title
        }));
        
        ritem = '<div class="'+item.value+' field radio"><input class="'+item.value+'" type="radio" name="'+item.name+'" value="' + item.value + '"'
        if( item.selected ) {
            ritem+= ' checked="yes"';
        }
        fields.push(ritem + ' /></div>');
    
    }
    
    return '<section class="labels">' + labels.join('') + '</section><section class="fields">' + fields.join('') + '</section>';
};
Chatterbox.template.settings.krender.checkitems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    labels = [];
    fields = [];
    
    for( i in items ) {
    
        item = items[i];
        if( 'title' in item ) {
            labels.push(Chatterbox.render('settings.item.form.label', {
                'ref': item.value,
                'label': item.title
            }));
        }
        
        ritem = '<div class="'+item.value+' field check"><input class="'+item.value+'" type="checkbox" name="'+item.name+'" value="' + item.value + '"'
        if( item.selected ) {
            ritem+= ' checked="yes"';
        }
        fields.push(ritem + ' /></div>');
    
    }
    
    if( labels.length > 0 ) {
        render+= '<section class="labels">' + labels.join('') + '</section>';
    }
    
    return render + '<section class="fields">' + fields.join('') + '</section>';
};

Chatterbox.template.settings.krender.manageditems = function( items ) {
    if( items.length == 0 )
        return '<i>No items in this list</i>';
    
    var render = '<ul>';
    var labels = [];
    var fields = [];
    var item;
    
    for( var i in items ) {
    
        if( !items.hasOwnProperty(i) )
            continue;
        
        item = items[i];
        render+= '<li title="' + item.toLowerCase() + '">\
                  <span class="remove"><a href="#remove" title="Remove item" class="close iconic x"></a></span>\
                  <span class="item">' + item + '</span>\
                  </li>';
    
    }
    
    return render + '</ul>';
};

Chatterbox.template.settings.item = {};
Chatterbox.template.settings.item.get = function( type ) {

    var tp = type.split('.');
    var item = Chatterbox.template.settings.item;
    
    for( i in tp ) {
        tc = tp[i];
        if( item.hasOwnProperty(tc) ) {
            item = item[tc];
            continue;
        }
        return null;
    }
    
    return item;

};

Chatterbox.template.settings.item.wrap = '<section class="item {type} {ref}{class}">\
                                    {content}\
                                </section>';
                                
Chatterbox.template.settings.item.hint = {};
Chatterbox.template.settings.item.hint.frame = '<aside class="hint">{hint}</aside>{content}';
Chatterbox.template.settings.item.hint.prep = function( html, data ) {

    if( !data.hasOwnProperty('hint') )
        return html;
    
    return Chatterbox.render('settings.item.hint', {
        'hint': data.hint,
        'content': html
    });

};

Chatterbox.template.settings.item.twopane = {};
Chatterbox.template.settings.item.twopane.frame = '{title}<div class="twopane">\
                                        <div class="text left">\
                                            <p>{text}</p>\
                                        </div>\
                                        <div class="right">\
                                            {template}\
                                        </div>\
                                    </div>';

Chatterbox.template.settings.item.twopane.wrap = function( html, data ) {

    if( !data.hasOwnProperty('text') )
        return html;
    
    html = replaceAll(
        Chatterbox.template.settings.item.twopane.frame, 
        '{template}',
        replaceAll(html, '{title}', '')
    );
    
    return html;

};

Chatterbox.template.settings.item.text = {};
Chatterbox.template.settings.item.text.pre = Chatterbox.template.settings.item.hint.prep;
Chatterbox.template.settings.item.text.post = Chatterbox.template.clean(['title', 'text']);
Chatterbox.template.settings.item.text.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.text.frame = '{title}<p>\
                                        {text}\
                                    </p>';

Chatterbox.template.settings.item.dropdown = {};
Chatterbox.template.settings.item.dropdown.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.dropdown.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.dditems
};

Chatterbox.template.settings.item.dropdown.post = Chatterbox.template.clean(['title', 'items']);
Chatterbox.template.settings.item.dropdown.events = [['change', 'select'],['inspect', 'select']];
Chatterbox.template.settings.item.dropdown.frame = '{title}<form>\
                                                <select>\
                                                    {items}\
                                                </select>\
                                            </form>';

Chatterbox.template.settings.item.radio = {};
Chatterbox.template.settings.item.radio.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.radio.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.radioitems
};

Chatterbox.template.settings.item.radio.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.radio.events = [['change', 'input:radio'],['inspect', 'input:radio']];
Chatterbox.template.settings.item.radio.frame = '{title}<div class="{ref} radiobox"><form>{items}</form></div>';

Chatterbox.template.settings.item.checkbox = {};
Chatterbox.template.settings.item.checkbox.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.checkbox.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.checkitems
};

Chatterbox.template.settings.item.checkbox.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.checkbox.events = [['change', 'input:checkbox'],['inspect', 'input:checkbox']];
Chatterbox.template.settings.item.checkbox.frame = '{title}<div class="{ref} checkbox"><form>{items}</form></div>';

Chatterbox.template.settings.item.textfield = {};
Chatterbox.template.settings.item.textfield.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.textfield.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.textfield.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.textfield.events = [['blur', 'input'],['inspect', 'input']];
Chatterbox.template.settings.item.textfield.frame = '{title}<div class="{ref} textfield"><form><input type="text" value="{default}" /></form></div>';

Chatterbox.template.settings.item.textarea = {};
Chatterbox.template.settings.item.textarea.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.textarea.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.textarea.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.textarea.events = [['blur', 'textarea'],['inspect', 'textarea']];
Chatterbox.template.settings.item.textarea.frame = '{title}<div class="{ref} textarea"><form><textarea rows="4" cols="20" value="{default}"></textarea></form></div>';

Chatterbox.template.settings.item.items = {};
Chatterbox.template.settings.item.items.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.items.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.manageditems
};

Chatterbox.template.settings.item.items.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.items.events = [];
Chatterbox.template.settings.item.items.frame = '{title}<div class="{ref} items">\
    <section class="buttons"><p><a href="#up" title="Move item up" class="button up iconic arrow_up"></a>\
    <a href="#down" title="Move item down" class="button down iconic arrow_down"></a>\
    <a href="#add" title="Add an item" class="button add iconic plus"></a>\
    <a href="#remove" title="Remove item from list" class="button close big square iconic x"></a>\
    </p></section>\
    <section class="mitems">{items}</section>\
    </div>';

Chatterbox.template.settings.item.form = {};
Chatterbox.template.settings.item.form.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.form.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.dditems
};

Chatterbox.template.settings.item.form.post = Chatterbox.template.clean(['title', 'text', 'items']);
//Chatterbox.template.settings.item.form.events = [['change', 'select'],['inspect', 'select']];
Chatterbox.template.settings.item.form.frame = '{title}<form>\
                                                <section class="labels"></section>\
                                                <section class="fields"></section>\
                                            </form>';

Chatterbox.template.settings.item.form.label = {};
Chatterbox.template.settings.item.form.label.post = Chatterbox.template.clean(['ref', 'label', 'class']);
Chatterbox.template.settings.item.form.label.frame = '<div class="{ref} label{class}"><label for="{ref}">{label}</label></div>';

Chatterbox.template.settings.item.form.field = {};
Chatterbox.template.settings.item.form.field.wrap = {};
Chatterbox.template.settings.item.form.field.wrap.post = Chatterbox.template.clean(['ref', 'field']);
Chatterbox.template.settings.item.form.field.wrap.frame = '<div class="{ref} field">{field}</div>';

Chatterbox.template.settings.item.form.field.dropdown = {};
Chatterbox.template.settings.item.form.field.dropdown.render = { 'items': Chatterbox.template.settings.krender.dditems };
Chatterbox.template.settings.item.form.field.dropdown.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.dropdown.frame = '<select class="{ref}">{items}</select>';

Chatterbox.template.settings.item.form.field.textfield = {};
Chatterbox.template.settings.item.form.field.textfield.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.textfield.frame = '<input class="{ref}" type="text" value="{default}" />';

Chatterbox.template.settings.item.form.field.textarea = {};
Chatterbox.template.settings.item.form.field.textarea.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.textarea.frame = '<textarea class="{ref}" rows="4" cols="20" value="{default}"></textarea>';

Chatterbox.template.settings.item.form.field.radio = {};
Chatterbox.template.settings.item.form.field.radio.render = { 'items': Chatterbox.template.settings.krender.radioitems };
Chatterbox.template.settings.item.form.field.radio.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.radio.frame = '<div class="{ref} radiobox">{items}</div>';

Chatterbox.template.settings.item.form.field.checkbox = {};
Chatterbox.template.settings.item.form.field.checkbox.render = { 'items': Chatterbox.template.settings.krender.checkitems };
Chatterbox.template.settings.item.form.field.checkbox.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.checkbox.frame = '<div class="{ref} checkbox">{items}</div>';

Chatterbox.template.settings.item.form.field.text = {};
Chatterbox.template.settings.item.form.field.text.pre = Chatterbox.template.settings.item.hint.prep;
Chatterbox.template.settings.item.form.field.text.post = Chatterbox.template.clean(['title', 'text']);
Chatterbox.template.settings.item.form.field.text.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.form.field.text.frame = '{title}<p>\
                                        {text}\
                                    </p>';



/*
 * wsc - photofroggy
 * jQuery plugin allowing an HTML5/CSS chat client to connect to llama-like
 * chat servers and interact with them.
 */

(function( $ ) {
    
    $('*').hover(
        function( e ) {
            $(this).data('hover', true);
        },
        function( e ) {
            $(this).data('hover', false);
        }
    );
    
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
                ui = new Chatterbox.UI( $(this), options, ($.browser.mozilla || false) );
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
