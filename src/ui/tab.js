
/**
 * Implements a base for a channel view.
 * @class Chatterbox.Tab
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
Chatterbox.Tab = function( ui, ns, hidden, monitor ) {

    this.manager = ui;
    this.hidden = hidden;
    this.monitor = ( monitor == undefined ? false : monitor );
    this.built = false;
    this.raw = ui.format_ns(ns);
    this.selector = (this.raw.substr(0, 2) == 'pc' ? 'pc' : 'c') + '-' + ui.deform_ns(ns).slice(1).toLowerCase();
    this.namespace = ui.deform_ns(ns);
    this.visible = false;
    this.st = 0;
    // UI elements.
    this.el = {
        t: {                        // Tab
            o: null,                //      Object..
            l: null,                //      Link
            c: null,                //      Close button
        },                          //
        m: null,                    // Main
        l: {                        // Channel log
            p: null,                //      Panel
            w: null,                //      Wrap
        },                          //
        u: null,                    // User panel
        h: {                        // Head
            title: null,            //      Title
            topic: null             //      Topic
        }
    };
    this.mulw = 0;
    // Dimensions...
    this.d = {
        u: [0, 0],                  // User panel [ width, height ]
        h: {                        // Header
            title: [0, 0],          //      Title [ width, height ]
            topic: [0, 0]           //      Topic [ width, height ]
        }
    };

};

/**
 * Draw the channel on screen and store the different elements in attributes.
 * 
 * @method build
 */
Chatterbox.Tab.prototype.build = function( ) {
    
    if( this.built )
        return;
    
    var selector = this.selector;
    var ns = this.namespace;
    var raw = this.raw;
    
    // Tabs.
    this.el.t.o = this.manager.nav.add_tab( selector, ns );
    this.el.t.l = this.el.t.o.find('.tab');
    this.el.t.c = this.el.t.o.find('.close');
    
    // Draw
    this.manager.chatbook.view.append(Chatterbox.render('channel', {'selector': selector, 'ns': ns}));
    
    // Store
    this.el.m = this.window = this.manager.chatbook.view.find('#' + selector + '-window');
    this.el.l.p = this.el.m.find('#' + selector + "-log");
    this.el.l.w = this.el.l.p.find('ul.logwrap');
    this.el.u = this.el.m.find('#' + selector + "-users");
    
    // Max user list width;
    this.mulw = parseInt(this.el.u.css('max-width').slice(0,-2));
    var chan = this;
    
    // Steal focus when someone clicks.
    var click_evt = false;
    
    this.el.l.w.click( function(  ) {
        if( !click_evt )
            return;
        chan.manager.control.focus();
    } );
    
    this.el.l.w.mousedown( function(  ) {
        click_evt = true;
    } );
    
    this.el.l.w.mousemove( function(  ) {
        click_evt = false;
    } );
    
    // When someone clicks the tab link.
    this.el.t.l.click(function () {
        chan.manager.toggle_channel(raw);
        return false;
    });
    
    // When someone clicks the tab close button.
    this.el.t.c.click(function ( e ) {
        chan.manager.trigger( 'tab.close.clicked', {
            'ns': chan.raw,
            'chan': chan,
            'e': e
        } );
        return false;
    });
    
    this.setup_header('title');
    this.setup_header('topic');
    
    if( this.hidden && !this.manager.settings.developer ) {
        this.el.t.o.toggleClass('hidden');
    }
    
    if( this.namespace[0] == '@' ) {
        this.build_user_list( { 100: 'Room Members' }, [ 100 ] );
    }
    
    this.built = true;
};

/**
 * Hide the channel from view.
 * 
 * @method hide
 */
Chatterbox.Tab.prototype.hide = function( ) {
    this.el.m.css({'display': 'none'});
    this.el.t.o.removeClass('active');
    this.visible = false;
};

/**
 * Display the channel.
 * 
 * @method show
 */
Chatterbox.Tab.prototype.show = function( ) {
    this.visible = true;
    this.el.m.css({'display': 'block'});
    this.el.t.o.addClass('active');
    this.el.t.o.removeClass('noise chatting tabbed fill');
    var c = this;
    setTimeout( function(  ) {
        c.el.l.w.scrollTop(c.el.l.w.prop('scrollHeight') - c.el.l.w.innerHeight());
        c.resize();
        c.el.l.w.scrollTop(c.el.l.w.prop('scrollHeight') - c.el.l.w.innerHeight());
    }, 100);
};

/**
 * Display or hide the tab based on whether we are in developer mode or not.
 * 
 * @method developer
 */
Chatterbox.Tab.prototype.developer = function(  ) {
    if( this.manager.settings.developer ) {
        this.el.t.o.removeClass('hidden');
        return;
    }
    if( this.hidden ) {
        this.el.t.o.addClass('hidden');
    }
};

/**
 * Remove the channel from the UI.
 * 
 * @method remove
 */
Chatterbox.Tab.prototype.remove = function(  ) {
    this.el.t.o.remove();
    this.el.m.remove();
};


