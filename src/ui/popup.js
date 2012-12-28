/**
 * Popup window base class.
 * Should allow people to easily create popups... or something.
 * Subclasses of the popups should provide a way of closing the popup, or
 * maybe I could change things around a bit so there's always a close button in
 * the top right corner. That said, the settings window looks good with the
 * close button at the bottom. Maybe make that configurable. Use a flag to
 * determine whether or not this class applies the close function or not?
 * 
 * @class Popup
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Popup = function( ui, options ) {

    this.manager = ui;
    this.window = null;
    this.closeb = null;
    this.options = Object.extend({
        'ref': 'popup',
        'title': 'Popup',
        'close': true,
        'content': ''
    }, (options || {}));

};

/**
 * Build the popup window.
 * This should be pretty easy.
 *
 * @method build
 */
Chatterbox.Popup.prototype.build = function(  ) {

    var fill = this.options;
    
    if( this.options.close ) {
        fill.title+= '<a href="#close" class="button close medium iconic x"></a>';
    }
    
    this.manager.view.append(Chatterbox.render( 'popup', fill ));
    this.window = this.manager.view.find('.floater.' + fill.ref);
    
    if( this.options.close ) {
        this.closeb = this.window.find('a.close');
        var popup = this;

        this.closeb.click(
            function( event ) {
                popup.close();
                return false;
            }
        );
    }

};

/**
 * Close the popup.
 * 
 * @method close
 */
Chatterbox.Popup.prototype.close = function(  ) {
    
    this.window.remove();
    
};

/**
 * Prompt popup.
 * This should be used for retrieving input from the user.
 */
Chatterbox.Popup.Prompt = function( ui, options ) {

    options = options || {};
    options = Object.extend( {
        'position': [0, 0],
        'ref': 'prompt',
        'title': 'Input',
        'close': false,
        'label': '',
        'default': ''
    }, options );
    
    Chatterbox.Popup.call( this, ui, options );
    this.data = this.options['default'];

};

Chatterbox.Popup.Prompt.prototype = new Chatterbox.Popup();
Chatterbox.Popup.Prompt.prototype.constructor = Chatterbox.Popup.Prompt;

/**
 * Build the prompt.
 * 
 * @method build
 */
Chatterbox.Popup.Prompt.prototype.build = function(  ) {

    this.options.content = Chatterbox.template.prompt.main;
    Chatterbox.Popup.prototype.build.call(this);
    this.window.css({
        'left': this.options.position[0],
        'top': this.options.position[1]
    });

};





