
/**
 * Implements a base for a channel view.
 * @class Chatterbox.BaseTab
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
Chatterbox.BaseTab = function( ui, ns, hidden, monitor ) {

    this.manager = ui;
    this.hidden = hidden;
    this.monitor = ( monitor == undefined ? false : monitor );
    this.built = false;
    this.raw = ns;
    this.selector = 't-' + (ns || 'chan').toLowerCase();
    this.namespace = ns;
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
    
    if( !ui )
        return;
    
    this.raw = ui.format_ns(ns);
    this.selector = (this.raw.substr(0, 2) == 'pc' ? 'pc' : 'c') + '-' + ui.deform_ns(ns).slice(1).toLowerCase();
    this.namespace = ui.deform_ns(ns);

};

/**
 * Draw the channel on screen and store the different elements in attributes.
 * 
 * @method build
 * @param [view] {String} HTML for the channel view
 */
Chatterbox.BaseTab.prototype.build = function( view ) {
    
    if( !this.manager )
        return;
    
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
    this.manager.chatbook.view.append( view || Chatterbox.render('basetab', {'selector': selector, 'ns': ns}) );
    
    // Store
    this.el.m = this.window = this.manager.chatbook.view.find('#' + selector + '-window');
    
    var chan = this;
    
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
    
    if( this.hidden && !this.manager.settings.developer ) {
        this.el.t.o.toggleClass('hidden');
    }
    
    this.built = true;
};

/**
 * Hide the channel from view.
 * 
 * @method hide
 */
Chatterbox.BaseTab.prototype.hide = function( ) {
    this.el.m.css({'display': 'none'});
    this.el.t.o.removeClass('active');
    this.visible = false;
};

/**
 * Display the channel.
 * 
 * @method show
 */
Chatterbox.BaseTab.prototype.show = function( ) {
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
Chatterbox.BaseTab.prototype.developer = function(  ) {
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
Chatterbox.BaseTab.prototype.remove = function(  ) {
    this.el.t.o.remove();
    this.el.m.remove();
};


/**
 * Resize the view window to fill the space available.
 * @method resize
 */
Chatterbox.BaseTab.prototype.resize = function( width, height ) {

    this.el.m.css( {
        height: height || this.manager.chatbook.height(),
        width: ( width || this.manager.chatbook.width() ) - 10
    } );

};

/**
 * This method is run on the main loop event. Having this allows channels to do
 * some maintenance autonomously.
 * @method loop
 */
Chatterbox.BaseTab.prototype.loop = function(  ) {



};


