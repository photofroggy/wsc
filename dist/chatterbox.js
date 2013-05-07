/**
 * Chatterbox is wsc's default UI library.
 * 
 * @module Chatterbox
 */
var Chatterbox = {};

Chatterbox.VERSION = '0.19.98';
Chatterbox.STATE = 'beta';

/**
 * This object is the platform for the wsc UI. Everything can be used and
 * loaded from here.
 * 
 * @class Chatterbox.UI
 * @constructor
 * @param client {Object} The client that this UI is attached to.
 * @param view {Object} Base jQuery object to use for the UI. Any empty div will do.
 * @param options {Object} Custom settings to use for the UI.
 * @param mozilla {Boolean} Is the browser in use made by Mozilla?
 * @param [events] {Object} EventEmitter object.
 **/
Chatterbox.UI = function( client, view, options, mozilla, events ) {
    
    this.client = client;
    this.events = events || new EventEmitter();
    this.mozilla = mozilla;
    this.umuted = [];
    this.viewing = true;
    this.settings = {
        'themes': [ 'wsct_dAmn', 'wsct_dark' ],
        'theme': 'wsct_dark',
        'monitor': ['~Monitor', true],
        'username': '',
        'domain': 'website.com',
        'clock': true,
        'tabclose': true,
        'developer': false,
        'media': '/static/'
    };
    
    var ui = this;
    
    /**
     * Sound bank.
     * 
     * Play and manage UI sounds. So far, Chatterbox includes these sounds:
     *
     *      * click
     *
     * To play a sound clip, call the method of the same name. For example, to
     * play the `click` sound, call `ui.sound.click()`.
     * 
     * Note that the sound methods are not documented as they are created on
     * the fly by the `add` method.
     * @class Chatterbox.UI.sound
     */
    this.sound = {
        
        /**
         * Holds references to audio objects.
         * @property bank
         * @type Object
         */
        bank: {
            m: null
        },
        
        /**
         * Add a sound to the sound bank.
         * @method add
         * @param name {String} Name to use for the sound and corresponding method
         * @param sound {Object} Audio DOM object
         * @return {Boolean} Success or fail
         */
        add: function( name, sound ) {
            if( ui.sound.hasOwnProperty( name ) )
                return false;
            
            ui.sound.bank[name] = sound;
            sound.load();
            
            ui.sound[name] = function(  ) {
                ui.sound.play( ui.sound.bank[name] );
            };
            
            return true;
        },
        
        /**
         * Play an audio file.
         * 
         * Do not use this method directly.
         * @method play
         * @param sound {Object} Audio DOM object
         */
        play: function( sound ) {
            sound.pause();
            sound.currentTime = 0;
            sound.play();
        },
        
        /**
         * Mute or unmute the UI.
         * @method toggle
         * @param state {Boolean} True is muted, false is unmuted
         */
        toggle: function( state ) {
            for( var s in ui.sound.bank ) {
                if( !ui.sound.bank.hasOwnProperty( s ) )
                    continue;
                ui.sound.bank[s].muted = state;
            }
        },
        
        /**
         * Shortcut for `sound.toggle( true )`
         * @method mute
         */
        mute: function(  ) { ui.sound.toggle( true ); },
        
        /**
         * Shortcut for `sound.toggle( false )`
         * @method unmute
         */
        unmute: function(  ) { ui.sound.toggle( false ); },
    };
    
    view.extend( this.settings, options );
    view.append('<div class="wsc '+this.settings['theme']+'"></div>');
    
    this.mw = new wsc.Middleware();
    
    this.view = view.find('.wsc');
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.monitoro = null;
    
    this.swidth = ( function() { 
        if ( $.browser.msie ) {
            var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                    .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
                $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                    .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
            scrollbarWidth = $textarea1.width() - $textarea2.width();
            $textarea1.add($textarea2).remove();
        } else {
            var $div = $('<div />')
                .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
                .prependTo('body').append('<div />').find('div')
                    .css({ width: '100%', height: 200 });
            scrollbarWidth = 100 - $div.width();
            $div.parent().remove();
        }
        return scrollbarWidth;
    } ) ();
    
    this.LIB = 'Chatterbox';
    this.VERSION = Chatterbox.VERSION;
    this.STATE = Chatterbox.STATE;
    
};

wsc.defaults.UI = Chatterbox.UI;

/**
 * Used to trigger events.
 *
 * @method trigger
 * @for Chatterbox.UI
 * @param event {String} Name of the event to trigger.
 * @param data {Object} Event data.
 **/
Chatterbox.UI.prototype.trigger = function( event, data ) {

    this.events.emit( event, data, this );

};

/**
 * Bind an event thingy.
 * 
 * @method on
 * @param event {String} The event name to listen for.
 * @param handler {Method} The event handler.
 */
Chatterbox.UI.prototype.on = function( event, handler ) {

    this.events.addListener( event, handler );

};

/**
 * Add a piece of middleware for something.
 * 
 * @method middle
 */
Chatterbox.UI.prototype.middle = function( event, callback ) {

    return this.mw.add( event, callback );

};

/**
 * Run a method with middleware.
 * 
 * @method cascade
 */
Chatterbox.UI.prototype.cascade = function( event, method, data ) {

    this.mw.run( event, method, data );

};

/**
 * Remove all of the event bindings.
 * 
 * @method remove_listeners
 */
Chatterbox.UI.prototype.remove_listeners = function(  ) {
    
    this.events.removeListeners();
    
};

/**
 * Deform a channel namespace.
 *
 * @method deform_ns
 * @param namespace {String} Channel namespace to deform.
 * @return {String} The deformed namespace.
 **/
Chatterbox.UI.prototype.deform_ns = function( namespace ) {

    var sym = namespace[0];
    
    if( sym == '#'
        || sym == '@'
        || sym == '~'
        || sym == '+' )
            return namespace;
    
    if( namespace.indexOf("chat:") == 0 )
        return '#' + namespace.slice(5);
    
    if( namespace.indexOf("server:") == 0 )
        return '~' + namespace.slice(7);
    
    if( namespace.indexOf("feed:") == 0 )
        return '#' + namespace.slice(5);
    
    if( namespace.indexOf('login:') == 0 )
        return '@' + namespace.slice(6);
    
    if( namespace.indexOf("pchat:") == 0 ) {
        var names = namespace.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    return '#' + namespace;
    
};

/**
 * Format a channel namespace.
 *
 * @method format_ns
 * @param namespace {String} Channel namespace to format.
 * @return {String} namespace formatted as a channel namespace.
 */
Chatterbox.UI.prototype.format_ns = function( namespace ) {
    
    var n = namespace.slice( 1 );
    
    switch( namespace[0] ) {
        
        case '@':
            var names = [n, this.lun];
            names.sort(caseInsensitiveSort)
            names.unshift("pchat");
            namespace = names.join(':');
            break;
        
        case '~':
            namespace = "server:" + n;
            break;
        
        case '+':
            namespace = 'feed:' + n
            break;
            
        case '#':
            namespace = 'chat:' + n;
            break;
            
        default:
            if( namespace.indexOf('chat:') == 0
                || namespace.indexOf('pchat:') == 0
                || namespace.indexOf('server:') == 0
                || namespace.indexOf('feed:') == 0 )
                    break;
            namespace = 'chat:' + namespace;
            break;
    }
    
    return namespace;
    
};

/**
 * Set the event emitter object in use by the UI lib.
 * 
 * @method set_events
 * @param events {Object} EventEmitter object.
 */
Chatterbox.UI.prototype.set_events = function( events ) {
    this.events = events || this.events;
};

/**
 * Set the clock to 24 hour or 12 hour. Or get the current mode.
 * True means 24 hour, false means 12 hour.
 * 
 * @method clock
 * @param [mode] {Boolean} What mode to set the clock to.
 * @return {Boolean} The mode of the clock.
 */
Chatterbox.UI.prototype.clock = function( mode ) {

    if( mode === undefined || mode == this.settings.clock )
        return this.settings.clock;
    
    this.settings.clock = mode;
    this.chatbook.retime();
    
    return this.settings.clock;

};

/**
 * Build the GUI.
 * 
 * @method build
 * @param [control=Chatterbox.Control] {Class} UI control panel class.
 * @param [navigation=Chatterbox.Navigation] {Class} UI navigation panel
 *   class.
 * @param [chatbook=Chatterbox.Chatbook] {Class} Chatbook panel class.
 */
Chatterbox.UI.prototype.build = function( control, navigation, chatbook ) {
    
    this.view.append( Chatterbox.render('ui', this.settings) );
    
    // UI Components.
    this.control = new ( control || Chatterbox.Control )( this );
    this.nav = new ( navigation || Chatterbox.Navigation )( this );
    this.chatbook = new ( chatbook || Chatterbox.Chatbook )( this );
    this.pager = new Chatterbox.Pager( this );
    
    // The monitor channel is essentially our console for the chat.
    this.monitoro = this.chatbook.create_channel(this.mns, this.settings.monitor[1], true);
    this.monitoro.show();
    
    //this.control.setInput();
    this.control.focus();
    
    // Sound bank
    this.sound.bank.m = this.view.find('div.soundbank');
    this.sound.add( 'click', this.sound.bank.m.find('audio.click')[0] );
    
    var sound = this.sound;
    
    // Mute button.
    var muted = false;
    var mute = this.nav.add_button({
        'label': '',
        'icon': 'volume',
        'href': '#mute',
        'title': 'Mute the client',
        'handler': function(  ) {
            if( !muted ) {
                sound.mute();
                mute.removeClass( 'volume' );
                mute.addClass('volume_mute' );
                mute.prop('title', 'Unmute the client');
                muted = true;
                return false;
            }
            sound.unmute();
            mute.removeClass( 'volume_mute' );
            mute.addClass( 'volume' );
            mute.prop('title', 'Mute the client');
            muted = false;
            return false;
        }
    });
    
    // Focusing stuff?
    var ui = this;
    $(window).focus( function(  ) {
        ui.viewing = true;
    } );
    
    $(window).blur( function(  ) {
        ui.viewing = false;
    } );
    
    // Events for logging output.
    this.client.bind( 'pkt', function( event, client ) {
    
        ui.packet( event, client );
    
    } );
    
    // Channel removed from client.
    this.client.middle(
        'ns.remove',
        function( data, done ) {
            ui.remove_channel( data.ns );
            done( data );
        }
    );
    
    this.client.bind(
        'ns.create',
        function( event, client ) {
            ui.create_channel(event.chan.raw, event.chan.hidden);
        }
    );
    
    this.client.bind(
        'ns.user.list',
        function( event ) {
            ui.channel(event.ns).set_user_list( event.users );
        }
    );
    
    this.client.middle(
        'ns.user.privchg',
        function( data, done ) {
            ui.channel(data.ns).privchg( data, done );
        }
    );
    
    this.client.bind(
        'ns.user.remove',
        function( event, client ) {
            ui.channel(event.ns).remove_one_user( event.user );
        }
    );
    
    this.client.bind(
        'ns.user.registered',
        function( event ) {
            ui.channel(event.ns).register_user( event.user );
        }
    );
    
};

/**
 * Resize the UI to fit the containing element.
 * 
 * @method resize
 */
Chatterbox.UI.prototype.resize = function() {

    this.control.resize();
    this.view.height( this.view.parent().height() );
    //this.view.width( '100%' );
    this.nav.resize(  );
    this.chatbook.resize( ((this.view.parent().height() - this.nav.height()) - this.control.height()) - 5 );

};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.UI.prototype.loop = function(  ) {

    this.chatbook.loop();

};

/**
 * Handle a packet being received.
 * @method packet
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.UI.prototype.packet = function( event, client ) {

    var ui = this;
    var msg = client.protocol.log( event );
    
    if( msg ) {
        
        if( this.settings.developer ) {
            console.log( '>>>', event.sns, '|', msg.text() );
        }
        
        // If the event is -shownotice, don't display it!
        if( event.hasOwnProperty( 's' ) && event.s == '0' ) {
            this.chatbook.handle( event, client );
            return;
        }
        
        event.html = msg.html();
        
        this.cascade(
            'log_message',
            function( data, done ) {
                ui.chatbook.log_message( data.message, data.event );
            }, {
                message: msg,
                event: event
            }
        );
    
    }
    
    this.chatbook.handle( event, client );

};

/**
 * Create a screen for channel `ns` in the UI, and initialise data
 * structures or some shit idk.
 * 
 * @method create_channel
 * @param ns {String} Short name for the channel.
 * @param hidden {Boolean} Should this channel's tab be hidden?
 */
Chatterbox.UI.prototype.create_channel = function( ns, toggle ) {
    this.chatbook.create_channel( ns, toggle );
};

/**
 * Remove a channel from the GUI.
 * We do this when we leave a channel for any reason.
 * Note: last channel is never removed and when removing a channel
 * we switch to the last channel in the list before doing so.
 *
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
Chatterbox.UI.prototype.remove_channel = function( ns ) {
    this.chatbook.remove_channel(ns);
};

/**
 * Select which channel is currently being viewed.
 * 
 * @method toggle_channel
 * @param ns {String} Name of the channel to select.
 */
Chatterbox.UI.prototype.toggle_channel = function( ns ) {
    return this.chatbook.toggle_channel(ns);
};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} The namespace to set or get.
 * @param [chan] {Object} A wsc channel object representing the channel specified.
 * @return {Object} The channel object representing the channel defined by `namespace`
 */
Chatterbox.UI.prototype.channel = function( namespace, chan ) {
    return this.chatbook.channel( namespace, chan );
};

/**
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
 * @method channels
 * @return {Integer} Number of channels open in the ui.
 */
Chatterbox.UI.prototype.channels = function( ) {
    return this.chatbook.channels();
};

/**
 * Switch to the channel left of the current channel.
 * 
 * @method channel_left
 */
Chatterbox.UI.prototype.channel_left = function(  ) {

    this.chatbook.channel_left();

};

/**
 * Switch to the channel right of the current channel.
 * 
 * @method channel_right
 */
Chatterbox.UI.prototype.channel_right = function(  ) {

    this.chatbook.channel_right();

};


/**
 * Display a log message in the monitor channel.
 * 
 * @method monitor
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.UI.prototype.monitor = function( msg, info ) {

    this.monitoro.server_message(msg, info);

};

/**
 * Display a server message across all open channels.
 * 
 * @method server_message
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.UI.prototype.server_message = function( msg, info ) {

    this.chatbook.server_message(msg, info);

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param item {Object} Item to display.
 */
Chatterbox.UI.prototype.log_item = function( item ) {

    this.chatbook.log_item(item);

};

/**
 * Display a log message across all open channels.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.UI.prototype.log = function( msg ) {

    this.chatbook.log(msg);

};

/**
 * Mute a user.
 * 
 * @method mute_user
 * @param user {String} User to mute.
 */
Chatterbox.UI.prototype.mute_user = function( user ) {

    if( !user )
        return false;
    
    user = user.toLowerCase();
    if( this.umuted.indexOf( user ) != -1 )
        return false;
    
    this.umuted.push( user );
    this.chatbook.each( function( ns, chan ) {
        chan.mute_user( user );
    } );
    
    return true;

};

/**
 * Unmute a user.
 * 
 * @method unmute_user
 * @param user {String} User to unmute.
 */
Chatterbox.UI.prototype.unmute_user = function( user ) {

    if( !user )
        return false;
    
    user = user.toLowerCase();
    var usri = this.umuted.indexOf( user );
    if( usri == -1 )
        return false;
    
    this.umuted.splice( usri, 1 );
    this.chatbook.each( function( ns, chan ) {
        chan.unmute_user( user );
    } );
    
    return true;

};

