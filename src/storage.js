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
