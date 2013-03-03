
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
        'content': 'Testing out this notices stuff.',
        'icon': '<img src="http://a.deviantart.net/avatars/p/h/photofroggy.png?1"/>'
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
        frame: null,
        close: null,
        options: Object.extend( {
            'ref': 'notice',
            'icon': '',
            'heading': 'Some notice',
            'content': 'Notice content goes here.'
        }, ( options || {} ) )
    };
    
    this.notices.push( notice );
    
    this.el.m.append(
        Chatterbox.render( 'pager.notice', notice.options )
    );
    
    notice.frame = this.el.m.find( '#' + notice.options.ref );
    notice.close = notice.frame.find('a.close_notice');
    
    var p = this;
    
    notice.close.click( function(  ) {
        p.remove_notice( notice );
        return false;
    } );
    
    return notice;

};

/**
 * Remove a given notice from the pager.
 * 
 * @remove_notice
 */
Chatterbox.Pager.prototype.remove_notice = function( notice ) {

    var nin = this.notices.indexOf( notice );
    
    if( nin == -1 )
        return false;
    
    notice.frame.fadeTo(500, 0).slideUp( function(  ) {
        notice.frame.remove();
    } );
    
    this.notices.splice( nin, 1 );

};
