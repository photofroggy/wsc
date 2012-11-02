/**
 * Controls the input panel of the client.
 * 
 * @class Control
 * @constructor
 * @param client {Object} wsc.Client object.
 */
wsc.Control = function( client ) {

    this.client = client;
    this.ui = this.client.ui.control;
    this.history = {};
    this.tab = {
        hit: false,
        cache: '',
        matched: [],
        index: -1,
        type: 0,
        prefix: ['', '/', ''],
    };
    
    this.set_input();

};

/**
 * Steal the lime light. Brings the cursor to the input panel.
 *
 * @method focus
 */
wsc.Control.prototype.focus = function(  ) {

    this.ui.focus();

};

/**
 * Set the input handlers for the input panel.
 * 
 * @method set_input
 */
wsc.Control.prototype.set_input = function(  ) {

    var o = this;
    
    this.ui.set_handlers(
        function( event ) {
            return o.keypress(event);
        },
        function( event ) {
            return o.submit(event);
        }
    );

};

/**
 * Save current input in a cache.
 * 
 * @method cache_input
 * @param event {Object} Event data.
 */
wsc.Control.prototype.cache_input = function( event ) {

    h = this.get_history( event.prev.namespace );
    
    if( h.index > -1 )
        return;
    
    h.tmp = this.ui.get_text();
    this.ui.set_text(this.get_history( event.chan.namespace ).tmp);

};

/**
 * Get a channel's input history object.
 * If no history object exists for the given channel, a new object is created
 * and stored.
 * 
 * @method get_history
 * @param [namespace] {String} Channel to get the history of. If not given, the
 *   channel currently being viewed is used.
 * @return history {Object} Channel's input history data.
 */
wsc.Control.prototype.get_history = function( namespace ) {

    namespace = namespace || this.client.cchannel.namespace;
    
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
wsc.Control.prototype.append_history = function( data ) {

    if( !data )
        return;
    
    h = this.get_history();
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
wsc.Control.prototype.scroll_history = function( up ) {

    var history = this.get_history();
    var data = this.ui.get_text();
    
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
    
    this.ui.set_text(history.list[history.index] || history.tmp);

};

/**
 * Handle the tab character being pressed.
 * 
 * @method tab_item
 * @param event {Object} Event data.
 */
wsc.Control.prototype.tab_item = function( event ) {

    if( !this.tab.hit )
        this.start_tab(event);
    
    this.ui.chomp();
    this.tab.index++;
    
    if( this.tab.index >= this.tab.matched.length )
        this.tab.index = -1;
    
    if( this.tab.index == -1 ) {
        this.ui.unchomp(this.tab.prefix[this.tab.type] + this.tab.cache);
        return;
    }
    
    suf = this.ui.get_text() == '' ? ( this.tab.type == 0 ? ': ' : ' ' ) : '';
    this.ui.unchomp(this.tab.prefix[this.tab.type] + this.tab.matched[this.tab.index] + suf);

};

/**
 * Start tab complete capabilities by compiling a list of items that match the
 * current user input.
 * 
 * @method start_tab
 * @param event {Object} Event data.
 */
wsc.Control.prototype.start_tab = function( event ) {

    this.tab.hit = true;
    this.tab.index = -1;
    this.tab.matched = [];
    this.tab.type = 0;
    
    // We only tab the last word in the input. Slice!
    needle = this.ui.chomp();
    this.ui.unchomp(needle);
    
    // Check if we's dealing with commands here
    if( needle[0] == "/" || needle[0] == "#" ) {
        this.tab.type = needle[0] == '/' ? 1 : 2;
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
        for( user in this.client.cchannel.info['members'] )
            if( user.toLowerCase().indexOf(needle) == 0 )
                this.tab.matched.push(user);
    } else if( this.tab.type == 1 ) {
        // Matching with commands.
        for( i in this.client.cmds ) {
            cmd = this.client.cmds[i];
            if( cmd.indexOf(needle) == 0 )
                this.tab.matched.push(cmd);
        }
    } else if( this.tab.type == 2 ) {
        // Matching with channels.
        for( chan in this.client.channelo )
            if( chan.toLowerCase().indexOf(needle) == 0 )
                this.tab.matched.push(this.client.channel(chan).namespace);
    }

};

/**
 * Clear the tabbing cache.
 * 
 * @method end_tab
 * @param event {Object} Event data.
 */
wsc.Control.prototype.end_tab = function( event ) {

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
wsc.Control.prototype.submit = function( event ) {

    msg = this.ui.get_text();
    this.append_history(msg);
    this.ui.set_text('');
    this.handle(event, msg);
    return false;

};
/**
 * A keypress happened. Process the keypress biatch.
 * 
 * @method keypress
 * @param event {Object} Event data.
 */
wsc.Control.prototype.keypress = function( event ) {

    key = event.which || event.keyCode;
    ut = this.tab.hit;
    var bubble = false;
    
    switch( key ) {
        case 13: // Enter
            if( !this.ui.multiline() ) {
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
            this.scroll_history(true);
            break;
        case 40: // Down
            this.scroll_history(false);
            break;
        case 9: // Tab
            this.tab_item( event );
            ut = false;
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
wsc.Control.prototype.handle = function( event, data ) {

    if( data == '' )
        return;
    
    if( data[0] != '/' ) {
        if( !this.client.cchannel )
            return;
    }
    
    data = (event.shiftKey ? '/npmsg ' : ( data[0] == '/' ? '' : '/say ' )) + data;
    data = data.slice(1);
    bits = data.split(' ');
    cmdn = bits.shift();
    ens = this.client.cchannel.namespace;
    etarget = ens;
    
    if( bits[0] ) {
        hash = bits[0][0];
        if( (hash == '#' || hash == '@') && bits[0].length > 1 ) {
            etarget = this.client.format_ns(bits.shift());
        }
    }
    
    arg = bits.join(' ');
    
    this.client.trigger('cmd.' + cmdn, {
        name: 'cmd',
        cmd: cmdn,
        args: arg,
        target: etarget,
        ns: ens
    });

};


