/**
 * This is an alternate thing for the UI module.
 * Chatterbox is basically a thing.
 * 
 * @module Chatterbox
 */
var Chatterbox = {};

Chatterbox.VERSION = '0.4.5';
Chatterbox.STATE = 'beta';

/**
 * This object is the platform for the wsc UI. Everything can be used and
 * loaded from here.
 * 
 * @class UI
 * @constructor
 * @param view {Object} Base jQuery object to use for the UI. Any empty div will do.
 * @param options {Object} Custom settings to use for the UI.
 * @param mozilla {Boolean} Is the browser in use made by Mozilla?
 * @param [events] {Object} EventEmitter object.
 **/
Chatterbox.UI = function( view, options, mozilla, events ) {
    
    this.events = events || new EventEmitter();
    this.mozilla = mozilla;
    this.settings = {
        'themes': ['wsct_default', 'wsct_dAmn'],
        'theme': 'wsct_default',
        'monitor': ['~Monitor', true],
        'username': '',
        'domain': 'website.com'
    };
    view.extend( this.settings, options );
    view.append('<div class="wsc '+this.settings['theme']+'"></div>');
    this.view = view.find('.wsc');
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.monitoro = null;
    this.swidth = getscrollbarWidth();
    this.LIB = 'Chatterbox';
    this.VERSION = Chatterbox.VERSION;
    this.STATE = Chatterbox.STATE;
    
};

/**
 * Used to trigger events.
 *
 * @method trigger
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
 * @param ns {String} Channel namespace to deform.
 * @return {String} The deformed namespace.
 **/
Chatterbox.UI.prototype.deform_ns = function( ns ) {
    if(ns.indexOf("chat:") == 0)
        return '#' + ns.slice(5);
    
    if(ns.indexOf("server:") == 0)
        return '~' + ns.slice(7);
    
    if(ns.indexOf("pchat:") == 0) {
        var names = ns.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    if( ns.indexOf('login:') == 0 )
        return '@' + ns.slice(6);
    
    if(ns[0] != '#' && ns[0] != '@' && ns[0] != '~')
        return '#' + ns;
    
    return ns;
};

/**
 * Format a channel namespace.
 *
 * @method format_ns
 * @param ns {String} Channel namespace to format.
 * @return {String} ns formatted as a channel namespace.
 */
Chatterbox.UI.prototype.format_ns = function( ns ) {
    if(ns.indexOf('#') == 0) {
        return 'chat:' + ns.slice(1);
    }
    if(ns.indexOf('@') == 0) {
        var names = [ns.slice(1), this.lun];
        names.sort(caseInsensitiveSort)
        names.unshift("pchat");
        return names.join(':');
    }
    if(ns.indexOf('~') == 0) {
        return "server:" + ns.slice(1);
    }
    if(ns.indexOf('chat:') != 0 && ns.indexOf('server:') != 0 && ns.indexOf('pchat:') != 0)
        return 'chat:' + ns;
    
    return ns;
};

Chatterbox.UI.prototype.set_events = function( events ) {
    this.events = events || this.events;
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
    
    this.view.append( Chatterbox.template.ui );
    this.control = new ( control || Chatterbox.Control )( this );
    this.nav = new ( navigation || Chatterbox.Navigation )( this );
    this.chatbook = new ( chatbook || Chatterbox.Chatbook )( this );
    // The monitor channel is essentially our console for the chat.
    hide = this.settings.monitor[1];
    this.monitoro = this.chatbook.create_channel(this.mns, hide, true);
    //this.control.setInput();
    this.control.focus();
    
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
    this.chatbook.resize( this.view.parent().height() - this.nav.height() - this.control.height() );

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
 * @param msg {String} Message to display.
 */
Chatterbox.UI.prototype.log_item = function( msg ) {

    this.chatbook.log_item(msg);

};

/**
 * Display a log message across all open channels.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.UI.prototype.log = function( msg ) {

    this.chatbook.log_item(wsc_html_logmsg.replacePArg('{message}', msg));

};

/**
 * Set the theme for the UI.
 * 
 * @method theme
 * @param theme {String} Name of the theme.
 */
Chatterbox.UI.prototype.theme = function( theme ) {
    if( this.settings.theme == theme )
        return;
    if( this.settings.themes.indexOf(theme) == -1 ) {
        theme = 'wsct_' + theme;
        if( this.settings.themes.indexOf(theme) == -1 )
            return;
    }
    this.view.removeClass( this.settings.theme ).addClass( theme );
    this.settings.theme = theme;
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


