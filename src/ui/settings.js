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
    this.config = config;

};

/**
 * Build the settings window.
 * 
 * @method build
 */
Chatterbox.Settings.prototype.build = function(  ) {

    wrap = Chatterbox.template.popup;
    window = Chatterbox.template.settings.main;
    
    pages = this.config.render();
    window = replaceAll(window, '{tabs}', pages[0]);
    window = replaceAll(window, '{pages}', pages[1]);
    wrap = replaceAll(wrap, '{content}', window);
    wrap = replaceAll(wrap, '{ref}', 'settings');
    
    this.manager.append(wrap);
    this.window = this.manager.find('.floater.settings');

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

    pages = ['', ''];
    
    for( i in this.pages ) {
    
        page = this.pages[i];
        parts = page.render();
        pages[0]+= parts[0];
        pages[1]+= parts[1];
    
    }
    
    return pages;

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

    content = '';
    
    for( i in this.items ) {
    
        item = this.items[i];
        content+= item.render();
    
    }
    
    return content;

};

/**
 * Add an item to the page.
 * 
 * @method item
 * @param type {String} The type of item to add to the page.
 * @param options {Object} Item options.
 * @return {Object} A settings page item object.
 */
Chatterbox.Settings.Page.prototype.item = function( type, options ) {

    item = new ( Chatterbox.Settings.Item[type[0].toUpperCase() + type.substr(1)] || Chatterbox.Settings.Item )( type, options );
    this.items.push(item);
    return item;

};


/**
 * A base class for settings page items.
 * 
 * @class Settings.Item
 * @constructor
 * @param type {String} Determines the type of the item.
 * @param options {Object} Options for the item.
 */
Chatterbox.Settings.Item = function( type, options ) {

    this.options = options || {};
    this.type = type || 'base';

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
    
    item = replaceAll(Chatterbox.template.settings.item.wrap, '{type}', this.type);
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

    if( !Chatterbox.template.settings.item.hasOwnProperty(this.type) )
        return false;
    
    item = Chatterbox.template.settings.item[this.type];
    
    if( !item.hasOwnProperty('keys') || !item.hasOwnProperty('frame') )
        return false;
    
    content = item.frame;
    stub = function( item ) { return item; };
    
    for( i in item.keys ) {
    
        key = item.keys[i];
        
        if( !this.options.hasOwnProperty(key[0]) )
            return false;
        
        content = replaceAll( content, key[1], ( key[2] || stub )( this.options[key[0]] ) );
    
    }
    
    return content;

};

/**
 * Method stub for UI events.
 * 
 * @method _event_stub
 */
Chatterbox.Settings.Item.prototype._event_stub = function(  ) {};