/**
 * Clear a user's messages from all channels.
 * 
 * @method clear_user
 * @param user {String} User to remove messages for.
 */
Chatterbox.UI.prototype.clear_user = function( user ) {

    this.chatbook.each( function( ns, chan ) {
        chan.clear_user( user );
    } );

};

/**
 * Set the theme for the UI.
 * 
 * @method theme
 * @param theme {String} Name of the theme.
 */
Chatterbox.UI.prototype.theme = function( theme ) {
    if( this.settings.theme == theme )
        return this.settings.theme;
    
    if( this.settings.themes.indexOf(theme) == -1 ) {
        theme = 'wsct_' + theme;
        if( this.settings.themes.indexOf(theme) == -1 )
            return this.settings.theme;
    }
    
    this.view.removeClass( this.settings.theme ).addClass( theme );
    this.settings.theme = theme;
    
    this.trigger('theme.set', { name: 'theme.set', theme: theme });
    
    return this.settings.theme;
};

/**
 * Add a new theme to the client.
 * 
 * @method add_theme
 * @param theme {String} Name of the theme to add.
 */
Chatterbox.UI.prototype.add_theme = function( theme ) {

    if( this.settings.themes.indexOf(theme) > -1 )
        return;
    
    this.settings.themes.push(theme);

};

/**
 * Toggle developer mode for the UI.
 *
 * @method developer
 */
Chatterbox.UI.prototype.developer = function( mode ) {
    this.settings.developer = mode;
    this.chatbook.developer();
};



/**
 * Implements a base for a channel view.
 * @class Chatterbox.BaseTab
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
Chatterbox.BaseTab = function( ui, ns, hidden, monitor ) {

    this.manager = ui;
    this.hidden = hidden;
    this.monitor = ( monitor == undefined ? false : monitor );
    this.built = false;
    this.raw = ns;
    this.selector = 't-' + (ns || 'chan').toLowerCase();
    this.namespace = ns;
    this.visible = false;
    this.st = 0;
    
    // UI elements.
    this.el = {
        t: {                        // Tab
            o: null,                //      Object..
            l: null,                //      Link
            c: null,                //      Close button
        },                          //
        m: null,                    // Main
        l: {                        // Channel log
            p: null,                //      Panel
            w: null,                //      Wrap
        },                          //
        u: null,                    // User panel
        h: {                        // Head
            title: null,            //      Title
            topic: null             //      Topic
        }
    };
    this.mulw = 0;
    // Dimensions...
    this.d = {
        u: [0, 0],                  // User panel [ width, height ]
        h: {                        // Header
            title: [0, 0],          //      Title [ width, height ]
            topic: [0, 0]           //      Topic [ width, height ]
        }
    };
    
    if( !ui )
        return;
    
    this.raw = ui.format_ns(ns);
    this.selector = (this.raw.substr(0, 2) == 'pc' ? 'pc' : 'c') + '-' + ui.deform_ns(ns).slice(1).toLowerCase();
    this.namespace = ui.deform_ns(ns);

};

/**
 * Draw the channel on screen and store the different elements in attributes.
 * 
 * @method build
 * @param [view] {String} HTML for the channel view
 */
Chatterbox.BaseTab.prototype.build = function( view ) {
    
    if( !this.manager )
        return;
    
    if( this.built )
        return;
    
    var selector = this.selector;
    var ns = this.namespace;
    var raw = this.raw;
    
    // Tabs.
    this.el.t.o = this.manager.nav.add_tab( selector, ns );
    this.el.t.l = this.el.t.o.find('.tab');
    this.el.t.c = this.el.t.o.find('.close');
    
    // Draw
    this.manager.chatbook.view.append( view || Chatterbox.render('basetab', {'selector': selector, 'ns': ns}) );
    
    // Store
    this.el.m = this.window = this.manager.chatbook.view.find('#' + selector + '-window');
    
    var chan = this;
    
    // When someone clicks the tab link.
    this.el.t.l.click(function () {
        chan.manager.toggle_channel(raw);
        return false;
    });
    
    // When someone clicks the tab close button.
    this.el.t.c.click(function ( e ) {
        chan.manager.trigger( 'tab.close.clicked', {
            'ns': chan.raw,
            'chan': chan,
            'e': e
        } );
        return false;
    });
    
    if( this.hidden && !this.manager.settings.developer ) {
        this.el.t.o.toggleClass('hidden');
    }
    
    this.built = true;
};

/**
 * Hide the channel from view.
 * 
 * @method hide
 */
Chatterbox.BaseTab.prototype.hide = function( ) {
    this.el.m.css({'display': 'none'});
    this.el.t.o.removeClass('active');
    this.visible = false;
};

/**
 * Display the channel.
 * 
 * @method show
 */
Chatterbox.BaseTab.prototype.show = function( ) {
    this.visible = true;
    this.el.m.css({'display': 'block'});
    this.el.t.o.addClass('active');
    this.el.t.o.removeClass('noise chatting tabbed fill');
    var c = this;
    setTimeout( function(  ) {
        c.el.l.w.scrollTop(c.el.l.w.prop('scrollHeight') - c.el.l.w.innerHeight());
        c.resize();
        c.el.l.w.scrollTop(c.el.l.w.prop('scrollHeight') - c.el.l.w.innerHeight());
    }, 100);
};

/**
 * Display or hide the tab based on whether we are in developer mode or not.
 * 
 * @method developer
 */
Chatterbox.BaseTab.prototype.developer = function(  ) {
    if( this.manager.settings.developer ) {
        this.el.t.o.removeClass('hidden');
        return;
    }
    if( this.hidden ) {
        this.el.t.o.addClass('hidden');
    }
};

/**
 * Remove the channel from the UI.
 * 
 * @method remove
 */
Chatterbox.BaseTab.prototype.remove = function(  ) {
    this.el.t.o.remove();
    this.el.m.remove();
};


/**
 * Resize the view window to fill the space available.
 * @method resize
 */
Chatterbox.BaseTab.prototype.resize = function( width, height ) {

    this.el.m.css( {
        height: height || this.manager.chatbook.height(),
        width: ( width || this.manager.chatbook.width() ) - 10
    } );

};

/**
 * This method is run on the main loop event. Having this allows channels to do
 * some maintenance autonomously.
 * @method loop
 */
Chatterbox.BaseTab.prototype.loop = function(  ) {



};


/**
 * Object for managing channel interfaces.
 * 
 * @class Chatterbox.Channel
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
Chatterbox.Channel = function( ui, ns, hidden, monitor ) {
    Chatterbox.BaseTab.call( this, ui, ns, hidden, monitor );
};

Chatterbox.Channel.prototype = new Chatterbox.BaseTab;
Chatterbox.Channel.prototype.constructor = Chatterbox.Channel;

/**
 * Draw the channel on screen and store the different elements in attributes.
 * 
 * @method build
 */
Chatterbox.Channel.prototype.build = function( ) {
    
    if( !this.manager )
        return;
    
    if( this.built )
        return;
    
    var selector = this.selector;
    var ns = this.namespace;
    var raw = this.raw;
    
    Chatterbox.BaseTab.prototype.build.call(
        this,
        Chatterbox.render('channel', {'selector': selector, 'ns': ns})
    );
    
    // Store
    this.el.l.p = this.el.m.find('#' + selector + "-log");
    this.el.l.w = this.el.l.p.find('ul.logwrap');
    this.el.u = this.el.m.find('#' + selector + "-users");
    
    // Max user list width;
    this.mulw = parseInt(this.el.u.css('max-width').slice(0,-2));
    var chan = this;
    
    // Steal focus when someone clicks.
    var click_evt = false;
    
    this.el.l.w.click( function(  ) {
        if( !click_evt )
            return;
        chan.manager.control.focus();
    } );
    
    this.el.l.w.mousedown( function(  ) {
        click_evt = true;
    } );
    
    this.el.l.w.mousemove( function(  ) {
        click_evt = false;
    } );
    
    // When someone clicks the tab link.
    this.el.t.l.click(function () {
        chan.manager.toggle_channel(raw);
        return false;
    });
    
    this.setup_header('title');
    this.setup_header('topic');
    
    if( this.namespace[0] == '@' ) {
        this.build_user_list( { 100: 'Room Members' }, [ 100 ] );
    }
    
    this.built = true;
};

/**
 * Set up a header so it can be edited in the UI.
 * 
 * @method setup_header
 */
Chatterbox.Channel.prototype.setup_header = function( head ) {
    
    var chan = this;
    var h = {};
    h.m = this.el.m.find('header.' + head + ' div');
    h.e = this.el.m.find('header.' + head + ' a[href=#edit]');
    h.t = this.el.m.find('header.' + head + ' textarea');
    h.s = this.el.m.find('header.' + head + ' a[href=#save]');
    h.c = this.el.m.find('header.' + head + ' a[href=#cancel]');
    
    this.el.h[head] = h.m;
    
    h.m.parent().mouseover( function( e ) {
        if( !h.editing ) {
            h.e.css('display', 'block');
            return;
        }
        h.s.css('display', 'block');
        h.c.css('display', 'block');
    } );
    
    h.m.parent().mouseout( function( e ) {
        if( !h.editing ) {
            h.e.css('display', 'none');
            return;
        }
        h.s.css('display', 'none');
        h.c.css('display', 'none');
    } );
    
    h.e.click( function( e ) {
        h.t.text(chan.manager.client.channel(chan.namespace).info[head].content);
        
        h.t.css({
            'display': 'block',
            'width': chan.el.h[head].innerWidth() - 10,
        });
        
        chan.el.h[head].css('display', 'none');
        h.e.css('display', 'none');
        h.editing = true;
        
        chan.resize();
        
        return false;
    } );
    
    var collapse = function(  ) {
        var val = h.t.val();
        h.t.text('');
        h.t.css('display', 'none');
        chan.el.h[head].css('display', 'block');
        h.s.css('display', 'none');
        h.c.css('display', 'none');
        h.editing = false;
        
        //setTimeout( function(  ) {
            chan.resize();
        //}, 100 );
        
        return val;
    };
    
    h.s.click( function( e ) {
        var val = collapse();
        
        chan.manager.trigger( head + '.save', {
            ns: chan.raw,
            value: val
        } );
        
        h.t.text('');
        return false;
    } );
    
    h.c.click( function( e ) {
        collapse();
        return false;
    } );
    
};

/**
 * Scroll the log panel downwards.
 * 
 * @method scroll
 */
Chatterbox.Channel.prototype.scroll = function( ) {
    this.pad();
    var ws = this.el.l.w.prop('scrollWidth') - this.el.l.w.innerWidth();
    var hs = this.el.l.w.prop('scrollHeight') - this.el.l.w.innerHeight();
    if( ws > 0 )
        hs += ws;
    if( hs < 0 || (hs - this.el.l.w.scrollTop()) > 100 )
        return;
    this.el.l.w.scrollTop(hs);
};

/**
 * Add padding to the channel log's wrapping ul.
 * This is done to make sure messages always appear at the bottom first.
 * 
 * @method pad
 */
Chatterbox.Channel.prototype.pad = function ( ) {
    // Add padding.
    this.el.l.w.css({'padding-top': 0, 'height': 'auto'});
    var wh = this.el.l.w.innerHeight();
    var lh = this.el.l.p.innerHeight() - this.el.h.topic.parent().outerHeight();
    var pad = lh - wh;
    
    if( pad > 0 )
        this.el.l.w.css({'padding-top': pad});
    else
        this.el.l.w.css({
            'padding-top': 0,
            'height': lh});
    this.el.l.w.scrollTop(this.st);
};

/**
 * Fix the dimensions of the log window.
 * 
 * @method resize
 */
Chatterbox.Channel.prototype.resize = function( width, height ) {
    
    Chatterbox.BaseTab.prototype.resize.call( this, width, height );
    
    var heads = {
        'title': {
            m: this.el.m.find( 'header div.title' ),
            e: this.el.m.find('header.title a[href=#edit]')
        },
        'topic': {
            m: this.el.m.find( 'header div.topic' ),
            e: this.el.m.find('header.topic a[href=#edit]')
        }
    };
    
    this.el.l.w.css({'padding-top': 0});
    // Height.
    height = height || this.manager.chatbook.height();
    width = width || this.manager.chatbook.width();
    var wh = height;
    var cw = this.el.m.width();
    
    // Userlist width.
    this.el.u.width(1);
    this.d.u[0] = this.el.u[0].scrollWidth + this.manager.swidth + 5;
    
    if( this.d.u[0] > this.mulw ) {
        this.d.u[0] = this.mulw;
    }
    
    this.el.u.width(this.d.u[0]);
    
    // Change log width based on userlist width.
    cw = cw - this.d.u[0];
    
    // Account for channel title in height.
    wh = wh - heads.title.m.parent().outerHeight();
        
    // Log panel dimensions
    this.el.l.p.css({
        height: wh - 3,
        width: cw - 10});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    this.d.u[1] = this.el.l.p.innerHeight();
    this.el.u.css({height: this.d.u[1]});
    
    // Make sure edit buttons are in the right place.
    for( var head in heads ) {
        if( !heads.hasOwnProperty( head ) )
            continue;
        
        if( heads[head].m.html().length == 0 )
            continue;
        
        var tline = (heads[head].m.outerHeight(true) - 5) * (-1);
        heads[head].e.css('top', tline);
    }
};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Channel.prototype.loop = function(  ) {

    var msgs = this.el.l.p.find( '.logmsg' );
    
    if( msgs.length < 200 )
        return;
    
    msgs.slice(0, msgs.length - 200).remove();
    this.resize();

};

/**
 * Display a log message.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.Channel.prototype.log = function( msg ) {
    
    var chan = this;
    
    this.manager.cascade( 'log',
        function( data ) {
            chan.log_item({ 'html': Chatterbox.render('logmsg', {'message': data.message}) });
        }, {
            'ns': this.raw,
            'sns': this.namespace,
            'message': msg
        }
    );
};

/**
 * Send a message to the log window.
 * 
 * @method log_item
 * @param item {Object} Message to send.
 */
Chatterbox.Channel.prototype.log_item = function( item ) {
    var date = new Date();
    var ts = '';
    
    if( this.manager.settings.clock ) {
        ts = formatTime('{HH}:{mm}:{ss}', date);
    } else {
        ts = formatTime('{hh}:{mm}:{ss} {mr}', date);
    }
    
    var chan = this;;
    
    this.manager.cascade( 'log_item',
        function( data ) {
            if( chan.visible ) {
                chan.st = chan.el.l.w.scrollTop();
            }
            
            // Add content.
            chan.el.l.w.append(Chatterbox.render('logitem', data));
            chan.manager.trigger( 'log_item.after', {'item': chan.el.l.w.find('li').last(), 'chan': chan } );
            if( chan.visible ) {
                chan.st+= chan.el.l.w.find('li.logmsg').last().height();
                chan.el.l.w.scrollTop( chan.st );
            }
            
            // Scrollio
            chan.scroll();
            chan.noise();
        }, {
            'ns': this.namespace,
            'ts': ts,
            'ms': date.getTime(),
            'message': item.html,
            'user': (item.user || 'system' ).toLowerCase()
        }
    );
};

/**
 * Rewrite time signatures for all messages. Woo.
 * 
 * @method retime
 */
