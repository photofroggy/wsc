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

    this.manager = ui;

};

/**
 * Build the settings window.
 * 
 * @method build
 */
Chatterbox.Settings.prototype.build = function(  ) {



};


/**
 * Settings options object.
 * Extensions can configure the settings window with this shit yo.
 * 
 * @class Settings.Config
 * @constructor
 */
Chatterbox.Settings.Config = function(  ) {

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

    n = name.toLowerCase();
    
    for( index in this.pages ) {
    
        page = this.pages[index];
        if( page.lname == n )
            return page;
    
    }
    
    return null;

};

/**
 * Return the settings pages rendered as html strings.
 * 
 * @method render
 * @return {Array} Settings pages HTML array.
 */
Chatterbox.Settings.Config.prototype.render = function(  ) {



};

/**
 * Get a settings page.
 * 
 * @method page
 * @param name {String} Name of the page to get or set.
 * @return {Chatterbox.Settings.Page} Settings page associated with `name`.
 */
Chatterbox.Settings.Config.prototype.page = function( name ) {

    page = this.find_page(name);
    
    if( page == null ) {
        page = new Chatterbox.Settings.Page(name);
        this.pages.unshift(page);
    }
    
    return page;

};


/**
 * Settings page config object.
 * 
 * @class Settings.Page
 * @constructor
 * @param name {String} Name of the page.
 */
Chatterbox.Settings.Page = function( name ) {

    this.name = name;
    this.lname = name.toLowerCase();
    this.ref = replaceAll(this.lname, ' ', '_');
    //this.content = '';
    this.items = [];

};

/**
 * Return the settings page rendered as an html string.
 * 
 * @method render
 * @return {Array} A pair of HTML strings. The Settings page tab HTML, and the Settings page HTML.
 */
Chatterbox.Settings.Page.prototype.render = function(  ) {

    tab = replaceAll(Chatterbox.template.settings.tab, '{ref}', this.ref);
    tab = replaceAll(tab, '{name}', this.name);
    page = replaceAll(Chatterbox.template.settings.page, '{ref}', this.ref);
    page = replaceAll(page, '{content}', this.content());
    page = replaceAll(page, '{page-name}', this.name);
    return [tab, page];

};

/**
 * Return the page contents rendered as an html string.
 * 
 * @method content
 * @return {String} The contents of the settings page as a string.
 */
Chatterbox.Settings.Page.prototype.content = function(  ) {

    return ''; // stub

};


/**
 * A base class for settings page items.
 * 
 * @class Settings.Item
 * @constructor
 * @param options {Object} Options for the item.
 */
Chatterbox.Settings.Item = function( options ) {

    this.options = options;
    this.type = 'base';

};

/**
 * Returns the settings page item rendered as an html string.
 * 
 * @method render
 * @return {String} Rendered page item.
 */
Chatterbox.Settings.Item.prototype.render = function(  ) {

    if( !this.options.hasOwnProperty('ref') )
        return '';
    
    content = this.content();
    
    if( content === false )
        return '';
    
    item = replaceAll(Chatterbox.template.settings.item, '{type}', this.type);
    item = replaceAll(item, '{ref}', this.options.ref);
    item = replaceAll(item, '{content}', content);
    return item;

};

/**
 * Renders the contents of the settings page item.
 * 
 * @method content
 * @return {Boolean} Returns false if there is no content for this item.
 * @return {String} Returns an HTML string if there is content for this item.
 */
Chatterbox.Settings.Item.prototype.content = function(  ) {

    return false;

};

/**
 * Method stub for UI events.
 * 
 * @method _event_stub
 */
Chatterbox.Settings.Item.prototype._event_stub = function(  ) {};



