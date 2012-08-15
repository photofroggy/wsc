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
 * @function height
 *
 * Return the height of the chatbook.
 */
WscUIChatbook.prototype.height = function() {
    return this.view.height();
};

/**
 * @function resize
 * 
 * Resize the chatbook view pane.
 * 
 * @param [Integer] height The height to set the view pane to. Defaults to 600px.
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

/**
 * @function create_channel
 * 
 * Create a channel in the UI.
 */
WscUIChatbook.prototype.create_channel = function( ns, toggle ) {
    chan = this.channel(ns, new WscUIChannel(this.manager, ns, toggle));
    chan.build();
    this.toggle_channel(ns);
    this.manager.resize();
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
    //this.control.focus();
    this.current = chan;
    //this.control.setLabel();
    /*if( this.settings['monitor'][1] ) {
        mt = this.tabul.find('#' + this.channel(this.mns).info['selector'] + '-tab')
        mt.addClass(this.settings['monitor'][1]);
    }*/
    //this.resizeUI();
};