Chatterbox.Channel.prototype.retime = function(  ) {

    var tsf = '';
    var wrap = this.el.l.w;

    if( this.manager.settings.clock ) {
        tsf = '{HH}:{mm}:{ss}';
    } else {
        tsf = '{hh}:{mm}:{ss} {mr}';
    }

    wrap.find('span.ts').each(function( index, span ) {
    
        el = wrap.find(span);
        time = new Date(parseInt(el.prop('id')));
        el.text(formatTime(tsf, time));
    
    });

};

/**
 * Send a server message to the log window.
 * 
 * @method server_message
 * @param msg {String} Server message.
 * @param [info] {String} Extra information for the message.
 */
Chatterbox.Channel.prototype.server_message = function( msg, info ) {
    var chan = this;
    
    this.manager.cascade( 'server_message',
        function( data ) {
            chan.log_item({ 'html': Chatterbox.render('servermsg', {'message': data.message, 'info': data.info}) });
        }, {
            'ns': this.namespace,
            'message': msg,
            'info': info
        }
    );
};

/**
 * Clear all log messages from the log window.
 * 
 * @method clear
 */
Chatterbox.Channel.prototype.clear = function(  ) {
    this.el.l.p.find('li.logmsg').remove();
    this.el.l.p.find('li.loginfo').remove();
    this.el.l.w.height(0);
    this.resize();
};

/**
 * Display an info box in the channel log.
 * 
 * @method log_info
 * @param content {String} Infobox contents.
 */
Chatterbox.Channel.prototype.log_info = function( ref, content ) {
    var data = {
        'ns': this.namespace,
        'ref': ref,
        'content': content
    };
    this.manager.trigger( 'log_info.before', data );
    delete data['ns'];
    var b = this.el.l.w.append(Chatterbox.render( 'loginfobox', data ));
    this.scroll();
    
    var ui = this;
    var box = this.el.l.w.find('li.' + data.ref);
    box.find('a.close').click(
        function( e ) {
            ui.el.l.w.find(this).parent().remove();
            ui.resize();
            return false;
        }
    );
    
    this.scroll();
    
    return box;
};

/**
 * Display a user's whois info.
 * 
 * @method show_whois
 * @param data {Object} Object containing a user's information.
 */
Chatterbox.Channel.prototype.log_whois = function( data ) {
    
    var whois = {
        'avatar': '<a href="#"><img height="50" width="50" alt="avatar"/></a>',
        'username': '<b>' + data.symbol + data.username + '</b>',
        'info': [],
        'conns': [],
        'raw': data,
    };
    
    for( var i in data.connections ) {
        var rcon = data.connections[i];
        var mcon = [];
        
        if( rcon.online ) {
            var stamp = (new Date - (rcon.online * 1000));
            mcon.push([ 'online', DateStamp(stamp / 1000) + formatTime(' [{HH}:{mm}:{ss}]', new Date(stamp)) ]);
        }
        if( rcon.idle )
            mcon.push([ 'idle', timeLengthString(rcon.idle) ]);
        if( rcon.agent )
            mcon.push([ 'agent', rcon.agent ]);
        if( rcon.debug )
            mcon.push([ 'debug', rcon.debug ]);
        
        mcon.push([ 'chatrooms', rcon.channels.join(' ') ]);
        
        whois.conns.push(mcon);
    }
    
    this.manager.trigger( 'log_whois.before', whois );
    
    var conns = '';
    for( var i in whois.conns ) {
        var conn = whois.conns[i];
        var text = '<section class="conn"><p><em>connection ' + ((parseInt(i) + 1).toString()) + ':</em></p>';
        text+= '<ul>';
        for( var x in conn ) {
            text+= '<li><strong>' + conn[x][0] + ':</strong> ' + conn[x][1] + '</li>';
        }
        text+= '</ul>'
        conns+= text + '</section>';
    }
    
    var info = '';
    for( var i in whois.info ) {
        info+= '<li>' + whois.info[i] + '</li>';
    }
    
    var box = this.log_info(
        'whois-'+data.username,
        Chatterbox.render('whoiswrap', {
            'avatar': whois.avatar,
            'info': Chatterbox.render('whoisinfo', {
                'username': whois.username,
                'info': info,
                'connections': conns
            })
        })
    );
    
    var av = box.find('div.avatar');
    var inf = box.find('div.info');
    inf.width( box.find('.whoiswrap').width() - 100 );
    av.height( box.height() - 10 );
    this.scroll();
};

/**
 * Display some information relating to a privilege class.
 * 
 * @method log_pc
 * @param privileges {Boolean} Are we showing privileges or users?
 * @param data {Array} Array containing information.
 */
Chatterbox.Channel.prototype.log_pc = function( privileges, data ) {

    contents = '';
    for( var i in data ) {
        if( !data.hasOwnProperty(i) )
            continue;
        var pc = data[i];
        var pcc = '';
        if( pc[2].length == 0 ) {
            pcc = '<em>' + ( privileges ? 'default privileges' : 'no members' ) + '</em>';
        } else {
            pcc = pc[2];
        }
        contents+= String.format('<li><em>{0}</em> <strong>{1}</strong>:<ul><li>{2}</li></ul></li>', [pc[1], pc[0], pcc ]);
    }
    
    var info = {
        'title': 'Privilege class ' + (privileges ? 'permissions' : 'members'),
        'info': '<ul>' + contents + '</ul>'
    };
    
    this.log_info(
        'pc-' + ( privileges ? 'permissions' : 'members' ),
        Chatterbox.render( 'pcinfo', info )
    );

};

/**
 * Set the channel header.
 * 
 * This can be the title or topic, determined by `head`.
 * 
 * @method set_header
 * @param head {String} Should be 'title' or 'topic'.
 * @param content {Object} Content for the header
 * @param by {String} Username of the person who set the header
 * @param ts {String} Timestamp for when the header was set
 */
Chatterbox.Channel.prototype.set_header = function( head, content, by, ts ) {
    
    head = head.toLowerCase();
    var edit = this.el.m.find('header.' + head + ' a[href=#edit]');
    //var c = this.manager.client.channel( this.namespace );
    
    if( this.el.h[head].html() != '' ) {
    
        if ( content.html().length != 0 ) {
            this.server_message( head + " set by " + by );
        }
    
    }
    
    this.el.h[head].html( content.html() );
    
    var chan = this;
    
    setTimeout( function(  ) {
        if( content.text().length > 0 ) {
            chan.el.h[head].css( { display: 'block' } );
            var tline = (chan.el.h[head].outerHeight(true) - 5) * (-1);
            edit.css('top', tline);
        } else {
            chan.el.h[head].css( { display: 'none' } );
        }
            
        chan.resize();
    }, 100 );
    
};

/**
 * Get a channel header's contents.
 * 
 * @method get_header
 * @param head {String} Should be 'title' or 'topic'.
 * @return {Object} Content of the header.
 */
Chatterbox.Channel.prototype.get_header = function( head ) {

    return this.el.h[head.toLowerCase()];

};

/**
 * Build the user list.
 * 
 * @method build_user_list
 * @param names {Object} Privilege class names
 * @param order {Array} Privilege class orders
 */
Chatterbox.Channel.prototype.build_user_list = function( names, order ) {
    
    var uld = this.el.m.find('div.chatusers');
    var pc = '';
    var pcel = null;
    
    uld.html('');
    
    for(var index in order) {
        var pc = names[order[index]];
        uld.append('<div class="pc" id="' + replaceAll( pc, ' ', '-' ) + '"><h3>' + pc + '</h3><ul></ul>');
        pcel = uld.find('.pc#' + pc);
        pcel.css('display', 'none');
    }

};

/**
 * Reveal or hide the userlist depending on the number of users present.
 * 
 * @method reveal_user_list
 */
Chatterbox.Channel.prototype.reveal_user_list = function(  ) {

    var uld = this.el.m.find('div.chatusers');
    var total = 0;
    var count = 0;
    var pc = null;
    
    uld.find('div.pc').each( function( i, el ) {
        pc = uld.find(this);
        count = pc.find('ul li').length;
        total+= count;
        pc.css('display', ( count == 0 ? 'none' : 'block' ));
    } );
    
    uld.css('display', ( total == 0 ? 'none' : 'block' ));
    
    var c = this;
    setTimeout( function( ) {
        c.resize();
    }, 100);

};

/**
 * Set the channel user list.
 * 
 * @method set_user_list
 * @param users {Array} Listing of users in the channel.
 */
Chatterbox.Channel.prototype.set_user_list = function( users ) {
    
    if( Object.size(users) == 0 )
        return;
    
    var uld = this.el.m.find('div.chatusers');
    var user = null;
    
    for( var index in users ) {
        
        user = users[index];
        this.set_user( user, true );
    
    }
    
    this.reveal_user_list();
    
};

/**
 * Set a user in the user list.
 * 
 * @method set_user
 * @param user {Object} Information about the user
 * @param noreveal {Boolean} Do not run the reveal method
 */
Chatterbox.Channel.prototype.set_user = function( user, noreveal ) {

    var uld = this.el.m.find( 'div.chatusers div.pc#' + replaceAll( user.pc, ' ', '-' ) );
    var ull = uld.find('ul');
    var conn = user.conn == 1 ? '' : '[' + user.conn + ']';
    var html = '<li><a target="_blank" id="' + user.name + '" href="http://' + user.name + '.' + this.manager.settings['domain'] + '"><em>' + user.symbol + '</em>' + user.name + '</a>' + conn + '</li>';
    
    if( ull.find('a#' + user.name).length == 1 )
        return;
    
    if( ull.find('li').length == 0 ) {
        ull.append( html );
    } else {
    
        var mname = user.name.toLowerCase();
        var link = null;
        var done = false;
        
        ull.find('li a').each( function(  ) {
            
            if( done )
                return;
            
            link = ull.find(this);
            
            if( mname < link.prop('id').toLowerCase() ) {
                link.parent().before( html );
                done = true;
            }
            
        } );
        
        if( !done )
            ull.append( html );
    
    }
    
    var c = this;
    this.manager.cascade( 'user.hover', function( data ) { c.userinfo( data ); }, user.hover);
    
    noreveal = noreveal || false;
    
    if( !( noreveal ) )
        this.reveal_user_list();
        

};

/**
 * Remove a user from the user list.
 * 
 * @method remove_user
 * @param user to remove
 */
Chatterbox.Channel.prototype.remove_user = function( user, noreveal ) {

    this.el
        .m.find('div.chatusers div.pc ul li a#' + user)
        .parent().remove();
    
    noreveal = noreveal || false;
    
    if( !( noreveal ) )
        this.reveal_user_list();

};

/**
 * Remove a single instance of a user from the user list.
 * 
 * @method remove_one_user
 * @param user {String} Username
 */
Chatterbox.Channel.prototype.remove_one_user = function( user ) {

    this.remove_user( user, true );
    
    var member = this.manager.client.channel(this.namespace).info.members[user];
    
    if( !member ) {
        this.reveal_user_list();
        return;
    }
    
    this.set_user( member );

};

/**
 * Move a user from one privclass to another.
 * 
 * @method privchg
 * @param event {Object} recv_privchg event data
 * @param done {Function} Next method
 */
Chatterbox.Channel.prototype.privchg = function( data, done ) {

    this.remove_user( data.user, true );
    
    var member = this.manager.client.channel(this.namespace).info.members[data.user];
    
    if( !member ) {
        this.reveal_user_list();
        done( data );
        return;
    }
    
    member = Object.extend( member, {} );
    member.pc = data.pc;
    
    this.set_user( member );
    done( data );

};

/**
 * Handle the register user event.
 * 
 * @method register_user
 * @param user {String} Name of the user to register
 */
Chatterbox.Channel.prototype.register_user = function( user ) {

    this.remove_user( user, true );
    var member = this.manager.client.channel(this.namespace).info.members[user];
    
    if( !member ) {
        this.reveal_user_list();
        return;
    }
    
    this.set_user( member );

};

/**
 * The user has been highlighted in this channel.
 * Highlights the last log message in the channel's log and animates the
 * channel tab if the channel is not visible.
 * 
 * @method highlight
 * @param [message] {Object} jQuery object for an html element. If provided,
 *   this element will be highlighted instead of the channel's last log
 *   message.
 */
Chatterbox.Channel.prototype.highlight = function( message ) {
    
    var c = this;
    
    this.manager.cascade( 'highlight', function( data, done ) {
        var tab = c.el.t.o;
        var message = data.message;
        
        if( message !== false ) {
            ( message || c.el.l.w.find('.logmsg').last() ).addClass('highlight');
        }
        
        if( tab.hasClass('active') ) {
            if( !c.manager.viewing )
                c.manager.sound.click();
            return;
        }
        
        if( !c.hidden ) {
            c.manager.sound.click();
        }
        
        if( tab.hasClass('tabbed') )
            return;
        
        if( tab.hasClass('chatting') )
            tab.removeClass('chatting');
        
        var runs = 0;
        tab.addClass('tabbed');
        
        function toggles() {
            runs++;
            tab.toggleClass('fill');
            if( runs == 6 )
                return;
            setTimeout( toggles, 1000 );
        }
        
        toggles();
    }, { 'c': c, 'message': message } );
    
};

/**
 * There has been activity in this channel.
 * Modifies the channel tab slightly, if the channel is not currently being
 * viewed.
 * 
 * @method noise
 */
Chatterbox.Channel.prototype.noise = function(  ) {
    
    var u = '';
    var si = 0;
    var msg = this.el.m.find('.logmsg').last();
    
    for( var i in this.manager.umuted ) {
        if( !this.manager.umuted.hasOwnProperty(i) )
            continue;
        
        if( msg.hasClass('u-' + this.manager.umuted[i]) ) {
            msg.css({'display': 'none'});
            this.scroll();
            return;
        }
    }
    
    if( !this.el.t.o.hasClass('active') ) {
        this.el.t.o.addClass('noise');
        if( !this.el.t.o.hasClass('tabbed') ) {
            if( msg.find('.cevent').length == 0 ) {
                this.el.t.o.addClass('chatting');
            }
        }
    }
    

};

/**
 * Display a user info hover box.
 * 
 * @method userinfo
 * @param user {Object} Information about a user.
 * @return {Object} jQuery object representing the information box.
 */
Chatterbox.Channel.prototype.userinfo = function( user ) {

    var link = this.el.m.find( 'a#' + user.name );
    
    if( link.length == 0 )
        return;

    var chan = this;
    var box = null;
    
    var menter = function( e ) {
        var infoli = '';
        
        for( index in user.info ) {
            infoli+= '<li>' + user.info[index] + '</li>';
        }
        
        chan.window.append(Chatterbox.render('userinfo', {
            'username': user.name,
            'avatar': user.avatar,
            'link': user.link,
            'info': infoli}));
        
        box = chan.window.find('.userinfo#'+user.name);
        chan.window.find('div.userinfo:not(\'#' + user.name + '\')').remove();
        var pos = link.offset();
        box.css({ 'top': (pos.top - link.height()) + 10, 'left': (pos.left - (box.width())) - 6 });
        box.find('.info').height(box.height());
        
        box.hover(
            function(){ box.data('hover', 1); },
            function( e ) {
                box.data('hover', 0);
                chan.unhover_user( box, e );
            }
        );
        
        box.data('hover', 0);
    };
    
    var mleave = function( e ) {
        link.data('hover', 0);
        chan.unhover_user(box, e);
    };
    
    link.off( 'mouseenter', menter );
    link.off( 'mouseleave', mleave );
    
    link.on( 'mouseenter', menter );
    link.on( 'mouseleave', mleave );

};

