/*
 * wsc/ui/chatbook.js - photofroggy
 * Object for managing the UI's chatbook.
 */

 /**
  * Object for managing the chatbook portion of the UI.
  *
  * @class WscUIChatbook
  * @constructor
  * @param ui {Object} WscUI object.
  */
function WscUIChatbook( ui ) {
    
    this.manager = ui;
    this.view = this.manager.view.find('div.chatbook');
    this.chan = {};
    this.current = null;
    
}

/**
 * Return the height of the chatbook.
 *
 * @method height
 */
WscUIChatbook.prototype.height = function() {
    return this.view.height();
};

/**
 * Resize the chatbook view pane.
 * 
 * @method resize
 * @param [height=600] {Integer} The height to set the view pane to.
 */
WscUIChatbook.prototype.resize = function( height ) {
    height = height || 600;
    this.view.height(height);
    
    for( select in this.chan ) {
        chan = this.chan[select];
        chan.resize();
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
WscUIChatbook.prototype.channel = function( namespace, chan ) {
    namespace = this.manager.deform_ns(namespace).slice(1).toLowerCase();
    /* 
    console.log(namespace);
    console.log(this.channelo);
    /* */
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
WscUIChatbook.prototype.channels = function( ) {
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
 * @return {Object} WscUIChannel object.
 */
WscUIChatbook.prototype.create_channel = function( ns, toggle ) {
    chan = this.channel(ns, new WscUIChannel(this.manager, ns, toggle));
    chan.build();
    this.toggle_channel(ns);
    this.manager.resize();
    return chan;
};

// Select which channel is currently being viewed.
WscUIChatbook.prototype.toggle_channel = function( ns ) {
    chan = this.channel(ns);
    
    if( !chan )
        return;
    
    if(this.current) {
        if(this.current == chan)
            return;
        // Hide previous channel, if any.
        //console.log("prevshift ", previous);
        this.current.hide();
        //this.control.cacheInput();
    }
    
    // Show clicked channel.
    chan.show();
    this.manager.control.focus();
    this.current = chan;
    this.manager.resize();
};

/**
 * Remove a channel from the UI.
 * 
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
WscUIChatbook.prototype.remove_channel = function( ns ) {
    if( this.channels() == 0 ) 
        return;
    
    chan = this.channel(ns);
    chan.remove();
    delete this.chan[chan.selector];
    
    var select = '';
    for (tmp in this.chan) {
        if (this.chan.hasOwnProperty(tmp) && tmp != chan.selector)
            select = tmp;
    }
    
    this.toggle_channel(select);
    this.channel(select).resize();
};

