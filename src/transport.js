/**
 * Client transport.
 * Acts as a basic wrapper around a transport.
 * 
 * @class Transport
 * @constructor
 */
wsc.Transport = function( open, message, disconnect ) {

    this.conn = null;
    this.open( open );
    this.message( message );
    this.disconnect( disconnect );

};

wsc.Transport.prototype.open = function( callback ) {

    this._open = callback || this.sopen;

};

wsc.Transport.prototype.message = function( callback ) {

    this._message = callback || this.smessage;

};

wsc.Transport.prototype.disconnect = function( callback ) {

    this._disconnect = callback || this.sdisconnect;

};

wsc.Transport.prototype.sopen = function(  ) {};
wsc.Transport.prototype.smessage = function(  ) {};
wsc.Transport.prototype.sdisconnect = function(  ) {};

wsc.Transport.prototype.send = function( data ) {};
wsc.Transport.prototype.close = function(  ) {};