/**
 * This method tries to get rid of the given user information box.
 * The information box can only be removed if the cursor is outside the
 * bounds of the information box AND outside of the bounds of the user link in
 * the user list.
 * 
 * @method unhover_user
 * @param box {Object} A jQuery object representing the information box.
 * @param event {Object} jQuery event object.
 */
Chatterbox.Channel.prototype.unhover_user = function( box, event ) {

    var o = box.offset();
    var eb = box.outerHeight(true) + o.top;
    var er = box.outerWidth(true) + o.left;
    var x = event.pageX;
    var y = event.pageY;
    
    if( x > o.left
        && x < er
        && y > o.top
        && y < eb)
        return;
    
    if( x < (er + 15)
        && x > o.left
        && y > o.top
        && y < (o.top + 15) )
        return;
    
    box.remove();

};

/**
 * Hide messages from a given user.
 * 
 * @method mute_user
 * @param user {String} User to hide messages for.
 */
Chatterbox.Channel.prototype.mute_user = function( user ) {

    if( !user )
        return;
    this.el.l.w.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'none'});
    this.scroll();

};

/**
 * Reveal messages received from a given user.
 *
 * @method unmute_user
 * @param user {String} Use to reveal messages for.
 */
Chatterbox.Channel.prototype.unmute_user = function( user ) {

    if( !user )
        return;
    this.el.l.w.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'list-item'});
    this.scroll();

};

/**
 * Remove a user's messages completely.
 * 
 * @method clear_user
 * @param user {String} User to remove messages for.
 */
Chatterbox.Channel.prototype.clear_user = function( user ) {

    if( !user )
        return;
    this.el.l.w.find('li.logmsg.u-' + user.toLowerCase()).remove();
    this.scroll();

};

/**
 * When we have just joined a channel we want to reset certain things like
 * the topic and title. We will be receiving these from the server again soon.
 * @method pkt_join
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.Channel.prototype.pkt_join = function( event, client ) {

    if( event.e != 'ok' )
        return;
    
    this.set_header('title', (new wsc.MessageString('')), '', '' );
    this.set_header('topic', (new wsc.MessageString('')), '', '' );

};

/**
 * Handle a recv_msg packet.
 * @method pkt_recv_msg
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.Channel.prototype.pkt_recv_msg = function( event, client ) {

    var c = this;
    
    this.manager.cascade( 'chan.recv_msg', function( e, done ) {
        var u = c.manager.client.settings['username'].toLowerCase(); 
        
        if( u == e.user.toLowerCase() )
            return;
        
        var msg = e['message'].toLowerCase();
        var hlight = msg.indexOf(u) != -1;
        
        if( !hlight && e.sns[0] != '@' )
            return;
        
        if( hlight ) {
            c.highlight( );
        } else {
            c.highlight( false );
        }
        
        c.trigger( 'pkt.recv_msg.highlighted', e );
    }, event );

};

/**
 * Handle a property packet.
 * @method pkt_property
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.Channel.prototype.pkt_property = function( event, client ) {

    var prop = event.pkt.arg.p;
    var c = client.channel( this.namespace );
    
    switch(prop) {
        case "title":
        case "topic":
            this.set_header(prop, event.value || (new wsc.MessageString( '' )), event.by, event.ts );
            break;
        case "privclasses":
            this.build_user_list( c.info.pc, c.info.pc_order.slice(0) );
            break;
        case "members":
            // this.set_members(e);
            break;
        default:
            // this.server_message("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
            break;
    }

};


/**
 * Object for managing the chatbook portion of the UI.
 *
 * @class Chatterbox.Chatbook
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Chatbook = function( ui ) {
    
    this.manager = ui;
    this.view = this.manager.view.find('div.chatbook');
    this.chan = {};
    this.trail = [];
    this.current = null;
    
    this.manager.on( 'tab.close.clicked', function( event, ui ) {
        ui.chatbook.remove_channel(event.ns);
    });
    
};

/**
 * Return the height of the chatbook.
 *
 * @method height
 */
Chatterbox.Chatbook.prototype.height = function() {
    return this.view.height();
};

/**
 * Return the width of the chatbook.
 *
 * @method height
 */
Chatterbox.Chatbook.prototype.width = function() {
    return this.view.width();
};

/**
 * Resize the chatbook view pane.
 * 
 * @method resize
 * @param [height=600] {Integer} The height to set the view pane to.
 */
Chatterbox.Chatbook.prototype.resize = function( height ) {
    height = height || 600;
    var width = this.view.innerWidth();
    
    for( var select in this.chan ) {
        if( !this.chan.hasOwnProperty( select ) )
            continue;
        
        var chan = this.chan[select];
        chan.resize( width, height );
    }
};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Chatbook.prototype.loop = function(  ) {

    for( select in this.chan ) {
        this.chan[select].loop();
    }

};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} The namespace to set or get.
 * @param [chan] {Object} A wsc channel object representing the channel specified.
 * @return {Object} The channel object representing the channel defined by `namespace`
 */
Chatterbox.Chatbook.prototype.channel = function( namespace, chan ) {
    namespace = this.manager.format_ns(namespace).toLowerCase();
    
    if( !this.chan[namespace] && chan )
        this.chan[namespace] = chan;
    
    return this.chan[namespace];
};

/**
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
 * @method channels
 * @return [Integer] Number of channels open in the ui.
 */
Chatterbox.Chatbook.prototype.channels = function( ) {
    chans = -1;
    for(ns in this.chan) {
        if( this.chan[ns].hidden )
            continue;
        chans++;
    }
    return chans;
};

/**
 * Create a channel in the UI.
 * 
 * @method create_channel
 * @param ns {String} Namespace of the channel to create.
 * @param hidden {Boolean} Should the tab be hidden?
 * @param monitor {Boolean} Is this channel the monitor?
 * @return {Object} WscUIChannel object.
 */
Chatterbox.Chatbook.prototype.create_channel = function( ns, hidden, monitor ) {
    var chan = this.channel(ns, this.channel_object(ns, hidden, monitor));
    chan.build();
    // Update the paper trail.
    if( this.trail.indexOf(chan.namespace) == -1 ) {
        this.trail.push(chan.namespace);
    }
    
    if( !chan.visible )
        this.toggle_channel(ns);
    
    this.manager.resize();
    return chan;
};

/**
 * Create a feed in the UI.
 * 
 * @method create_feed
 * @param ns {String} Namespace of the feed to create
 * @param type {String} The type of feed this view represents
 * @param priv {Integer} The privilege level the user has for this feed
 * @param [actions] {String} A string describing the actions the user can perform on this feed
 * @return {Object} WscUIChannel object.
 */
Chatterbox.Chatbook.prototype.create_feed = function( ns, type, priv, actions ) {
    var chan = this.channel(ns, this.feed_object(ns, type, priv, actions));
    chan.build();
    // Update the paper trail.
    if( this.trail.indexOf(chan.namespace) == -1 ) {
        this.trail.push(chan.namespace);
    }
    
    if( !chan.visible )
        this.toggle_channel(ns);
    
    this.manager.resize();
    return chan;
};

/**
 * Create a new channel panel object.
 * Override this method to use a different type of channel object.
 * 
 * @method channel_object
 * @param ns {String} Namespace of the channel.
 * @return {Object} An object representing a channel UI.
 */
Chatterbox.Chatbook.prototype.channel_object = function( ns ) {
    return new Chatterbox.Channel( this.manager, ns );
};

/**
 * Create a new feed panel object.
 * Override this method to use a different type of channel object.
 * 
 * @method feed_object
 * @param ns {String} Namespace of the feed
 * @param type {String} The type of feed this view represents
 * @param priv {Integer} The privilege level the user has for this feed
 * @param [actions] {String} A string describing the actions the user can perform on this feed
 * @return {Object} An object representing a feed UI.
 */
Chatterbox.Chatbook.prototype.feed_object = function( ns, type, priv, actions ) {
    return new Chatterbox.Feed( this.manager, ns, type, priv, actions );
};

/**
 * Select which channel is currently being viewed.
 * 
 * @method toggle_channel
 * @param ns {String} Namespace of the channel to view.
 */
Chatterbox.Chatbook.prototype.toggle_channel = function( ns ) {
    var chan = this.channel(ns);
    var prev = chan;
    
    if( !chan )
        return;
    
    if( chan.hidden ) {
        if( this.current && this.current == chan )
            return;
        if( !this.manager.settings.developer ) {
            chan.hide();
            return;
        }
    }
    
    if(this.current) {
        if(this.current == chan)
            return;
        // Hide previous channel, if any.
        this.current.hide();
        prev = this.current;
    } else {
        if( this.manager.monitoro !== null )
            this.manager.monitoro.hide();
    }
    
    // Show clicked channel.
    chan.show();
    this.manager.control.focus();
    this.current = chan;
    this.manager.resize();
    this.manager.control.cache_input( prev, chan );
    
    this.manager.trigger( 'channel.selected', {
        'ns': chan.raw,
        'chan': chan,
        'prev': prev
    } );
    
    this.manager.client.select_ns( chan.raw );
};

/**
 * Remove a channel from the UI.
 * 
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
Chatterbox.Chatbook.prototype.remove_channel = function( ns ) {
    var chan = this.channel(ns);
    
    if( this.channels() == 0 && !chan.hidden ) 
        return;
    
    chan.remove();
    delete this.chan[chan.raw.toLowerCase()];
    
    if( this.current == chan )
        this.channel_left();
    
    var rpos = this.trail.indexOf(chan.namespace);
    this.trail.splice(rpos, 1);
};

/**
 * Switch to the channel left of the current channel.
 * 
 * @method channel_left
 */
Chatterbox.Chatbook.prototype.channel_left = function(  ) {

    var ns = this.current.namespace;
    var index = this.trail.indexOf(ns);
    
    if( index < 0 )
        return;
    
    var nc = null;
    while( true ) {
        try {
            nc = this.channel(this.trail[--index]);
        } catch( err ) {
            index = this.trail.length - 1;
            nc = this.channel(this.trail[index]);
        }
        
        if( !nc.hidden )
            break;
        
        if( this.manager.settings.developer )
            break;
    }
    
    this.toggle_channel(nc.namespace);

};

/**
 * Switch to the channel right of the current channel.
 * 
 * @method channel_right
 */
Chatterbox.Chatbook.prototype.channel_right = function(  ) {

    var ns = this.current.namespace;
    var index = this.trail.indexOf(ns);
    
    if( index == -1 )
        return;
    
    var nc = null;
    while( true ) {
        try {
            nc = this.channel(this.trail[++index]);
        } catch( err ) {
            index = 0;
            nc = this.channel(this.trail[0]);
        }
        if( !nc.hidden )
            break;
        
        if( this.manager.settings.developer )
            break;
    }
    
    this.toggle_channel(nc.namespace);

};

/**
 * Iterate through the different channels.
 * 
 * @method each
 * @param method {Function} Function to call for each channel.
 */
Chatterbox.Chatbook.prototype.each = function( method ) {
    
    var chan = null;
    
    for( var ns in this.chan ) {
        if( !this.chan.hasOwnProperty(ns) )
            continue;
        
        chan = this.chan[ns];
        
        if( method( chan.namespace, chan ) === false )
            break;
    }
    
};

/**
 * Display a server message across all open channels.
 * 
 * @method server_message
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.Chatbook.prototype.server_message = function( msg, info ) {

    for( ns in this.chan ) {
        this.chan[ns].server_message(msg, info);
    }

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param msg {String} Message to display.
 */
Chatterbox.Chatbook.prototype.log_item = function( msg ) {

    for( ns in this.chan ) {
        this.chan[ns].log_item(msg);
    }

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param msg {String} Message to display.
 */
Chatterbox.Chatbook.prototype.log = function( msg ) {

    for( ns in this.chan ) {
        this.chan[ns].log(msg);
    }

};

/**
 * Handle a log message.
 * @method log_message
 * @param message {Object} Log message object
 * @param event {Object} Event data
 */
Chatterbox.Chatbook.prototype.log_message = function( message, event ) {

    try {
        if( !message.global ) {
            if( !message.monitor ) {
                this.channel( event.ns ).log_item( event );
            } else {
                this.manager.monitoro.log_item( event );
            }
        } else {
            this.log_item( event );
        }
    } catch( err ) {
        try {
            this.ui.monitoro.server_message( 'Failed to log for', event.sns, event.html );
        } catch( err ) {
            console.log( '>> Failed to log message for', event.sns, '::' );
            console.log( '>>', event.html );
        }
    }

};

/**
 * Rewrite timestamps for all open channels.
 * 
 * @method retime
 */
Chatterbox.Chatbook.prototype.retime = function(  ) {

    for( ns in this.chan ) {
        this.chan[ns].retime();
    }

};

/**
 * Toggle the developer mode of each channel.
 *
 * @method developer
 */
Chatterbox.Chatbook.prototype.developer = function(  ) {
    this.each( function( ns, chan ) {
        chan.developer();
    } );
};

/**
 * Handle a packet event.
 * @method handle
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.Chatbook.prototype.handle = function( event, client ) {

    var ui = this.manager;
    var chan = this.channel( event.ns );
    
    if( !chan )
        return;
    
    var meth = 'pkt_' + event.name;
    
    try {
        chan[meth]( event, client );
    } catch( err ) {}

};


/**
 * This object provides an interface for the chat input panel.
 * 
 * @class Chatterbox.Control
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Control = function( ui ) {

    this.manager = ui;
    this.manager.view.append( Chatterbox.template.control );
    this.view = this.manager.view.find('div.chatcontrol');
    this.ml = false;
    
    this.history = {};
    this.tab = {
        hit: false,
        cache: '',
        matched: [],
        index: -1,
        type: 0,
        prefix: ['', '/', ''],
    };
    
    /**
     * UI elements
     */
    this.el = {
        form: this.view.find('form.msg'),                       // Input form
        i: {                                                    // Input field
            s: this.view.find('form.msg input.msg'),            //      Single line input
            m: this.view.find('form.msg textarea.msg'),         //      Multi line input
            c: null,                                            //      Current input element
            t: this.view.find('ul.buttons a[href~=#multiline].button')   //      Toggle multiline button
        },
        brow: {
            m: this.view.find('div.brow'),                               // Control brow
            b: this.view.find('div.brow ul.buttons'),
            s: this.view.find('div.brow ul.states')
        }
    };
    // Default input mode is single line.
    this.el.i.c = this.el.i.s;
    
    var ctrl = this;
    this.el.i.t.click(function( event ) {
        ctrl.multiline( !ctrl.multiline() );
        return false;
    });
    
    // Input handling.
    this.el.i.s.keydown( function( event ) { return ctrl.keypress( event ); } );
    this.el.i.m.keydown( function( event ) { return ctrl.keypress( event ); } );
    this.el.form.submit( function( event ) { return ctrl.submit( event ); } );
    
    // FORMATTING BUTTONS
    
    this.add_button({
        'label': '<b>b</b>',
        'icon': false,
        'href': '#bold',
        'title': 'Bold text',
        'handler': function(  ) {
            ctrl.surroundtext( ctrl.el.i.c[0], '<b>', '</b>');
        }
    });
    
    this.add_button({
        'label': '<i>i</i>',
        'icon': false,
        'href': '#italic',
        'title': 'Italic text',
        'handler': function(  ) {
            ctrl.surroundtext( ctrl.el.i.c[0], '<i>', '</i>');
        }
    });
    
    this.add_button({
        'label': '<u>u</u>',
        'icon': false,
        'href': '#underline',
        'title': 'Underline text',
        'handler': function(  ) {
            ctrl.surroundtext( ctrl.el.i.c[0], '<u>', '</u>');
        }
    });
    
    this.add_button({
        'label': '<sup>sup</sup>',
        'icon': false,
        'href': '#sup',
        'title': 'Superscript',
        'handler': function(  ) {
            ctrl.surroundtext( ctrl.el.i.c[0], '<sup>', '</sup>');
        }
    });
    
    this.add_button({
        'label': '<sub>sub</sub>',
        'icon': false,
        'href': '#sub',
        'title': 'Subscript',
        'handler': function(  ) {
            ctrl.surroundtext( ctrl.el.i.c[0], '<sub>', '</sub>');
        }
    });

};

