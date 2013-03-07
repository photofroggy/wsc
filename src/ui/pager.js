
/**
 * Pager
 * 
 * Used for giving the user notifications.
 */
Chatterbox.Pager = function( ui ) {

    this.manager = ui;
    this.lifespan = 20000;
    this.halflife = 5000;
    
    this.el = {
        m: null,
        click: null
    };
    
    this.sound = {
        click: function(  ) {},
    };
    
    this.notices = [];
    
    this.build();

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
Chatterbox.Pager.prototype.notice = function( options, sticky, lifespan, silent ) {

    var notice = {
        frame: null,
        close: null,
        foot: null,
        b: {},
        options: Object.extend( {
            'ref': 'notice',
            'icon': '',
            'heading': 'Some notice',
            'content': 'Notice content goes here.'
        }, ( options || {} ) ),
        onclose: function(  ) {},
        ondestroy: function(  ) {}
    };
    
    notice.options.content = notice.options.content.split('\n').join('</p><p>');
    
    this.notices.push( notice );
    
    this.el.m.append(
        Chatterbox.render( 'pager.notice', notice.options )
    );
    
    notice.frame = this.el.m.find( '#' + notice.options.ref );
    notice.close = notice.frame.find('a.close_notice');
    notice.foot = notice.frame.find('footer.buttons');
    var bopt = {};
    
    for( var b in notice.options.buttons ) {
        if( !notice.options.buttons.hasOwnProperty( b ) )
            continue;
        
        bopt = notice.options.buttons[b];
        notice.foot.append( Chatterbox.render('pager.button', bopt) );
        notice.b[b] = notice.foot.find('a#' + bopt.ref);
        notice.b[b].click( bopt.click );
    }
    
    var p = this;
    
    notice.close.click( function(  ) {
        notice.onclose();
        p.remove_notice( notice );
        return false;
    } );
    
    if( !sticky ) {
        if( !lifespan )
            lifespan = p.lifespan;
        
        setTimeout( function(  ) {
            p.remove_notice( notice, true );
        }, lifespan );
    }
    
    if( silent !== true )
        this.manager.sound.click();
    
    return notice;

};

/**
 * Remove a given notice from the pager.
 * 
 * @remove_notice
 */
Chatterbox.Pager.prototype.remove_notice = function( notice, interrupt ) {

    var p = this;
    
    if( this.notices.indexOf( notice ) == -1 )
        return false;
    
    notice.frame.fadeTo( ( interrupt ? this.halflife : 300 ), 0 ).slideUp( function(  ) {
        notice.frame.remove();
        p.notices.splice( p.notices.indexOf( notice ), 1 );
        notice.ondestroy();
    } );
    
    if( interrupt ) {
        notice.frame.mouseenter( function(  ) {
            if( p.notices.indexOf( notice ) == -1 )
                return;
            
            notice.frame.stop( true );
            
            notice.frame.slideDown( function(  ) {
                notice.frame.fadeTo(300, 1);
                
                notice.frame.mouseleave( function(  ) {
                    setTimeout( function(  ) {
                        p.remove_notice( notice, true );
                    }, p.lifespan );
                } );
            } );
        } );
    }

};
