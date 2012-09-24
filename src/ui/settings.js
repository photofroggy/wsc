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
    swindow = Chatterbox.template.settings.main;
    wrap = replaceAll(wrap, '{content}', swindow);
    wrap = replaceAll(wrap, '{ref}', 'settings');
    
    this.manager.view.append(wrap);
    this.window = this.manager.view.find('.floater.settings');
    this.saveb = this.window.find('a.button.save');
    this.closeb = this.window.find('a.button.close');
    this.scb = this.window.find('a.button.saveclose');
    this.tabs = this.window.find('nav.tabs ul.tabs');
    this.book = this.window.find('div.book');
    
    this.config.build(this);
    
    //this.window.draggable();
    this.window.find('ul.tabs li').first().addClass('active');
    this.window.find('div.book div.page').first().addClass('active');
    
    var settings = this;
    this.saveb.click(
        function( event ) {
            settings.save();
            return false;
        }
    );
    
    this.closeb.click(
        function( event ) {
            settings.close();
            return false;
        }
    );
    this.scb.click(
        function( event ) {
            settings.save();
            settings.close();
            return false;
        }
    );
    
    this.resize();

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.prototype.resize = function(  ) {

    inner = this.window.find('.inner');
    head = inner.find('h2');
    wrap = inner.find('.bookwrap');
    foot = inner.find('footer');
    wrap.height(inner.height() - foot.outerHeight() - head.outerHeight() - 15);
    this.book.height(wrap.innerHeight() - this.tabs.outerHeight() - 25);

};

/**
 * Switch the window to view the given page.
 * 
 * @method switch_page
 * @param page {Object} Settings window page object. This should be the page
 *   that you want to bring into focus.
 */
Chatterbox.Settings.prototype.switch_page = function( page ) {

    active = this.tabs.find('li.active').first();
    activeref = active.prop('id').split('-', 1)[0];
    active = this.config.page(activeref.split('_').join(' '));
    active.hide();
    page.show();

};

Chatterbox.Settings.prototype.save = function(  ) {

    this.config.save(this);

};