/**
 * Lifted from superdAmn.
 *
 * SURROUNDTEXT: Adds text around selected text (from deviantPlus)
 * @method surroundtext
 * @param tf
 * @param left
 * @param right
 */
Chatterbox.Control.prototype.surroundtext = function(tf, left, right){
    // Thanks, Zikes
    var tmpScroll     = tf.scrollTop;
    var t             = tf.value, s = tf.selectionStart, e = tf.selectionEnd;
    var selectedText  = tf.value.substring(s,e);
    tf.value          = t.substring(0,s) + left + selectedText + right + t.substring(e);
    tf.selectionStart = s + left.length;
    tf.selectionEnd   = s + left.length + selectedText.length;
    tf.scrollTop      = tmpScroll;
    tf.focus();
};


/**
 * Steal the lime light. Brings the cursor to the input panel.
 * 
 * @method focus
 */
Chatterbox.Control.prototype.focus = function( ) {
    this.el.i.c.focus();
};

/**
 * Resize the control panel.
 *
 * @method resize
 */
Chatterbox.Control.prototype.resize = function( ) {
    w = this.manager.view.width();
    this.view.css({
        width: '100%'});
    // Form dimensionals.
    this.el.form.css({'width': this.manager.view.width() - 20});
    this.el.i.s.css({'width': this.manager.view.width() - 100});
    this.el.i.m.css({'width': this.manager.view.width() - 90});
};


/**
 * Get the height of the input panel.
 * 
 * @method height
 */
Chatterbox.Control.prototype.height = function( ) {
    var h = this.view.outerHeight();
    return h;
};

/**
 * Set or get multiline input mode.
 * 
 * @method multiline
 * @param [on] {Boolean} Use multiline input?
 * @return {Boolean} Current mode.
 */
Chatterbox.Control.prototype.multiline = function( on ) {

    if( on == undefined || this.ml == on )
        return this.ml;
    
    this.ml = on;
    var off = ( this.ml ? 's' : 'm' );
    on = ( this.ml ? 'm' : 's' );
    
    this.el.i[off].css('display', 'none');
    this.el.i[on].css('display', 'inline-block');
    this.el.i.c = this.el.i[on];
    this.manager.resize();
    return this.ml;

};

/**
 * Add a button to the control panel button row.
 * 
 * @method add_button
 * @param options {Object} Configuration options for the button.
 * @return {Object} DOM element or something.
 */
Chatterbox.Control.prototype.add_button = function( options ) {

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
    
    this.el.brow.b.append(Chatterbox.render('brow_button', options));
    var button = this.el.brow.b.find('a[href='+options.href+'].button');
    
    button.click( function( event ) {
        options['handler']();
        return false;
    } );
    
    return button;

};

/**
 * Add status text to the control panel button row.
 * 
 * @method add_state
 * @param options {Object} Status configuration options
 */
Chatterbox.Control.prototype.add_state = function( options ) {

    options = Object.extend( {
        'ref': 'state',
        'label': 'some state'
    }, ( options || {} ) );
    
    var state = this.el.brow.s.find( 'li#' + options.ref );
    
    if( state.length == 0 ) {
        this.el.brow.s.append(Chatterbox.render('brow_state', options));
        return this.el.brow.s.find('li#' + options.ref);
    }
    
    state.html( options.label );
    return state;

};

/**
 * Remove a status item from the control panel button row.
 * 
 * @method rem_state
 * @param ref {String} Reference ID for the button
 */
Chatterbox.Control.prototype.rem_state = function( ref ) {

    return this.el.brow.s.find( 'li#' + ref ).remove();

};

/**
 * Get the last word from the input box.
 * 
 * @method chomp
 * @return {String} The last word in the input box.
 */
Chatterbox.Control.prototype.chomp = function( ) {
    var d = this.el.i.c.val();
    var i = d.lastIndexOf(' ');
    
    if( i == -1 ) {
        this.el.i.c.val('');
        return d;
    }
    
    var chunk = d.slice(i + 1);
    this.el.i.c.val( d.slice(0, i) );
    
    if( chunk.length == 0 )
        return this.chomp();
    
    return chunk;
};

/**
 * Append text to the end of the input box.
 * 
 * @method unchomp
 * @param data {String} Text to append.
 */
Chatterbox.Control.prototype.unchomp = function( data ) {
    var d = this.el.i.c.val();
    if( !d )
        this.el.i.c.val(data);
    else
        this.el.i.c.val(d + ' ' + data);
};

/**
 * Get the text in the input box.
 * 
 * @method get_text
 * @return {String} The text currently in the input box.
 */
Chatterbox.Control.prototype.get_text = function( text ) {

    if( text == undefined )
        return this.el.i.c.val();
    this.el.i.c.val( text || '' );
    return this.el.i.c.val();

};

/**
 * Set the text in the input box.
 * 
 * @method set_text
 * @param text {String} The text to put in the input box.
 */
Chatterbox.Control.prototype.set_text = function( text ) {

    this.el.i.c.val( text || '' );

};

/**
 * Save current input in a cache.
 * 
 * @method cache_input
 * @param previous {Object} Channel to cache input for.
 * @param chan {Object} Newly selected channel
 */
Chatterbox.Control.prototype.cache_input = function( previous, chan ) {

    var h = this.get_history( previous.namespace );
    
    if( h.index > -1 )
        return;
    
    h.tmp = this.get_text();
    this.set_text(this.get_history( chan.namespace ).tmp);

};

/**
 * Get a channel's input history object.
 * 
 * If no history object exists for the given channel, a new object is created
 * and stored.
 * 
 * @method get_history
 * @param [namespace] {String} Channel to get the history of. If not given, the
 *   channel currently being viewed is used.
 * @return history {Object} Channel's input history data.
 */
Chatterbox.Control.prototype.get_history = function( namespace ) {

    if( !namespace ) {
        if( !this.manager.chatbook.current ) {
             namespace = '~monitor';
        }
    }
    
    namespace = namespace || this.manager.chatbook.current.namespace;
    
    if( !this.history[namespace] )
        this.history[namespace] = { index: -1, list: [], tmp: '' };
    
    return this.history[namespace];

};

/**
 * Append an item to the current channel's input history.
 * 
 * @method append_history
 * @param data {String} Input string to store.
 */
Chatterbox.Control.prototype.append_history = function( data ) {

    if( !data )
        return;
    
    var h = this.get_history();
    h.list.unshift(data);
    h.index = -1;
    
    if( h.list.length > 100 )
        h.list.pop();

};

/**
 * Scroll through the current channel's input history.
 * 
 * @method scroll_history
 * @param up {Boolean} Scroll up?
 */
Chatterbox.Control.prototype.scroll_history = function( up ) {

    var history = this.get_history();
    var data = this.get_text();
    
    if( history.index == -1 )
        if( data )
            history.tmp = data;
    else
        history.list[history.index] = data;
    
    if( up ) {
        if( history.list.length > 0 && history.index < (history.list.length - 1) )
            history.index++;
    } else {
        if( history.index > -1)
            history.index--;
    }
    
    this.set_text(history.list[history.index] || history.tmp);

};

/**
 * Handle the tab character being pressed.
 * 
 * @method tab_item
 * @param event {Object} Event data.
 */
Chatterbox.Control.prototype.tab_item = function( event ) {

    if( !this.tab.hit )
        this.start_tab(event);
    
    this.chomp();
    this.tab.index++;
    
    if( this.tab.index >= this.tab.matched.length )
        this.tab.index = -1;
    
    if( this.tab.index == -1 ) {
        this.unchomp(this.tab.prefix[this.tab.type] + this.tab.cache);
        return;
    }
    
    var suf = this.get_text() == '' ? ( this.tab.type == 0 ? ': ' : ' ' ) : '';
    this.unchomp(this.tab.prefix[this.tab.type] + this.tab.matched[this.tab.index] + suf);

};

/**
 * Start tab complete capabilities by compiling a list of items that match the
 * current user input.
 * 
 * TODO: make this actually work in its new found home
 * 
 * @method start_tab
 * @param event {Object} Event data.
 */
Chatterbox.Control.prototype.start_tab = function( event ) {

    this.tab.hit = true;
    this.tab.index = -1;
    this.tab.matched = [];
    this.tab.type = 0;
    
    // We only tab the last word in the input. Slice!
    var needle = this.chomp();
    this.unchomp(needle);
    
    // Check if we's dealing with commands here
    if( needle[0] == "/" || needle[0] == "#" || needle[0] == '@' ) {
        this.tab.type = needle[0] == '/' ? 1 : 2;
        if( needle[0] == '/' )
            needle = needle.slice(1);
    } else {
        this.tab.type = 0;
    }
    
    this.tab.cache = needle;
    needle = needle.toLowerCase();
    
    // Nows we have to find our matches. Fun.
    // Lets start with matching users.
    this.tab.matched = [];
    if( this.tab.type == 0 ) {
        var c = this.manager.client.channel( this.manager.chatbook.current.namespace );
        for( var user in c.info['members'] ) {
            if( user.toLowerCase().indexOf(needle) == 0 )
                this.tab.matched.push(user);
        }
    } else if( this.tab.type == 1 ) {
        // Matching with commands.
        var cmd = '';
        for( var i in this.manager.client.cmds ) {
            cmd = this.manager.client.cmds[i];
            if( cmd.indexOf(needle) == 0 )
                this.tab.matched.push(cmd);
        }
    } else if( this.tab.type == 2 ) {
        // Matching with channels.
        var ctrl = this;
        this.manager.client.each_channel( function( ns, chan ) {
            if( chan.namespace.toLowerCase().indexOf(needle) == 0 )
                ctrl.tab.matched.push(chan.namespace);
        } );
    }

};

/**
 * Clear the tabbing cache.
 * 
 * @method end_tab
 * @param event {Object} Event data.
 */
Chatterbox.Control.prototype.end_tab = function( event ) {

    this.tab.hit = false;
    this.tab.matched = [];
    this.tab.cache = '';
    this.tab.index = -1;

};

/**
 * Handle the send button being pressed.
 * 
 * @method submit
 * @param event {Object} Event data.
 */
Chatterbox.Control.prototype.submit = function( event ) {

    var msg = this.get_text();
    this.append_history(msg);
    this.set_text('');
    this.handle(event, msg);
    return false;

};
/**
 * Processes a key being typed in the input area.
 * 
 * @method keypress
 * @param event {Object} Event data.
 */
Chatterbox.Control.prototype.keypress = function( event ) {

    var key = event.which || event.keyCode;
    var ut = this.tab.hit;
    var bubble = false;
    
    switch( key ) {
        case 13: // Enter
            if( !this.multiline() ) {
                this.submit(event);
            } else {
                if( event.shiftKey ) {
                    this.submit(event);
                } else {
                    bubble = true;
                }
            }
            break;
        case 38: // Up
            if( !this.multiline() ) {
                this.scroll_history(true);
                break;
            }
            bubble = true;
            break;
        case 40: // Down
            if( !this.multiline() ) {
                this.scroll_history(false);
                break;
            }
            bubble = true;
            break;
        case 9: // Tab
            if( event.shiftKey ) {
                this.manager.channel_right();
            } else {
                this.tab_item( event );
                ut = false;
            }
            break;
        case 219: // [
            if( event.ctrlKey ) {
                this.manager.channel_left();
            } else {
                bubble = true;
            }
            break;
        case 221: // ] (using instead of +)
            if( event.ctrlKey ) {
                this.manager.channel_right();
            } else {
                bubble = true;
            }
            break;
        default:
            bubble = true;
            break;
    }
    
    if( ut )
        this.end_tab( event );
    
    return bubble;

};

/**
 * Handle some user input.
 * 
 * @method handle
 * @param event {Object} Event data.
 * @param data {String} Input message given by the user.
 */
Chatterbox.Control.prototype.handle = function( event, data ) {

    if( data == '' )
        return;
    
    if( !this.manager.chatbook.current )
        return;
    
    var autocmd = false;
    
    if( data[0] != '/' ) {
        autocmd = true;
    }
    
    data = (event.shiftKey ? '/npmsg ' : ( data[0] == '/' ? '' : '/say ' )) + data;
    data = data.slice(1);
    var bits = data.split(' ');
    var cmdn = bits.shift().toLowerCase();
    var ens = this.manager.chatbook.current.namespace;
    var etarget = ens;
    
    if( !autocmd && bits[0] ) {
        var hash = bits[0][0];
        if( (hash == '#' || hash == '@') && bits[0].length > 1 ) {
            etarget = this.manager.format_ns(bits.shift());
        }
    }
    
    var arg = bits.join(' ');
    
    var fired = this.manager.client.trigger('cmd.' + cmdn, {
        name: 'cmd',
        cmd: cmdn,
        args: arg,
        target: etarget,
        ns: ens
    });
    
    if( fired == 0 ) {
        this.manager.pager.notice({
            'ref': 'cmd-fail',
            'heading': 'Command failed',
            'content': '"' + cmdn + '" is not a command.'
        }, false, 5000 );
    }

};


/**
 * Object for managing feed interfaces.
 * 
 * @class Chatterbox.Feed
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the feed this object will represent
 * @param type {String} The type of feed this view represents
 * @param [actions] {String} A string describing the feed
 */
Chatterbox.Feed = function( ui, ns, type, description ) {
    
    Chatterbox.BaseTab.call( this, ui, ns );
    
    /**
     * The name of the feed.
     * @property name
     * @type String
     */
    this.name = this.namespace.substr(1);
    
    /**
     * The type of feed this channel represents
     * @property type
     * @type String
     */
    this.type = type;
    
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
                'type': 'quiet',
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
    };
    
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

    this.el.tw.width( this.el.n.width() - this.el.b.outerWidth() - 20 );
    if( this.settings.open ) {
        this.settings.window.resize();
    }

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



/**
 * Pager
 * 
 * Used for giving the user notifications.
 * 
 * @class Chatterbox.Pager
 * @constructor
 * @param ui {Object} Main UI object.
 */
Chatterbox.Pager = function( ui ) {

    this.manager = ui;
    this.lifespan = 20000;
    this.halflife = 5000;
    
    this.el = {
        m: null,
        click: null
    };
    
    this.sound = {
        click: function(  ) {},
    };
    
    this.notices = [];
    
    this.build();

};

/**
 * Build the Pager interface...
 * 
 * @method build
 */
Chatterbox.Pager.prototype.build = function(  ) {

    this.el.m = this.manager.view.find('div.pager');

};

/**
 * Page the user with a notice.
 * 
 * @method notice
 */
