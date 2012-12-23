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

    Chatterbox.Popup.call( this, ui, {
        'ref': 'settings',
        'title': 'Settings',
        'close': false,
        'content': ''
    } );
    
    this.config = config;
    this.saveb = null;
    this.scb = null;
    this.tabs = null;
    this.book = null;
    this.changed = false;

};

Chatterbox.Settings.prototype = new Chatterbox.Popup();
Chatterbox.Settings.prototype.constructor = Chatterbox.Settings;

/**
 * Build the settings window.
 * 
 * @method build
 */
Chatterbox.Settings.prototype.build = function(  ) {

    this.options.content = Chatterbox.template.settings.main;
    Chatterbox.Popup.prototype.build.call(this);
    this.saveb = this.window.find('a.button.save');
    this.closeb = this.window.find('a.close');
    this.scb = this.window.find('a.button.saveclose');
    this.tabs = this.window.find('nav.tabs ul.tabs');
    this.book = this.window.find('div.book');
    
    this.config.build(this);
    
    this.window.find('ul.tabs li').first().addClass('active');
    this.window.find('div.book div.page').first().addClass('active');
    
    var settings = this;
    this.window.find('form').bind('change', function(  ) { settings.changed = true; });
    
    this.saveb.click(
        function( event ) {
            settings.save();
            return false;
        }
    );
    
    this.closeb.click(
        function( event ) {
            if( settings.changed ) {
                if( !confirm( 'Are you sure? You will lose any unsaved changes.') )
                    return false;
            }
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

    var inner = this.window.find('.inner');
    var head = inner.find('h2');
    var wrap = inner.find('.bookwrap');
    var foot = inner.find('footer');
    wrap.height(inner.height() - foot.outerHeight() - head.outerHeight() - 15);
    this.book.height(wrap.innerHeight() - this.tabs.outerHeight() - 25);
    this.config.resize();

};

/**
 * Switch the window to view the given page.
 * 
 * @method switch_page
 * @param page {Object} Settings window page object. This should be the page
 *   that you want to bring into focus.
 */
Chatterbox.Settings.prototype.switch_page = function( page ) {

    var active = this.tabs.find('li.active').first();
    var activeref = active.prop('id').split('-', 1)[0];
    active = this.config.page(activeref.split('_').join(' '));
    active.hide();
    page.show();

};

/**
 * Save settings.
 * 
 * @method save
 */
Chatterbox.Settings.prototype.save = function(  ) {

    this.config.save(this);
    this.changed = false;

};

/**
 * Close settings.
 * 
 * @method close
 */
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
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Config.prototype.resize = function(  ) {

    for( i in this.pages ) {
    
        this.pages[i].resize();
    
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

    var page = this.find_page(name);
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

/**
 * Save settings.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Config.prototype.save = function( window ) {

    for( i in this.pages ) {
    
        this.pages[i].save(window);
    
    }

};

/**
 * Close settings.
 * 
 * @method close
 * @param window {Object} The settings window.
 */
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

    var tab = replaceAll(Chatterbox.template.settings.tab, '{ref}', this.ref);
    tab = replaceAll(tab, '{name}', this.name);
    var page = replaceAll(Chatterbox.template.settings.page, '{ref}', this.ref);
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
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Page.prototype.resize = function(  ) {

    for( i in this.items ) {
    
        this.items[i].resize();
    
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
    
    this.resize();

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
    var item = Chatterbox.Settings.Item.get( type, options );
    
    if( shift ) {
        this.items.unshift(item);
    } else {
        this.items.push(item);
    }
    
    return item;

};

/**
 * Save page data.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Page.prototype.save = function( window ) {

    for( i in this.items ) {
    
        this.items[i].save(window, this);
    
    }

};

/**
 * Window closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 */
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
    this.selector = this.type.toLowerCase();
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
    
    if( content.length == 0 )
        return;
    
    wclass = '';
    if( this.options.hasOwnProperty('wclass') )
        wclass = ' ' + this.options.wclass;
    
    item = Chatterbox.render('settings.item.wrap', {
        'type': this.type.toLowerCase().split('.').join('-'),
        'ref': this.options.ref,
        'class': wclass
    });
    
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
        sitem = Chatterbox.Settings.Item.get( type, options );
        
        cls = [ 'stacked' ];
        if( sitem.options.wclass )
            cls.push(sitem.options.wclass);
        sitem.options.wclass = cls.join(' ');
        
        sitem.build(this.view);
        this.items.push(sitem);
    
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

    return Chatterbox.render('settings.item.' + this.selector, this.options);

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.prototype.resize = function(  ) {

    for( i in this.items ) {
    
        this.items[i].resize();
    
    }

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
    
    var events = this.options.event;
    var titem = Chatterbox.template.settings.item.get(this.selector);
    
    if( titem == false )
        return;
    
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

/**
 * Get an item event callback.
 * 
 * @method _get_cb
 * @param event {String} Item event to get callbacks for.
 * @return {Function} Item event callback.
 */
Chatterbox.Settings.Item.prototype._get_cb = function( event ) {

    if( !this.options.hasOwnProperty('event') )
        return this._event_stub;
    
    return this.options.event[event] || this._event_stub;

};

/**
 * Get an item event pair.
 * 
 * @method _get_ep
 * @param event {String} Item event to get an event pair for.
 * @return {Function} Item event pair.
 */
Chatterbox.Settings.Item.prototype._get_ep = function( event ) {

    var titem = Chatterbox.template.settings.item.get(this.selector);
    
    if( titem == null )
        return false;
    
    if( !titem.hasOwnProperty('events') )
        return false;
    
    for( i in titem.events ) {
    
        pair = titem.events[i];
        
        if( pair[0] == event )
            return pair;
    
    }

};

/**
 * Save page item data.
 * 
 * @method save
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.prototype.save = function( window, page ) {

    var pair = this._get_ep('inspect');
    var inps = pair == false ? null : this.view.find(pair[1]);
    var cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
    } else {
        for( i in cb ) {
            var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
            cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
        }
    }
    
    for( i in this.items ) {
    
        this.items[i].save( window, page );
    
    }

};

/**
 * Called when the settings window is closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.prototype.close = function( window, page ) {

    pair = this._get_ep('inspect');
    inps = pair == false ? null : this.view.find(pair[1]);
    cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
        return;
    }
    
    for( i in cb ) {
        sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
        cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
    }
    
    for( i in this.items ) {
    
        this.items[i].close( window, page );
    
    }

};

/* Create a new Settings Item object.
 * 
 * @method get
 * @param type {String} The type of item to create.
 * @param options {Object} Item options.
 * @param [base] {Object} Object to fetch the item from. Defaults to
     `Chatterbox.Settings.Item`.
 * @param [defaultc] {Class} Default class to use for the item.
 * @return {Object} Settings item object.
 */
Chatterbox.Settings.Item.get = function( type, options, base, defaultc ) {

    types = type.split('.');
    item = base || Chatterbox.Settings.Item;
    
    for( i in types ) {
        cls = types[i];
        if( !item.hasOwnProperty( cls ) ) {
            item = defaultc || Chatterbox.Settings.Item;
            break;
        }
        item = item[cls];
    }
    
    return new item( type, options );

};


/**
 * HTML form as a single settings page item.
 * This item should be given settings items to use as form fields.
 * 
 * @class Form
 * @constructor
 * @param type {String} The type of item this item is.
 * @param options {Object} Item options.
 */
Chatterbox.Settings.Item.Form = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.form = null;
    this.fields = [];
    this.lsection = null;
    this.fsection = null;

};

Chatterbox.Settings.Item.Form.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Form.prototype.constructor = Chatterbox.Settings.Item.Form;

/*
 * Create a form field object.
 * 
 * @method field
 * @param type {String} The type of form field to get.
 * @param options {Object} Field options.
 * @return {Object} Form field object.
 */
Chatterbox.Settings.Item.Form.field = function( type, options ) {

    return Chatterbox.Settings.Item.get( type, options, Chatterbox.Settings.Item.Form, Chatterbox.Settings.Item.Form.Field );

};

/**
 * Build the form.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Form.prototype.build = function( page ) {

    Chatterbox.Settings.Item.prototype.build.call(this, page);
    
    if( this.view == null )
        return;
    
    this.lsection = this.view.find('section.labels');
    this.fsection = this.view.find('section.fields');
    
    if( !this.options.hasOwnProperty('fields') )
        return;
    
    for( i in this.options.fields ) {
        f = this.options.fields[i];
        field = Chatterbox.Settings.Item.Form.field( f[0], f[1] );
        this.fields.push( field );
        field.build( this );
    }
    
    this.form = this.view.find('form');
    var form = this;
    this.form.bind('change', function( event ) { form.change(); });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.prototype.resize = function(  ) {

    for( i in this.fields ) {
    
        this.fields[i].resize();
    
    }

};

/**
 * Called when there is a change in the form.
 * 
 * @method change
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.change = function(  ) {

    data = {};
    
    for( i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    cb = this._get_cb('change');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this } );
    } else {
        for( i in cb ) {
            cb[i]( { 'data': data, 'form': this } );
        }
    }

};

/**
 * Save form data.
 * 
 * @method save
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this form belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.save = function( window, page ) {

    var data = {};
    
    for( i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( i in cb ) {
            cb[i]( { 'data': data, 'form': this, 'page': page, 'window': window } );
        }
    }

};

/**
 * Called when the settings window is closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.close = function( window, page ) {

    data = {};
    
    for( i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( i in cb ) {
            cb[i]( { 'data': data, 'form': this, 'page': page, 'window': window } );
        }
    }

};


/**
 * Base class for form fields.
 * 
 * @class Field
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Field = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.ref = this.options['ref'] || 'ref';
    this.label = null;
    this.field = null;
    this.value = '';

};

Chatterbox.Settings.Item.Form.Field.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Form.Field.prototype.constructor = Chatterbox.Settings.Item.Form.Field;

/**
 * Build the form field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Field.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || '',
            'class': (this.options['class'] ? ' ' + this.options['class'] : '')
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.' + this.selector, this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('.'+this.ref);
    this.view = this.fwrap;
    var field = this;
    this.value = this.field.val();
    this.field.bind('change', function( event ) {
        field.value = field.view.find(this).val();
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Field.prototype.resize = function(  ) {

    this.lwrap.height( this.field.height() );

};

/**
 * Get field data.
 * 
 * @method get
 * @return {Object} data.
 */
Chatterbox.Settings.Item.Form.Field.prototype.get = function(  ) {

    return this.value;

};


/**
 * Form radio field.
 * 
 * @class Radio
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Radio = function( type, options ) {

    options = options || {};
    options['class'] = ( options['class'] ? (options['class'] + ' ') : '' ) + 'box';
    Chatterbox.Settings.Item.Form.Field.call(this, type, options);
    this.items = {};
    this.value = '';

};

Chatterbox.Settings.Item.Form.Radio.prototype = new Chatterbox.Settings.Item.Form.Field();
Chatterbox.Settings.Item.Form.Radio.prototype.constructor = Chatterbox.Settings.Item.Form.Radio;

/**
 * Build the radio field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Radio.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || ''
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.ref;
            this.items[item.ref] = '';
        }
    }
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.radio', this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('input:radio');
    this.value = this.fwrap.find('input[checked]:radio').val();
    
    var radio = this;
    this.field.bind('change', function( event ) {
        radio.value = radio.fwrap.find(this).val();
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Radio.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.find('.radiobox').height() );

};

/**
 * Get field data.
 * 
 * @method get
 * @return {Object} data.
 */
Chatterbox.Settings.Item.Form.Radio.prototype.get = function(  ) {

    return this.value;

};


/**
 * Form checkbox field.
 * 
 * @class Check
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Check = function( type, options ) {

    Chatterbox.Settings.Item.Form.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Form.Check.prototype = new Chatterbox.Settings.Item.Form.Radio();
Chatterbox.Settings.Item.Form.Check.prototype.constructor = Chatterbox.Settings.Item.Form.Check;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Check.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || ''
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.ref;
            this.items[item.ref] = '';
        }
    }
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.check', this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('input:checkbox');
    var check = this;
    this.value = [];
    this.fwrap.find('input[checked]:checkbox').each(function(  ) {
        check.value.push(check.fwrap.find(this).val());
    });
    
    this.field.bind('change', function( event ) {
        check.value = [];
        check.fwrap.find('input[checked]:checkbox').each(function(  ) {
            check.value.push(check.fwrap.find(this).val());
        });
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Check.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.find('.checkbox').height() );

};


/**
 * Radio box item.
 * 
 * @class Radio
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Radio = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.value = '';

};

Chatterbox.Settings.Item.Radio.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Radio.prototype.constructor = Chatterbox.Settings.Item.Radio;

/**
 * Build the radio field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Radio.prototype.build = function( page ) {

    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.options['ref'] || 'ref';
        }
    }
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    this.field = this.view.find('input:radio');
    this.value = this.view.find('input[checked]:radio').val();
    
    var radio = this;
    this.field.bind('change', function( event ) {
        radio.value = radio.view.find(this).val();
    });

};


/**
 * Check box item.
 * 
 * @class Check
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Check = function( type, options ) {

    Chatterbox.Settings.Item.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Check.prototype = new Chatterbox.Settings.Item.Radio();
Chatterbox.Settings.Item.Check.prototype.constructor = Chatterbox.Settings.Item.Check;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Check.prototype.build = function( page ) {

    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.options['ref'] || 'ref';
        }
    }
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    this.field = this.view.find('input:checkbox');
    var check = this;
    this.value = [];
    this.view.find('input[checked]:checkbox').each(function(  ) {
        check.value.push(check.view.find(this).val());
    });
    
    this.field.bind('change', function( event ) {
        check.value = [];
        check.view.find('input[checked]:checkbox').each(function(  ) {
            check.value.push(check.view.find(this).val());
        });
    });

};

/**
 * Get field data.
 * 
 * @method get
 * @return {Object} data.
 */
Chatterbox.Settings.Item.Form.Field.prototype.get = function(  ) {

    return this.value;

};



