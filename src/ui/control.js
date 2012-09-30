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
    this.form = this.view.find('form.msg');
    this.input = this.form.find('input.msg');
    this.mli = this.form.find('textarea.msg');
    this.ci = this.input;
    this.ml = false;
    this.mlb = this.view.find('a[href~=#multiline].button');
    
    var ctrl = this;
    this.mlb.click(function( event ) {
        ctrl.multiline( !ctrl.multiline() );
    });

};

/**
 * Steal the lime light. Brings the cursor to the input panel.
 * 
 * @method focus
 */
Chatterbox.Control.prototype.focus = function( ) {
    this.ci.focus();
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
    this.form.css({'width': this.manager.view.width() - 20});
    this.input.css({'width': this.manager.view.width() - 90});
    this.mli.css({'width': this.manager.view.width() - 90});
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
        this.input.keypress( onkeypress || this._onkeypress );
        this.mli.keypress( onkeypress || this._onkeypress );
    } else {
        this.input.keydown( onkeypress || this._onkeypress );
        this.mli.keydown( onkeypress || this._onkeypress );
    }
    
    this.form.submit( onsubmit || this._onsubmit );
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
    
    if( this.ml ) {
        this.input.css('display', 'none');
        this.mli.css('display', 'inline-block');
        this.ci = this.mli;
        this.manager.resize();
        return this.ml;
    }
    
    this.mli.css('display', 'none');
    this.input.css('display', 'inline-block');
    this.ci = this.input;
    this.manager.resize();
    return this.mli;

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
    d = this.ci.val();
    i = d.lastIndexOf(' ');
    
    if( i == -1 ) {
        this.ci.val('');
        return d;
    }
    
    chunk = d.slice(i + 1);
    this.ci.val( d.slice(0, i) );
    
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
    d = this.ci.val();
    if( !d )
        this.ci.val(data);
    else
        this.ci.val(d + ' ' + data);
};

/**
 * Get the text in the input box.
 * 
 * @method get_text
 * @return {String} The text currently in the input box.
 */
Chatterbox.Control.prototype.get_text = function( text ) {

    if( text == undefined )
        return this.ci.val();
    this.ci.val( text || '' );
    return this.ci.val();

};

/**
 * Set the text in the input box.
 * 
 * @method set_text
 * @param text {String} The text to put in the input box.
 */
Chatterbox.Control.prototype.set_text = function( text ) {

    this.ci.val( text || '' );

};