Chatterbox.Pager.prototype.notice = function( options, sticky, lifespan, silent ) {

    var notice = {
        frame: null,
        close: null,
        foot: null,
        b: {},
        options: Object.extend( {
            'ref': 'notice',
            'icon': '',
            'heading': 'Some notice',
            'content': 'Notice content goes here.'
        }, ( options || {} ) ),
        onclose: function(  ) {},
        ondestroy: function(  ) {}
    };
    
    notice.options.ref+= '-' + (new Date()).valueOf();
    notice.options.content = notice.options.content.split('\n').join('</p><p>');
    
    this.notices.push( notice );
    
    this.el.m.append(
        Chatterbox.render( 'pager.notice', notice.options )
    );
    
    notice.frame = this.el.m.find( '#' + notice.options.ref ).last();
    notice.close = notice.frame.find('a.close_notice');
    notice.foot = notice.frame.find('footer.buttons');
    var bopt = {};
    
    for( var b in notice.options.buttons ) {
        if( !notice.options.buttons.hasOwnProperty( b ) )
            continue;
        
        bopt = notice.options.buttons[b];
        notice.foot.append( Chatterbox.render('pager.button', bopt) );
        notice.b[b] = notice.foot.find('a#' + bopt.ref);
        notice.b[b].click( bopt.click );
    }
    
    var p = this;
    
    notice.close.click( function(  ) {
        notice.onclose();
        p.remove_notice( notice );
        return false;
    } );
    
    if( !sticky ) {
        if( !lifespan )
            lifespan = p.lifespan;
        
        setTimeout( function(  ) {
            p.remove_notice( notice, true );
        }, lifespan );
    }
    
    if( silent !== true )
        this.manager.sound.click();
    
    return notice;

};

/**
 * Remove a given notice from the pager.
 * 
 * @remove_notice
 */
Chatterbox.Pager.prototype.remove_notice = function( notice, interrupt ) {

    var p = this;
    
    if( this.notices.indexOf( notice ) == -1 )
        return false;
    
    notice.frame.fadeTo( ( interrupt ? this.halflife : 300 ), 0 ).slideUp( function(  ) {
        notice.frame.remove();
        p.notices.splice( p.notices.indexOf( notice ), 1 );
        notice.ondestroy();
    } );
    
    if( interrupt ) {
        notice.frame.mouseenter( function(  ) {
            if( p.notices.indexOf( notice ) == -1 )
                return;
            
            notice.frame.stop( true );
            
            notice.frame.slideDown( function(  ) {
                notice.frame.fadeTo(300, 1);
                
                notice.frame.mouseleave( function(  ) {
                    setTimeout( function(  ) {
                        p.remove_notice( notice, true );
                    }, p.lifespan );
                } );
            } );
        } );
    }

};

/**
 * Find a notice based on the reference.
 *
 */
Chatterbox.Pager.prototype.find_notice = function( reference ) {

    for( var i in this.notices ) {
        if( this.notices[i].options.ref == reference ) {
            return this.notices[i];
        }
    }
    
    return null;

};
/**
 * Popup window base class.
 *
 * Should allow people to easily create popups... or something.
 * Subclasses of the popups should provide a way of closing the popup, or
 * maybe I could change things around a bit so there's always a close button in
 * the top right corner. That said, the settings window looks good with the
 * close button at the bottom. Maybe make that configurable. Use a flag to
 * determine whether or not this class applies the close function or not?
 * 
 * @class Chatterbox.Popup
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Popup = function( ui, options ) {

    this.manager = ui;
    this.pview = ( this.manager || {view: {find: function(){}} } ).view;
    this.window = null;
    this.closeb = null;
    this.options = Object.extend({
        'ref': 'popup',
        'title': 'Popup',
        'close': true,
        'content': ''
    }, (options || {}));

};

/**
 * Build the popup window.
 * This should be pretty easy.
 *
 * @method build
 */
Chatterbox.Popup.prototype.build = function(  ) {

    var fill = this.options;
    
    if( this.options.close ) {
        fill.title+= '<a href="#close" class="close iconic x"></a>';
    }
    
    this.pview.append(Chatterbox.render( 'popup', fill ));
    this.window = this.pview.find('.floater.' + fill.ref);
    
    if( this.options.close ) {
        this.closeb = this.window.find('a.close');
        var popup = this;

        this.closeb.click(
            function( event ) {
                popup.close();
                return false;
            }
        );
    }

};

/**
 * Close the popup.
 * 
 * @method close
 */
Chatterbox.Popup.prototype.close = function(  ) {
    
    this.window.remove();
    
};

/**
 * Prompt popup.
 * This should be used for retrieving input from the user.
 */
Chatterbox.Popup.Prompt = function( ui, options ) {

    options = options || {};
    options = Object.extend( {
        'position': [0, 0],
        'ref': 'prompt',
        'title': 'Input',
        'close': false,
        'label': '',
        'default': '',
        'submit-button': 'Submit',
        'event': {
            'submit': function(  ) {},
            'cancel': function(  ) {}
        }
    }, options );
    
    Chatterbox.Popup.call( this, ui, options );
    this.data = this.options['default'];

};

Chatterbox.Popup.Prompt.prototype = new Chatterbox.Popup();
Chatterbox.Popup.Prompt.prototype.constructor = Chatterbox.Popup.Prompt;

/**
 * Build the prompt.
 * 
 * @method build
 */
