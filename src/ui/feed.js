
/**
 * Object for managing feed interfaces.
 * 
 * @class Chatterbox.Feed
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the feed this object will represent.
 */
Chatterbox.Feed = function( ui, ns ) {
    Chatterbox.BaseTab.call( this, ui, ns );
    this.name = this.namespace.substr(1);
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
                'type': 'quiet',
                'name': this.name,
                'info': 'This is a test of how things will look. You are registered as a <em>Publisher</em>. You can <em>read</em> and <em>post messages</em>.',
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
Chatterbox.Feed.prototype.resize = function(  ) {

    // TODO: Figure out what we should actually be doing here.

};

