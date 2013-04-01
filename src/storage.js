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
     * The namaespace for this storage object.
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
