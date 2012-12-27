/**
 * Object for managing the chatbook portion of the UI.
 *
 * @class Chatbook
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
 * Resize the chatbook view pane.
 * 
 * @method resize
 * @param [height=600] {Integer} The height to set the view pane to.
 */
Chatterbox.Chatbook.prototype.resize = function( height ) {
    height = height || 600;
    this.view.height(height);
    
    for( select in this.chan ) {
        var chan = this.chan[select];
        chan.resize();
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
    namespace = this.manager.deform_ns(namespace).slice(1).toLowerCase();
    
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
    chan = this.channel(ns, this.channel_object(ns, hidden, monitor));
    chan.build();
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
 * @param hidden {Boolean} Should the tab be hidden?
 * @return {Object} An object representing a channel UI.
 */
Chatterbox.Chatbook.prototype.channel_object = function( ns, hidden ) {
    return new Chatterbox.Channel( this.manager, ns, hidden );
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
    
    if(this.current) {
        if(this.current == chan)
            return;
        // Hide previous channel, if any.
        this.current.hide();
        prev = this.current;
    }
    
    // Show clicked channel.
    chan.show();
    this.manager.control.focus();
    this.current = chan;
    this.manager.resize();
    
    // Update the paper trail.
    if( this.trail.indexOf(chan.namespace) == -1 ) {
        this.trail.push(chan.namespace);
    }
    
    this.manager.trigger( 'channel.selected', {
        'ns': chan.namespace,
        'chan': chan,
        'prev': prev
    } );
};

/**
 * Remove a channel from the UI.
 * 
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
Chatterbox.Chatbook.prototype.remove_channel = function( ns ) {
    if( this.channels() == 0 ) 
        return;
    
    var chan = this.channel(ns);
    chan.remove();
    delete this.chan[chan.selector];
    
    if( this.current == chan )
        this.channel_left();
    
    rpos = this.trail.indexOf(chan.namespace);
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
 * Rewrite timestamps for all open channels.
 * 
 * @method retime
 */
Chatterbox.Chatbook.prototype.retime = function(  ) {

    for( ns in this.chan ) {
        this.chan[ns].retime();
    }

};

