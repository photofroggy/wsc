/**
 * wsc/ui/chatbook.js - photofroggy
 * Object for managing the UI's chatbook.
 */

function WscUIChatbook( ui ) {
    
    this.manager = ui;
    this.view = this.manager.view.find('div.chatbook');
    this.chan = {};
    this.current = null;
    
}

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
 * @function channels
 * 
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
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

