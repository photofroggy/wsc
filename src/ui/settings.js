/**
 * Settings popup window.
 * Provides stuff for doing things. Yay.
 *
 * @class Settings
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Settings = function( ui ) {

    this.manager = ui;

};


/**
 * Settings options object.
 * Extensions can configure the settings window with this shit yo.
 * 
 * @class SettingsConfig
 * @constructor
 */
Chatterbox.SettingsConfig = function() {

    this.pages = [];

};

/**
 * Find a settings page that has the given name.
 * 
 * @method find_page
 * @param name {String} Settings page to search for.
 * @return {Chatterbox.SettingsPage} Settings page object. Returns null if
 *   no such page exists.
 */
Chatterbox.SettingsConfig.prototype.find_page = function( name ) {

    n = name.toLowerCase();
    
    for( index in this.pages ) {
    
        page = this.pages[index];
        if( page.lname == n )
            return page;
    
    }
    
    return null;

};

/**
 * Get or set a settings page.
 * 
 * @method page
 * @param name {String} Name of the page to get or set.
 * @param [page] {Chatterbox.SettingsPage} Settings page object to associate
 *   with the given name.
 * @return {Chatterbox.SettingsPage} Settings page associated with `name`.
 */
Chatterbox.SettingsConfig.prototype.page = function( name, page ) {

    if( page == undefined ) {
        page = this.find_page(name);
        if( page == null ) {
            page = new Chatterbox.SettingsPage(name);
            this.pages.unshift(page);
        }
    }
    return page;

};


/**
 * Settings page config object.
 * 
 * @class SettingsPage
 * @constructor
 * @param name {String} Name of the page.
 */
Chatterbox.SettingsPage = function( name ) {

    this.name = name;
    this.lname = name.toLowerCase();
    this.items = [];

};

/**
 * Return the settings page rendered as an html string.
 * 
 * @method render
 * @return {String} Settings page HTML.
 */
Chatterbox.SettingsPage.prototype.render = function() {



};

