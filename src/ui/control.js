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
            cmd = this.client.cmds[i];
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

