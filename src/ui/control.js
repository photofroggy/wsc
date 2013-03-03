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
    return this.view.height();
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
    if( this.manager.mozilla ) {
        this.el.i.s.keypress( onkeypress || this._onkeypress );
        this.el.i.m.keypress( onkeypress || this._onkeypress );
    } else {
        this.el.i.s.keydown( onkeypress || this._onkeypress );
        this.el.i.m.keydown( onkeypress || this._onkeypress );
    }
    
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

