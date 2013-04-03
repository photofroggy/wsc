/**
 * Navigation UI element. Provides helpers for controlling the chat navigation.
 *
 * @class Chatterbox.Navigation
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Navigation = function( ui ) {

    this.manager = ui;
    this.showclose = this.manager.settings.tabclose;
    this.settings = {};
    this.settings.open = false;
    
    /* UI Elements
     * Something similar to the channel elements object.
     */
    this.el = {
        n: this.manager.view.find('nav.tabs'),                            // Navigation bar
        tw: this.manager.view.find('nav.tabs div.tabwrap'),
        t: this.manager.view.find('nav.tabs #chattabs'),                  // Tabs
        b: this.manager.view.find('nav.tabs #tabnav'),                    // Buttons
        l: this.manager.view.find('nav.tabs #tabnav .arrow_left'),        // Tab left navigation button
        r: this.manager.view.find('nav.tabs #tabnav .arrow_right'),       // Tab right.
        s: this.manager.view.find('nav.tabs #tabnav #settings-button'),   // Settings
        side: this.manager.view.find('nav.channels'),                     // Nav side bar
        sideb: this.manager.view.find('nav.tabs #chattabs .chans'),   // Side bar button
    };
    
    this.side = false;
    var shift = this.el.side.outerWidth(true) * -1;
    this.el.side.css( {
        'left': shift,
        'margin-right': shift
    } );
    
    if( !this.showclose ) {
        if( !this.el.t.hasClass('hc') )
            this.el.t.addClass('hc');
    }
    
    var nav = this;
    this.el.s.click(
        function( event ) {
            if( nav.settings.open )
                return false;
            
            var evt = {
                'e': event,
                'settings': new Chatterbox.Settings.Config(nav.manager)
            };
            
            nav.configure_page( evt );
            nav.manager.trigger('settings.open', evt);
            nav.manager.trigger('settings.open.ran', evt);
            
            var about = evt.settings.page('About');
            about.item('text', {
                'ref': 'about-chatterbox',
                'wclass': 'centered faint',
                'text': 'Using <a href="http://github.com/photofroggy/wsc/">Chatterbox</a> version ' + Chatterbox.VERSION + ' ' + Chatterbox.STATE + ' by ~<a href="http://photofroggy.deviantart.com/">photofroggy</a>.'
            });
            
            nav.settings.window = new Chatterbox.Settings( nav.manager, evt.settings );
            nav.settings.window.build();
            nav.settings.open = true;
            return false;
        }
    );
    
    this.el.l.click(
        function(  ) {
            nav.manager.channel_left();
            return false;
        }
    );
    
    this.el.r.click(
        function(  ) {
            nav.manager.channel_right();
            return false;
        }
    );
    
    this.el.sideb.find('a.tab').click(function(){
        nav.toggle_sidebar();
        return false;
    });

};

/**
 * Configure the main settings page of the settings popup.
 *
 * @method configure_page
 * @param event {Object} Event object.
 */
Chatterbox.Navigation.prototype.configure_page = function( event ) {

    var ui = this.manager;
    var page = event.settings.page('Main');
    var orig = {};
    orig.theme = replaceAll(ui.settings.theme, 'wsct_', '');
    orig.clock = ui.clock();
    orig.tc = ui.nav.closer();
    
    var themes = [];
    for( i in ui.settings.themes ) {
        name = replaceAll(ui.settings.themes[i], 'wsct_', '');
        themes.push({ 'value': name, 'title': name, 'selected': orig.theme == name })
    }
    
    page.item('Form', {
        'ref': 'ui',
        'title': 'UI',
        'hint': '<b>Timestamp</b><br/>Choose between a 24 hour clock and\
                a 12 hour clock.\n\n<b>Theme</b><br/>Change the look of the\
                client.\n\n<b>Close Buttons</b><br/>Turn tab close buttons on/off.',
        'fields': [
            ['Dropdown', {
                'ref': 'theme',
                'label': 'Theme',
                'items': themes
            }],
            ['Dropdown', {
                'ref': 'clock',
                'label': 'Timestamp Format',
                'items': [
                    { 'value': '24', 'title': '24 hour', 'selected': orig.clock },
                    { 'value': '12', 'title': '12 hour', 'selected': !orig.clock }
                ]
            }],
            ['Checkbox', {
                'ref': 'tabclose',
                'label': 'Close Buttons',
                'items': [
                    { 'value': 'yes', 'title': 'On', 'selected': orig.tc }
                ]
            }],
        ],
        'event': {
            'change': function( event ) {
                ui.clock(event.data.clock == '24');
                ui.theme(event.data.theme);
                ui.nav.closer(event.data.tabclose.indexOf('yes') > -1);
            },
            'save': function( event ) {
                orig.clock = ui.clock();
                orig.theme = replaceAll(ui.theme(), 'wsct_', '');
                orig.tc = ui.nav.closer();
                
                ui.trigger('settings.save.ui', {
                    'clock': orig.clock,
                    'tabclose': orig.tc,
                    'theme': 'wsct_' + orig.theme
                } );
            },
            'close': function( event ) {
                ui.clock(orig.clock);
                ui.theme(orig.theme);
                ui.nav.closer(orig.tc);
            }
        }
    });

};

