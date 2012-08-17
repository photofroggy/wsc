/**
 * Base object used to manage a wsc client interface.
 * 
 * @module wscuilib
 **/
var Foo = {};

/**
 * This object is the platform for the wsc UI. Everything can be used and
 * loaded from here.
 * 
 * @class WscUI
 * @author photofroggy
 * @constructor
 * @param view {Object} Base jQuery object to use for the UI. Any empty div will do.
 * @param options {Object} Custom settings to use for the UI.
 * @param mozilla {Boolean} Is the browser in use made by Mozilla?
 * @param events {Method} Event trigger callback.
 **/
function WscUI( view, options, mozilla, events ) {
    
    this.trigger = events || this._handle_evt;
    this.mozilla = mozilla;
    this.settings = {
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
    
}

/**
 * Sets the handler method to use for events.
 * 
 * @method set_handler
 * @param events {Method} Callback for handling events.
 **/
WscUI.prototype.set_handler = function( events ) {

    this.trigger = events || this._handle_evt;

};

/**
 * Used to trigger events.
 *
 * @method trigger
 * @param event {String} Name of the event to trigger.
 * @param data {Object} Event data.
 **/
WscUI.prototype.trigger = function( event, data ) {

    this._handle_evt( event, data );

};

/**
 * Place holder.
 * @method _handle_evt
 * @param event {String}
 * @param data {Object}
 */
WscUI.prototype._handle_evt = function( event, data ) {};

/**
 * Deform a channel namespace.
 *
 * @method deform_ns
 * @param ns {String} Channel namespace to deform.
 * @return {String} The deformed namespace.
 **/
WscUI.prototype.deform_ns = function( ns ) {
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

// Format a channel namespace.
WscUI.prototype.format_ns = function( ns ) {
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

WscUI.prototype.set_events = function( events ) {
    this.events = events;
};

WscUI.prototype.build = function() {
    
    this.view.append( wsc_html_ui );
    this.control = new WscUIControl( this );
    this.nav = new WscUINavigation( this ); //this.view.find('#chattabs');
    this.chatbook = new WscUIChatbook( this ); //this.chatbook = this.view.find('div.chatbook');
    // The monitor channel is essentially our console for the chat.
    hide = this.settings.monitor[1];
    this.chatbook.create_channel(this.mns, hide);
    //this.control.setInput();
    this.control.focus();
    
};

WscUI.prototype.resize = function() {

    this.control.resize();
    this.view.height( this.view.parent().height() );
    this.view.width( '100%' );
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
WscUI.prototype.create_channel = function( ns, toggle ) {
    this.chatbook.create_channel( ns, toggle );
    this.resize();
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
WscUI.prototype.remove_channel = function( ns ) {
    if( this.channels() == 0 )
        return;
    
    chan = this.channel(ns);
    chan.remove();
    delete this.channelo[chan.info["selector"]];
    
    var select = '';
    for (tmp in this.channelo) {
        if (this.channelo.hasOwnProperty(tmp) && tmp != chan.info['selector'])
            select = tmp;
    }
    
    this.toggle_channel(select);
    this.channel(select).resize();
};

// Select which channel is currently being viewed.
WscUI.prototype.toggle_channel = function( ns ) {
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
WscUI.prototype.channel = function( namespace, chan ) {
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
WscUI.prototype.channels = function( ) {
    return this.chatbook.channels();
};