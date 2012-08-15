/**
 * wsc/ui/base.js - photofroggy
 * Base object used to manage a wsc client interface.
 */

function WscUI( view, options, mozilla, events ) {
    
    this.handle_evt = events || this._handle_evt;
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

WscUI.prototype.set_handler = function( events ) {

    this.handle_evt = events || this._handle_evt;

};

WscUI.prototype.trigger = function( event, data ) {

    this.handle_evt( event, data );

};

WscUI.prototype._handle_evt = function( event, data ) {};

// Deform a channel namespace.
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
    
    // Main view dimensions.
    //console.log('>> pH:',client.view.parent().height());
    this.view.height( this.view.parent().height() );
    this.view.width( '100%' );
    
    h = (this.view.parent().height() - this.nav.height() - this.control.height());
    //console.log('>> rUI h parts:',client.view.parent().height(),client.tabul.outerHeight(true),client.control.height());
    //console.log('>> rUI h:', h);
    // Chatbook dimensions.
    this.chatbook.resize(h);

};

// Create a screen for channel `ns` in the UI, and initialise data
// structures or some shit idk. The `selector` parameter defines the
// channel without the `chat:` or `#` style prefixes. The `ns`
// parameter is the string to use for the tab.
WscUI.prototype.create_channel = function( ns, toggle ) {
    this.chatbook.create_channel( ns, toggle );
    this.resize();
};

// Remove a channel from the client and the GUI.
// We do this when we leave a channel for any reason.
// Note: last channel is never removed and when removing a channel
// we switch to the last channel in the list before doing so.
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
 * @function channel
 * 
 * @overload
 *  Get the channel object associated with the given namespace.
 *  @param [String] namespace
 *  
 * @overload
 *  Set the channel object associated with the given namespace.
 *  @param [String] namespace
 *  @param [Object] chan A {wsc_channel.channel wsc channel object} representing the channel specified.
 */
WscUI.prototype.channel = function( namespace, chan ) {
    return this.chatbook.channel( namespace, chan );
};

/**
 * @function channels
 * 
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
 * @return [Integer] Number of channels open in the ui.
 */
WscUI.prototype.channels = function( ) {
    return this.chatbook.channels();
};