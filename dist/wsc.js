/**
 * WebSocket Chat client module.
 * 
 * @module wsc
 */
var wsc = {};
wsc.VERSION = '1.7.50';
wsc.STATE = 'release candidate';
wsc.REVISION = '0.21.135';
wsc.defaults = {};
wsc.defaults.theme = 'wsct_dark';
wsc.defaults.themes = [ 'wsct_dAmn', 'wsct_dark' ];
// Taken from dAmnAIR by philo23
// dAmnAIR - http://botdom.com/wiki/DAmnAIR
// philo23 on deviantART - http://philo23.deviantart.com/

/*
 * EventEmitter
 * Simple event framework, based off of NodeJS's EventEmitter
 * @class EventEmitter
 * @constructor
 **/

/**
 * Event emitter object emits events and stuff.
 * 
 * @class EventEmitter
 * @constructor
 */
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
        var called = 0;
        if(callbacks === false) {
            return called;
        }
        for(var i in callbacks) {
            if(callbacks.hasOwnProperty(i)) {
                bubble = callbacks[i].apply({}, args);
                called++;
                if( bubble === false )
                    break;
            }
        }
        return called;
    }

    function listeners(event) {
        return events[event] || [];
    }


    this.addListener = addListener;
    this.removeListeners = removeListeners;
    this.emit = emit;
    this.listeners = listeners;
}/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(s,p){var m={},l=m.lib={},n=function(){},r=l.Base={extend:function(b){n.prototype=this;var h=new n;b&&h.mixIn(b);h.hasOwnProperty("init")||(h.init=function(){h.$super.init.apply(this,arguments)});h.init.prototype=h;h.$super=this;return h},create:function(){var b=this.extend();b.init.apply(b,arguments);return b},init:function(){},mixIn:function(b){for(var h in b)b.hasOwnProperty(h)&&(this[h]=b[h]);b.hasOwnProperty("toString")&&(this.toString=b.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=l.WordArray=r.extend({init:function(b,h){b=this.words=b||[];this.sigBytes=h!=p?h:4*b.length},toString:function(b){return(b||t).stringify(this)},concat:function(b){var h=this.words,a=b.words,j=this.sigBytes;b=b.sigBytes;this.clamp();if(j%4)for(var g=0;g<b;g++)h[j+g>>>2]|=(a[g>>>2]>>>24-8*(g%4)&255)<<24-8*((j+g)%4);else if(65535<a.length)for(g=0;g<b;g+=4)h[j+g>>>2]=a[g>>>2];else h.push.apply(h,a);this.sigBytes+=b;return this},clamp:function(){var b=this.words,h=this.sigBytes;b[h>>>2]&=4294967295<<
32-8*(h%4);b.length=s.ceil(h/4)},clone:function(){var b=r.clone.call(this);b.words=this.words.slice(0);return b},random:function(b){for(var h=[],a=0;a<b;a+=4)h.push(4294967296*s.random()|0);return new q.init(h,b)}}),v=m.enc={},t=v.Hex={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++){var k=a[j>>>2]>>>24-8*(j%4)&255;g.push((k>>>4).toString(16));g.push((k&15).toString(16))}return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j+=2)g[j>>>3]|=parseInt(b.substr(j,
2),16)<<24-4*(j%8);return new q.init(g,a/2)}},a=v.Latin1={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++)g.push(String.fromCharCode(a[j>>>2]>>>24-8*(j%4)&255));return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j++)g[j>>>2]|=(b.charCodeAt(j)&255)<<24-8*(j%4);return new q.init(g,a)}},u=v.Utf8={stringify:function(b){try{return decodeURIComponent(escape(a.stringify(b)))}catch(g){throw Error("Malformed UTF-8 data");}},parse:function(b){return a.parse(unescape(encodeURIComponent(b)))}},
g=l.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(b){"string"==typeof b&&(b=u.parse(b));this._data.concat(b);this._nDataBytes+=b.sigBytes},_process:function(b){var a=this._data,g=a.words,j=a.sigBytes,k=this.blockSize,m=j/(4*k),m=b?s.ceil(m):s.max((m|0)-this._minBufferSize,0);b=m*k;j=s.min(4*b,j);if(b){for(var l=0;l<b;l+=k)this._doProcessBlock(g,l);l=g.splice(0,b);a.sigBytes-=j}return new q.init(l,j)},clone:function(){var b=r.clone.call(this);
b._data=this._data.clone();return b},_minBufferSize:0});l.Hasher=g.extend({cfg:r.extend(),init:function(b){this.cfg=this.cfg.extend(b);this.reset()},reset:function(){g.reset.call(this);this._doReset()},update:function(b){this._append(b);this._process();return this},finalize:function(b){b&&this._append(b);return this._doFinalize()},blockSize:16,_createHelper:function(b){return function(a,g){return(new b.init(g)).finalize(a)}},_createHmacHelper:function(b){return function(a,g){return(new k.HMAC.init(b,
g)).finalize(a)}}});var k=m.algo={};return m}(Math);
(function(s){function p(a,k,b,h,l,j,m){a=a+(k&b|~k&h)+l+m;return(a<<j|a>>>32-j)+k}function m(a,k,b,h,l,j,m){a=a+(k&h|b&~h)+l+m;return(a<<j|a>>>32-j)+k}function l(a,k,b,h,l,j,m){a=a+(k^b^h)+l+m;return(a<<j|a>>>32-j)+k}function n(a,k,b,h,l,j,m){a=a+(b^(k|~h))+l+m;return(a<<j|a>>>32-j)+k}for(var r=CryptoJS,q=r.lib,v=q.WordArray,t=q.Hasher,q=r.algo,a=[],u=0;64>u;u++)a[u]=4294967296*s.abs(s.sin(u+1))|0;q=q.MD5=t.extend({_doReset:function(){this._hash=new v.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(g,k){for(var b=0;16>b;b++){var h=k+b,w=g[h];g[h]=(w<<8|w>>>24)&16711935|(w<<24|w>>>8)&4278255360}var b=this._hash.words,h=g[k+0],w=g[k+1],j=g[k+2],q=g[k+3],r=g[k+4],s=g[k+5],t=g[k+6],u=g[k+7],v=g[k+8],x=g[k+9],y=g[k+10],z=g[k+11],A=g[k+12],B=g[k+13],C=g[k+14],D=g[k+15],c=b[0],d=b[1],e=b[2],f=b[3],c=p(c,d,e,f,h,7,a[0]),f=p(f,c,d,e,w,12,a[1]),e=p(e,f,c,d,j,17,a[2]),d=p(d,e,f,c,q,22,a[3]),c=p(c,d,e,f,r,7,a[4]),f=p(f,c,d,e,s,12,a[5]),e=p(e,f,c,d,t,17,a[6]),d=p(d,e,f,c,u,22,a[7]),
c=p(c,d,e,f,v,7,a[8]),f=p(f,c,d,e,x,12,a[9]),e=p(e,f,c,d,y,17,a[10]),d=p(d,e,f,c,z,22,a[11]),c=p(c,d,e,f,A,7,a[12]),f=p(f,c,d,e,B,12,a[13]),e=p(e,f,c,d,C,17,a[14]),d=p(d,e,f,c,D,22,a[15]),c=m(c,d,e,f,w,5,a[16]),f=m(f,c,d,e,t,9,a[17]),e=m(e,f,c,d,z,14,a[18]),d=m(d,e,f,c,h,20,a[19]),c=m(c,d,e,f,s,5,a[20]),f=m(f,c,d,e,y,9,a[21]),e=m(e,f,c,d,D,14,a[22]),d=m(d,e,f,c,r,20,a[23]),c=m(c,d,e,f,x,5,a[24]),f=m(f,c,d,e,C,9,a[25]),e=m(e,f,c,d,q,14,a[26]),d=m(d,e,f,c,v,20,a[27]),c=m(c,d,e,f,B,5,a[28]),f=m(f,c,
d,e,j,9,a[29]),e=m(e,f,c,d,u,14,a[30]),d=m(d,e,f,c,A,20,a[31]),c=l(c,d,e,f,s,4,a[32]),f=l(f,c,d,e,v,11,a[33]),e=l(e,f,c,d,z,16,a[34]),d=l(d,e,f,c,C,23,a[35]),c=l(c,d,e,f,w,4,a[36]),f=l(f,c,d,e,r,11,a[37]),e=l(e,f,c,d,u,16,a[38]),d=l(d,e,f,c,y,23,a[39]),c=l(c,d,e,f,B,4,a[40]),f=l(f,c,d,e,h,11,a[41]),e=l(e,f,c,d,q,16,a[42]),d=l(d,e,f,c,t,23,a[43]),c=l(c,d,e,f,x,4,a[44]),f=l(f,c,d,e,A,11,a[45]),e=l(e,f,c,d,D,16,a[46]),d=l(d,e,f,c,j,23,a[47]),c=n(c,d,e,f,h,6,a[48]),f=n(f,c,d,e,u,10,a[49]),e=n(e,f,c,d,
C,15,a[50]),d=n(d,e,f,c,s,21,a[51]),c=n(c,d,e,f,A,6,a[52]),f=n(f,c,d,e,q,10,a[53]),e=n(e,f,c,d,y,15,a[54]),d=n(d,e,f,c,w,21,a[55]),c=n(c,d,e,f,v,6,a[56]),f=n(f,c,d,e,D,10,a[57]),e=n(e,f,c,d,t,15,a[58]),d=n(d,e,f,c,B,21,a[59]),c=n(c,d,e,f,r,6,a[60]),f=n(f,c,d,e,z,10,a[61]),e=n(e,f,c,d,j,15,a[62]),d=n(d,e,f,c,x,21,a[63]);b[0]=b[0]+c|0;b[1]=b[1]+d|0;b[2]=b[2]+e|0;b[3]=b[3]+f|0},_doFinalize:function(){var a=this._data,k=a.words,b=8*this._nDataBytes,h=8*a.sigBytes;k[h>>>5]|=128<<24-h%32;var l=s.floor(b/
4294967296);k[(h+64>>>9<<4)+15]=(l<<8|l>>>24)&16711935|(l<<24|l>>>8)&4278255360;k[(h+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;a.sigBytes=4*(k.length+1);this._process();a=this._hash;k=a.words;for(b=0;4>b;b++)h=k[b],k[b]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;return a},clone:function(){var a=t.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=t._createHelper(q);r.HmacMD5=t._createHmacHelper(q)})(Math);

/**
 * Client transport.
 * Acts as a basic wrapper around a transport.
 * 
 * @class wsc.Transport
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
 * @class wsc.WebSocket
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
    this.cause = null;
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
    this._disconnect( { wsEvent: event, cause: this.cause } );

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
    
    return this.sock.send(
        replaceAll(
            escape(message).replace(/\%u([\dA-F]{4})/g, "%26%23x$1%3B"),
            '+', '%2B'
        )
    );

};

/**
 * Close the connection.
 * 
 * @method close
 */
wsc.WebSocket.prototype.close = function( cause ) {

    if( this.sock == null )
        return;
    
    this.cause = cause;
    
    this.sock.close();

};


/**
 * SocketIO wrapper.
 * 
 * @class wsc.SocketIO
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
    
    return this.sock.send(
        replaceAll(
            escape(message).replace(/\%u([\dA-F]{4})/g, "%26%23x$1%3B"),
            '+', '%2B'
        )
    );

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
    if ( length <= 0 )
        return '0 seconds.';
    
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
 * Sets of unique strings.
 * 
 * Strings in the set are stored lower case.
 * @class StringSet
 * @param [items=[]] {Array} Items to start with
 */
function StringSet( items ) {

    this.items = items || [];

};

/**
 * Add an item.
 * @method add
 * @param item {String} Item to add to the set
 * @param [unshift=false] {Boolean} Pass true to unshift instead of push when adding
 * @return {Boolean} Success or failure
 */
StringSet.prototype.add = function( item, unshift ) {

    if( !item )
        return false;
    
    item = item.toLowerCase();
    
    if( this.contains( item ) )
        return true;
    
    if( unshift )
        this.items.unshift( item );
    else
        this.items.push( item );
    
    return true;

};

/**
 * Remove an item.
 * @method remove
 * @param item {String} Item to remove from the set
 * @return {Boolean} Success or failure
 */
StringSet.prototype.remove = function( item ) {

    if( !item )
        return false;
    
    item = item.toLowerCase();
    
    if( !this.contains( item ) )
        return true;
    
    this.items.splice( this.items.indexOf( item ), 1 );
    return true;

};

/**
 * Check if the set contains an item.
 * @method contains
 * @param item {String} Item to search for
 * @return {Boolean} Found or not found
 */
StringSet.prototype.contains = function( item ) {

    if( !item )
        return false;
    
    return this.items.indexOf( item.toLowerCase() ) != -1;

};

/**
 * Middleware management and execution.
 * 
 * @class wsc.Middleware
 * @constructor
 */
wsc.Middleware = function(  ) {

    this.callbacks = {};

};

/**
 * Add a middleware callback for the given event.
 * 
 * @method add
 */
wsc.Middleware.prototype.add = function( event, callback ) {

    var callbacks = this.callbacks[event] || false;
    
    if( callbacks === false )
        this.callbacks[event] = [];
    
    this.callbacks[event].push( callback );
    return this.callbacks[event].length;

};

/**
 * Call a method, invoking middleware according to the given event name.
 * 
 * @method run
 */
wsc.Middleware.prototype.run = function( event, method, data ) {
    
    var mw = (this.callbacks[event] || []).slice();
    mw.push( method );
    
    var done = function( data ) {
        
        mw.shift()( data, done );
        
    };
    
    done( data );

};
/**
 * Storage object.
 * 
 * This class is a light wrapper around localStorage. Keys are given namespaces, to avoid
 * interfering with the data of other applications. This feature also allows us to create
 * "folders".
 * 
 * @class wsc.Storage
 * @constructor
 * @param namespace {String} Storage namespace to apply to keys
 * @param parent {Object} Parent storage object
 */
wsc.Storage = function( namespace, parent ) {

    /**
     * The namespace for this storage object.
     * 
     * @property namespace
     * @type String
     * @default null
     */
    this.ns = namespace || null;
    
    /**
     * Parent storage object. As if it is a containing folder.
     * 
     * @property parent
     * @type Object
     * @default null
     */
    this.parent = parent || null;

};

/**
 * Create a storage "folder".
 * 
 * This method creates a storage object with a namespace `this.namespace + '.' + namespace`.
 * 
 * @method folder
 * @param namespace
 * @return {Object} A storage object.
 */
wsc.Storage.prototype.folder = function( namespace ) {

    if( this.ns != null )
        namespace = this.ns + '.' + namespace;
    
    return new wsc.Storage( namespace, this );

};

/**
 * Get an item from storage.
 * 
 * @method get
 * @param key {String} Key of the entry to retrieve
 * @param default_val {String} Value to return if the entry is not found
 * @return {String} The corresponding value
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
 * 
 * @method set
 * @param key {String} Key to store the value under
 * @param value {Mixed} Item to store
 */
wsc.Storage.prototype.set = function( key, value ) {

    if( this.ns != null )
        key = this.ns + '.' + key;
    
    try {
        localStorage[key] = value;
    } catch(err) {  }

};

/**
 * Remove an item from localStorage.
 * 
 * @method remove
 * @param key {String} Entry to remove
 * @param {Boolean} Success or failure
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

/**
 * Parses a raw packet into a usable object.
 * 
 * @class wsc.Packet
 * @constructor
 * @param data {String} Raw packet data
 * @param [separator='='] {String} Separator character used to delimit arguments
 * @param [recurse=true] {Boolean} Should the parser recursively parse packets
 */
wsc.Packet = function( data, separator, recurse ) {

    if(!( data )) {
        return null;
    }
    
    if( recurse === undefined )
        recurse = true;
    
    separator = separator || '=';
    var pkt = { cmd: null, param: null, arg: {}, body: null, sub: [], raw: data };
    var args = null;
    var idx = -1;
    
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
            pkt.param = cline.join(' ') || null;
        }
        
        for( var n in args ) {
            arg = args[n];
            idx = arg.search(separator);
            
            if( idx == -1 )
                continue;
            
            pkt.arg[arg.substr( 0, idx )] = arg.substr( idx + separator.length ) || '';
        }
        
        if( pkt.body != null && recurse ) {
            subs = pkt.body.split('\n\n');
            for(var i in subs) {
                sub = wsc.Packet( subs[i], separator, false );
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
    
    if( this.namespace[0] == '@' )
        this.set_privclasses( { pkt: { body: '' } } );
    
};

/**
 * Process a channel property packet.
 * 
 * @method property
 * @param e {Object} Event data for the property packet.
 */
wsc.Channel.prototype.property = function( e ) {
    var prop = e.pkt.arg.p;
    
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

};

/**
 * Set the channel's privclasses.
 * 
 * @method set_privclasses
 * @param e {Object} Event data for the property packet.
 */
wsc.Channel.prototype.set_privclasses = function( e ) {

    if( this.namespace[0] == '@' ) {
    
        this.info.pc = { 100: 'Room Members' };
        this.info.pc_order = [ 100 ];
    
    } else {
    
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
    
    }
    
    this.info["pc_order"].sort(function(a, b){ return b - a });
    
    var names = this.info.pc;
    var orders = this.info.pc_order.slice(0);
    
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
    
    this.client.trigger('ns.user.list', {
        'name': 'set.userlist',
        'ns': this.namespace,
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
        'pc': member.pc || 'Room Members',
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
    
    this.client.trigger('ns.user.registered', {
        name: 'ns.user.registered',
        ns: this.namespace,
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
    }
    
    this.client.trigger('ns.user.remove', {
        user: member.name,
        ns: this.namespace
    });
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
 * Process a recv_privchg event.
 * 
 * @method recv_privchg
 * @param e {Object} Event data for recv_privhcg packet.
 */
wsc.Channel.prototype.recv_privchg = function( e ) {
    var c = this;
    
    this.client.cascade('ns.user.privchg', function( data ) {
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

/**
 * Rendered message object.
 * 
 * @class wsc.MessageString
 * @constructor
 * @param data {String} Unparsed message.
 * @param [parser=wsc.MessageParser] {Object} Object used to parse messages.
 */
wsc.MessageString = function( data, parser ) {
    this._parser = parser || new wsc.MessageParser();
    this.raw = data;
};

with(wsc.MessageString.prototype = new String) {
    constructor = wsc.MessageParser;
    toString = valueOf = function() { return this.raw; };
}

/**
 * Render the message in HTML where possible.
 * @method html
 * @return {String} The message rendered as an HTML string
 */
wsc.MessageString.prototype.html = function(  ) {
    return this.raw;
};

/**
 * Render the message in plain text where possible.
 * @method text
 * @return {String} The message rendered as a plain text string
 */
wsc.MessageString.prototype.text = function() {
    return this.raw;
};

/**
 * Render the message with ANSI escape sequences.
 * @method ansi
 * @return {String} The message rendered as an ANSI-formatted string
 */
wsc.MessageString.prototype.ansi = function() {
    return this.raw;
};


/**
 * A parser for formatted messages.
 * 
 * @class wsc.MessageParser
 * @constructor
 */
wsc.MessageParser = function(  ) {};

/**
 * Parse a given message.
 * @method parse
 * @param data {String} Raw message data
 * @return {Object} Message string object.
 */
wsc.MessageParser.prototype.parse = function( data ) {

    return new wsc.MessageString(data, this);

};

/**
 * Render a given message string.
 * @method render
 * @param mode {Integer} Determine how the message should be rendered
 * @param data {Object} Message string to render
 * @return {String} Rendered message
 */
wsc.MessageParser.prototype.render = function( mode, data ) {

    return data.raw;

};



/**
 * Parser for dAmn-like protocols.
 * 
 * @class wsc.Protocol
 * @constructor
 * @param [mparser=wsc.MessageParser] {Object} Message parser instance.
 */
wsc.Protocol = function( mparser ) {

    this.mparser = mparser || new wsc.MessageParser;
    this.chains = [["recv", "admin"]];
    
    /**
     * Mapping object.
     * 
     * This object determines how each protocol packet should be mapped from a `packet object`
     * to an `event object`. For each packet, there is an entry, where the key is the
     * {{#crossLink "wsc.Protocol/event:method"}}event name{{/crossLink}} of the packet.
     * 
     * Each entry is an array. The array consists of names under which to store packet data.
     * The array is of the structure `[ param, args, body ]`. All items are optional, but
     * positional. To discard a particular piece of data, `null` can be used.
     * 
     * When `args` is present it must be an array. This array names the arguments to store.
     * Each item in the `args` array can be a string or a pair of strings. For strings,
     * the corresponding packet argument is stored using its own name. For pairs, the packet
     * argument named by the first string is stored using the second string as the key.
     * 
     * When `body` is present, it can either be a string or an array. If a string is provided,
     * the entire body is stored using the string as the key. If an array is provided, it
     * treated as another mapping array. This is handled recursively.
     * 
     * Keys in the mapping array can start with an asterisks (`*`). This indicates that the
     * value is a formatted string and needs to be parsed using a
     * {{#crossLink "wsc.MessageParser"}}message parser{{/crossLink}}. The asterisks is
     * removed from the key in the final object.
     * 
     * As an example, property packets use this mapping array:
     * 
     *      this.maps['property'] = ['ns', ['p', 'by', 'ts'], '*value' ];
     * 
     * When mapping a property packet, the returned object looks like the following:
     *      
     *      {
     *          "name": "property",
     *          "ns": pkt.param,
     *          "p": pkt.arg.p,
     *          "by": pkt.arg.by,
     *          "ts": pkt.arg.ts,
     *          "value": pkt.body
     *      }
     * 
     * For an example of arguments being mapped to different keys, kick
     * (error) packets use this mapping array:
     * 
     *      this.maps['kick'] = ['ns', [['u', 'user'], 'e']];
     * 
     * For this array, the returned object looks like the following:
     *      
     *      {
     *          "name": "kick",
     *          "ns": pkt.param,
     *          "user": pkt.arg.u,
     *          "e": pkt.body
     *      }
     *
     * @property maps
     * @type Object
     */
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

};

/**
 * Extend the protocol maps.
 * 
 * @method extend_maps
 * @param maps {Object} An object containing packet mappings.
 */
wsc.Protocol.prototype.extend_maps = function( maps ) {

    for( var key in maps ) {
        this.maps[key] = maps[key];
    }

};

/**
 * Generate template keys based on current protocol maps.
 * 
 * @method populate_keys
 */
wsc.Protocol.prototype.populate_keys = function(  ) {

    this.tkeys = {};
    
    for( var evt in this.maps ) {
        
        if( !this.maps.hasOwnProperty( evt ) )
            continue;
        
        var keys = this.maps[evt];
        var key = '';
        
        this.tkeys[evt] = [];
        
        for( var i in keys ) {
            if( !keys.hasOwnProperty( i ) )
                continue;
            
            key = keys[i];
            
            if( !key )
                continue;
            
            if( i == 1 ) {
                
                var sk = '';
                
                for( var x in key ) {
                    if( !key.hasOwnProperty( x ) )
                        continue;
                    
                    sk = key[x];
                    
                    if( !sk )
                        continue;
                    
                    if( sk instanceof Array ) {
                        sk = sk[1];
                    }
                    
                    if( sk[0] == '*' )
                        this.tkeys[evt].push( sk.substr( 1 ) );
                    else
                        this.tkeys[evt].push( sk );
                }
                
                continue;
                
            }
            
            if( key[0] == '*' )
                this.tkeys[evt].push( key.substr( 1 ) );
            else
                this.tkeys[evt].push( key );
        }
    
    }

};

/**
 * Parse a packet.
 * 
 * @method parse
 * @param packet {Object} Packet object.
 */
wsc.Protocol.prototype.parse = function( packet ) {

    var name = this.event( packet );
    
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
        var k = '', val = '';
        
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
 * Control the client's program flow. This object determines how the client responds to
 * certain events.
 * 
 * @class wsc.Flow
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
    var evt = {
        name: 'closed',
        pkt: new wsc.Packet('connection closed\n\n'),
        reason: '',
        evt: event,
        // Were we fully connected or did we fail to connect?
        connected: client.connected,
        // Are we using SocketIO?
        sio: client.conn instanceof wsc.SocketIO,
        cause: event.cause || null,
        reconnect: true
    };
    
    var logevt = {
        name: 'log',
        ns: '~System',
        msg: '',
        info: ''
    };
    
    client.trigger( 'closed', evt );
    
    if(client.connected) {
        logevt.msg = 'Connection closed';
        client.trigger( 'log', logevt );
        client.connected = false;
        if( client.conn instanceof wsc.SocketIO ) {
            logevt.msg = 'At the moment there is a problem with reconnecting with socket.io';
            logevt.info = 'Refresh to connect';
            client.trigger( 'log', logevt );
            logevt.info = '';
            return;
        }
    } else {
        logevt.msg = 'Connection failed';
        client.trigger( 'log', logevt );
    }
    
    evt.name = 'quit';
    
    // Tried more than twice? Give up.
    if( client.attempts > 2 ) {
        //client.ui.server_message("Can't connect. Try again later.");
        evt.reconnect = false;
        client.attempts = 0;
        client.trigger( 'quit', evt );
        return;
    }
    
    // If login failure occured, don't reconnect
    if( event.cause ) {
        if( event.cause.hasOwnProperty( 'name' ) && event.cause.name == 'login' ) {
            client.trigger( 'quit', evt );
            return;
        }
    }
    
    // Notify everyone we'll be reconnecting soon
    //client.ui.server_message("Connecting in 2 seconds");
    
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
    
    if(event.pkt.arg.e == "ok") {
        // Use the username returned by the server!
        var info = event.pkt.sub[0];
        client.settings["username"] = event.pkt["param"];
        client.settings['symbol'] = info.arg.symbol;
        client.settings['userinfo'] = info.arg;
        
        var joiner = function(  ) {
            client.join(client.settings["autojoin"]);
            if( client.autojoin.on ) {
                for( var i in client.autojoin.channel ) {
                    if( !client.autojoin.channel.hasOwnProperty(i) )
                        continue;
                    client.join(client.autojoin.channel[i]);
                }
            }
        };
        
        // Autojoin!
        if ( client.fresh ) {
            joiner();
        } else {
            var joined = false;
            
            for( key in client.channelo ) {
                if( client.channelo[key].namespace[0] != '~' ) {
                    client.join(key);
                    joined = true;
                }
            }
            
            if( !joined )
                joiner();
            
        }
    } else {
        client.close( event );
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
        var ns = client.deform_ns(event.pkt["param"]);
        client.create_ns(ns, client.hidden.contains(event.pkt['param']));
    } else {
        client.trigger( 'log',
            {
                name: 'log',
                ns: 'server:current',
                sns: '~current',
                msg: "Failed to join " + client.deform_ns(event.pkt["param"]),
                info: event.pkt["arg"]["e"]
            }
        );
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
            client.remove_ns(event.ns);
        
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
        client.trigger( 'log',
            {
                name: 'log',
                ns: 'server:current',
                sns: '~current',
                msg: "Couldn't leave " + ns,
                info: event.e
            }
        );
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
 * @class wsc.defaults.Extension
 * @constructor
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
        client.bind('cmd.connect', cmd.connection );
        client.bind('cmd.set', cmd.setter );
        
        // standard dAmn commands.
        client.bind('cmd.join', cmd.join );
        client.bind('cmd.chat', cmd.pjoin );
        client.bind('cmd.part', cmd.part );
        // send ...
        client.bind('cmd.say', cmd.say );
        client.bind('cmd.npmsg', cmd.npmsg );
        client.bind('cmd.me', cmd.action );
        client.bind('cmd.promote', cmd.chgpriv );
        client.bind('cmd.demote', cmd.chgpriv );
        client.bind('cmd.ban', cmd.ban );
        client.bind('cmd.unban', cmd.ban );
        client.bind('cmd.kick', cmd.killk );
        //client.bind('cmd.get', cmd.get );
        client.bind('cmd.whois', cmd.whois );
        client.bind('cmd.title', cmd.title );
        client.bind('cmd.topic', cmd.title );
        client.bind('cmd.admin', cmd.admin );
        client.bind('cmd.disconnect', cmd.connection );
        client.bind('cmd.kill', cmd.killk );
        client.bind('cmd.raw', cmd.raw );
        
        client.bind('cmd.clear', cmd.clear );
        client.bind('cmd.clearall', cmd.clearall );
        client.bind('cmd.close', cmd.close );
        
        client.bind('pkt.property', pkt_property );
        client.bind('pkt.recv_admin_show', pkt_admin_show );
        client.bind('pkt.recv_admin_showverbose', pkt_admin_show );
        client.bind('pkt.get', pkt_get );
        
        
        // Non-standard commands.
        client.bind('cmd.gettitle', cmd.gett);
        client.bind('cmd.gettopic', cmd.gett);
        
        // lol themes
        client.bind('cmd.theme', cmd.theme);
        /*
        // some ui business.
        client.ui.on('settings.open', settings_page);
        client.ui.on('settings.open.ran', about_page);
        client.ui.on('settings.save.ui', settings_save);
        client.ui.on('settings.save', function(  ) { client.config_save(); } );
        */
    };
    
    var settings_save = function( e, ui ) {
        client.settings.ui.theme = e.theme;
        client.settings.ui.clock = e.clock;
        client.settings.ui.tabclose = e.tabclose;
    };
    
    var settings_page = function( e, ui ) {
    
        var page = e.settings.page('Main');
        var orig = {};
        orig.username = client.settings.username;
        orig.pk = client.settings.pk;
        orig.devel = client.settings.developer;
        
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
        
        page.item('Form', {
            'ref': 'developer',
            'title': 'Developer Mode',
            'text': 'Turn developer mode on or off.\n\nDeveloper mode will expose any hidden\
                channel tabs, amongst other things. Keep this turned off unless you\'re working\
                on implementing something.',
            'fields': [
                ['Checkbox', {
                    'ref': 'enabled',
                    'items': [
                        { 'value': 'on', 'title': 'On', 'selected': orig.devel }
                    ]
                }]
            ],
            'event': {
                'change': function( event ) {
                    client.settings.developer = (event.data.enabled.indexOf('on') != -1);
                    client.ui.developer(client.settings.developer);
                },
                'save': function( event ) {
                    orig.devel = client.settings.developer;
                },
                'close': function( event ) {
                    client.settings.developer = orig.devel;
                    client.ui.developer(client.settings.developer);
                }
            }
        });
        
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
    
    /**
     * Holds all of the command handling methods.
     * 
     * @property cmd
     * @type Object
     */
    var cmd = {};
    
    cmd.theme = function( e, client) {
        client.ui.theme(e.args.split(' ').shift());
    };
        
    /**
     * This command allows the user to change the settings for the client through
     * the input box.
     * 
     * @method cmd.setter
     * @param cmd {Object} Command event data.
     */
    cmd.setter = function( e ) {
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
        
    };
    
    /**
     * This command allows the user to force the client to connect to the server.
     * @method cmd.connection
     */
    cmd.connection = function( e ) {
        client[e.cmd]();
    };
    
    // Join a channel
    cmd.join = function( e ) {
        var chans = e.args.split(' ');
        var chans = chans.toString() == '' ? [] : chans;
        
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' )
            return;
        
        for( index in chans )
            client.join(chans[index]);
    };
    
    // Join a channel
    cmd.pjoin = function( e ) {
        var chans = e.args.split(' ');
        var chans = chans.toString() == '' ? [] : chans;
        
        if( e.ns != e.target )
            chans.unshift(e.target);
        
        if( chans.toString() == '' )
            return;
        
        for( index in chans )
            client.join('@' + chans[index]);
    };
    
    // Leave a channel
    cmd.part = function( e ) {
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
    cmd.title = function( e ) {
        client.set(e.target, e.cmd, e.args);
    };
    
    // Promote or demote user
    cmd.chgpriv = function( e ) {
        var bits = e.args.split(' ');
        client[e.cmd.toLowerCase()](e.target, bits[0], bits[1]);
    };
    
    // Ban user
    cmd.ban = function( e, client ) {
        var args = e.args.split(' ');
        var user = args.shift();
        var cmd = e.cmd;
        if( cmd == 'ban' && args.length > 0 ) {
            client.kick( e.target, user, args.join(' ') );
        }
        client[cmd](e.target, user);
    };
    
    // Send a /me action thingy.
    cmd.action = function( e ) {
        client.action(e.target, e.args);
    };
    
    // Send a raw packet.
    cmd.raw = function( e ) {
        client.send( e.args.replace(/\\n/gm, "\n") );
    };
    
    // Kick or kill someone.
    cmd.killk = function( e, client ) {
        var d = e.args.split(' ');
        var u = d.shift();
        var r = d.length > 0 ? d.join(' ') : null;
        if( e.cmd == 'kick' )
            client.kick( e.target, u, r );
        else
            client.kill( u, r );
    };
    
    // Say something.
    cmd.say = function( e ) {
        if( client.channel(e.target).monitor )
            return;
        client.say( e.target, e.args );
    };
    
    // Say something without emotes and shit. Zomg.
    cmd.npmsg = function( e ) {
        client.npmsg( e.target, e.args );
    };
    
    // Clear the channel's log.
    cmd.clear = function( e, client ) {
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            for( var i in users ) {
                if( !users.hasOwnProperty(i) )
                    continue;
                client.ui.channel( e.target ).clear_user( users[i] );
            }
        } else {
            client.ui.channel( e.target ).clear();
        }
    };
    
    // Clear all channel logs.
    cmd.clearall = function( e, client ) {
        var method = null;
        
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            method = function( ns, channel ) {
                for( var i in users ) {
                    if( !users.hasOwnProperty(i) )
                        continue;
                    channel.clear_user( users[i] );
                }
            };
        } else {
            method = function( ns, channel ) {
                channel.clear();
            };
        }
        
        client.ui.chatbook.each( method, true );
    };
    
    cmd.close = function( cmd ) {
        client.part(cmd.target);
        client.remove_ns(cmd.target);
    };
    
    // Send a whois thingy.
    cmd.whois = function( event, client ) {
        client.whois( event.args.split(' ')[0] );
    };
    
    // Send an admin packet.
    cmd.admin = function( event, client ) {
        client.admin( event.target, event.args );
    };
    
    // Send an disconnect packet.
    cmd.disconnect = function( event, client ) {
        client.disconnect(  );
    };
    
    // Get the title or topic.
    cmd.gett = function( event, client ) {
        var which = event.cmd.indexOf('title') > -1 ? 'title' : 'topic';
        client.ui.control.set_text('/' + which + ' ' + client.channel(event.target).info[which].content);
    };
    
    // Process a property packet, hopefully retreive whois info.
    var pkt_property = function( event, client ) {
        if(event.p != 'info')
            return;
        
        var subs = event.pkt.sub;
        var data = subs.shift().arg;
        data.username = event.sns.substr(1);
        data.connections = [];
        var conn = null;
        var section = {};
        
        while( subs.length > 0 ) {
            section = subs.shift();
            
            switch( section.cmd ) {
                
                case 'conn':
                    if( conn != null ) {
                        data.connections.push(conn);
                    }
                    
                    conn = section.arg;
                    conn.channels = [];
                    break;
                
                case 'agent':
                    conn.agent = [[ 'agent', section.arg.agent ]];
                    
                    if( section.arg.hasOwnProperty('url') )
                        conn.agent.push( [ 'url', section.arg.url ] );
                    
                    if( section.arg.hasOwnProperty('browser') )
                        conn.agent.push( [ 'browser', section.arg.browser ] );
                    
                    for( var k in section.arg ) {
                        if( k == 'agent' || k == 'url' || k == 'browser' )
                            continue;
                        
                        if( section.arg.hasOwnProperty( k ) ) {
                            conn.agent.push( [ k, section.arg[k] ] );
                        }
                    }
                    break;
                
                case 'ns':
                    conn.channels.unshift( client.deform_ns(section.param) );
                    break;
            
            }
        
        }
        
        data.connections.push(conn);
        
        client.trigger( 'pkt.whois', {
            name: 'pkt.whois',
            pkt: event.pkt,
            info: data
        });
        //client.ui.chatbook.current.log_whois(data);
    };
    
    var pkt_get = function( event, client ) {
    
        if( event.ns.indexOf('login:') != 0 )
            return;
        
        var usr = event.sns.substr(1);
        
        client.ui.pager.notice({
            'ref': 'whois-' + usr,
            'heading': 'Whois Failed',
            'content': 'Whois failed for ' + usr + '.\nNo such user online.'
        }, false, 5000 );
    
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
        
        client.ui.chatbook.current.log_pc(event.p == 'privclass', pcs);
    
    };
    
    init();
    
    /**
     * Implements the ignore feature.
     * 
     * @method Ignore
     */
    wsc.defaults.Extension.Ignore(client);
    
    /**
     * Implements away messages.
     * 
     * @method Away
     */
    wsc.defaults.Extension.Away(client);
    
    /**
     * Implements autojoin channels.
     * 
     * @method Autojoin
     */
    wsc.defaults.Extension.Autojoin(client);

};
/**
 * Autojoin extension.
 */
wsc.defaults.Extension.Autojoin = function( client ) {

    var settings = client.autojoin;
    /*
    client.ui.nav.add_button( {
        'icon': 'chat',
        'label': '',
        'title': 'Join your autojoin channels',
        'href': '#autojoin-do',
        'handler': function(  ) {
            for( var i in client.autojoin.channel ) {
                if( !client.autojoin.channel.hasOwnProperty(i) )
                    continue;
                client.join(client.autojoin.channel[i]);
            }
        }
    });
    */
    
    var init = function(  ) {
    
        client.bind('cmd.autojoin', cmd_autojoin);
        //client.ui.on('settings.open', settings.page);
    
    };
    /*
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Autojoin');
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
    */
    
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
                        //chan.server_message('Added ' + item + ' to your autojoin.');
                    } else {
                        //chan.server_message('Already have ' + item + ' on your autojoin.');
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
                        //chan.server_message('Removed ' + item + ' from your autojoin.');
                    } else {
                        //chan.server_message(item + ' is not on your autojoin list.');
                    }
                };
                break;
            case 'on':
                //chan.server_message('Autojoin on.');
                if( !client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = true;
                }
                break;
            case 'off':
                //chan.server_message('Autojoin off.');
                if( client.autojoin.on ) {
                    mod = true;
                    client.autojoin.on = false;
                }
                break;
            default:
                console.log('> start autojoin');
                console.log(client.autojoin);
                for( var i in client.autojoin.channel ) {
                    if( !client.autojoin.channel.hasOwnProperty(i) )
                        continue;
                    client.join(client.autojoin.channel[i]);
                }
                return;
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
            'away': "{user}: I've been away for {timesince}. Reason: {reason}"
        }
    };
    client.away = settings;
    
    var init = function(  ) {
    
        load();
        save();
        
        client.bind('cmd.setaway', cmd_setaway);
        client.bind('cmd.setback', cmd_setback);
        //client.ui.on('tabbed', pkt_highlighted);
        //client.ui.on('settings.open', settings.page);
    
    };
    /*
    settings.page = function( event, ui ) {
    
        var strips = function( data ) {
            data = replaceAll(data, '<', '&lt;');
            data = replaceAll(data, '>', '&gt;');
            data = replaceAll(data, '"', '&quot;');
            return data;
        };
        var unstrips = function( data ) {
            data = replaceAll(data, '&lt;', '<');
            data = replaceAll(data, '&gt;', '>');
            data = replaceAll(data, '&quot;', '"');
            return data;
        };
        var page = event.settings.page('Away');
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
                    'default': strips(orig.away)
                }],
                ['Textfield', {
                    'ref': 'setaway',
                    'label': 'Setaway',
                    'default': strips(orig.sa)
                }],
                ['Textfield', {
                    'ref': 'setback',
                    'label': 'Setback',
                    'default': strips(orig.sb)
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.format.away = unstrips(event.data.away);
                    settings.format.setaway = unstrips(event.data.setaway);
                    settings.format.setback = unstrips(event.data.setback);
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
    */
    
    
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
        /*
        client.ui.control.add_state({
            'ref': 'away',
            'label': 'Away, reason: <i>' + ( settings.reason || '[silent away]' ) + '</i>'
        });
        */
    
    };
    
    var cmd_setback = function( event, client ) {
    
        if( !settings.on )
            return;
        
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
        
        //client.ui.control.rem_state('away');
    };
    
    var pkt_highlighted = function( event ) {
    
        if( !settings.on )
            return;
        
        if( settings.reason.length == 0 )
            return;
        
        if( event.user == client.settings.username )
            return;
        
        if( client.exclude.contains( event.ns ) )
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
        //client.ui.on('settings.open', settings.page);
    
    };
    /*
    settings.page = function( event, ui ) {
    
        var page = event.settings.page('Ignores');
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
    */
    
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
        /*
        for( var i in client.ui.umuted ) {
            if( !client.ui.umuted.hasOwnProperty(i) ) {
                continue;
            }
            client.unmute_user( client.ui.umuted[i] );
        }
        */
        
        //client.ui.umuted = [];
        
        if( settings.count > 0 ) {
            tu = null;
            for( var i = 0; i < settings.count; i++ ) {
                //client.mute_user( istore.get(i, null) );
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
        /*
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
        */
    
    };
    
    init();

};

/**
 * An entire chat client. Instances of this object orchestrate the operation of
 * the client. Other objects are loaded in to control different parts of the client. These
 * components can be reasonably swapped out, assuming they provide the same functionality.
 *
 * @class wsc.Client
 * @constructor
 * @param view {Object} The client's container element.
 * @param options {Object} Configuration options for the client.
 * @param mozilla {Object} Is firefox being used?
 * @since 0.0.1
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
    
    /**
     * An instance of a protocol parser.
     *
     * @property protocol
     * @type {Object}
     * @default wsc.Protocol
     */
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
        "protocol": wsc.Protocol,
        "mparser": wsc.MessageParser,
        "flow": wsc.Flow,
        "extend": [wsc.defaults.Extension],
        "client": 'chatclient',
        "clientver": '0.3',
        "developer": false
    };
    this.autojoin = {
        'on': true,
        'count': 0,
        'channel': []
    };
    this.away = {};
    
    var cli = this;
    // Channels excluded from loops.
    this.exclude = new StringSet();
    // Hidden channels
    this.hidden = new StringSet();
    this.settings = Object.extend( this.settings, options );
    this.config_load();
    this.config_save();
    
    this.mw = new wsc.Middleware();
    
    this.settings.agent = 'Client (' + navigator.platform + '; HTML5; JavaScript) wsc/' + wsc.VERSION + '-r' + wsc.REVISION;
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.protocol = new this.settings.protocol( new this.settings.mparser() );
    this.flow = new this.settings.flow(this.protocol);
    
    this.build();
    
    /*
    for(var index in this.settings["extend"]) {
        this.settings["extend"][index](this);
    }
    */
    
    wsc.defaults.Extension( this );

};

/**
 * Load configuration from localStorage.
 *
 * @method config_load
 */
wsc.Client.prototype.config_load = function(  ) {

    this.settings.developer = ( this.storage.get('developer', this.settings.developer.toString()) == 'true' );
    //this.settings.ui.theme = this.storage.ui.get('theme', this.settings.ui.theme);
    //this.settings.ui.clock = (this.storage.ui.get('clock', this.settings.ui.clock.toString()) == 'true');
    //this.settings.ui.tabclose = (this.storage.ui.get('tabclose', this.settings.ui.tabclose.toString()) == 'true');
    
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

    this.storage.set('developer', this.settings.developer);
    //this.storage.ui.set('theme', this.settings.ui.theme);
    //this.storage.ui.set('clock', this.settings.ui.clock.toString());
    //this.storage.ui.set('tabclose', this.settings.ui.tabclose.toString());
    
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

    //this.ui.build();
    this.create_ns( this.settings.monitor[0], true, true );
    var client = this;
    /*
    this.ui.on('tab.close.clicked', function( event, ui ) {
        if( event.chan.monitor )
            return false;
        client.part(event.ns);
        client.remove_ns(event.ns);
        return false;
    } );
    
    this.ui.on('title.save', function( event, ui ) {
        client.set(event.ns, 'title', event.value);
    } );
    
    this.ui.on('topic.save', function( event, ui ) {
        client.set(event.ns, 'topic', event.value);
    } );
    */

};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
wsc.Client.prototype.loop = function(  ) {

    //this.ui.loop();

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

    return this.events.emit( event, data, this );

};

/**
 * Add a middleware method.
 * 
 * @method middle
 * @param event {String} Event to attach middleware to
 * @param callback {Function} Method to call
 */
wsc.Client.prototype.middle = function( event, callback ) {

    return this.mw.add( event, callback );

};

/**
 * Run a method with middleware.
 *
 * @method cascade
 * @param event {String} Event to run middleware for
 * @param callback {Function} Method to call after running middleware
 * @param data {Object} Input for the method/event
 */
wsc.Client.prototype.cascade = function( event, callback, data ) {

    this.mw.run( event, callback, data );

};

/**
 * Open a connection to the chat server.
 * 
 * If the client is already connected, nothing happens.
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
        //this.ui.server_message('Opening connection');
        this.trigger('start', new wsc.Packet('client connecting\ne=ok\n\n'));
    } catch(err) {
        console.log(err);
        //this.monitor("Your browser does not support WebSockets. Sorry.");
        this.trigger('start', new wsc.Packet('client connecting\ne=no websockets available\n\n'));
    }

};

/**
 * Close the connection foo.
 * 
 * @method close
 * @param [event] {Object} Event that resulted in the connection being closed
 */
wsc.Client.prototype.close = function( event ) {

    this.conn.close( event );
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

    namespace = this.format_ns(namespace).toLowerCase();
    
    if( !this.channelo[namespace] ) {
        if( channel ) {
            this.channelo[namespace] = channel;
                return channel;
        }
        return null;
    }
    
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
            if( this.exclude.contains( chan.raw ) )
                continue;
        
        if( method( chan.raw, chan ) === false )
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

    var sym = namespace[0];
    
    if( sym == '#'
        || sym == '@'
        || sym == '~'
        || sym == '+' )
            return namespace;
    
    if( namespace.indexOf("chat:") == 0 )
        return '#' + namespace.slice(5);
    
    if( namespace.indexOf("server:") == 0 )
        return '~' + namespace.slice(7);
    
    if( namespace.indexOf("feed:") == 0 )
        return '#' + namespace.slice(5);
    
    if( namespace.indexOf('login:') == 0 )
        return '@' + namespace.slice(6);
    
    if( namespace.indexOf("pchat:") == 0 ) {
        var names = namespace.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    return '#' + namespace;

};

/**
 * Format a channel namespace in its longhand form.
 * 
 * @method format_ns
 * @param namespace {String} Channel namespace to format.
 * @return {String} Formatted namespace.
 */
wsc.Client.prototype.format_ns = function( namespace ) {

    var n = namespace.slice( 1 );
    
    switch( namespace[0] ) {
        
        case '@':
            var names = [n, this.lun];
            names.sort(caseInsensitiveSort)
            names.unshift("pchat");
            namespace = names.join(':');
            break;
        
        case '~':
            namespace = "server:" + n;
            break;
        
        case '+':
            namespace = 'feed:' + n
            break;
            
        case '#':
            namespace = 'chat:' + n;
            break;
            
        default:
            if( namespace.indexOf('chat:') == 0
                || namespace.indexOf('pchat:') == 0
                || namespace.indexOf('server:') == 0
                || namespace.indexOf('feed:') == 0 )
                    break;
            namespace = 'chat:' + namespace;
            break;
    }
    
    return namespace;

};

/**
 * Create a channel object for the client.
 * 
 * @method create_ns
 * @param namespace {String} Namespace to use for the channel.
 * @param hidden {Boolean} Should the channel tab be hidden?
 */
wsc.Client.prototype.create_ns = function( namespace, hidden, monitor ) {

    var chan = this.channel(namespace, new wsc.Channel(this, namespace, hidden, monitor));
    this.trigger( 'ns.create', {
        name: 'ns.create',
        ns: namespace,
        chan: chan,
        client: this
    });
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
    
    this.cascade(
        'ns.remove',
        function( data ) {
            var chan = data.client.channel( data.ns );
            
            if( !chan )
                return;
            
            delete data.client.channelo[chan.raw.toLowerCase()];
        },
        {
            ns: namespace,
            client: this
        }
    );

};

/**
 * Focus the client on a particular channel, for some reason.
 * 
 * If the UI is managing everything to do with the channel being used, maybe this
 * should be deprecated...
 *
 * @method select_ns
 * @param ns {String} Namespace of the channel to select
 */
wsc.Client.prototype.select_ns = function( ns ) {

    this.cchannel = this.channel(ns) || this.cchannel;

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

    console.log( message );
    //this.ui.monitor(message);

};

/**
 * Mute a user.
 * 
 * @method mute_user
 * @param user {String} User to mute.
 */
wsc.Client.prototype.mute_user = function( user ) {

    //return this.ui.mute_user( user );

};

/**
 * Unmute a user.
 * 
 * @method unmute_user
 * @param user {String} User to unmute.
 */
wsc.Client.prototype.unmute_user = function( user ) {

    //return this.ui.unmute_user( user );

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
        "agent": this.settings.agent,
        "url": window.location.href,
        "browser": navigator.userAgent
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

    var c = this;
    this.cascade( 'send.msg',
        function( data ) {
            c.send(wsc_packetstr('send', c.format_ns(data.ns), {},
                wsc_packetstr('msg', 'main', {}, data.input)
            ));
        }, { 'input': message, 'ns': namespace }
    );

};

/**
 * Send a non-parsed message to a channel.
 * 
 * @method npmsg
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.npmsg = function( namespace, message ) {

    var c = this;
    this.cascade( 'send.npmsg',
        function( data ) {
            c.send(wsc_packetstr('send', c.format_ns(data.ns), {},
                wsc_packetstr('npmsg', 'main', {}, data.input)
            ));
        }, { 'input': message, 'ns': namespace }
    );

};

/**
 * Send an action message to a channel.
 * 
 * @method action
 * @param namespace {String} Channel to send a message to.
 * @param message {String} Message to send.
 */
wsc.Client.prototype.action = function( namespace, action ) {

    var c = this;
    this.cascade( 'send.action',
        function( data ) {
            c.send(wsc_packetstr('send', c.format_ns(data.ns), {},
                wsc_packetstr('action', 'main', {}, data.input)
            ));
        }, { 'input': action, 'ns': namespace }
    );

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
wsc.Client.prototype.unban = function( namespace, user ) {

    this.send(wsc_packetstr('send', this.format_ns(namespace), {},
        wsc_packetstr('unban', user)));

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

    var c = this;
    this.cascade( 'send.kick',
        function( data ) {
            c.send(wsc_packetstr('kick', c.format_ns(data.ns), { 'u': data.user }, data.input || null));
        }, { 'input': reason || '', 'ns': namespace, 'user': user }
    );

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

    this.send(wsc_packetstr('kill', 'login:' + user, {}, reason || null));

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

    var c = this;
    this.cascade( 'send.set',
        function( data ) {
            c.send(wsc_packetstr('set', c.format_ns(data.ns), { 'p': data.property }, data.input));
        }, { 'input': value, 'ns': namespace, 'property': property }
    );

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
 * jQuery plugin.
 * 
 * Wrapper for implementing the plugin.
 * 
 * @class jQuery.plugin
 * @constructor
 * @param $ {Object} jQuery instance
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
    
    /**
     * Implements the wsc client as a jQuery plugin.
     * 
     * To create a new client, pass `"init"` as the method, as follows:
     *      
     *      $('div.container').wsc( 'init', options );
     * 
     * @method wsc
     * @param method {String} Method to call
     * @param options {Object} Method input options
     * @return {Object} Instance of wsc
     */
    $.fn.wsc = function( method, options ) {
        
        var client = $(window).data('wscclient');
        
        if( method == 'init' || client === undefined ) {
            if( client == undefined ) {
                client = new wsc.Client( $(this), options, ($.browser.mozilla || false) );
                //$(window).resize(function( ) { client.ui.resize(); });
                //$(window).focus(function( ) { client.ui.control.focus(); });
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
