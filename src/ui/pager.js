
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
    
    this.notices = [];
    
    this.build();
    
    this.notice({
        'ref': 'testing',
        'heading': 'Test',
        'content': 'Testing out this notices stuff.'
    });

};

/**
 * Build the Pager interface...
 * 
 * @method build
 */
Chatterbox.Pager.prototype.build = function(  ) {

    this.el.m = this.manager.view.find('div.pager');

};

/**
 * Page the user with a notice.
 * 
 * @method notice
 */
Chatterbox.Pager.prototype.notice = function( options ) {

    var notice = {
        el: null,
        options: Object.extend( {
            'ref': 'notice',
            'icon': '',
            'heading': 'Some notice',
            'content': 'Notice content goes here.'
        }, ( options || {} ) )
    };
    
    this.notices.push( notice );
    
    notice.el = this.el.m.append(
        Chatterbox.render( 'pager.notice', notice.options )
    );
    
    return notice;

};