/**
 * Get the height of the navigation bar.
 *
 * @method height
 * @return {Integer} The height of the navigation bar in pixels.
 */
Chatterbox.Navigation.prototype.height = function(  ) {
    var h = this.el.n.outerHeight();
    return h;
};

/**
 * Add a button to the top button row.
 *
 * @method add_button
 */
Chatterbox.Navigation.prototype.add_button = function( options ) {

    options = Object.extend( {
        'label': 'New',
        'icon': false,
        'href': '#button',
        'title': 'Button.',
        'handler': function(  ) {}
    }, ( options || {} ) );
    
    if( options.icon !== false ) {
        options.icon = ' iconic ' + options.icon;
    } else {
        options.icon = ' text';
    }
    
    this.el.b.prepend(Chatterbox.render('nav_button', options));
    var button = this.el.b.find('a[href='+options.href+'].button');
    
    button.click( function( event ) {
        options['handler']();
        return false;
    } );
    
    this.resize();
    
    return button;

};

/**
 * Add a channel tab to the navigation bar.
 * 
 * @method add_tab
 * @param selector {String} Shorthand lower case name for the channel with no prefixes.
 * @param ns {String} Shorthand namespace for the channel. Used as the label
 *   for the tab.
 */
Chatterbox.Navigation.prototype.add_tab = function( selector, ns ) {
    this.el.t.append(Chatterbox.render('tab', {'selector': selector, 'ns': ns}));
    return this.el.t.find('#' + selector + '-tab');
};

/**
 * Resize the tab bar.
 * 
 * @method resize
 */
Chatterbox.Navigation.prototype.resize = function(  ) {

    var w = this.el.n.width() - this.el.b.outerWidth() - 20;
    var h = ((this.manager.view.parent().height() - this.height()) - this.manager.control.height()) - 8;
    
    this.el.tw.width( w );
    this.el.t.width( w );
    if( this.settings.open ) {
        this.settings.window.resize();
    }
    
    this.el.side.height(h);
    

};

/**
 * Get the width of the tab list.
 * 
 * @method listwidth
 * @return {Integer} Width of the channel list, in pixels
 */
Chatterbox.Navigation.prototype.listwidth = function(  ) {

    return this.side ? this.manager.view.find('nav.channels').outerWidth(true) : 0;

};

/**
 * Show or hide the side bar.
 * 
 * @method toggle_sidebar
 * @param [show] {Object} Show or hide the side bar
 */
Chatterbox.Navigation.prototype.toggle_sidebar = function( show ) {

    if( show === undefined )
        show = !this.side;
    
    this.side = show;
    
    if( show ) {
    
        this.el.sideb.removeClass('noise chatting tabbed fill');
        this.el.side.css( {
            'left': 0,
            'margin-right': 5
        } );
        
        this.manager.resize();
        
        return;
    
    }
    
    var shift = this.el.side.outerWidth(true) * -1;
    this.el.side.css( {
        'left': shift,
        'margin-right': shift
    } );
    
    this.manager.resize();

};

/**
 * Set or get the visibility of tab close buttons.
 * 
 * @method closer
 * @param [visible] {Boolean} Should the close buttons be shown?
 * @return {Boolean} Whether or not the close buttons are visible.
 */
Chatterbox.Navigation.prototype.closer = function( visible ) {

    if( visible == undefined || visible == this.showclose )
        return this.showclose;
    
    this.showclose = visible;
    if( this.showclose ) {
        if( !this.el.t.hasClass('hc') )
            return;
        this.el.t.removeClass('hc');
        return;
    }
    
    if( this.el.t.hasClass('hc') )
        return;
    this.el.t.addClass('hc');

};


