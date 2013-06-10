/**
 * Chatterbox is wsc's default UI library.
 * 
 * @module Chatterbox
 */
var Chatterbox = {};

Chatterbox.VERSION = '0.19.99';
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


