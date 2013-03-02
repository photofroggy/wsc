
/**
 * Pager
 * 
 * Used for giving the user notifications.
 */
Chatterbox.Pager = function( ui ) {

    this.manager = ui;
    
    this.el = {
        m: null
    };
    
    this.build();

};

/**
 * Build the Pager interface...
 * 
 * @method build
 */
Chatterbox.Pager.prototype.build = function(  ) {

    this.el.m = this.manager.view.find('div.pager');
    this.el.m.css({
        'width': 100,
        'height': 500
    });

};
