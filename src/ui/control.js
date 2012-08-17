/*
 * wsc/ui/control.js - photofroggy
 * Object to control the UI for the control panel.
 */

/**
 * This object provides an interface for the chat input panel.
 * 
 * @class WscUIControl
 * @constructor
 * @param ui {Object} WscUI object.
 */
function WscUIControl( ui ) {

    this.manager = ui;
    this.manager.view.append( wsc_html_control );
    this.view = this.manager.view.find('div.chatcontrol');
    this.form = this.view.find('form.msg');
    this.input = this.form.find('input.msg');

}

/**
 * Steal the lime light. Brings the cursor to the input panel.
 * 
 * @method focus
 */
WscUIControl.prototype.focus = function( ) {
    this.input.focus();
};

/**
 * Deprecated; Returns `<username>`;
 * 
 * @method user_line
 * @return {String} `username`.
 */
WscUIControl.prototype.user_line = function( ) {
    return /*this.manager.settings["symbol"] +*/ this.manager.settings["username"];
};

/**
 * Resize the control panel.
 *
 * @method resize
 */
WscUIControl.prototype.resize = function( ) {
    w = this.manager.view.width();
    this.view.css({
        width: '100%'});
    // Form dimensionals.
    this.form.css({'width': this.manager.view.width() - 20});
    this.input.css({'width': this.manager.view.width() - 80});
};


/**
 * Get the height of the input panel.
 * 
 * @method height
 */
WscUIControl.prototype.height = function( ) {
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
WscUIControl.prototype.set_handlers = function( onkeypress, onsubmit ) {
    if( this.manager.mozilla )
        this.input.keypress( onkeypress || this._onkeypress );
    else
        this.input.keydown( onkeypress || this._onkeypress );
    
    this.form.submit( onsubmit || this._onsubmit );
};

WscUIControl.prototype._onkeypress = function( event ) {};
WscUIControl.prototype._onsubmit = function( event ) {};