Chatterbox.Popup.Prompt.prototype.build = function(  ) {

    this.options.content = Chatterbox.template.prompt.main;
    Chatterbox.Popup.prototype.build.call(this);
    this.window.css({
        'left': this.options.position[0],
        'top': this.options.position[1]
    });
    
    var prompt = this;
    
    this.window.find('.button.close').click( function(  ) {
        prompt.options.event.cancel( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('.button.submit').click( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('form').submit( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );

};

/**
 * Emote picker.
 * This should be used for retrieving input from the user.
 */
Chatterbox.Popup.ItemPicker = function( ui, options ) {

    options = options || {};
    options = Object.extend( {
        'position': [100, 60],
        'ref': 'item-picker',
        'title': 'Items',
        'event': {
            'select': function( item ) {}
        }
    }, options );
    
    Chatterbox.Popup.call( this, ui, options );
    this.pview = this.pview.find('.chatbook');
    this.data = this.options['default'];
    this.pages = [];
    this.cpage = null;

};

Chatterbox.Popup.ItemPicker.prototype = new Chatterbox.Popup();
Chatterbox.Popup.ItemPicker.prototype.constructor = Chatterbox.Popup.ItemPicker;

Chatterbox.Popup.ItemPicker.prototype.build = function(  ) {

    this.options.content = Chatterbox.render('ip.main', {});
    Chatterbox.Popup.prototype.build.call(this);
    this.window.css({
        'right': this.options.position[0],
        'bottom': this.options.position[1]
    });
    this.closeb.removeClass('medium');
    this.pbook = this.window.find('section.pages');
    this.tabs = this.window.find('section.tabs ul');
    this.buttons = this.window.find('section.buttons');
    
    var ip = this;
    var page = null;
    
    for( var i in this.pages ) {
        if( !this.pages.hasOwnProperty(i) )
            continue;
        page = this.pages[i];
        page.build();
        if( i == 0 )
            this.select_page(page);
    }

};

Chatterbox.Popup.ItemPicker.prototype.refresh = function(  ) {
    
    if( this.cpage == null ) {
        return;
    } else {
        this.cpage.refresh();
    }

};

Chatterbox.Popup.ItemPicker.prototype.page = function( name, dpage ) {

    name = name.toLowerCase();
    
    for( var i in this.pages ) {
        if( !this.pages.hasOwnProperty(i) )
            continue;
        if( this.pages[i].name.toLowerCase() == name )
            return this.pages[i];
    }
    
    return (dpage || null);

};

Chatterbox.Popup.ItemPicker.prototype.add_page = function( options, pclass ) {

    this.pages.push( new ( pclass || Chatterbox.Popup.ItemPicker.Page )( this, options ) );

};

Chatterbox.Popup.ItemPicker.prototype.add_button = function( options ) {

    options = Object.extend( {
        'href': '#button',
        'title': 'Button',
        'label': 'Button'
    }, ( options || {} ) );
    
    this.buttons.append(Chatterbox.render( 'ip.button', options ));
    return this.buttons.find('a[href='+options.href+']');

};

Chatterbox.Popup.ItemPicker.prototype.select = function( item ) {

    this.options.event.select(item);

};

Chatterbox.Popup.ItemPicker.prototype.select_page = function( page ) {

    if( !page )
        return;
    
    if( this.cpage != null )
        this.cpage.hide();
    
    this.cpage = page || null;
    
    if( this.cpage != null )
        this.cpage.show();

};

Chatterbox.Popup.ItemPicker.Page = function( picker, options ) {

    this.picker = picker;
    this.options = Object.extend( {
        'ref': 'page',
        'href': '#page',
        'label': 'Page',
        'title': 'page',
        'items': [],
        'content': '<em>No items on this page.</em>',
    }, ( options || {} ));
    this.name = this.options.label;
    this.nrefresh = true;

};

Chatterbox.Popup.ItemPicker.Page.prototype.build = function(  ) {

    this.picker.pbook.append( Chatterbox.render('ip.page', this.options) );
    this.picker.tabs.append(Chatterbox.render('ip.tab', this.options));
    this.view = this.picker.pbook.find('div.page#'+this.options.ref);
    this.items = this.view.find('ul');
    this.tab = this.picker.tabs.find('#'+this.options.ref);
    
    this.refresh();
    
    var page = this;
    this.tab.find('a').click( function(  ) {
        page.picker.select_page( page );
        return false;
    } );

};

Chatterbox.Popup.ItemPicker.Page.prototype.refresh = function(  ) {

    var content = this.build_list();
    if( content.length == 0 ) {
        this.options.content = '<em>No items on this page.</em>';
    } else {
        this.options.content = '<ul>' + content + '</ul>';
    }
    this.view.html(this.options.content);
    this.items = this.view.find('ul');
    this.hook_events();
    this.nrefresh = false;

};

Chatterbox.Popup.ItemPicker.Page.prototype.hook_events = function(  ) {

    var page = this;
    this.items.find('li').each( function( index, elem ) {
        var obj = page.view.find(elem);
        var item = obj.find('.value').html();
        obj.click( function(  ) {
            page.picker.select(item);
        } );
    } );

};

Chatterbox.Popup.ItemPicker.Page.prototype.build_list = function(  ) {

    var ul = [];
    var item = null;
    var title, val, html;
    for( var i in this.options.items ) {
        if( !this.options.items.hasOwnProperty(i) )
            continue;
        item = this.options.items[i];
        val = item.value || item;
        title = item.title || val;
        html = item.html || false;
        ul.push(
            '<li class="item" title="'+title+'">\
            <span class="hicon"><i class="iconic check"></i></span>\
            '+ ( html ? val : '<span class="value">'+val+'</span>' ) + '\
            </li>'
        );
    }
    
    return ul.join('');

};

Chatterbox.Popup.ItemPicker.Page.prototype.show = function(  ) {

    this.tab.addClass('selected');
    this.view.css('display', 'block');
    this.refresh();

};

Chatterbox.Popup.ItemPicker.Page.prototype.hide = function(  ) {

    this.tab.removeClass('selected');
    this.view.css('display', 'none');

};







/**
 * Settings popup window.
 * Provides stuff for doing things. Yay.
 *
 * @class Chatterbox.Settings
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
    this.manager = ui;

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
    
    this.config.build(this.manager, this);
    
    this.window.find('ul.tabs li').first().addClass('active');
    this.window.find('div.book div.page').first().addClass('active');
    
    var settings = this;
    this.window.find('form').bind('change', function(  ) { settings.changed = true; });
    
    this.config.each_page( function( index, page ) {
        page.each_item( function( index, item ) {
            item._onchange = function( event ) {
                settings.changed = true;
            };
        } );
    } );
    
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
    this.book.width( wrap.innerWidth() - 20 );
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
    this.manager.trigger( 'settings.save', { 'config': this.config } );

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
    this.manager.trigger( 'settings.close', { 'config': this.config } );

};

/**
 * Settings options object.
 * Extensions can configure the settings window with this shit yo.
 * 
 * @class Chatterbox.Settings.Config
 * @constructor
 */
Chatterbox.Settings.Config = function( ui ) {

    this.manager = ui || null;
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

    var n = name.toLowerCase();
    var page;
    
    for( var index in this.pages ) {
    
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
Chatterbox.Settings.Config.prototype.build = function( ui, window ) {

    ui = ui || this.manager;
    
    for( var i in this.pages ) {
    
        this.pages[i].build(ui, window);
    
    }

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Config.prototype.resize = function(  ) {

    for( var i in this.pages ) {
    
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
    push = push || true;
    
    if( page == null ) {
        page = new Chatterbox.Settings.Page(name, this.manager);
        if( push ) {
            this.pages.push(page);
        } else {
            this.pages.unshift(page);
        }
    }
    
    return page;

};


Chatterbox.Settings.Config.prototype.each_page = function( method ) {

    var page = null;
    var result = null;
    
    for( var i in this.pages ) {
    
        if( !this.pages.hasOwnProperty(i) )
            continue;
        
        page = this.pages[i];
        result = method( i, page );
        
        if( result === false )
            break;
    
    }

};

/**
 * Save settings.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Config.prototype.save = function( window ) {

    for( var i in this.pages ) {
    
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

    for( var i in this.pages ) {
    
        this.pages[i].close(window);
    
    }

};


/**
 * Settings page config object.
 * 
 * @class Chatterbox.Settings.Page
 * @constructor
 * @param name {String} Name of the page.
 */
Chatterbox.Settings.Page = function( name, ui) {

    this.name = name;
    this.lname = name.toLowerCase();
    this.ref = replaceAll(this.lname, ' ', '_');
    //this.content = '';
    this.items = [];
    this.itemo = {};
    this.manager = ui;

};

/**
 * Render and display the settings page in the given settings window.
 * 
 * @method build
 * @param window {Object} Settings window object.
 */
Chatterbox.Settings.Page.prototype.build = function( ui, window ) {

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
    
    for( var i in this.items ) {
    
        this.items[i].build(this.view);
    
    }

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Page.prototype.resize = function(  ) {

    for( var i in this.items ) {
    
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
    var item = Chatterbox.Settings.Item.get( type, options, this.manager );
    
    if( shift ) {
        this.items.unshift(item);
    } else {
        this.items.push(item);
    }
    
    if( options.hasOwnProperty('ref') ) {
        this.itemo[options.ref] = item;
    }
    
    return item;

};

Chatterbox.Settings.Page.prototype.get = function( item ) {

    if( this.itemo.hasOwnProperty( item ) )
        return this.itemo[item];
    return null;

};

Chatterbox.Settings.Page.prototype.each_item = function( method ) {

    var item = null;
    var result = null;
    
    for( var i in this.items ) {
    
        if( !this.items.hasOwnProperty(i) )
            continue;
        
        item = this.items[i];
        result = method( i, item );
        
        if( result === false )
            break;
    
    }

};

/**
 * Save page data.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Page.prototype.save = function( window ) {

    for( var i in this.items ) {
    
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

    for( var i in this.items ) {
    
        this.items[i].close(window, this);
    
    }

};


/**
 * A base class for settings page items.
 * 
 * @class Chatterbox.Settings.Item
 * @constructor
 * @param type {String} Determines the type of the item.
 * @param options {Object} Options for the item.
 */
Chatterbox.Settings.Item = function( type, options, ui ) {

    this.manager = ui || null;
    this.options = options || {};
    this.type = type || 'base';
    this.selector = this.type.toLowerCase();
    this.items = [];
    this.itemo = {};
    this.view = null;
    this.val = null;
    this._onchange = this._event_stub;

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
    var content = this.content();
    
    if( content.length == 0 )
        return;
    
    var wclass = '';
    if( this.options.hasOwnProperty('wclass') )
        wclass = ' ' + this.options.wclass;
    
    var item = Chatterbox.render('settings.item.wrap', {
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
    
    var iopt;
    var type;
    var options;
    var cls;
    
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
        
        if( options.hasOwnProperty('ref') ) {
            this.itemo[options.ref] = sitem;
        }
    
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

    for( var i in this.items ) {
    
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
    
    var pair = [];
    
    for( var i in titem.events ) {
    
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
    
    var pair = [];
    
    for( var i in titem.events ) {
    
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
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
            cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
        }
    }
    
    for( var i in this.items ) {
    
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

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
        return;
    }
    
    for( var i in cb ) {
        var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
        cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
    }
    
    for( var i in this.items ) {
    
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
Chatterbox.Settings.Item.get = function( type, options, ui, base, defaultc ) {

    var types = type.split('.');
    var item = base || Chatterbox.Settings.Item;
    var cls;
    
    for( var i in types ) {
        cls = types[i];
        if( !item.hasOwnProperty( cls ) ) {
            item = defaultc || Chatterbox.Settings.Item;
            break;
        }
        item = item[cls];
    }
    
    return new item( type, options, ui );

};


/**
 * HTML form as a single settings page item.
 * This item should be given settings items to use as form fields.
 * 
 * @class Chatterbox.Settings.Item.Form
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
    this.fieldo = {};

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

    return Chatterbox.Settings.Item.get( type, options, this.manager, Chatterbox.Settings.Item.Form, Chatterbox.Settings.Item.Form.Field );

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
    
    var f;
    var field;
    
    for( var i in this.options.fields ) {
        f = this.options.fields[i];
        field = Chatterbox.Settings.Item.Form.field( f[0], f[1] );
        this.fields.push( field );
        field.build( this );
        if( f[1].hasOwnProperty('ref') ) {
            this.fieldo[f[1].ref] = field;
        }
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

    for( var i in this.fields ) {
    
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

    var data = {};
    var field;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('change');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this } );
    } else {
        for( var i in cb ) {
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
    var fields;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
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

    var data = {};
    var field;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            cb[i]( { 'data': data, 'form': this, 'page': page, 'window': window } );
        }
    }

};


/**
 * Base class for form fields.
 * 
 * @class Chatterbox.Settings.Item.Form.Field
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
 * @class Chatterbox.Settings.Item.Form.Radio
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
 * @class Chatterbox.Settings.Item.Form.Checkbox
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Checkbox = function( type, options ) {

    Chatterbox.Settings.Item.Form.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Form.Checkbox.prototype = new Chatterbox.Settings.Item.Form.Radio();
Chatterbox.Settings.Item.Form.Checkbox.prototype.constructor = Chatterbox.Settings.Item.Form.Checkbox;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Checkbox.prototype.build = function( form ) {

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
            'field': Chatterbox.render('settings.item.form.field.checkbox', this.options)
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
Chatterbox.Settings.Item.Form.Checkbox.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.find('.checkbox').height() );

};


/**
 * Form colour field.
 * 
 * @class Chatterbox.Settings.Item.Form.Colour
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Colour = function( type, options ) {

    Chatterbox.Settings.Item.Form.Field.call(this, type, options);

};

Chatterbox.Settings.Item.Form.Colour.prototype = new Chatterbox.Settings.Item.Form.Field();
Chatterbox.Settings.Item.Form.Colour.prototype.constructor = Chatterbox.Settings.Item.Form.Colour;

/**
 * Build the colour field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Colour.prototype.build = function( form ) {

    Chatterbox.Settings.Item.Form.Field.prototype.build.call(this, form);
    this.resize();

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Colour.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.height() );

};


/**
 * Radio box item.
 * 
 * @class Chatterbox.Settings.Item.Radio
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
 * @class Chatterbox.Settings.Item.Checkbox
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Checkbox = function( type, options ) {

    Chatterbox.Settings.Item.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Checkbox.prototype = new Chatterbox.Settings.Item.Radio();
Chatterbox.Settings.Item.Checkbox.prototype.constructor = Chatterbox.Settings.Item.Checkbox;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Checkbox.prototype.build = function( page ) {

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
 * Check box item.
 * 
 * @class Chatterbox.Settings.Item.Items
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Items = function( type, options, ui ) {

    options = Object.extend( {
        'prompt': {
            'title': 'Add Item',
            'label': 'Item:',
            'submit-button': 'Add'
        }
    }, ( options || {} ) );
    Chatterbox.Settings.Item.call(this, type, options, ui);
    this.selected = false;

};

Chatterbox.Settings.Item.Items.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Items.prototype.constructor = Chatterbox.Settings.Item.Items;

/**
 * Build the Items field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Items.prototype.build = function( page ) {
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    var mgr = this;
    this.list = this.view.find('ul');
    this.buttons = this.view.find('section.buttons p');
    
    var listing = this.list.find('li');
    
    listing.click( function( event ) {
        var el = mgr.list.find(this);
        mgr.list.find('li.selected').removeClass('selected');
        mgr.selected = el.find('.item').html();
        el.addClass('selected');
    } );
    
    listing.each( function( index, item ) {
        var el = mgr.list.find(item);
        el.find('a.close').click( function( event ) {
            mgr.list.find('li.selected').removeClass('selected');
            mgr.selected = el.find('.item').html();
            el.addClass('selected');
            mgr.remove_item();
            return false;
        } );
    } );
    
    this.buttons.find('a.button.up').click( function( event ) {
        mgr.shift_item( true );
        return false;
    } );
    this.buttons.find('a.button.down').click( function( event ) {
        mgr.shift_item();
        return false;
    } );
    this.buttons.find('a.button.add').click( function( event ) {
        var iprompt = new Chatterbox.Popup.Prompt( mgr.manager, {
            'position': [event.clientX - 100, event.clientY - 50],
            'title': mgr.options.prompt.title,
            'label': mgr.options.prompt.label,
            'submit-button': mgr.options.prompt['submit-button'],
            'event': {
                'submit': function( prompt ) {
                    var data = prompt.data;
                    if( !data ) {
                        prompt.options.event.cancel( prompt );
                        return;
                    }
                    
                    data = data.toLowerCase();
                    var index = mgr.options.items.indexOf(data);
                    if( index != -1 ) {
                        prompt.options.event.cancel( prompt );
                        return;
                    }
                    
                    mgr._fevent( 'add', {
                        'item': data
                    } );
                    
                    mgr.refresh();
                    mgr._onchange({});
                },
                'cancel': function( prompt ) {
                    mgr._fevent('cancel', {});
                    mgr.refresh();
                    mgr._onchange({});
                }
            }
        } );
        iprompt.build();
        return false;
    } );
    this.buttons.find('a.button.close').click( function( event ) {
        mgr.remove_item();
        return false;
    } );

};

Chatterbox.Settings.Item.Items.prototype.shift_item = function( direction ) {

    if( this.selected === false )
        return;
    
    var first = this.options.items.indexOf( this.selected );
    var second = first + 1;
    
    if( direction )
        second = first - 1;
    
    if( first == -1 || first >= this.options.items.length )
        return;
    
    if( second < 0 || second >= this.options.items.length )
        return;
    
    this._fevent(( direction ? 'up' : 'down' ), {
        'swap': {
            'this': { 'index': first, 'item': this.options.items[first] },
            'that': { 'index': second, 'item': this.options.items[second] }
        }
    });
    
    this.refresh();
    this._onchange({});
    return;

};

Chatterbox.Settings.Item.Items.prototype.remove_item = function(  ) {

    if( this.selected === false )
        return false;
    
    var index = this.options.items.indexOf( this.selected );
    if( index == -1 || index >= this.options.items.length )
        return;
    
    this._fevent( 'remove', {
        'index': index,
        'item': this.selected
    } );
    
    this.selected = false;
    this.refresh();
    this._onchange({});
};

Chatterbox.Settings.Item.Items.prototype.refresh = function(  ) {

    this.view.find('section.mitems').html(
        Chatterbox.template.settings.krender.manageditems(this.options.items)
    );
    this.list = this.view.find('ul');
    this.list.find('li[title=' + (this.selected || '').toLowerCase() + ']')
        .addClass('selected');
    
    var mgr = this;
    var listing = this.list.find('li');
    
    listing.click( function( event ) {
        var el = mgr.list.find(this);
        mgr.list.find('li.selected').removeClass('selected');
        mgr.selected = el.find('.item').html();
        el.addClass('selected');
    } );
    
    listing.each( function( index, item ) {
        var el = mgr.list.find(item);
        el.find('a.close').click( function( event ) {
            mgr.list.find('li.selected').removeClass('selected');
            mgr.selected = el.find('.item').html();
            el.addClass('selected');
            mgr.remove_item();
            return false;
        } );
    } );

};

Chatterbox.Settings.Item.Items.prototype._fevent = function( evt, args ) {

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb(evt);
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'args': args } );
    } else {
        for( var i in cb ) {
            var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
            cb[i]( { 'input': sinps, 'item': this, 'args': args } );
        }
    }

};

Chatterbox.Settings.Item.Items.prototype.save = function(  ) {

    this._fevent('save', {
        'items': this.options['items'] || []
    });

};




/**
 * Container object for HTML5 templates for the chat UI.
 * 
 * @class template
 */
Chatterbox.template = {};

/**
 * Helper method to render templates.
 * This method is actually a static method on the Chatterbox module.
 * 
 * @method render
 * @param template {String} Name of the template to render.
 * @param fill {Object} Variables to render the template with.
 * @param use {Boolean} Use `template` as the actual template rather than the name.
 */
Chatterbox.render = function( template, fill, use, base ) {

    var html = base || Chatterbox.template;
    var renderer = {};
    var tmpl = null;
    var part = null;
    
    if( use !== undefined && use === true ) {
        html = template;
    } else {
        var tparts = template.split('.');
        for( var ind in tparts ) {
            part = tparts[ind];
            if( !html.hasOwnProperty( part ) )
                return '';
            html = html[part];
        }
    }
    
    if( html.hasOwnProperty('frame') ) {
        tmpl = html;
        renderer = html.render || {};
        html = html.frame;
        if( tmpl.hasOwnProperty('pre') ) {
            if( typeof tmpl.pre == 'function' ) {
                html = tmpl.pre( html, fill );
            } else {
                for( i in tmpl.pre ) {
                    html = tmpl.pre[i]( html, fill );
                }
            }
        }
    }
    
    for( key in fill ) {
        html = replaceAll(html, '{'+key+'}', ( renderer[key] || Chatterbox.template.render_stub )( fill[key] || '' ));
    }
    
    if( tmpl != null ) {
        if( tmpl.hasOwnProperty('post') ) {
            if( typeof tmpl.post == 'function' ) {
                html = tmpl.post( html, fill );
            } else {
                for( i in tmpl.post ) {
                    html = tmpl.post[i]( html, fill );
                }
            }
        }
    }
    
    return html;

};

Chatterbox.template.render_stub = function( data ) { return data; };
Chatterbox.template.clean = function( keys ) {

    return function( html, fill ) {
        for( i in keys ) {
            html = replaceAll( html, '{'+keys[i]+'}', '' );
        }
        return html;
    };

};


/**
 * This template provides the HTML for a chat client's main view.
 *
 * @property ui
 * @type String
 */
Chatterbox.template.ui = '<div class="soundbank">\
            <audio class="click">\
                <source src="{media}click.ogg" type="audio/ogg">\
                <source src="{media}click.mp3" type="audio/mpeg">\
            </audio>\
        </div>\
        <div class="pager">\
        </div>\
        <nav class="tabs"><div class="tabwrap"><ul id="chattabs" class="tabs"></ul></div>\
        <ul id="tabnav">\
            <li><a href="#left" class="button iconic arrow_left"></a></li>\
            <li><a href="#right" class="button iconic arrow_right"></a></li>\
            <li><a href="#settings" title="Change client settings" class="button iconic cog" id="settings-button"></a></li>\
        </ul>\
        </nav>\
        <div class="chatbook"></div>';

/**
 * HTML for an input panel.
 * 
 * @property control
 * @type String
 */
Chatterbox.template.control = '<div class="chatcontrol">\
            <div class="brow">\
                <ul class="buttons">\
                    <li><a href="#multiline" title="Toggle multiline input" class="button iconic list"></a></li>\
                </ul>\
                <ul class="states">\
                </ul>\
            </div>\
            <form class="msg">\
                <input type="text" class="msg" />\
                <textarea class="msg"></textarea>\
                <input type="submit" value="Send" class="sendmsg" />\
            </form>\
        </div>';

Chatterbox.template.brow_button = '<li><a href="{href}" title="{title}" class="button{icon}">{label}</a></li>';
Chatterbox.template.brow_state = '<li id="{ref}">{label}</li>';

Chatterbox.template.nav_button = '<li><a href="{href}" title="{title}" class="button{icon}">{label}</a></li>';

/**
 * HTML for a channel tab.
 * 
 * @property tab
 * @type String
 */
Chatterbox.template.tab = '<li id="{selector}-tab"><a href="#{selector}" class="tab">{ns}<a href="#{selector}" class="close iconic x"></a></a></li>';

/**
 * HTML template for a base channel view.
 * 
 * @property basetab
 * @type String
 */
Chatterbox.template.basetab = '<div class="chatwindow" id="{selector}-window"></div>';

/**
 * HTML template for a feed view.
 * 
 * @property channel
 * @type String
 */
Chatterbox.template.feed = '<div class="chatwindow feed" id="{selector}-window">\
                    <header class="info">\
                        <h2>{name}<span class="type">{type} feed</span></h2>\
                        <p>{info}</p>\
                        <ul class="control">\
                            <li><a href="#post" class="button iconic pen" title="Post a message on"></a></li>\
                            <li><a href="#refresh" class="button iconic spin" title="Get updates"></a></li>\
                            <li><a href="#close" class="button iconic x" title="Close feed reader"></a></li>\
                        </ul>\
                    </header>\
                    <div class="log" id="{selector}-log">\
                        <ul class="logwrap"></ul>\
                    </div>\
                    <div class="users" id="{selector}-users"></div>\
                </div>';
/**
 * HTML template for a feed message.
 * @property feedmsg
 * @type String
 */
Chatterbox.template.feedmsg = '<li id="{ref}">\
                                <article>\
                                    <a href="#close" class="iconic x" title="Remove feed message"></a>\
                                    <section class="label">{icon}</section>\
                                    <section class="content">\
                                        <h3>{title}</h3>\
                                        {content}\
                                    </section>\
                                </article>\
                            </li>';

/**
 * HTML template for a channel view.
 * 
 * @property channel
 * @type String
 */
Chatterbox.template.channel = '<div class="chatwindow" id="{selector}-window">\
                    <header class="title">\
                        <div class="title"></div>\
                        <textarea></textarea>\
                        <a href="#edit" class="button iconic pen" title="Edit the title"></a>\
                        <a href="#save" class="button iconic check" title="Save changes"></a>\
                        <a href="#cancel" class="button iconic x" title="Cancel"></a>\
                    </header>\
                    <div class="chatlog" id="{selector}-log">\
                        <header class="topic">\
                            <div class="topic"></div>\
                            <textarea></textarea>\
                            <a href="#edit" class="button iconic pen" title="Edit the topic"></a>\
                            <a href="#save" class="button iconic check" title="Save changes"></a>\
                            <a href="#cancel" class="button iconic x" title="Cancel"></a>\
                        </header>\
                        <ul class="logwrap"></ul>\
                    </div>\
                    <div class="chatusers" id="{selector}-users">\
                </div>\
            </div>';

/**
 * Channel header HTML template.
 * 
 * @property header
 * @type String
 */
Chatterbox.template.header = '<div class="{head}">{content}</div>';

/**
 * Log message template.
 * 
 * @property logmsg
 * @type String
 */
Chatterbox.template.logmsg = '<span class="message">{message}</span>';

/**
 * Simple log template.
 * 
 * @property logitem
 * @type String
 */
Chatterbox.template.logitem = '<li class="logmsg u-{user}"><span class="ts" id="{ms}">{ts}</span> {message}</li>';

/**
 * Server message template.
 * 
 * @property servermsg
 * @type String
 */
Chatterbox.template.servermsg = '<span class="servermsg">** {message} * <em>{info}</em></span>';

/**
 * User message template.
 * 
 * @property usermsg
 * @type String
 */
Chatterbox.template.usermsg = '<strong class="user">&lt;{user}&gt;</strong> {message}';

/**
 * User info box (userlist hover)
 * 
 * @property userinfo
 * @type String
 */
Chatterbox.template.userinfo = '<div class="userinfo" id="{username}">\
                            <div class="avatar">\
                                {avatar}\
                            </div><div class="info">\
                            <strong>\
                            {link}\
                            </strong>\
                            <ul>{info}</ul></div>\
                        </div>';

                        
Chatterbox.template.loginfobox = '<li class="loginfo {ref}"><a href="#{ref}" class="close iconic x"></a>{content}</li>';
Chatterbox.template.whois = {};
Chatterbox.template.whoiswrap = '<div class="whoiswrap">\
                                <div class="avatar">{avatar}</div>\
                                <div class="info">{info}</div>\
                                </div>';
Chatterbox.template.whoisinfo = '<p>{username}</p><ul>{info}</ul>{connections}';
Chatterbox.template.pcinfo = '<section class="pcinfo"><strong>{title}</strong>{info}</section>';

/**
 * Container for popup shit.
 * 
 * @property popup
 * @type String
 */
Chatterbox.template.popup = '<div class="floater {ref}"><div class="inner"><h2>{title}</h2><div class="content">{content}</div></div></div>';

Chatterbox.template.ip = {};
Chatterbox.template.ip.main = {};
Chatterbox.template.ip.main.frame = '<section class="tabs"><ul></ul></section>\
        <section class="pages"></section>\
        <section class="buttons"></section>';

Chatterbox.template.ip.page = { 'frame': '<div class="page" id="{ref}">{content}</div>' };
Chatterbox.template.ip.button = { 'frame': '<a href="{href}" title="{title}" class="button text">{label}</a>' };
Chatterbox.template.ip.tab = {'frame': '<li class="tab" id="{ref}"><a href="{href}" title="{title}">{label}</a></li>' };

Chatterbox.template.prompt = {};
Chatterbox.template.prompt.main = '<span class="label">{label}</span>\
    <span class="input"><form><input type="text" value="{default}" /></form></span>\
    <span class="buttons">\
    <a href="#submit" class="button submit">{submit-button}</a>\
    <a href="#remove" class="button close big square iconic x"></a>\
    </span>';

/**
 * Pager notices and such.
 */
Chatterbox.template.pager = {
    notice: {
        frame: '<div class="notice" id="{ref}">\
            <a href="#close" class="close_notice iconic x"></a>\
            <div class="icon">{icon}</div>\
            <div class="content">\
                <h3>{heading}</h3>\
                <p>{content}</p>\
                <footer class="buttons"></footer>\
            </div>\
            </div>'
    },
    button: {
        frame: '<a href="#{target}" title="{title}" id="{ref}" class="button text">{label}</a>'
    }
};

/**
 * Settings stuff.
 */
Chatterbox.template.settings = {};
Chatterbox.template.settings.main = '<div class="bookwrap">\
                                <nav class="tabs">\
                                    <ul class="tabs"></ul>\
                                </nav>\
                                <div class="book"></div>\
                            </div>\
                            <footer>\
                                <a href="#save" class="button save">Save</a> <a href="#saveclose" class="button saveclose">Save & Close</a> <a href="#close" class="button close big square iconic x"></a>\
                            </footer>';

Chatterbox.template.settings.page = '<div class="page" id="{ref}-page"></div>';
Chatterbox.template.settings.tab = '<li id="{ref}-tab"><a href="#{ref}" class="tab" id="{ref}-tab">{name}</a></li>';

// Key renderers.
Chatterbox.template.settings.krender = {};
Chatterbox.template.settings.krender.title = function( title ) {
    if( title.length == 0 )
        return '';
    return '<h3>' + title + '</h3>';
};
Chatterbox.template.settings.krender.text = function( text ) { return replaceAll(text, '\n\n', '\n</p><p>\n'); };
Chatterbox.template.settings.krender.dditems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    
    for( i in items ) {
    
        item = items[i];
        render+= '<option value="' + item.value + '"';
        if( item.selected ) {
            render+= ' selected="yes"';
        }
        render+= '>' + item.title + '</option>';
    
    }
    return render;
};
Chatterbox.template.settings.krender.radioitems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    labels = [];
    fields = [];
    
    for( i in items ) {
    
        item = items[i];
        labels.push(Chatterbox.render('settings.item.form.label', {
            'ref': item.value,
            'label': item.title
        }));
        
        ritem = '<div class="'+item.value+' field radio"><input class="'+item.value+'" type="radio" name="'+item.name+'" value="' + item.value + '"'
        if( item.selected ) {
            ritem+= ' checked="yes"';
        }
        fields.push(ritem + ' /></div>');
    
    }
    
    return '<section class="labels">' + labels.join('') + '</section><section class="fields">' + fields.join('') + '</section>';
};
Chatterbox.template.settings.krender.checkitems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    labels = [];
    fields = [];
    
    for( i in items ) {
    
        item = items[i];
        if( 'title' in item ) {
            labels.push(Chatterbox.render('settings.item.form.label', {
                'ref': item.value,
                'label': item.title
            }));
        }
        
        ritem = '<div class="'+item.value+' field check"><input class="'+item.value+'" type="checkbox" name="'+item.name+'" value="' + item.value + '"'
        if( item.selected ) {
            ritem+= ' checked="yes"';
        }
        fields.push(ritem + ' /></div>');
    
    }
    
    if( labels.length > 0 ) {
        render+= '<section class="labels">' + labels.join('') + '</section>';
    }
    
    return render + '<section class="fields">' + fields.join('') + '</section>';
};

Chatterbox.template.settings.krender.manageditems = function( items ) {
    if( items.length == 0 )
        return '<i>No items in this list</i>';
    
    var render = '<ul>';
    var labels = [];
    var fields = [];
    var item;
    
    for( var i in items ) {
    
        if( !items.hasOwnProperty(i) )
            continue;
        
        item = items[i];
        render+= '<li title="' + item.toLowerCase() + '">\
                  <span class="remove"><a href="#remove" title="Remove item" class="close iconic x"></a></span>\
                  <span class="item">' + item + '</span>\
                  </li>';
    
    }
    
    return render + '</ul>';
};

Chatterbox.template.settings.item = {};
Chatterbox.template.settings.item.get = function( type ) {

    var tp = type.split('.');
    var item = Chatterbox.template.settings.item;
    
    for( i in tp ) {
        tc = tp[i];
        if( item.hasOwnProperty(tc) ) {
            item = item[tc];
            continue;
        }
        return null;
    }
    
    return item;

};

Chatterbox.template.settings.item.wrap = '<section class="item {type} {ref}{class}">\
                                    {content}\
                                </section>';
                                
Chatterbox.template.settings.item.hint = {};
Chatterbox.template.settings.item.hint.frame = '<aside class="hint">{hint}</aside>{content}';
Chatterbox.template.settings.item.hint.prep = function( html, data ) {

    if( !data.hasOwnProperty('hint') )
        return html;
    
    return Chatterbox.render('settings.item.hint', {
        'hint': data.hint,
        'content': html
    });

};

Chatterbox.template.settings.item.twopane = {};
Chatterbox.template.settings.item.twopane.frame = '{title}<div class="twopane">\
                                        <div class="text left">\
                                            <p>{text}</p>\
                                        </div>\
                                        <div class="right">\
                                            {template}\
                                        </div>\
                                    </div>';

Chatterbox.template.settings.item.twopane.wrap = function( html, data ) {

    if( !data.hasOwnProperty('text') )
        return html;
    
    html = replaceAll(
        Chatterbox.template.settings.item.twopane.frame, 
        '{template}',
        replaceAll(html, '{title}', '')
    );
    
    return html;

};

Chatterbox.template.settings.item.text = {};
Chatterbox.template.settings.item.text.pre = Chatterbox.template.settings.item.hint.prep;
Chatterbox.template.settings.item.text.post = Chatterbox.template.clean(['title', 'text']);
Chatterbox.template.settings.item.text.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.text.frame = '{title}<p>\
                                        {text}\
                                    </p>';

Chatterbox.template.settings.item.dropdown = {};
Chatterbox.template.settings.item.dropdown.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.dropdown.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.dditems
};

Chatterbox.template.settings.item.dropdown.post = Chatterbox.template.clean(['title', 'items']);
Chatterbox.template.settings.item.dropdown.events = [['change', 'select'],['inspect', 'select']];
Chatterbox.template.settings.item.dropdown.frame = '{title}<form>\
                                                <select>\
                                                    {items}\
                                                </select>\
                                            </form>';

Chatterbox.template.settings.item.radio = {};
Chatterbox.template.settings.item.radio.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.radio.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.radioitems
};

Chatterbox.template.settings.item.radio.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.radio.events = [['change', 'input:radio'],['inspect', 'input:radio']];
Chatterbox.template.settings.item.radio.frame = '{title}<div class="{ref} radiobox"><form>{items}</form></div>';

Chatterbox.template.settings.item.checkbox = {};
Chatterbox.template.settings.item.checkbox.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.checkbox.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.checkitems
};

Chatterbox.template.settings.item.checkbox.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.checkbox.events = [['change', 'input:checkbox'],['inspect', 'input:checkbox']];
Chatterbox.template.settings.item.checkbox.frame = '{title}<div class="{ref} checkbox"><form>{items}</form></div>';

Chatterbox.template.settings.item.textfield = {};
Chatterbox.template.settings.item.textfield.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.textfield.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.textfield.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.textfield.events = [['blur', 'input'],['inspect', 'input']];
Chatterbox.template.settings.item.textfield.frame = '{title}<div class="{ref} textfield"><form><input type="text" value="{default}" /></form></div>';

Chatterbox.template.settings.item.textarea = {};
Chatterbox.template.settings.item.textarea.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.textarea.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.textarea.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.textarea.events = [['blur', 'textarea'],['inspect', 'textarea']];
Chatterbox.template.settings.item.textarea.frame = '{title}<div class="{ref} textarea"><form><textarea rows="4" cols="20" value="{default}"></textarea></form></div>';

Chatterbox.template.settings.item.items = {};
Chatterbox.template.settings.item.items.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.items.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.manageditems
};

Chatterbox.template.settings.item.items.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.items.events = [];
Chatterbox.template.settings.item.items.frame = '{title}<div class="{ref} items">\
    <section class="buttons"><p><a href="#up" title="Move item up" class="button up iconic arrow_up"></a>\
    <a href="#down" title="Move item down" class="button down iconic arrow_down"></a>\
    <a href="#add" title="Add an item" class="button add iconic plus"></a>\
    <a href="#remove" title="Remove item from list" class="button close big square iconic x"></a>\
    </p></section>\
    <section class="mitems">{items}</section>\
    </div>';

Chatterbox.template.settings.item.colour = {};
Chatterbox.template.settings.item.colour.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.colour.render = { 'title': Chatterbox.template.settings.krender.title };

Chatterbox.template.settings.item.colour.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.colour.events = [['blur', 'input'],['inspect', 'input']];
Chatterbox.template.settings.item.colour.frame = '{title}<div class="{ref} textfield"><form><input type="color" value="{default}" /></form></div>';

Chatterbox.template.settings.item.form = {};
Chatterbox.template.settings.item.form.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.form.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.dditems
};

Chatterbox.template.settings.item.form.post = Chatterbox.template.clean(['title', 'text', 'items']);
//Chatterbox.template.settings.item.form.events = [['change', 'select'],['inspect', 'select']];
Chatterbox.template.settings.item.form.frame = '{title}<form>\
                                                <section class="labels"></section>\
                                                <section class="fields"></section>\
                                            </form>';

Chatterbox.template.settings.item.form.label = {};
Chatterbox.template.settings.item.form.label.post = Chatterbox.template.clean(['ref', 'label', 'class']);
Chatterbox.template.settings.item.form.label.frame = '<div class="{ref} label{class}"><label for="{ref}">{label}</label></div>';

Chatterbox.template.settings.item.form.field = {};
Chatterbox.template.settings.item.form.field.wrap = {};
Chatterbox.template.settings.item.form.field.wrap.post = Chatterbox.template.clean(['ref', 'field']);
Chatterbox.template.settings.item.form.field.wrap.frame = '<div class="{ref} field">{field}</div>';

Chatterbox.template.settings.item.form.field.dropdown = {};
Chatterbox.template.settings.item.form.field.dropdown.render = { 'items': Chatterbox.template.settings.krender.dditems };
Chatterbox.template.settings.item.form.field.dropdown.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.dropdown.frame = '<select class="{ref}">{items}</select>';

Chatterbox.template.settings.item.form.field.textfield = {};
Chatterbox.template.settings.item.form.field.textfield.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.textfield.frame = '<input class="{ref}" type="text" value="{default}" />';

Chatterbox.template.settings.item.form.field.textarea = {};
Chatterbox.template.settings.item.form.field.textarea.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.textarea.frame = '<textarea class="{ref}" rows="4" cols="20" value="{default}"></textarea>';

Chatterbox.template.settings.item.form.field.radio = {};
Chatterbox.template.settings.item.form.field.radio.render = { 'items': Chatterbox.template.settings.krender.radioitems };
Chatterbox.template.settings.item.form.field.radio.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.radio.frame = '<div class="{ref} radiobox">{items}</div>';

Chatterbox.template.settings.item.form.field.checkbox = {};
Chatterbox.template.settings.item.form.field.checkbox.render = { 'items': Chatterbox.template.settings.krender.checkitems };
Chatterbox.template.settings.item.form.field.checkbox.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.checkbox.frame = '<div class="{ref} checkbox">{items}</div>';

Chatterbox.template.settings.item.form.field.text = {};
Chatterbox.template.settings.item.form.field.text.pre = Chatterbox.template.settings.item.hint.prep;
Chatterbox.template.settings.item.form.field.text.post = Chatterbox.template.clean(['title', 'text']);
Chatterbox.template.settings.item.form.field.text.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.form.field.text.frame = '{title}<p>\
                                        {text}\
                                    </p>';

Chatterbox.template.settings.item.form.field.colour = {};
Chatterbox.template.settings.item.form.field.colour.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.colour.frame = '<input class="{ref}" type="color" value="{default}" />';



