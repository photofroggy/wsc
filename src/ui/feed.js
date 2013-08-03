
/**
 * Object for managing feed interfaces.
 * 
 * @class Chatterbox.Feed
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the feed this object will represent
 * @param [meta] {String} Meta information about the feed
 * @param [description] {String} A string describing the feed
 */
Chatterbox.Feed = function( ui, ns, meta, description ) {
    
    Chatterbox.BaseTab.call( this, ui, ns );
    
    /**
     * The name of the feed.
     * @property name
     * @type String
     */
    this.name = this.namespace.substr(1);
    
    /**
     * Meta information for the feed
     * @property meta
     * @type String
     */
    this.meta = meta || '';
    
    /**
     * The description for the channel.
     * @property description
     * @type String
     */
    this.description = description || '';
    
};

Chatterbox.Feed.prototype = new Chatterbox.BaseTab;
Chatterbox.Feed.prototype.constructor = Chatterbox.Feed;

/**
 * Draw the feed on screen and store the different elements in attributes.
 * 
 * @method build
 */
Chatterbox.Feed.prototype.build = function( ) {
    
    if( !this.manager )
        return;
    
    if( this.built )
        return;
    
    var selector = this.selector;
    var ns = this.namespace;
    var raw = this.raw;
    
    Chatterbox.BaseTab.prototype.build.call(
        this,
        Chatterbox.render(
            'feed',
            {
                'selector': selector,
                'meta': this.meta,
                'name': this.name,
                'info': this.description,
            }
        )
    );
    
    // Store
    this.el.l.p = this.el.m.find('#' + selector + "-log");
    this.el.l.w = this.el.l.p.find('ul.logwrap');
    this.el.u = this.el.m.find('#' + selector + "-users");
    
    // Max user list width;
    this.mulw = parseInt(this.el.u.css('max-width').slice(0,-2));
    
    this.built = true;
};

/**
 * Resize the feed reader
 * @method resize
 */
Chatterbox.Feed.prototype.resize = function( width, height ) {

    // TODO: Figure out what we should actually be doing here.
    Chatterbox.BaseTab.prototype.resize.call( this, width, height );

};

/**
 * Add a feed item to the interface.
 * @method add_item
 * @param item {Object} Object representing a feed item
 * @return {Object} Object representing the item in the UI
 */
Chatterbox.Feed.prototype.add_item = function( item ) {

    item = Object.extend( {
        ref: 'item0001',
        icon: '',
        title: 'Feed Item 0001',
        content: '<p>This is a feed item</p>'
    }, item );
    
    var ihtml = Chatterbox.render( 'feedmsg', item );
    
    this.el.l.w.prepend( ihtml );
    
    var iui = this.el.l.w.find( 'li#' + item.ref );
    
    // Add some event hooks to close/remove items!
    
    return iui;

};
