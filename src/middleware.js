
/**
 * Middleware management and execution.
 * 
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
