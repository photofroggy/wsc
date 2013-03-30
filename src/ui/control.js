/**
 * This object provides an interface for the chat input panel.
 * 
 * @class Control
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
 * Set the handlers for the UI input.
 *
 * @method set_handlers
 * @param [onkeypress=this._onkeypress] {Method} Method to call on input event
 *   `keypress`.
 * @param [onsubmite=this._onsubmit] {Method} Method to call on input even
 *   `submit`.
 */
Chatterbox.Control.prototype.set_handlers = function( onkeypress, onsubmit ) {
    this.el.i.s.keydown( onkeypress || this._onkeypress );
    this.el.i.m.keydown( onkeypress || this._onkeypress );
    this.el.form.submit( onsubmit || this._onsubmit );
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

Chatterbox.Control.prototype.rem_state = function( ref ) {

    return this.el.brow.s.find( 'li#' + ref ).remove();

};

Chatterbox.Control.prototype._onkeypress = function( event ) {};
Chatterbox.Control.prototype._onsubmit = function( event ) {};

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
 * @param event {Object} Event data.
 */
Chatterbox.Control.prototype.cache_input = function( event ) {

    var h = this.get_history( event.prev.namespace );
    
    if( h.index > -1 )
        return;
    
    h.tmp = this.ui.get_text();
    this.set_text(this.get_history( event.chan.namespace ).tmp);

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
        var c = this.manager.client.channel( this.manager.chatbook.current );
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
        this.client.each_channel( function( ns, chan ) {
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