Chatterbox.Settings.prototype.close = function(  ) {

    this.window.remove();
    this.manager.nav.settings.open = false;
    this.manager.nav.settings.window = null;
    this.config.close(this);

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
 * Render and display the settings pages in the given settings window.
 * 
 * @method build
 * @param window {Object} Settings window object.
 */
Chatterbox.Settings.Config.prototype.build = function( window ) {

    for( i in this.pages ) {
    
        this.pages[i].build(window);
    
    }

};

/**
 * Get a settings page.
 * 
 * @method page
 * @param name {String} Name of the page to get or set.
 * @param [push=false] {Boolean} When adding the page, should push be used in
 *   place of unshift? Default is `false`, meaning use unshift.
 * @return {Chatterbox.Settings.Page} Settings page associated with `name`.
 */
Chatterbox.Settings.Config.prototype.page = function( name, push ) {

    page = this.find_page(name);
    push = push || false;
    
    if( page == null ) {
        page = new Chatterbox.Settings.Page(name);
        if( push ) {
            this.pages.push(page);
        } else {
            this.pages.unshift(page);
        }
    }
    
    return page;

};

Chatterbox.Settings.Config.prototype.save = function( window ) {

    for( i in this.pages ) {
    
        this.pages[i].save(window);
    
    }

};

Chatterbox.Settings.Config.prototype.close = function( window ) {

    for( i in this.pages ) {
    
        this.pages[i].close(window);
    
    }

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
 * Render and display the settings page in the given settings window.
 * 
 * @method build
 * @param window {Object} Settings window object.
 */
Chatterbox.Settings.Page.prototype.build = function( window ) {

    tab = replaceAll(Chatterbox.template.settings.tab, '{ref}', this.ref);
    tab = replaceAll(tab, '{name}', this.name);
    page = replaceAll(Chatterbox.template.settings.page, '{ref}', this.ref);
    page = replaceAll(page, '{page-name}', this.name);
    window.tabs.append(tab);
    window.book.append(page);
    
    this.view = window.book.find('div#' + this.ref + '-page');
    this.tab = window.tabs.find('li#' + this.ref + '-tab');
    
    var page = this;
    this.tab.find('a').click(
        function( event ) {
            if( page.tab.hasClass('active') )
                return false;
            window.switch_page(page);
            return false;
        }
    );
    
    this.content();

};

/**
 * Display the page's contents.
 * 
 * @method content
 */
Chatterbox.Settings.Page.prototype.content = function(  ) {
    
    for( i in this.items ) {
    
        this.items[i].build(this.view);
    
    }

};

/**
 * Bring the page into view.
 * 
 * @method show
 */
Chatterbox.Settings.Page.prototype.show = function(  ) {

    if( !this.tab.hasClass('active') )
        this.tab.addClass('active');
    
    if( !this.view.hasClass('active') )
        this.view.addClass('active');

};

/**
 * Hide the page from view.
 * 
 * @method hide
 */
Chatterbox.Settings.Page.prototype.hide = function(  ) {

    if( this.tab.hasClass('active') )
        this.tab.removeClass('active');
    
    if( this.view.hasClass('active') )
        this.view.removeClass('active');

};

/**
 * Add an item to the page.
 * 
 * @method item
 * @param type {String} The type of item to add to the page.
 * @param options {Object} Item options.
 * @param [shift=false] {Boolean} Should unshift be used when adding the item?
 * @return {Object} A settings page item object.
 */
Chatterbox.Settings.Page.prototype.item = function( type, options, shift ) {

    shift = shift || false;
    item = new ( Chatterbox.Settings.Item[type[0].toUpperCase() + type.substr(1)] || Chatterbox.Settings.Item )( type, options );
    
    if( shift ) {
        this.items.unshift(item);
    } else {
        this.items.push(item);
    }
    
    return item;

};

Chatterbox.Settings.Page.prototype.save = function( window ) {

    for( i in this.items ) {
    
        this.items[i].save(window, this);
    
    }

};

Chatterbox.Settings.Page.prototype.close = function( window ) {

    for( i in this.items ) {
    
        this.items[i].close(window, this);
    
    }

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
    this.items = [];
    this.view = null;

};

/**
 * Render and display the settings page item.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.prototype.build = function( page ) {

    if( !this.options.hasOwnProperty('ref') )
        return;
    
    content = this.content();
    
    if( content === false )
        return;
    
    item = replaceAll(Chatterbox.template.settings.item.wrap, '{type}', this.type);
    item = replaceAll(item, '{ref}', this.options.ref);
    item = replaceAll(item, '{class}', (this.options['wclass'] || ''));
    item = replaceAll(item, '{content}', content);
    page.append(item);
    this.view = page.find('.item.'+this.options.ref);
    this.hooks(this.view);
    
    if( !this.options.hasOwnProperty('subitems') )
        return;
    
    for( i in this.options.subitems ) {
    
        iopt = this.options.subitems[i];
        type = iopt[0];
        options = iopt[1];
        item = new ( Chatterbox.Settings.Item[type[0].toUpperCase() + type.substr(1)] || Chatterbox.Settings.Item )( type, options );
        item.build(page.find('.item.' + this.ref + ' div.item.sub#' + String(i)));
    
    }

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
        content = replaceAll( content, key[1], ( key[2] || stub )( ( this.options[key[0]] || '' ) ) );
    
    }
    
    return content;

};

/**
 * Apply event callbacks to the page item.
 * 
 * @method hooks
 * @param item {Object} Page item jQuery object.
 */
Chatterbox.Settings.Item.prototype.hooks = function( item ) {

    if( !this.options.hasOwnProperty('event') )
        return;
    
    events = this.options.event;
        
    if( !Chatterbox.template.settings.item.hasOwnProperty(this.type) )
        return;
    
    titem = Chatterbox.template.settings.item[this.type];
    
    if( !titem.hasOwnProperty('events') )
        return;
    
    for( i in titem.events ) {
    
        pair = titem.events[i];
        
        if( !events.hasOwnProperty(pair[0]) )
            continue;
        
        item.find(pair[1]).bind(pair[0], events[pair[0]]);
    
    }

};

/**
 * Method stub for UI events.
 * 
 * @method _event_stub
 */
Chatterbox.Settings.Item.prototype._event_stub = function(  ) {};

Chatterbox.Settings.Item.prototype._get_cb = function( event ) {

    if( !this.options.hasOwnProperty('event') )
        return this._event_stub;
    
    return this.options.event[event] || this._event_stub;

};

Chatterbox.Settings.Item.prototype._get_ep = function( event ) {

    if( !Chatterbox.template.settings.item.hasOwnProperty(this.type) )
        return false;
    
    titem = Chatterbox.template.settings.item[this.type];
    
    if( !titem.hasOwnProperty('events') )
        return false;
    
    for( i in titem.events ) {
    
        pair = titem.events[i];
        
        if( pair[0] == event )
            return pair;
    
    }

};

Chatterbox.Settings.Item.prototype.save = function( window, page ) {

    pair = this._get_ep('inspect');
    inps = pair == false ? null : this.view.find(pair[1]);
    closecb = this._get_cb('save')( { 'input': inps, 'item': this, 'page': page, 'window': window } );

};

Chatterbox.Settings.Item.prototype.close = function( window, page ) {

    pair = this._get_ep('inspect');
    inps = pair == false ? null : this.view.find(pair[1]);
    closecb = this._get_cb('close')( { 'input': inps, 'item': this, 'page': page, 'window': window } );

};


/**
 * Drop down menu as a settings page item.
 * 
 * @class Dropdown
 * @constructor
 * @param type {String} The type of item this item is.
 * @param options {Object} Item options.
 */
Chatterbox.Settings.Item.Dropdown = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);

};

Chatterbox.Settings.Item.Dropdown.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Dropdown.prototype.constructor = Chatterbox.Settings.Item.Dropdown;
/*
Chatterbox.Settings.Item.Dropdown.prototype.hooks = function( item ) {

    if( !this.options.hasOwnProperty('event') )
        return;
    
    events = this.options.event;
    
    if( events.hasOwnProperty('change') ) {
    
        item.find('select').bind('change', events.change);
    
    }

};*/



