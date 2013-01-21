/**
 * This is an alternate thing for the UI module.
 * Chatterbox is basically a thing.
 * 
 * @module Chatterbox
 */
var Chatterbox = {};

Chatterbox.VERSION = '0.10.58';
Chatterbox.STATE = 'beta';

/**
 * This object is the platform for the wsc UI. Everything can be used and
 * loaded from here.
 * 
 * @class UI
 * @constructor
 * @param view {Object} Base jQuery object to use for the UI. Any empty div will do.
 * @param options {Object} Custom settings to use for the UI.
 * @param mozilla {Boolean} Is the browser in use made by Mozilla?
 * @param [events] {Object} EventEmitter object.
 **/
Chatterbox.UI = function( view, options, mozilla, events ) {
    
    this.events = events || new EventEmitter();
    this.mozilla = mozilla;
    this.umuted = [];
    this.settings = {
        'themes': ['wsct_default', 'wsct_dAmn'],
        'theme': 'wsct_default',
        'monitor': ['~Monitor', true],
        'username': '',
        'domain': 'website.com',
        'clock': true,
        'tabclose': true
    };
    
    view.extend( this.settings, options );
    view.append('<div class="wsc '+this.settings['theme']+'"></div>');
    
    this.view = view.find('.wsc');
    this.mns = this.format_ns(this.settings['monitor'][0]);
    this.lun = this.settings["username"].toLowerCase();
    this.monitoro = null;
    
    this.swidth = ( function() { 
        if ( $.browser.msie ) {
            var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                    .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
                $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                    .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
            scrollbarWidth = $textarea1.width() - $textarea2.width();
            $textarea1.add($textarea2).remove();
        } else {
            var $div = $('<div />')
                .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
                .prependTo('body').append('<div />').find('div')
                    .css({ width: '100%', height: 200 });
            scrollbarWidth = 100 - $div.width();
            $div.parent().remove();
        }
        return scrollbarWidth;
    } ) ();
    
    this.LIB = 'Chatterbox';
    this.VERSION = Chatterbox.VERSION;
    this.STATE = Chatterbox.STATE;
    
};

wsc.defaults.UI = Chatterbox.UI;

/**
 * Used to trigger events.
 *
 * @method trigger
 * @param event {String} Name of the event to trigger.
 * @param data {Object} Event data.
 **/
Chatterbox.UI.prototype.trigger = function( event, data ) {

    this.events.emit( event, data, this );

};

/**
 * Bind an event thingy.
 * 
 * @method on
 * @param event {String} The event name to listen for.
 * @param handler {Method} The event handler.
 */
Chatterbox.UI.prototype.on = function( event, handler ) {

    this.events.addListener( event, handler );

};

/**
 * Remove all of the event bindings.
 * 
 * @method remove_listeners
 */
Chatterbox.UI.prototype.remove_listeners = function(  ) {
    
    this.events.removeListeners();
    
};

/**
 * Deform a channel namespace.
 *
 * @method deform_ns
 * @param ns {String} Channel namespace to deform.
 * @return {String} The deformed namespace.
 **/
Chatterbox.UI.prototype.deform_ns = function( ns ) {
    if(ns.indexOf("chat:") == 0)
        return '#' + ns.slice(5);
    
    if(ns.indexOf("server:") == 0)
        return '~' + ns.slice(7);
    
    if(ns.indexOf("pchat:") == 0) {
        var names = ns.split(":");
        names.shift();
        for(i in names) {
            name = names[i];
            if(name.toLowerCase() != this.lun) {
                return '@' + name;
            }
        }
    }
    
    if( ns.indexOf('login:') == 0 )
        return '@' + ns.slice(6);
    
    if(ns[0] != '#' && ns[0] != '@' && ns[0] != '~')
        return '#' + ns;
    
    return ns;
};

/**
 * Format a channel namespace.
 *
 * @method format_ns
 * @param ns {String} Channel namespace to format.
 * @return {String} ns formatted as a channel namespace.
 */
Chatterbox.UI.prototype.format_ns = function( ns ) {
    if(ns.indexOf('#') == 0) {
        return 'chat:' + ns.slice(1);
    }
    if(ns.indexOf('@') == 0) {
        var names = [ns.slice(1), this.lun];
        names.sort(caseInsensitiveSort)
        names.unshift("pchat");
        return names.join(':');
    }
    if(ns.indexOf('~') == 0) {
        return "server:" + ns.slice(1);
    }
    if(ns.indexOf('chat:') != 0 && ns.indexOf('server:') != 0 && ns.indexOf('pchat:') != 0)
        return 'chat:' + ns;
    
    return ns;
};

/**
 * Set the event emitter object in use by the UI lib.
 * 
 * @method set_events
 * @param events {Object} EventEmitter object.
 */
Chatterbox.UI.prototype.set_events = function( events ) {
    this.events = events || this.events;
};

/**
 * Set the clock to 24 hour or 12 hour. Or get the current mode.
 * True means 24 hour, false means 12 hour.
 * 
 * @method clock
 * @param [mode] {Boolean} What mode to set the clock to.
 * @return {Boolean} The mode of the clock.
 */
Chatterbox.UI.prototype.clock = function( mode ) {

    if( mode === undefined || mode == this.settings.clock )
        return this.settings.clock;
    
    this.settings.clock = mode;
    this.chatbook.retime();
    
    return this.settings.clock;

};

/**
 * Build the GUI.
 * 
 * @method build
 * @param [control=Chatterbox.Control] {Class} UI control panel class.
 * @param [navigation=Chatterbox.Navigation] {Class} UI navigation panel
 *   class.
 * @param [chatbook=Chatterbox.Chatbook] {Class} Chatbook panel class.
 */
Chatterbox.UI.prototype.build = function( control, navigation, chatbook ) {
    
    this.view.append( Chatterbox.template.ui );
    this.control = new ( control || Chatterbox.Control )( this );
    this.nav = new ( navigation || Chatterbox.Navigation )( this );
    this.chatbook = new ( chatbook || Chatterbox.Chatbook )( this );
    // The monitor channel is essentially our console for the chat.
    this.monitoro = this.chatbook.create_channel(this.mns, this.settings.monitor[1], true);
    //this.control.setInput();
    this.control.focus();
    
};

/**
 * Resize the UI to fit the containing element.
 * 
 * @method resize
 */
Chatterbox.UI.prototype.resize = function() {

    this.control.resize();
    this.view.height( this.view.parent().height() );
    //this.view.width( '100%' );
    this.nav.resize(  );
    this.chatbook.resize( this.view.parent().height() - this.nav.height() - this.control.height() );

};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.UI.prototype.loop = function(  ) {

    this.chatbook.loop();

};

/**
 * Create a screen for channel `ns` in the UI, and initialise data
 * structures or some shit idk.
 * 
 * @method create_channel
 * @param ns {String} Short name for the channel.
 * @param hidden {Boolean} Should this channel's tab be hidden?
 */
Chatterbox.UI.prototype.create_channel = function( ns, toggle ) {
    this.chatbook.create_channel( ns, toggle );
};

/**
 * Remove a channel from the GUI.
 * We do this when we leave a channel for any reason.
 * Note: last channel is never removed and when removing a channel
 * we switch to the last channel in the list before doing so.
 *
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
Chatterbox.UI.prototype.remove_channel = function( ns ) {
    this.chatbook.remove_channel(ns);
};

/**
 * Select which channel is currently being viewed.
 * 
 * @method toggle_channel
 * @param ns {String} Name of the channel to select.
 */
Chatterbox.UI.prototype.toggle_channel = function( ns ) {
    return this.chatbook.toggle_channel(ns);
};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} The namespace to set or get.
 * @param [chan] {Object} A wsc channel object representing the channel specified.
 * @return {Object} The channel object representing the channel defined by `namespace`
 */
Chatterbox.UI.prototype.channel = function( namespace, chan ) {
    return this.chatbook.channel( namespace, chan );
};

/**
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
 * @method channels
 * @return {Integer} Number of channels open in the ui.
 */
Chatterbox.UI.prototype.channels = function( ) {
    return this.chatbook.channels();
};

/**
 * Switch to the channel left of the current channel.
 * 
 * @method channel_left
 */
Chatterbox.UI.prototype.channel_left = function(  ) {

    this.chatbook.channel_left();

};

/**
 * Switch to the channel right of the current channel.
 * 
 * @method channel_right
 */
Chatterbox.UI.prototype.channel_right = function(  ) {

    this.chatbook.channel_right();

};


/**
 * Display a log message in the monitor channel.
 * 
 * @method monitor
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.UI.prototype.monitor = function( msg, info ) {

    this.monitoro.server_message(msg, info);

};

/**
 * Display a server message across all open channels.
 * 
 * @method server_message
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.UI.prototype.server_message = function( msg, info ) {

    this.chatbook.server_message(msg, info);

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param item {Object} Item to display.
 */
Chatterbox.UI.prototype.log_item = function( item ) {

    this.chatbook.log_item(item);

};

/**
 * Display a log message across all open channels.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.UI.prototype.log = function( msg ) {

    this.chatbook.log(msg);

};

/**
 * Mute a user.
 * 
 * @method mute_user
 * @param user {String} User to mute.
 */
Chatterbox.UI.prototype.mute_user = function( user ) {

    if( !user )
        return false;
    
    user = user.toLowerCase();
    if( this.umuted.indexOf( user ) != -1 )
        return false;
    
    this.umuted.push( user );
    this.chatbook.each( function( ns, chan ) {
        chan.mute_user( user );
    } );
    
    return true;

};

/**
 * Unmute a user.
 * 
 * @method unmute_user
 * @param user {String} User to unmute.
 */
Chatterbox.UI.prototype.unmute_user = function( user ) {

    if( !user )
        return false;
    
    user = user.toLowerCase();
    var usri = this.umuted.indexOf( user );
    if( usri == -1 )
        return false;
    
    this.umuted.splice( usri, 1 );
    this.chatbook.each( function( ns, chan ) {
        chan.unmute_user( user );
    } );
    
    return true;

};

/**
 * Clear a user's messages from all channels.
 * 
 * @method clear_user
 * @param user {String} User to remove messages for.
 */
Chatterbox.UI.prototype.clear_user = function( user ) {

    this.chatbook.each( function( ns, chan ) {
        chan.clear_user( user );
    } );

};

/**
 * Set the theme for the UI.
 * 
 * @method theme
 * @param theme {String} Name of the theme.
 */
Chatterbox.UI.prototype.theme = function( theme ) {
    if( this.settings.theme == theme )
        return this.settings.theme;
    if( this.settings.themes.indexOf(theme) == -1 ) {
        theme = 'wsct_' + theme;
        if( this.settings.themes.indexOf(theme) == -1 )
            return this.settings.theme;
    }
    this.view.removeClass( this.settings.theme ).addClass( theme );
    this.settings.theme = theme;
    return this.settings.theme;
};

/**
 * Add a new theme to the client.
 * 
 * @method add_theme
 * @param theme {String} Name of the theme to add.
 */
Chatterbox.UI.prototype.add_theme = function( theme ) {

    if( this.settings.themes.indexOf(theme) > -1 )
        return;
    
    this.settings.themes.push(theme);

};


/**
 * Object for managing channel interfaces.
 * 
 * @class Channel
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
Chatterbox.Channel = function( ui, ns, hidden, monitor ) {

    var selector = ui.deform_ns(ns).slice(1).toLowerCase();
    this.manager = ui;
    this.hidden = hidden;
    this.monitor = monitor || false;
    this.built = false;
    this.selector = selector;
    this.raw = ui.format_ns(ns);
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
        h: {                        // Header
            title: null,            //      Title
            topic: null,            //      Topic
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
 * Draw channel on screen and store the different elements in attributes.
 * 
 * @method build
 */
Chatterbox.Channel.prototype.build = function( ) {
    
    if( this.built )
        return;
    
    var selector = this.selector;
    ns = this.namespace;
    
    // Tabs.
    this.el.t.o = this.manager.nav.add_tab( selector, ns );
    this.el.t.l = this.el.t.o.find('.tab');
    this.el.t.c = this.el.t.o.find('.close');
    // Draw
    this.manager.chatbook.view.append(Chatterbox.render('channel', {'selector': selector, 'ns': ns}));
    // Store
    this.el.m = this.window = this.manager.chatbook.view.find('#' + selector + '-window');
    this.el.h.title = this.el.m.find('header div.title');
    this.el.h.topic = this.el.m.find('header div.topic');
    this.el.l.p = this.el.m.find('#' + selector + "-log");
    this.el.l.w = this.el.l.p.find('ul.logwrap');
    this.el.u = this.el.m.find('#' + selector + "-users");
    // Max user list width;
    this.mulw = parseInt(this.el.u.css('max-width').slice(0,-2));
    var chan = this;
    
    // When someone clicks the tab link.
    this.el.t.l.click(function () {
        chan.manager.toggle_channel(selector);
        return false;
    });
    
    // When someone clicks the tab close button.
    this.el.t.c.click(function ( e ) {
        chan.manager.trigger( 'tab.close.clicked', {
            'ns': chan.namespace,
            'chan': chan,
            'e': e
        } );
        return false;
    });
    
    var focus = true;
    
    this.el.m.click(
        function( e ) {
            if( focus )
                chan.manager.control.focus();
            else
                focus = true;
        }
    );
    
    this.el.l.p.select(
        function( ) {
            focus = false;
        }
    );
    
    if( this.hidden ) {
        this.el.t.o.toggleClass('hidden');
    }
    
    this.built = true;
};

/**
 * Hide the channel from view.
 * 
 * @method hide
 */
Chatterbox.Channel.prototype.hide = function( ) {
    //console.log("hide " + this.info.selector);
    this.el.m.css({'display': 'none'});
    this.el.t.o.removeClass('active');
    this.visible = false;
};

/**
 * Display the channel.
 * 
 * @method show
 */
Chatterbox.Channel.prototype.show = function( ) {
    this.visible = true;
    this.el.m.css({'display': 'block'});
    this.el.t.o.addClass('active');
    this.el.t.o.removeClass('noise chatting tabbed fill');
    var c = this;
    setTimeout( function(  ) {
        c.el.l.w.scrollTop(c.el.l.w.prop('scrollHeight') - c.el.l.w.innerHeight());
        c.resize();
        c.pad();
        c.el.l.w.scrollTop(c.el.l.w.prop('scrollHeight') - c.el.l.w.innerHeight());
    }, 1000);
};

/**
 * Remove the channel from the UI.
 * 
 * @method remove
 */
Chatterbox.Channel.prototype.remove = function(  ) {
    this.el.t.o.remove();
    this.el.m.remove();
};

/**
 * Scroll the log panel downwards.
 * 
 * @method scroll
 */
Chatterbox.Channel.prototype.scroll = function( ) {
    this.pad();
    var ws = this.el.l.w.prop('scrollWidth') - this.el.l.w.innerWidth();
    var hs = this.el.l.w.prop('scrollHeight') - this.el.l.w.innerHeight();
    if( ws > 0 )
        hs += ws;
    if( hs < 0 || (hs - this.el.l.w.scrollTop()) > 100 )
        return;
    this.el.l.w.scrollTop(hs);
};

/**
 * Add padding to the channel log's wrapping ul.
 * This is done to make sure messages always appear at the bottom first.
 * 
 * @method pad
 */
Chatterbox.Channel.prototype.pad = function ( ) {
    // Add padding.
    this.el.l.w.css({'padding-top': 0, 'height': 'auto'});
    var wh = this.el.l.w.innerHeight();
    var lh = this.el.l.p.innerHeight() - this.el.h.topic.height() - 3;
    var pad = lh - wh;
    
    if( pad > 0 )
        this.el.l.w.css({'padding-top': pad});
    else
        this.el.l.w.css({
            'padding-top': 0,
            'height': lh});
    this.el.l.w.scrollTop(this.st);
};

/**
 * Fix the dimensions of the log window.
 * 
 * @method resize
 */
Chatterbox.Channel.prototype.resize = function( ) {
    this.el.l.w.css({'padding-top': 0});
    // Height.
    var wh = this.manager.chatbook.height();
    this.el.m.height(wh);
    // Width.
    var cw = this.el.m.width();
    
    // Userlist width.
    this.el.u.width(1);
    this.d.u[0] = this.el.u[0].scrollWidth + this.manager.swidth + 5;
    if( this.d.u[0] > this.mulw ) {
        this.d.u[0] = this.mulw;
    }
    this.el.u.width(this.d.u[0]);
    
    // Change log width based on userlist width.
    cw = cw - this.d.u[0];
    
    // Account for channel title in height.
    wh = wh - this.d.h.title[1];
        
    // Log panel dimensions
    this.el.l.p.css({
        height: wh - 3,
        width: cw - 3});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    this.d.u[1] = this.el.l.p.innerHeight();
    this.el.u.css({height: this.d.u[1]});
};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Channel.prototype.loop = function(  ) {

    msgs = this.el.l.p.find( '.logmsg' );
    
    if( msgs.length < 200 )
        return;
    
    msgs.slice(0, msgs.length - 200).remove();
    this.resize();

};

/**
 * Display a log message.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
Chatterbox.Channel.prototype.log = function( msg ) {
    data = {
        'ns': this.namespace,
        'message': msg};
    this.manager.trigger( 'log.before', data );
    this.log_item({ 'html': Chatterbox.render('logmsg', {'message': data.message}) });
};

/**
 * Send a message to the log window.
 * 
 * @method log_item
 * @param item {Object} Message to send.
 */
Chatterbox.Channel.prototype.log_item = function( item ) {
    var date = new Date();
    ts = '';
    
    if( this.manager.settings.clock ) {
        ts = formatTime('{HH}:{mm}:{ss}', date);
    } else {
        ts = formatTime('{hh}:{mm}:{ss} {mr}', date);
    }
        
    data = {
        'ts': ts,
        'ms': date.getTime(),
        'message': item.html,
        'user': (item.user || 'system' ).toLowerCase()
    };
    
    this.manager.trigger( 'log_item.before', data );
    if( this.visible ) {
        this.st = this.el.l.w.scrollTop();
    }
    
    // Add content.
    this.el.l.w.append(Chatterbox.render('logitem', data));
    this.manager.trigger( 'log_item.after', {'item': this.el.l.w.find('li').last() } );
    if( this.visible ) {
        this.st+= this.el.l.w.find('li.logmsg').last().height();
        this.el.l.w.scrollTop( this.st );
    }
    
    // Scrollio
    this.scroll();
    this.noise();
};

/**
 * Rewrite time signatures for all messages. Woo.
 * 
 * @method retime
 */
Chatterbox.Channel.prototype.retime = function(  ) {

    var tsf = '';
    var wrap = this.el.l.w;

    if( this.manager.settings.clock ) {
        tsf = '{HH}:{mm}:{ss}';
    } else {
        tsf = '{hh}:{mm}:{ss} {mr}';
    }

    wrap.find('span.ts').each(function( index, span ) {
    
        el = wrap.find(span);
        time = new Date(parseInt(el.prop('id')));
        el.text(formatTime(tsf, time));
    
    });

};

/**
 * Send a server message to the log window.
 * 
 * @method server_message
 * @param msg {String} Server message.
 * @param [info] {String} Extra information for the message.
 */
Chatterbox.Channel.prototype.server_message = function( msg, info ) {
    data = {
        'ns': this.namespace,
        'message': msg,
        'info': info};
    this.manager.trigger( 'server_message.before', data );
    this.log_item({ 'html': Chatterbox.render('servermsg', {'message': data.message, 'info': data.info}) });
};

/**
 * Clear all log messages from the log window.
 * 
 * @method clear
 */
Chatterbox.Channel.prototype.clear = function(  ) {
    this.el.l.p.find('li.logmsg').remove();
    this.el.l.p.find('li.loginfo').remove();
    this.el.l.w.height(0);
    this.resize();
};

/**
 * Display an info box in the channel log.
 * 
 * @method log_info
 * @param content {String} Infobox contents.
 */
Chatterbox.Channel.prototype.log_info = function( ref, content ) {
    data = {
        'ns': this.namespace,
        'ref': ref,
        'content': content
    };
    this.manager.trigger( 'log_info.before', data );
    delete data['ns'];
    var b = this.el.l.w.append(Chatterbox.render( 'loginfobox', data ));
    this.scroll();
    
    var ui = this;
    var box = this.el.l.w.find('li.' + data.ref);
    box.find('a.close').click(
        function( e ) {
            ui.wrap.find(this).parent().remove();
            ui.resize();
            return false;
        }
    );
    
    return box;
};

/**
 * Display a user's whois info.
 * 
 * @method show_whois
 * @param data {Object} Object containing a user's information.
 */
Chatterbox.Channel.prototype.log_whois = function( data ) {
    
    var whois = {
        'avatar': '<a href="#"><img height="50" width="50" alt="avatar"/></a>',
        'username': '<b>' + data.symbol + data.username + '</b>',
        'info': [],
        'conns': [],
        'raw': data,
    };
    
    for( var i in data.connections ) {
        var rcon = data.connections[i];
        var mcon = [];
        
        if( rcon.online ) {
            stamp = (new Date - (rcon.online * 1000));
            mcon.push([ 'online', DateStamp(stamp / 1000) + formatTime(' [{HH}:{mm}:{ss}]', new Date(stamp)) ]);
        }
        if( rcon.idle )
            mcon.push([ 'idle', timeLengthString(rcon.idle) ]);
        if( rcon.agent )
            mcon.push([ 'agent', rcon.agent ]);
        if( rcon.debug )
            mcon.push([ 'debug', rcon.debug ]);
        
        mcon.push([ 'chatrooms', rcon.channels.join(' ') ]);
        
        whois.conns.push(mcon);
    }
    
    this.manager.trigger( 'log_whois.before', whois );
    
    var conns = '';
    for( var i in whois.conns ) {
        var conn = whois.conns[i];
        var text = '<section class="conn"><p><em>connection ' + ((parseInt(i) + 1).toString()) + ':</em></p>';
        text+= '<ul>';
        for( x in conn ) {
            text+= '<li><strong>' + conn[x][0] + ':</strong> ' + conn[x][1] + '</li>';
        }
        text+= '</ul>'
        conns+= text + '</section>';
    }
    
    var info = '';
    for( var i in whois.info ) {
        info+= '<li>' + whois.info[i] + '</li>';
    }
    
    var box = this.log_info(
        'whois-'+data.username,
        Chatterbox.render('whoiswrap', {
            'avatar': whois.avatar,
            'info': Chatterbox.render('whoisinfo', {
                'username': whois.username,
                'info': info,
                'connections': conns
            })
        })
    );
    
    var av = box.find('div.avatar');
    var inf = box.find('div.info');
    inf.width( box.find('.whoiswrap').width() - 100 );
    av.height( box.height() - 10 );
    this.scroll();
};

/**
 * Display some information relating to a privilege class.
 * 
 * @method log_pc
 * @param privileges {Boolean} Are we showing privileges or users?
 * @param data {Array} Array containing information.
 */
Chatterbox.Channel.prototype.log_pc = function( privileges, data ) {

    contents = '';
    for( var i in data ) {
        if( !data.hasOwnProperty(i) )
            continue;
        var pc = data[i];
        var pcc = '';
        if( pc[2].length == 0 ) {
            pcc = '<em>' + ( privileges ? 'default privileges' : 'no members' ) + '</em>';
        } else {
            pcc = pc[2];
        }
        contents+= String.format('<li><em>{0}</em> <strong>{1}</strong>:<ul><li>{2}</li></ul></li>', [pc[1], pc[0], pcc ]);
    }
    
    var info = {
        'title': 'Privilege class ' + (privileges ? 'permissions' : 'members'),
        'info': '<ul>' + contents + '</ul>'
    };
    
    this.log_info(
        'pc-' + ( privileges ? 'permissions' : 'members' ),
        Chatterbox.render( 'pcinfo', info )
    );

};

/**
 * Set the channel header.
 * This can be the title or topic, determined by `head`.
 * 
 * @method set_header
 * @param head {String} Should be 'title' or 'topic'.
 * @param content {String} HTML to use for the header.
 */
Chatterbox.Channel.prototype.set_header = function( head, content ) {
    head = head.toLowerCase();
    
    this.el.h[head].replaceWith(
        Chatterbox.render('header', {'head': head, 'content': content || ''})
    );
    
    this.el.h[head] = this.el.m.find('header div.' + head);
    
    if( content.length > 0 ) {
        this.el.h[head].css( { display: 'block' } );
        this.d.h[head] = [
            this.el.h[head].outerWidth(true),
            this.el.h[head].outerHeight(true)
        ];
    } else {
        this.el.h[head].css( { display: 'none' } );
        this.d.h[head] = [0, 0];
    }
        
    this.resize();
};

/**
 * Get a channel header's contents.
 * 
 * @method get_header
 * @param head {String} Should be 'title' or 'topic'.
 * @return {Object} Content of the header.
 */
Chatterbox.Channel.prototype.get_header = function( head ) {

    return this.el.h[head.toLowerCase()];

};

/**
 * Set the channel user list.
 * 
 * @method set_user_list
 * @param userlist {Array} Listing of users in the channel.
 */
Chatterbox.Channel.prototype.set_user_list = function( userlist ) {
    
    if( Object.size(userlist) == 0 )
        return;
    
    var infoboxes = [];
    var html = '';
    var pc = {};
    var conn = '';
    var user = '';
    
    for( var order in userlist ) {
        pc = userlist[order];
        html += '<div class="pc"><h3>' + pc.name + '</h3><ul>';
        for( var un in pc.users ) {
            user = pc.users[un];
            conn = user.conn == 1 ? '' : '[' + user.conn + ']';
            html+= '<li><a target="_blank" id="' + user.name + '" href="http://' + user.name + '.' + this.manager.settings['domain'] + '"><em>' + user.symbol + '</em>' + user.name + '</a>' + conn + '</li>'
            if( user.hover )
                infoboxes.push(user.hover);
        }
        html+= '</ul></div>';
    }
    
    this.el.m.find('div.chatusers').html(html);
    this.el.u = this.el.m.find('div.chatusers');
    this.el.u.css({display: 'block'});
    this.d.u = [
        this.el.u.outerWidth(),
        this.el.u.outerHeight()
    ];
    
    for( var index in infoboxes ) {
        this.userinfo(infoboxes[index]);
    }
    this.resize();
    
};

/**
 * The user has been highlighted in this channel.
 * Highlights the last log message in the channel's log and animates the
 * channel tab if the channel is not visible.
 * 
 * @method highlight
 * @param [message] {Object} jQuery object for an html element. If provided,
 *   this element will be highlighted instead of the channel's last log
 *   message.
 */
Chatterbox.Channel.prototype.highlight = function( message ) {
    
    var tab = this.el.t.o;
    ( message || this.el.l.w.find('.logmsg').last() ).addClass('highlight');
    
    if( tab.hasClass('active') )
        return;
    
    if( tab.hasClass('tabbed') )
        return;
    
    if( tab.hasClass('chatting') )
        tab.removeClass('chatting');
    
    var runs = 0;
    tab.addClass('tabbed');
    
    function toggles() {
        runs++;
        tab.toggleClass('fill');
        if( runs == 6 )
            return;
        setTimeout( toggles, 1000 );
    }
    
    toggles();
    
};

/**
 * There has been activity in this channel.
 * Modifies the channel tab slightly, if the channel is not currently being
 * viewed.
 * 
 * @method noise
 */
Chatterbox.Channel.prototype.noise = function(  ) {
    
    var u = '';
    var si = 0;
    var msg = this.el.m.find('.logmsg').last();
    
    for( var i in this.manager.umuted ) {
        if( !this.manager.umuted.hasOwnProperty(i) )
            continue;
        
        if( msg.hasClass('u-' + this.manager.umuted[i]) ) {
            msg.css({'display': 'none'});
            this.scroll();
            return;
        }
    }
    
    if( !this.el.t.o.hasClass('active') ) {
        this.el.t.o.addClass('noise');
        if( !this.el.t.o.hasClass('tabbed') ) {
            if( msg.find('.cevent').length == 0 ) {
                this.el.t.o.addClass('chatting');
            }
        }
    }
    

};

/**
 * Display a user info hover box.
 * 
 * @method userinfo
 * @param user {Object} Information about a user.
 * @return {Object} jQuery object representing the information box.
 */
Chatterbox.Channel.prototype.userinfo = function( user ) {

    var link = this.el.m.find( 'a#' + user.name );
    
    if( link.length == 0 )
        return;

    var chan = this;
    var box = null;
    
    link.hover(
        function( e ) {
            user.info = [];
            var ed = { 'ns': chan.namespace, 'user': user };
            chan.manager.trigger( 'userinfo.before', ed );
            user = ed.user;
            var infoli = '';
            
            for( index in user.info ) {
                infoli+= '<li>' + user.info[index] + '</li>';
            }
            
            chan.window.append(Chatterbox.render('userinfo', {
                'username': user.name,
                'avatar': user.avatar,
                'link': user.link,
                'info': infoli}));
            
            box = chan.window.find('.userinfo#'+user.name);
            chan.window.find('div.userinfo:not(\'#' + user.name + '\')').remove();
            var pos = link.offset();
            box.css({ 'top': (pos.top - link.height()) + 10, 'left': (pos.left - (box.width())) - 6 });
            box.find('.info').height(box.height());
            
            box.hover(
                function(){ box.data('hover', 1); },
                function( e ) {
                    box.data('hover', 0);
                    chan.unhover_user( box, e );
                }
            );
            
            box.data('hover', 0);
        },
        function( e ) {
            link.data('hover', 0);
            chan.unhover_user(box, e);
        }
    );

};

/**
 * This method tries to get rid of the given user information box.
 * The information box can only be removed if the cursor is outside the
 * bounds of the information box AND outside of the bounds of the user link in
 * the user list.
 * 
 * @method unhover_user
 * @param box {Object} A jQuery object representing the information box.
 * @param event {Object} jQuery event object.
 */
Chatterbox.Channel.prototype.unhover_user = function( box, event ) {

    var o = box.offset();
    var eb = box.outerHeight(true) + o.top;
    var er = box.outerWidth(true) + o.left;
    var x = event.pageX;
    var y = event.pageY;
    
    if( x > o.left
        && x < er
        && y > o.top
        && y < eb)
        return;
    
    if( x < (er + 15)
        && x > o.left
        && y > o.top
        && y < (o.top + 15) )
        return;
    
    box.remove();

};

/**
 * Hide messages from a given user.
 * 
 * @method mute_user
 * @param user {String} User to hide messages for.
 */
Chatterbox.Channel.prototype.mute_user = function( user ) {

    if( !user )
        return;
    this.el.l.w.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'none'});
    this.scroll();

};

/**
 * Reveal messages received from a given user.
 *
 * @method unmute_user
 * @param user {String} Use to reveal messages for.
 */
Chatterbox.Channel.prototype.unmute_user = function( user ) {

    if( !user )
        return;
    this.el.l.w.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'list-item'});
    this.scroll();

};

/**
 * Remove a user's messages completely.
 * 
 * @method clear_user
 * @param user {String} User to remove messages for.
 */
Chatterbox.Channel.prototype.clear_user = function( user ) {

    if( !user )
        return;
    this.el.l.w.find('li.logmsg.u-' + user.toLowerCase()).remove();
    this.scroll();

};


/**
 * Object for managing the chatbook portion of the UI.
 *
 * @class Chatbook
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Chatbook = function( ui ) {
    
    this.manager = ui;
    this.view = this.manager.view.find('div.chatbook');
    this.chan = {};
    this.trail = [];
    this.current = null;
    this.manager.on( 'tab.close.clicked', function( event, ui ) {
        ui.chatbook.remove_channel(event.ns);
    });
    
};

/**
 * Return the height of the chatbook.
 *
 * @method height
 */
Chatterbox.Chatbook.prototype.height = function() {
    return this.view.height();
};

/**
 * Resize the chatbook view pane.
 * 
 * @method resize
 * @param [height=600] {Integer} The height to set the view pane to.
 */
Chatterbox.Chatbook.prototype.resize = function( height ) {
    height = height || 600;
    this.view.height(height);
    
    for( select in this.chan ) {
        var chan = this.chan[select];
        chan.resize();
    }
};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Chatbook.prototype.loop = function(  ) {

    for( select in this.chan ) {
        this.chan[select].loop();
    }

};

/**
 * Get or set the channel object associated with the given namespace.
 * 
 * @method channel
 * @param namespace {String} The namespace to set or get.
 * @param [chan] {Object} A wsc channel object representing the channel specified.
 * @return {Object} The channel object representing the channel defined by `namespace`
 */
Chatterbox.Chatbook.prototype.channel = function( namespace, chan ) {
    namespace = this.manager.deform_ns(namespace).slice(1).toLowerCase();
    
    if( !this.chan[namespace] && chan )
        this.chan[namespace] = chan;
    
    return this.chan[namespace];
};

/**
 * Determine how many channels the ui has open. Hidden channels are
 * not included in this, and we don't include the first channel because
 * there should always be at least one non-hidden channel present in the
 * ui.
 * 
 * @method channels
 * @return [Integer] Number of channels open in the ui.
 */
Chatterbox.Chatbook.prototype.channels = function( ) {
    chans = -1;
    for(ns in this.chan) {
        if( this.chan[ns].hidden )
            continue;
        chans++;
    }
    return chans;
};

/**
 * Create a channel in the UI.
 * 
 * @method create_channel
 * @param ns {String} Namespace of the channel to create.
 * @param hidden {Boolean} Should the tab be hidden?
 * @param monitor {Boolean} Is this channel the monitor?
 * @return {Object} WscUIChannel object.
 */
Chatterbox.Chatbook.prototype.create_channel = function( ns, hidden, monitor ) {
    chan = this.channel(ns, this.channel_object(ns, hidden, monitor));
    chan.build();
    this.toggle_channel(ns);
    this.manager.resize();
    return chan;
};

/**
 * Create a new channel panel object.
 * Override this method to use a different type of channel object.
 * 
 * @method channel_object
 * @param ns {String} Namespace of the channel.
 * @param hidden {Boolean} Should the tab be hidden?
 * @return {Object} An object representing a channel UI.
 */
Chatterbox.Chatbook.prototype.channel_object = function( ns, hidden ) {
    return new Chatterbox.Channel( this.manager, ns, hidden );
};

/**
 * Select which channel is currently being viewed.
 * 
 * @method toggle_channel
 * @param ns {String} Namespace of the channel to view.
 */
Chatterbox.Chatbook.prototype.toggle_channel = function( ns ) {
    var chan = this.channel(ns);
    var prev = chan;
    
    if( !chan )
        return;
    
    if(this.current) {
        if(this.current == chan)
            return;
        // Hide previous channel, if any.
        this.current.hide();
        prev = this.current;
    }
    
    // Show clicked channel.
    chan.show();
    this.manager.control.focus();
    this.current = chan;
    this.manager.resize();
    
    // Update the paper trail.
    if( this.trail.indexOf(chan.namespace) == -1 ) {
        this.trail.push(chan.namespace);
    }
    
    this.manager.trigger( 'channel.selected', {
        'ns': chan.namespace,
        'chan': chan,
        'prev': prev
    } );
};

/**
 * Remove a channel from the UI.
 * 
 * @method remove_channel
 * @param ns {String} Name of the channel to remove.
 */
Chatterbox.Chatbook.prototype.remove_channel = function( ns ) {
    if( this.channels() == 0 ) 
        return;
    
    var chan = this.channel(ns);
    chan.remove();
    delete this.chan[chan.selector];
    
    if( this.current == chan )
        this.channel_left();
    
    rpos = this.trail.indexOf(chan.namespace);
    this.trail.splice(rpos, 1);
};

/**
 * Switch to the channel left of the current channel.
 * 
 * @method channel_left
 */
Chatterbox.Chatbook.prototype.channel_left = function(  ) {

    var ns = this.current.namespace;
    var index = this.trail.indexOf(ns);
    
    if( index < 0 )
        return;
    
    var nc = null;
    while( true ) {
        try {
            nc = this.channel(this.trail[--index]);
        } catch( err ) {
            index = this.trail.length - 1;
            nc = this.channel(this.trail[index]);
        }
        
        if( !nc.hidden )
            break;
    }
    
    this.toggle_channel(nc.namespace);

};

/**
 * Switch to the channel right of the current channel.
 * 
 * @method channel_right
 */
Chatterbox.Chatbook.prototype.channel_right = function(  ) {

    var ns = this.current.namespace;
    var index = this.trail.indexOf(ns);
    
    if( index == -1 )
        return;
    
    var nc = null;
    while( true ) {
        try {
            nc = this.channel(this.trail[++index]);
        } catch( err ) {
            index = 0;
            nc = this.channel(this.trail[0]);
        }
        if( !nc.hidden )
            break;
    }
    
    this.toggle_channel(nc.namespace);

};

/**
 * Iterate through the different channels.
 * 
 * @method each
 * @param method {Function} Function to call for each channel.
 */
Chatterbox.Chatbook.prototype.each = function( method ) {
    
    var chan = null;
    
    for( var ns in this.chan ) {
        if( !this.chan.hasOwnProperty(ns) )
            continue;
        
        chan = this.chan[ns];
        
        if( method( chan.namespace, chan ) === false )
            break;
    }
    
};

/**
 * Display a server message across all open channels.
 * 
 * @method server_message
 * @param msg {String} Message to display.
 * @param [info] {String} Additional data to display.
 */
Chatterbox.Chatbook.prototype.server_message = function( msg, info ) {

    for( ns in this.chan ) {
        this.chan[ns].server_message(msg, info);
    }

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param msg {String} Message to display.
 */
Chatterbox.Chatbook.prototype.log_item = function( msg ) {

    for( ns in this.chan ) {
        this.chan[ns].log_item(msg);
    }

};

/**
 * Display a log item across all open channels.
 * 
 * @method log_item
 * @param msg {String} Message to display.
 */
Chatterbox.Chatbook.prototype.log = function( msg ) {

    for( ns in this.chan ) {
        this.chan[ns].log(msg);
    }

};

/**
 * Rewrite timestamps for all open channels.
 * 
 * @method retime
 */
Chatterbox.Chatbook.prototype.retime = function(  ) {

    for( ns in this.chan ) {
        this.chan[ns].retime();
    }

};

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
    this.brow = this.view.find('p');
    this.mli = this.form.find('textarea.msg');
    this.ci = this.input;
    this.ml = false;
    this.mlb = this.brow.find('a[href~=#multiline].button');
    
    var ctrl = this;
    this.mlb.click(function( event ) {
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
    this.input.css({'width': this.manager.view.width() - 100});
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
    
    this.brow.append(Chatterbox.render('control_button', options));
    var button = this.brow.find('a[href='+options.href+'].button');
    
    button.click( function( event ) {
        options['handler']();
        return false;
    } );

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

/**
 * Navigation UI element. Provides helpers for controlling the chat navigation.
 *
 * @class Navigation
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Navigation = function( ui ) {

    this.manager = ui;
    this.showclose = this.manager.settings.tabclose;
    this.nav = this.manager.view.find('nav.tabs');
    this.tabs = this.nav.find('#chattabs');
    this.buttons = this.nav.find('#tabnav');
    this.tableft = this.buttons.find('.arrow_left');
    this.tabright = this.buttons.find('.arrow_right');
    this.settingsb = this.buttons.find('#settings-button');
    this.settings = {};
    this.settings.open = false;
    
    if( !this.showclose ) {
        if( !this.tabs.hasClass('hc') )
            this.tabs.addClass('hc');
    }
    
    var nav = this;
    this.settingsb.click(
        function( event ) {
            if( nav.settings.open )
                return false;
            
            var evt = {
                'e': event,
                'settings': new Chatterbox.Settings.Config(nav.manager)
            };
            
            nav.configure_page( evt );
            nav.manager.trigger('settings.open', evt);
            nav.manager.trigger('settings.open.ran', evt);
            
            var about = evt.settings.page('About');
            about.item('text', {
                'ref': 'about-chatterbox',
                'wclass': 'centered faint',
                'text': 'Using <a href="http://github.com/photofroggy/wsc/">Chatterbox</a> version ' + Chatterbox.VERSION + ' ' + Chatterbox.STATE + ' by ~<a href="http://photofroggy.deviantart.com/">photofroggy</a>.'
            });
            
            nav.settings.window = new Chatterbox.Settings( nav.manager, evt.settings );
            nav.settings.window.build();
            nav.settings.open = true;
            return false;
        }
    );
    
    this.tableft.click(
        function(  ) {
            nav.manager.channel_left();
            return false;
        }
    );
    
    this.tabright.click(
        function(  ) {
            nav.manager.channel_right();
            return false;
        }
    );

};

/**
 * Configure the main settings page of the settings popup.
 *
 * @method configure_page
 * @param event {Object} Event object.
 */
Chatterbox.Navigation.prototype.configure_page = function( event ) {

    var ui = this.manager;
    var page = event.settings.page('Main');
    var orig = {};
    orig.theme = replaceAll(ui.settings.theme, 'wsct_', '');
    orig.clock = ui.clock();
    orig.tc = ui.nav.closer();
    
    var themes = [];
    for( i in ui.settings.themes ) {
        name = replaceAll(ui.settings.themes[i], 'wsct_', '');
        themes.push({ 'value': name, 'title': name, 'selected': orig.theme == name })
    }
    
    page.item('Form', {
        'ref': 'ui',
        'title': 'UI',
        'hint': '<b>Timestamp</b><br/>Choose between a 24 hour clock and\
                a 12 hour clock.\n\n<b>Theme</b><br/>Change the look of the\
                client.\n\n<b>Close Buttons</b><br/>Turn tab close buttons on/off.',
        'fields': [
            ['Dropdown', {
                'ref': 'theme',
                'label': 'Theme',
                'items': themes
            }],
            ['Dropdown', {
                'ref': 'clock',
                'label': 'Timestamp Format',
                'items': [
                    { 'value': '24', 'title': '24 hour', 'selected': orig.clock },
                    { 'value': '12', 'title': '12 hour', 'selected': !orig.clock }
                ]
            }],
            ['Checkbox', {
                'ref': 'tabclose',
                'label': 'Close Buttons',
                'items': [
                    { 'value': 'yes', 'title': 'On', 'selected': orig.tc }
                ]
            }],
        ],
        'event': {
            'change': function( event ) {
                ui.clock(event.data.clock == '24');
                ui.theme(event.data.theme);
                ui.nav.closer(event.data.tabclose.indexOf('yes') > -1);
            },
            'save': function( event ) {
                orig.clock = ui.clock();
                orig.theme = replaceAll(ui.theme(), 'wsct_', '');
                orig.tc = ui.nav.closer();
                
                ui.trigger('settings.save.ui', {
                    'clock': orig.clock,
                    'tabclose': orig.tc,
                    'theme': 'wsct_' + orig.theme
                } );
            },
            'close': function( event ) {
                ui.clock(orig.clock);
                ui.theme(orig.theme);
                ui.nav.closer(orig.tc);
            }
        }
    });

};

/**
 * Get the height of the navigation bar.
 *
 * @method height
 * @return {Integer} The height of the navigation bar in pixels.
 */
Chatterbox.Navigation.prototype.height = function(  ) {
    return this.nav.height();
};

/**
 * Add a channel tab to the navigation bar.
 * 
 * @method add_tab
 * @param selector {String} Shorthand lower case name for the channel with no prefixes.
 * @param ns {String} Shorthand namespace for the channel. Used as the label
 *   for the tab.
 */
Chatterbox.Navigation.prototype.add_tab = function( selector, ns ) {
    this.tabs.append(Chatterbox.render('tab', {'selector': selector, 'ns': ns}));
    return this.tabs.find('#' + selector + '-tab');
};

/**
 * Resize the tab bar.
 * 
 * @method resize
 */
Chatterbox.Navigation.prototype.resize = function(  ) {

    this.tabs.width( this.nav.width() - this.buttons.outerWidth() - 20 );
    if( this.settings.open ) {
        this.settings.window.resize();
    }

};

/**
 * Set or get the visibility of tab close buttons.
 * 
 * @method closer
 * @param [visible] {Boolean} Should the close buttons be shown?
 * @return {Boolean} Whether or not the close buttons are visible.
 */
Chatterbox.Navigation.prototype.closer = function( visible ) {

    if( visible == undefined || visible == this.showclose )
        return this.showclose;
    
    this.showclose = visible;
    if( this.showclose ) {
        if( !this.tabs.hasClass('hc') )
            return;
        this.tabs.removeClass('hc');
        return;
    }
    
    if( this.tabs.hasClass('hc') )
        return;
    this.tabs.addClass('hc');

};


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
    this.pview = ( this.manager || {view: {find: function(){}} } ).view;
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
    
    this.pview.append(Chatterbox.render( 'popup', fill ));
    this.window = this.pview.find('.floater.' + fill.ref);
    
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
        'default': '',
        'submit-button': 'Submit',
        'event': {
            'submit': function(  ) {},
            'cancel': function(  ) {}
        }
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
    
    var prompt = this;
    
    this.window.find('.button.close').click( function(  ) {
        prompt.options.event.cancel( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('.button.submit').click( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('form').submit( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );

};

/**
 * Emote picker.
 * This should be used for retrieving input from the user.
 */
Chatterbox.Popup.ItemPicker = function( ui, options ) {

    options = options || {};
    options = Object.extend( {
        'position': [10, 60],
        'ref': 'item-picker',
        'title': 'Items',
        'event': {
            'select': function( item ) {}
        }
    }, options );
    
    Chatterbox.Popup.call( this, ui, options );
    this.pview = this.pview.find('.chatbook');
    this.data = this.options['default'];
    this.pages = [];
    this.cpage = null;

};

Chatterbox.Popup.ItemPicker.prototype = new Chatterbox.Popup();
Chatterbox.Popup.ItemPicker.prototype.constructor = Chatterbox.Popup.ItemPicker;

Chatterbox.Popup.ItemPicker.prototype.build = function(  ) {

    this.options.content = Chatterbox.render('ip.main', {});
    Chatterbox.Popup.prototype.build.call(this);
    this.window.css({
        'left': this.options.position[0],
        'bottom': this.options.position[1]
    });
    this.closeb.removeClass('medium');
    this.pbook = this.window.find('section.pages');
    this.tabs = this.window.find('section.tabs ul');
    this.buttons = this.window.find('section.buttons');
    
    var ip = this;
    var page = null;
    
    for( var i in this.pages ) {
        if( !this.pages.hasOwnProperty(i) )
            continue;
        page = this.pages[i];
        page.build();
        if( i == 0 )
            this.select_page(page);
    }

};

Chatterbox.Popup.ItemPicker.prototype.refresh = function(  ) {
    
    if( this.cpage == null ) {
        return;
    } else {
        this.cpage.refresh();
    }

};

Chatterbox.Popup.ItemPicker.prototype.page = function( name, dpage ) {

    name = name.toLowerCase();
    
    for( var i in this.pages ) {
        if( !this.pages.hasOwnProperty(i) )
            continue;
        if( this.pages[i].name.toLowerCase() == name )
            return this.pages[i];
    }
    
    return (dpage || null);

};

Chatterbox.Popup.ItemPicker.prototype.add_page = function( options, pclass ) {

    this.pages.push( new ( pclass || Chatterbox.Popup.ItemPicker.Page )( this, options ) );

};

Chatterbox.Popup.ItemPicker.prototype.add_button = function( options ) {

    options = Object.extend( {
        'href': '#button',
        'title': 'Button',
        'label': 'Button'
    }, ( options || {} ) );
    
    this.buttons.append(Chatterbox.render( 'ip.button', options ));
    return this.buttons.find('a[href='+options.href+']');

};

Chatterbox.Popup.ItemPicker.prototype.select = function( item ) {

    this.options.event.select(item);

};

Chatterbox.Popup.ItemPicker.prototype.select_page = function( page ) {

    if( !page )
        return;
    
    if( this.cpage != null )
        this.cpage.hide();
    
    this.cpage = page || null;
    
    if( this.cpage != null )
        this.cpage.show();

};

Chatterbox.Popup.ItemPicker.Page = function( picker, options ) {

    this.picker = picker;
    this.options = Object.extend( {
        'ref': 'page',
        'href': '#page',
        'label': 'Page',
        'title': 'page',
        'items': [],
        'content': '<em>No items on this page.</em>',
    }, ( options || {} ));
    this.name = this.options.label;
    this.nrefresh = true;

};

Chatterbox.Popup.ItemPicker.Page.prototype.build = function(  ) {

    this.picker.pbook.append( Chatterbox.render('ip.page', this.options) );
    this.picker.tabs.append(Chatterbox.render('ip.tab', this.options));
    this.view = this.picker.pbook.find('div.page#'+this.options.ref);
    this.items = this.view.find('ul');
    this.tab = this.picker.tabs.find('#'+this.options.ref);
    
    this.refresh();
    
    var page = this;
    this.tab.find('a').click( function(  ) {
        page.picker.select_page( page );
        return false;
    } );

};

Chatterbox.Popup.ItemPicker.Page.prototype.refresh = function(  ) {

    var content = this.build_list();
    if( content.length == 0 ) {
        this.options.content = '<em>No items on this page.</em>';
    } else {
        this.options.content = '<ul>' + content + '</ul>';
    }
    this.view.html(this.options.content);
    this.items = this.view.find('ul');
    this.hook_events();
    this.nrefresh = false;

};

Chatterbox.Popup.ItemPicker.Page.prototype.hook_events = function(  ) {

    var page = this;
    this.items.find('li').each( function( index, elem ) {
        var obj = page.view.find(elem);
        var item = obj.find('.value').html();
        obj.click( function(  ) {
            page.picker.select(item);
        } );
    } );

};

Chatterbox.Popup.ItemPicker.Page.prototype.build_list = function(  ) {

    var ul = [];
    var item = null;
    var title, val, html;
    for( var i in this.options.items ) {
        if( !this.options.items.hasOwnProperty(i) )
            continue;
        item = this.options.items[i];
        val = item.value || item;
        title = item.title || val;
        html = item.html || false;
        ul.push(
            '<li class="item" title="'+title+'">\
            <span class="hicon"><i class="iconic check"></i></span>\
            '+ ( html ? val : '<span class="value">'+val+'</span>' ) + '\
            </li>'
        );
    }
    
    return ul.join('');

};

Chatterbox.Popup.ItemPicker.Page.prototype.show = function(  ) {

    this.tab.addClass('selected');
    this.view.css('display', 'block');
    this.refresh();

};

Chatterbox.Popup.ItemPicker.Page.prototype.hide = function(  ) {

    this.tab.removeClass('selected');
    this.view.css('display', 'none');

};







/**
 * Settings popup window.
 * Provides stuff for doing things. Yay.
 *
 * @class Settings
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param config {Object} Chatterbox.Settings.Config object.
 */
Chatterbox.Settings = function( ui, config ) {

    Chatterbox.Popup.call( this, ui, {
        'ref': 'settings',
        'title': 'Settings',
        'close': false,
        'content': ''
    } );
    
    this.config = config;
    this.saveb = null;
    this.scb = null;
    this.tabs = null;
    this.book = null;
    this.changed = false;
    this.manager = ui;

};

Chatterbox.Settings.prototype = new Chatterbox.Popup();
Chatterbox.Settings.prototype.constructor = Chatterbox.Settings;

/**
 * Build the settings window.
 * 
 * @method build
 */
Chatterbox.Settings.prototype.build = function(  ) {

    this.options.content = Chatterbox.template.settings.main;
    Chatterbox.Popup.prototype.build.call(this);
    this.saveb = this.window.find('a.button.save');
    this.closeb = this.window.find('a.close');
    this.scb = this.window.find('a.button.saveclose');
    this.tabs = this.window.find('nav.tabs ul.tabs');
    this.book = this.window.find('div.book');
    
    this.config.build(this.manager, this);
    
    this.window.find('ul.tabs li').first().addClass('active');
    this.window.find('div.book div.page').first().addClass('active');
    
    var settings = this;
    this.window.find('form').bind('change', function(  ) { settings.changed = true; });
    
    this.config.each_page( function( index, page ) {
        page.each_item( function( index, item ) {
            item._onchange = function( event ) {
                settings.changed = true;
            };
        } );
    } );
    
    this.saveb.click(
        function( event ) {
            settings.save();
            return false;
        }
    );
    
    this.closeb.click(
        function( event ) {
            if( settings.changed ) {
                if( !confirm( 'Are you sure? You will lose any unsaved changes.') )
                    return false;
            }
            settings.close();
            return false;
        }
    );
    this.scb.click(
        function( event ) {
            settings.save();
            settings.close();
            return false;
        }
    );
    
    this.resize();

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.prototype.resize = function(  ) {

    var inner = this.window.find('.inner');
    var head = inner.find('h2');
    var wrap = inner.find('.bookwrap');
    var foot = inner.find('footer');
    wrap.height(inner.height() - foot.outerHeight() - head.outerHeight() - 15);
    this.book.height(wrap.innerHeight() - this.tabs.outerHeight() - 25);
    this.config.resize();

};

/**
 * Switch the window to view the given page.
 * 
 * @method switch_page
 * @param page {Object} Settings window page object. This should be the page
 *   that you want to bring into focus.
 */
Chatterbox.Settings.prototype.switch_page = function( page ) {

    var active = this.tabs.find('li.active').first();
    var activeref = active.prop('id').split('-', 1)[0];
    active = this.config.page(activeref.split('_').join(' '));
    active.hide();
    page.show();

};

/**
 * Save settings.
 * 
 * @method save
 */
Chatterbox.Settings.prototype.save = function(  ) {

    this.config.save(this);
    this.changed = false;
    this.manager.trigger( 'settings.save', { 'config': this.config } );

};

/**
 * Close settings.
 * 
 * @method close
 */
Chatterbox.Settings.prototype.close = function(  ) {

    this.window.remove();
    this.manager.nav.settings.open = false;
    this.manager.nav.settings.window = null;
    this.config.close(this);
    this.manager.trigger( 'settings.close', { 'config': this.config } );

};

/**
 * Settings options object.
 * Extensions can configure the settings window with this shit yo.
 * 
 * @class Settings.Config
 * @constructor
 */
Chatterbox.Settings.Config = function( ui ) {

    this.manager = ui || null;
    this.pages = [];

};

/**
 * Find a settings page that has the given name.
 * 
 * @method find_page
 * @param name {String} Settings page to search for.
 * @return {Chatterbox.Settings.Page} Settings page object. Returns null if
 *   no such page exists.
 */
Chatterbox.Settings.Config.prototype.find_page = function( name ) {

    var n = name.toLowerCase();
    var page;
    
    for( var index in this.pages ) {
    
        page = this.pages[index];
        if( page.lname == n )
            return page;
    
    }
    
    return null;

};

/**
 * Render and display the settings pages in the given settings window.
 * 
 * @method build
 * @param window {Object} Settings window object.
 */
Chatterbox.Settings.Config.prototype.build = function( ui, window ) {

    ui = ui || this.manager;
    
    for( var i in this.pages ) {
    
        this.pages[i].build(ui, window);
    
    }

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Config.prototype.resize = function(  ) {

    for( var i in this.pages ) {
    
        this.pages[i].resize();
    
    }

};

/**
 * Get a settings page.
 * 
 * @method page
 * @param name {String} Name of the page to get or set.
 * @param [push=false] {Boolean} When adding the page, should push be used in
 *   place of unshift? Default is `false`, meaning use unshift.
 * @return {Chatterbox.Settings.Page} Settings page associated with `name`.
 */
Chatterbox.Settings.Config.prototype.page = function( name, push ) {

    var page = this.find_page(name);
    push = push || true;
    
    if( page == null ) {
        page = new Chatterbox.Settings.Page(name, this.manager);
        if( push ) {
            this.pages.push(page);
        } else {
            this.pages.unshift(page);
        }
    }
    
    return page;

};


Chatterbox.Settings.Config.prototype.each_page = function( method ) {

    var page = null;
    var result = null;
    
    for( var i in this.pages ) {
    
        if( !this.pages.hasOwnProperty(i) )
            continue;
        
        page = this.pages[i];
        result = method( i, page );
        
        if( result === false )
            break;
    
    }

};

/**
 * Save settings.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Config.prototype.save = function( window ) {

    for( var i in this.pages ) {
    
        this.pages[i].save(window);
    
    }

};

/**
 * Close settings.
 * 
 * @method close
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Config.prototype.close = function( window ) {

    for( var i in this.pages ) {
    
        this.pages[i].close(window);
    
    }

};


/**
 * Settings page config object.
 * 
 * @class Settings.Page
 * @constructor
 * @param name {String} Name of the page.
 */
Chatterbox.Settings.Page = function( name, ui) {

    this.name = name;
    this.lname = name.toLowerCase();
    this.ref = replaceAll(this.lname, ' ', '_');
    //this.content = '';
    this.items = [];
    this.itemo = {};
    this.manager = ui;

};

/**
 * Render and display the settings page in the given settings window.
 * 
 * @method build
 * @param window {Object} Settings window object.
 */
Chatterbox.Settings.Page.prototype.build = function( ui, window ) {

    var tab = replaceAll(Chatterbox.template.settings.tab, '{ref}', this.ref);
    tab = replaceAll(tab, '{name}', this.name);
    var page = replaceAll(Chatterbox.template.settings.page, '{ref}', this.ref);
    page = replaceAll(page, '{page-name}', this.name);
    window.tabs.append(tab);
    window.book.append(page);
    
    this.view = window.book.find('div#' + this.ref + '-page');
    this.tab = window.tabs.find('li#' + this.ref + '-tab');
    
    var page = this;
    this.tab.find('a').click(
        function( event ) {
            if( page.tab.hasClass('active') )
                return false;
            window.switch_page(page);
            return false;
        }
    );
    
    this.content();

};

/**
 * Display the page's contents.
 * 
 * @method content
 */
Chatterbox.Settings.Page.prototype.content = function(  ) {
    
    for( var i in this.items ) {
    
        this.items[i].build(this.view);
    
    }

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Page.prototype.resize = function(  ) {

    for( var i in this.items ) {
    
        this.items[i].resize();
    
    }

};

/**
 * Bring the page into view.
 * 
 * @method show
 */
Chatterbox.Settings.Page.prototype.show = function(  ) {

    if( !this.tab.hasClass('active') )
        this.tab.addClass('active');
    
    if( !this.view.hasClass('active') )
        this.view.addClass('active');
    
    this.resize();

};

/**
 * Hide the page from view.
 * 
 * @method hide
 */
Chatterbox.Settings.Page.prototype.hide = function(  ) {

    if( this.tab.hasClass('active') )
        this.tab.removeClass('active');
    
    if( this.view.hasClass('active') )
        this.view.removeClass('active');

};

/**
 * Add an item to the page.
 * 
 * @method item
 * @param type {String} The type of item to add to the page.
 * @param options {Object} Item options.
 * @param [shift=false] {Boolean} Should unshift be used when adding the item?
 * @return {Object} A settings page item object.
 */
Chatterbox.Settings.Page.prototype.item = function( type, options, shift ) {

    shift = shift || false;
    var item = Chatterbox.Settings.Item.get( type, options, this.manager );
    
    if( shift ) {
        this.items.unshift(item);
    } else {
        this.items.push(item);
    }
    
    if( options.hasOwnProperty('ref') ) {
        this.itemo[options.ref] = item;
    }
    
    return item;

};

Chatterbox.Settings.Page.prototype.get = function( item ) {

    if( this.itemo.hasOwnProperty( item ) )
        return this.itemo[item];
    return null;

};

Chatterbox.Settings.Page.prototype.each_item = function( method ) {

    var item = null;
    var result = null;
    
    for( var i in this.items ) {
    
        if( !this.items.hasOwnProperty(i) )
            continue;
        
        item = this.items[i];
        result = method( i, item );
        
        if( result === false )
            break;
    
    }

};

/**
 * Save page data.
 * 
 * @method save
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Page.prototype.save = function( window ) {

    for( var i in this.items ) {
    
        this.items[i].save(window, this);
    
    }

};

/**
 * Window closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 */
Chatterbox.Settings.Page.prototype.close = function( window ) {

    for( var i in this.items ) {
    
        this.items[i].close(window, this);
    
    }

};


/**
 * A base class for settings page items.
 * 
 * @class Settings.Item
 * @constructor
 * @param type {String} Determines the type of the item.
 * @param options {Object} Options for the item.
 */
Chatterbox.Settings.Item = function( type, options, ui ) {

    this.manager = ui || null;
    this.options = options || {};
    this.type = type || 'base';
    this.selector = this.type.toLowerCase();
    this.items = [];
    this.itemo = {};
    this.view = null;
    this.val = null;
    this._onchange = this._event_stub;

};

/**
 * Render and display the settings page item.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.prototype.build = function( page ) {

    if( !this.options.hasOwnProperty('ref') )
        return;
    var content = this.content();
    
    if( content.length == 0 )
        return;
    
    var wclass = '';
    if( this.options.hasOwnProperty('wclass') )
        wclass = ' ' + this.options.wclass;
    
    var item = Chatterbox.render('settings.item.wrap', {
        'type': this.type.toLowerCase().split('.').join('-'),
        'ref': this.options.ref,
        'class': wclass
    });
    
    item = replaceAll(item, '{content}', content);
    
    page.append(item);
    this.view = page.find('.item.'+this.options.ref);
    this.hooks(this.view);
    
    if( !this.options.hasOwnProperty('subitems') )
        return;
    
    var iopt;
    var type;
    var options;
    var cls;
    
    for( i in this.options.subitems ) {
    
        iopt = this.options.subitems[i];
        type = iopt[0];
        options = iopt[1];
        sitem = Chatterbox.Settings.Item.get( type, options );
        
        cls = [ 'stacked' ];
        if( sitem.options.wclass )
            cls.push(sitem.options.wclass);
        sitem.options.wclass = cls.join(' ');
        
        sitem.build(this.view);
        this.items.push(sitem);
        
        if( options.hasOwnProperty('ref') ) {
            this.itemo[options.ref] = sitem;
        }
    
    }

};

/**
 * Renders the contents of the settings page item.
 * 
 * @method content
 * @return {Boolean} Returns false if there is no content for this item.
 * @return {String} Returns an HTML string if there is content for this item.
 */
Chatterbox.Settings.Item.prototype.content = function(  ) {

    return Chatterbox.render('settings.item.' + this.selector, this.options);

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.prototype.resize = function(  ) {

    for( var i in this.items ) {
    
        this.items[i].resize();
    
    }

};

/**
 * Apply event callbacks to the page item.
 * 
 * @method hooks
 * @param item {Object} Page item jQuery object.
 */
Chatterbox.Settings.Item.prototype.hooks = function( item ) {

    if( !this.options.hasOwnProperty('event') )
        return;
    
    var events = this.options.event;
    var titem = Chatterbox.template.settings.item.get(this.selector);
    
    if( titem == false )
        return;
    
    if( !titem.hasOwnProperty('events') )
        return;
    
    var pair = [];
    
    for( var i in titem.events ) {
    
        pair = titem.events[i];
        
        if( !events.hasOwnProperty(pair[0]) )
            continue;
        
        item.find(pair[1]).bind(pair[0], events[pair[0]]);
    
    }

};

/**
 * Method stub for UI events.
 * 
 * @method _event_stub
 */
Chatterbox.Settings.Item.prototype._event_stub = function(  ) {};

/**
 * Get an item event callback.
 * 
 * @method _get_cb
 * @param event {String} Item event to get callbacks for.
 * @return {Function} Item event callback.
 */
Chatterbox.Settings.Item.prototype._get_cb = function( event ) {

    if( !this.options.hasOwnProperty('event') )
        return this._event_stub;
    
    return this.options.event[event] || this._event_stub;

};

/**
 * Get an item event pair.
 * 
 * @method _get_ep
 * @param event {String} Item event to get an event pair for.
 * @return {Function} Item event pair.
 */
Chatterbox.Settings.Item.prototype._get_ep = function( event ) {

    var titem = Chatterbox.template.settings.item.get(this.selector);
    
    if( titem == null )
        return false;
    
    if( !titem.hasOwnProperty('events') )
        return false;
    
    var pair = [];
    
    for( var i in titem.events ) {
    
        pair = titem.events[i];
        
        if( pair[0] == event )
            return pair;
    
    }

};

/**
 * Save page item data.
 * 
 * @method save
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.prototype.save = function( window, page ) {

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
            cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
        }
    }
    
    for( var i in this.items ) {
    
        this.items[i].save( window, page );
    
    }

};

/**
 * Called when the settings window is closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.prototype.close = function( window, page ) {

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'page': page, 'window': window } );
        return;
    }
    
    for( var i in cb ) {
        var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
        cb[i]( { 'input': sinps, 'item': this, 'page': page, 'window': window } );
    }
    
    for( var i in this.items ) {
    
        this.items[i].close( window, page );
    
    }

};

/* Create a new Settings Item object.
 * 
 * @method get
 * @param type {String} The type of item to create.
 * @param options {Object} Item options.
 * @param [base] {Object} Object to fetch the item from. Defaults to
     `Chatterbox.Settings.Item`.
 * @param [defaultc] {Class} Default class to use for the item.
 * @return {Object} Settings item object.
 */
Chatterbox.Settings.Item.get = function( type, options, ui, base, defaultc ) {

    var types = type.split('.');
    var item = base || Chatterbox.Settings.Item;
    var cls;
    
    for( var i in types ) {
        cls = types[i];
        if( !item.hasOwnProperty( cls ) ) {
            item = defaultc || Chatterbox.Settings.Item;
            break;
        }
        item = item[cls];
    }
    
    return new item( type, options, ui );

};


/**
 * HTML form as a single settings page item.
 * This item should be given settings items to use as form fields.
 * 
 * @class Form
 * @constructor
 * @param type {String} The type of item this item is.
 * @param options {Object} Item options.
 */
Chatterbox.Settings.Item.Form = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.form = null;
    this.fields = [];
    this.lsection = null;
    this.fsection = null;
    this.fieldo = {};

};

Chatterbox.Settings.Item.Form.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Form.prototype.constructor = Chatterbox.Settings.Item.Form;

/*
 * Create a form field object.
 * 
 * @method field
 * @param type {String} The type of form field to get.
 * @param options {Object} Field options.
 * @return {Object} Form field object.
 */
Chatterbox.Settings.Item.Form.field = function( type, options ) {

    return Chatterbox.Settings.Item.get( type, options, this.manager, Chatterbox.Settings.Item.Form, Chatterbox.Settings.Item.Form.Field );

};

/**
 * Build the form.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Form.prototype.build = function( page ) {

    Chatterbox.Settings.Item.prototype.build.call(this, page);
    
    if( this.view == null )
        return;
    
    this.lsection = this.view.find('section.labels');
    this.fsection = this.view.find('section.fields');
    
    if( !this.options.hasOwnProperty('fields') )
        return;
    
    var f;
    var field;
    
    for( var i in this.options.fields ) {
        f = this.options.fields[i];
        field = Chatterbox.Settings.Item.Form.field( f[0], f[1] );
        this.fields.push( field );
        field.build( this );
        if( f[1].hasOwnProperty('ref') ) {
            this.fieldo[f[1].ref] = field;
        }
    }
    
    this.form = this.view.find('form');
    var form = this;
    this.form.bind('change', function( event ) { form.change(); });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.prototype.resize = function(  ) {

    for( var i in this.fields ) {
    
        this.fields[i].resize();
    
    }

};

/**
 * Called when there is a change in the form.
 * 
 * @method change
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.change = function(  ) {

    var data = {};
    var field;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('change');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this } );
    } else {
        for( var i in cb ) {
            cb[i]( { 'data': data, 'form': this } );
        }
    }

};

/**
 * Save form data.
 * 
 * @method save
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this form belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.save = function( window, page ) {

    var data = {};
    var fields;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('save');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            cb[i]( { 'data': data, 'form': this, 'page': page, 'window': window } );
        }
    }

};

/**
 * Called when the settings window is closed.
 * 
 * @method close
 * @param window {Object} The settings window.
 * @param page {Object} The settings page this item belongs to.
 */
Chatterbox.Settings.Item.Form.prototype.close = function( window, page ) {

    var data = {};
    var field;
    
    for( var i in this.fields ) {
    
        field = this.fields[i];
        data[field.ref] = field.get();
    
    }
    
    var cb = this._get_cb('close');
    
    if( typeof cb == 'function' ) {
        cb( { 'data': data, 'form': this, 'page': page, 'window': window } );
    } else {
        for( var i in cb ) {
            cb[i]( { 'data': data, 'form': this, 'page': page, 'window': window } );
        }
    }

};


/**
 * Base class for form fields.
 * 
 * @class Field
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Field = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.ref = this.options['ref'] || 'ref';
    this.label = null;
    this.field = null;
    this.value = '';

};

Chatterbox.Settings.Item.Form.Field.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Form.Field.prototype.constructor = Chatterbox.Settings.Item.Form.Field;

/**
 * Build the form field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Field.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || '',
            'class': (this.options['class'] ? ' ' + this.options['class'] : '')
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.' + this.selector, this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('.'+this.ref);
    this.view = this.fwrap;
    var field = this;
    this.value = this.field.val();
    this.field.bind('change', function( event ) {
        field.value = field.view.find(this).val();
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Field.prototype.resize = function(  ) {

    this.lwrap.height( this.field.height() );

};

/**
 * Get field data.
 * 
 * @method get
 * @return {Object} data.
 */
Chatterbox.Settings.Item.Form.Field.prototype.get = function(  ) {

    return this.value;

};


/**
 * Form radio field.
 * 
 * @class Radio
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Radio = function( type, options ) {

    options = options || {};
    options['class'] = ( options['class'] ? (options['class'] + ' ') : '' ) + 'box';
    Chatterbox.Settings.Item.Form.Field.call(this, type, options);
    this.items = {};
    this.value = '';

};

Chatterbox.Settings.Item.Form.Radio.prototype = new Chatterbox.Settings.Item.Form.Field();
Chatterbox.Settings.Item.Form.Radio.prototype.constructor = Chatterbox.Settings.Item.Form.Radio;

/**
 * Build the radio field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Radio.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || ''
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.ref;
            this.items[item.ref] = '';
        }
    }
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.radio', this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('input:radio');
    this.value = this.fwrap.find('input[checked]:radio').val();
    
    var radio = this;
    this.field.bind('change', function( event ) {
        radio.value = radio.fwrap.find(this).val();
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Radio.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.find('.radiobox').height() );

};

/**
 * Get field data.
 * 
 * @method get
 * @return {Object} data.
 */
Chatterbox.Settings.Item.Form.Radio.prototype.get = function(  ) {

    return this.value;

};


/**
 * Form checkbox field.
 * 
 * @class Check
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Checkbox = function( type, options ) {

    Chatterbox.Settings.Item.Form.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Form.Checkbox.prototype = new Chatterbox.Settings.Item.Form.Radio();
Chatterbox.Settings.Item.Form.Checkbox.prototype.constructor = Chatterbox.Settings.Item.Form.Checkbox;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Checkbox.prototype.build = function( form ) {

    form.lsection.append(
        Chatterbox.render('settings.item.form.label', {
            'ref': this.ref,
            'label': this.options['label'] || ''
        })
    );
    
    this.label = form.lsection.find('label.' + this.ref);
    this.lwrap = form.lsection.find('.'+this.ref+'.label');
    
    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.ref;
            this.items[item.ref] = '';
        }
    }
    
    form.fsection.append(
        Chatterbox.render('settings.item.form.field.wrap', {
            'ref': this.ref,
            'field': Chatterbox.render('settings.item.form.field.checkbox', this.options)
        })
    );
    
    this.fwrap = form.fsection.find('div.'+this.ref+'.field');
    this.field = this.fwrap.find('input:checkbox');
    var check = this;
    this.value = [];
    this.fwrap.find('input[checked]:checkbox').each(function(  ) {
        check.value.push(check.fwrap.find(this).val());
    });
    
    this.field.bind('change', function( event ) {
        check.value = [];
        check.fwrap.find('input[checked]:checkbox').each(function(  ) {
            check.value.push(check.fwrap.find(this).val());
        });
    });

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Checkbox.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.find('.checkbox').height() );

};


/**
 * Form colour field.
 * 
 * @class Colour
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Form.Colour = function( type, options ) {

    Chatterbox.Settings.Item.Form.Field.call(this, type, options);

};

Chatterbox.Settings.Item.Form.Colour.prototype = new Chatterbox.Settings.Item.Form.Field();
Chatterbox.Settings.Item.Form.Colour.prototype.constructor = Chatterbox.Settings.Item.Form.Colour;

/**
 * Build the colour field.
 * 
 * @method build
 * @param form {Object} Settings page form.
 */
Chatterbox.Settings.Item.Form.Colour.prototype.build = function( form ) {

    Chatterbox.Settings.Item.Form.Field.prototype.build.call(this, form);
    this.resize();

};

/**
 * Resize the settings window boxes stuff.
 * 
 * @method resize
 */
Chatterbox.Settings.Item.Form.Colour.prototype.resize = function(  ) {

    this.lwrap.height( this.fwrap.height() );

};


/**
 * Radio box item.
 * 
 * @class Radio
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Radio = function( type, options ) {

    Chatterbox.Settings.Item.call(this, type, options);
    this.value = '';

};

Chatterbox.Settings.Item.Radio.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Radio.prototype.constructor = Chatterbox.Settings.Item.Radio;

/**
 * Build the radio field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Radio.prototype.build = function( page ) {

    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.options['ref'] || 'ref';
        }
    }
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    this.field = this.view.find('input:radio');
    this.value = this.view.find('input[checked]:radio').val();
    
    var radio = this;
    this.field.bind('change', function( event ) {
        radio.value = radio.view.find(this).val();
    });

};


/**
 * Check box item.
 * 
 * @class Check
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Checkbox = function( type, options ) {

    Chatterbox.Settings.Item.Radio.call(this, type, options);
    this.value = [];

};

Chatterbox.Settings.Item.Checkbox.prototype = new Chatterbox.Settings.Item.Radio();
Chatterbox.Settings.Item.Checkbox.prototype.constructor = Chatterbox.Settings.Item.Checkbox;

/**
 * Build the checkbox field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Checkbox.prototype.build = function( page ) {

    if( this.options.hasOwnProperty('items') ) {
        for( i in this.options.items ) {
            var item = this.options.items[i];
            item.name = this.options['ref'] || 'ref';
        }
    }
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    this.field = this.view.find('input:checkbox');
    var check = this;
    this.value = [];
    this.view.find('input[checked]:checkbox').each(function(  ) {
        check.value.push(check.view.find(this).val());
    });
    
    this.field.bind('change', function( event ) {
        check.value = [];
        check.view.find('input[checked]:checkbox').each(function(  ) {
            check.value.push(check.view.find(this).val());
        });
    });

};


/**
 * Check box item.
 * 
 * @class Items
 * @constructor
 * @param type {String} The type of field this field is.
 * @param options {Object} Field options.
 */
Chatterbox.Settings.Item.Items = function( type, options, ui ) {

    options = Object.extend( {
        'prompt': {
            'title': 'Add Item',
            'label': 'Item:',
            'submit-button': 'Add'
        }
    }, ( options || {} ) );
    Chatterbox.Settings.Item.call(this, type, options, ui);
    this.selected = false;

};

Chatterbox.Settings.Item.Items.prototype = new Chatterbox.Settings.Item();
Chatterbox.Settings.Item.Items.prototype.constructor = Chatterbox.Settings.Item.Items;

/**
 * Build the Items field.
 * 
 * @method build
 * @param page {Object} Settings page object.
 */
Chatterbox.Settings.Item.Items.prototype.build = function( page ) {
    
    Chatterbox.Settings.Item.prototype.build.call( this, page );
    var mgr = this;
    this.list = this.view.find('ul');
    this.buttons = this.view.find('section.buttons p');
    
    var listing = this.list.find('li');
    
    listing.click( function( event ) {
        var el = mgr.list.find(this);
        mgr.list.find('li.selected').removeClass('selected');
        mgr.selected = el.find('.item').html();
        el.addClass('selected');
    } );
    
    listing.each( function( index, item ) {
        var el = mgr.list.find(item);
        el.find('a.close').click( function( event ) {
            mgr.list.find('li.selected').removeClass('selected');
            mgr.selected = el.find('.item').html();
            el.addClass('selected');
            mgr.remove_item();
            return false;
        } );
    } );
    
    this.buttons.find('a.button.up').click( function( event ) {
        mgr.shift_item( true );
        return false;
    } );
    this.buttons.find('a.button.down').click( function( event ) {
        mgr.shift_item();
        return false;
    } );
    this.buttons.find('a.button.add').click( function( event ) {
        var iprompt = new Chatterbox.Popup.Prompt( mgr.manager, {
            'position': [event.clientX - 100, event.clientY - 50],
            'title': mgr.options.prompt.title,
            'label': mgr.options.prompt.label,
            'submit-button': mgr.options.prompt['submit-button'],
            'event': {
                'submit': function( prompt ) {
                    var data = prompt.data;
                    if( !data ) {
                        prompt.options.event.cancel( prompt );
                        return;
                    }
                    
                    data = data.toLowerCase();
                    var index = mgr.options.items.indexOf(data);
                    if( index != -1 ) {
                        prompt.options.event.cancel( prompt );
                        return;
                    }
                    
                    mgr._fevent( 'add', {
                        'item': data
                    } );
                    
                    mgr.refresh();
                    mgr._onchange({});
                },
                'cancel': function( prompt ) {
                    mgr._fevent('cancel', {});
                    mgr.refresh();
                    mgr._onchange({});
                }
            }
        } );
        iprompt.build();
        return false;
    } );
    this.buttons.find('a.button.close').click( function( event ) {
        mgr.remove_item();
        return false;
    } );

};

Chatterbox.Settings.Item.Items.prototype.shift_item = function( direction ) {

    if( this.selected === false )
        return;
    
    var first = this.options.items.indexOf( this.selected );
    var second = first + 1;
    
    if( direction )
        second = first - 1;
    
    if( first == -1 || first >= this.options.items.length )
        return;
    
    if( second < 0 || second >= this.options.items.length )
        return;
    
    this._fevent(( direction ? 'up' : 'down' ), {
        'swap': {
            'this': { 'index': first, 'item': this.options.items[first] },
            'that': { 'index': second, 'item': this.options.items[second] }
        }
    });
    
    this.refresh();
    this._onchange({});
    return;

};

Chatterbox.Settings.Item.Items.prototype.remove_item = function(  ) {

    if( this.selected === false )
        return false;
    
    var index = this.options.items.indexOf( this.selected );
    if( index == -1 || index >= this.options.items.length )
        return;
    
    this._fevent( 'remove', {
        'index': index,
        'item': this.selected
    } );
    
    this.selected = false;
    this.refresh();
    this._onchange({});
};

Chatterbox.Settings.Item.Items.prototype.refresh = function(  ) {

    this.view.find('section.mitems').html(
        Chatterbox.template.settings.krender.manageditems(this.options.items)
    );
    this.list = this.view.find('ul');
    this.list.find('li[title=' + (this.selected || '').toLowerCase() + ']')
        .addClass('selected');
    
    var mgr = this;
    var listing = this.list.find('li');
    
    listing.click( function( event ) {
        var el = mgr.list.find(this);
        mgr.list.find('li.selected').removeClass('selected');
        mgr.selected = el.find('.item').html();
        el.addClass('selected');
    } );
    
    listing.each( function( index, item ) {
        var el = mgr.list.find(item);
        el.find('a.close').click( function( event ) {
            mgr.list.find('li.selected').removeClass('selected');
            mgr.selected = el.find('.item').html();
            el.addClass('selected');
            mgr.remove_item();
            return false;
        } );
    } );

};

Chatterbox.Settings.Item.Items.prototype._fevent = function( evt, args ) {

    var pair = this._get_ep('inspect');
    var inps = pair ? this.view.find(pair[1]) : null;
    var cb = this._get_cb(evt);
    
    if( typeof cb == 'function' ) {
        cb( { 'input': inps, 'item': this, 'args': args } );
    } else {
        for( var i in cb ) {
            var sinps = inps.hasOwnProperty('slice') ? inps.slice(i, 1) : inps;
            cb[i]( { 'input': sinps, 'item': this, 'args': args } );
        }
    }

};

Chatterbox.Settings.Item.Items.prototype.save = function(  ) {

    this._fevent('save', {
        'items': this.options['items'] || []
    });

};




/**
 * Container object for HTML5 templates for the chat UI.
 * 
 * @class template
 */
Chatterbox.template = {};

/**
 * Helper method to render templates.
 * This method is actually a static method on the Chatterbox module.
 * 
 * @method render
 * @param template {String} Name of the template to render.
 * @param fill {Object} Variables to render the template with.
 * @param use {Boolean} Use `template` as the actual template rather than the name.
 */
Chatterbox.render = function( template, fill, use, base ) {

    var html = base || Chatterbox.template;
    var renderer = {};
    var tmpl = null;
    var part = null;
    
    if( use !== undefined && use === true ) {
        html = template;
    } else {
        var tparts = template.split('.');
        for( var ind in tparts ) {
            part = tparts[ind];
            if( !html.hasOwnProperty( part ) )
                return '';
            html = html[part];
        }
    }
    
    if( html.hasOwnProperty('frame') ) {
        tmpl = html;
        renderer = html.render || {};
        html = html.frame;
        if( tmpl.hasOwnProperty('pre') ) {
            if( typeof tmpl.pre == 'function' ) {
                html = tmpl.pre( html, fill );
            } else {
                for( i in tmpl.pre ) {
                    html = tmpl.pre[i]( html, fill );
                }
            }
        }
    }
    
    for( key in fill ) {
        html = replaceAll(html, '{'+key+'}', ( renderer[key] || Chatterbox.template.render_stub )( fill[key] || '' ));
    }
    
    if( tmpl != null ) {
        if( tmpl.hasOwnProperty('post') ) {
            if( typeof tmpl.post == 'function' ) {
                html = tmpl.post( html, fill );
            } else {
                for( i in tmpl.post ) {
                    html = tmpl.post[i]( html, fill );
                }
            }
        }
    }
    
    return html;

};

Chatterbox.template.render_stub = function( data ) { return data; };
Chatterbox.template.clean = function( keys ) {

    return function( html, fill ) {
        for( i in keys ) {
            html = replaceAll( html, '{'+keys[i]+'}', '' );
        }
        return html;
    };

};


/**
 * This template provides the HTML for a chat client's main view.
 *
 * @property ui
 * @type String
 */
Chatterbox.template.ui = '<nav class="tabs"><ul id="chattabs" class="tabs"></ul>\
        <ul id="tabnav">\
            <li><a href="#left" class="button iconic arrow_left"></a></li>\
            <li><a href="#right" class="button iconic arrow_right"></a></li>\
            <li><a href="#settings" title="Change client settings" class="button iconic cog" id="settings-button"></a></li>\
        </ul>\
        </nav>\
        <div class="chatbook"></div>';

/**
 * HTML for an input panel.
 * 
 * @property control
 * @type String
 */
Chatterbox.template.control = '<div class="chatcontrol">\
            <p><a href="#multiline" title="Toggle multiline input" class="button iconic list"></a></p>\
            <form class="msg">\
                <input type="text" class="msg" />\
                <textarea class="msg"></textarea>\
                <input type="submit" value="Send" class="sendmsg" />\
            </form>\
        </div>';

Chatterbox.template.control_button = '<a href="{href}" title="{title}" class="button{icon}">{label}</a>';

/**
 * HTML for a channel tab.
 * 
 * @property tab
 * @type String
 */
Chatterbox.template.tab = '<li id="{selector}-tab"><a href="#{selector}" class="tab">{ns}<a href="#{selector}" class="close iconic x"></a></a></li>';

/**
 * HTML template for a channel view.
 * 
 * @property channel
 * @type String
 */
Chatterbox.template.channel = '<div class="chatwindow" id="{selector}-window">\
                    <header>\
                        <div class="title"></div>\
                    </header>\
                    <div class="chatlog" id="{selector}-log">\
                        <header>\
                            <div class="topic"></div>\
                        </header>\
                        <ul class="logwrap"></ul>\
                    </div>\
                    <div class="chatusers" id="{selector}-users">\
                </div>\
            </div>';

/**
 * Channel header HTML template.
 * 
 * @property header
 * @type String
 */
Chatterbox.template.header = '<div class="{head}">{content}</div>';

/**
 * Log message template.
 * 
 * @property logmsg
 * @type String
 */
Chatterbox.template.logmsg = '<span class="message">{message}</span>';

/**
 * Simple log template.
 * 
 * @property logitem
 * @type String
 */
Chatterbox.template.logitem = '<li class="logmsg u-{user}"><span class="ts" id="{ms}">{ts}</span> {message}</li>';

/**
 * Server message template.
 * 
 * @property servermsg
 * @type String
 */
Chatterbox.template.servermsg = '<span class="servermsg">** {message} * <em>{info}</em></span>';

/**
 * User message template.
 * 
 * @property usermsg
 * @type String
 */
Chatterbox.template.usermsg = '<strong class="user">&lt;{user}&gt;</strong> {message}';

/**
 * User info box (userlist hover)
 * 
 * @property userinfo
 * @type String
 */
Chatterbox.template.userinfo = '<div class="userinfo" id="{username}">\
                            <div class="avatar">\
                                {avatar}\
                            </div><div class="info">\
                            <strong>\
                            {link}\
                            </strong>\
                            <ul>{info}</ul></div>\
                        </div>';

                        
Chatterbox.template.loginfobox = '<li class="loginfo {ref}"><a href="#{ref}" class="close iconic x"></a>{content}</li>';
Chatterbox.template.whois = {};
Chatterbox.template.whoiswrap = '<div class="whoiswrap">\
                                <div class="avatar">{avatar}</div>\
                                <div class="info">{info}</div>\
                                </div>';
Chatterbox.template.whoisinfo = '<p>{username}</p><ul>{info}</ul>{connections}';
Chatterbox.template.pcinfo = '<section class="pcinfo"><strong>{title}</strong>{info}</section>';

/**
 * Container for popup shit.
 * 
 * @property popup
 * @type String
 */
Chatterbox.template.popup = '<div class="floater {ref}"><div class="inner"><h2>{title}</h2><div class="content">{content}</div></div></div>';

Chatterbox.template.ip = {};
Chatterbox.template.ip.main = {};
Chatterbox.template.ip.main.frame = '<section class="tabs"><ul></ul></section>\
        <section class="pages"></section>\
        <section class="buttons"></section>';

Chatterbox.template.ip.page = { 'frame': '<div class="page" id="{ref}">{content}</div>' };
Chatterbox.template.ip.button = { 'frame': '<a href="{href}" title="{title}" class="button text">{label}</a>' };
Chatterbox.template.ip.tab = {'frame': '<li class="tab" id="{ref}"><a href="{href}" title="{title}">{label}</a></li>' };

Chatterbox.template.prompt = {};
Chatterbox.template.prompt.main = '<span class="label">{label}</span>\
    <span class="input"><form><input type="text" value="{default}" /></form></span>\
    <span class="buttons">\
    <a href="#submit" class="button submit">{submit-button}</a>\
    <a href="#remove" class="button close big square iconic x"></a>\
    </span>';

/**
 * Settings stuff.
 *
 * @class settings
 */
Chatterbox.template.settings = {};
Chatterbox.template.settings.main = '<div class="bookwrap">\
                                <nav class="tabs">\
                                    <ul class="tabs"></ul>\
                                </nav>\
                                <div class="book"></div>\
                            </div>\
                            <footer>\
                                <a href="#save" class="button save">Save</a> <a href="#saveclose" class="button saveclose">Save & Close</a> <a href="#close" class="button close big square iconic x"></a>\
                            </footer>';

Chatterbox.template.settings.page = '<div class="page" id="{ref}-page"></div>';
Chatterbox.template.settings.tab = '<li id="{ref}-tab"><a href="#{ref}" class="tab" id="{ref}-tab">{name}</a></li>';

// Key renderers.
Chatterbox.template.settings.krender = {};
Chatterbox.template.settings.krender.title = function( title ) {
    if( title.length == 0 )
        return '';
    return '<h3>' + title + '</h3>';
};
Chatterbox.template.settings.krender.text = function( text ) { return replaceAll(text, '\n\n', '\n</p><p>\n'); };
Chatterbox.template.settings.krender.dditems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    
    for( i in items ) {
    
        item = items[i];
        render+= '<option value="' + item.value + '"';
        if( item.selected ) {
            render+= ' selected="yes"';
        }
        render+= '>' + item.title + '</option>';
    
    }
    return render;
};
Chatterbox.template.settings.krender.radioitems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    labels = [];
    fields = [];
    
    for( i in items ) {
    
        item = items[i];
        labels.push(Chatterbox.render('settings.item.form.label', {
            'ref': item.value,
            'label': item.title
        }));
        
        ritem = '<div class="'+item.value+' field radio"><input class="'+item.value+'" type="radio" name="'+item.name+'" value="' + item.value + '"'
        if( item.selected ) {
            ritem+= ' checked="yes"';
        }
        fields.push(ritem + ' /></div>');
    
    }
    
    return '<section class="labels">' + labels.join('') + '</section><section class="fields">' + fields.join('') + '</section>';
};
Chatterbox.template.settings.krender.checkitems = function( items ) {
    if( items.length == 0 )
        return '';
    render = '';
    labels = [];
    fields = [];
    
    for( i in items ) {
    
        item = items[i];
        if( 'title' in item ) {
            labels.push(Chatterbox.render('settings.item.form.label', {
                'ref': item.value,
                'label': item.title
            }));
        }
        
        ritem = '<div class="'+item.value+' field check"><input class="'+item.value+'" type="checkbox" name="'+item.name+'" value="' + item.value + '"'
        if( item.selected ) {
            ritem+= ' checked="yes"';
        }
        fields.push(ritem + ' /></div>');
    
    }
    
    if( labels.length > 0 ) {
        render+= '<section class="labels">' + labels.join('') + '</section>';
    }
    
    return render + '<section class="fields">' + fields.join('') + '</section>';
};

Chatterbox.template.settings.krender.manageditems = function( items ) {
    if( items.length == 0 )
        return '<i>No items in this list</i>';
    
    var render = '<ul>';
    var labels = [];
    var fields = [];
    var item;
    
    for( var i in items ) {
    
        if( !items.hasOwnProperty(i) )
            continue;
        
        item = items[i];
        render+= '<li title="' + item.toLowerCase() + '">\
                  <span class="remove"><a href="#remove" title="Remove item" class="close iconic x"></a></span>\
                  <span class="item">' + item + '</span>\
                  </li>';
    
    }
    
    return render + '</ul>';
};

Chatterbox.template.settings.item = {};
Chatterbox.template.settings.item.get = function( type ) {

    var tp = type.split('.');
    var item = Chatterbox.template.settings.item;
    
    for( i in tp ) {
        tc = tp[i];
        if( item.hasOwnProperty(tc) ) {
            item = item[tc];
            continue;
        }
        return null;
    }
    
    return item;

};

Chatterbox.template.settings.item.wrap = '<section class="item {type} {ref}{class}">\
                                    {content}\
                                </section>';
                                
Chatterbox.template.settings.item.hint = {};
Chatterbox.template.settings.item.hint.frame = '<aside class="hint">{hint}</aside>{content}';
Chatterbox.template.settings.item.hint.prep = function( html, data ) {

    if( !data.hasOwnProperty('hint') )
        return html;
    
    return Chatterbox.render('settings.item.hint', {
        'hint': data.hint,
        'content': html
    });

};

Chatterbox.template.settings.item.twopane = {};
Chatterbox.template.settings.item.twopane.frame = '{title}<div class="twopane">\
                                        <div class="text left">\
                                            <p>{text}</p>\
                                        </div>\
                                        <div class="right">\
                                            {template}\
                                        </div>\
                                    </div>';

Chatterbox.template.settings.item.twopane.wrap = function( html, data ) {

    if( !data.hasOwnProperty('text') )
        return html;
    
    html = replaceAll(
        Chatterbox.template.settings.item.twopane.frame, 
        '{template}',
        replaceAll(html, '{title}', '')
    );
    
    return html;

};

Chatterbox.template.settings.item.text = {};
Chatterbox.template.settings.item.text.pre = Chatterbox.template.settings.item.hint.prep;
Chatterbox.template.settings.item.text.post = Chatterbox.template.clean(['title', 'text']);
Chatterbox.template.settings.item.text.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.text.frame = '{title}<p>\
                                        {text}\
                                    </p>';

Chatterbox.template.settings.item.dropdown = {};
Chatterbox.template.settings.item.dropdown.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.dropdown.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.dditems
};

Chatterbox.template.settings.item.dropdown.post = Chatterbox.template.clean(['title', 'items']);
Chatterbox.template.settings.item.dropdown.events = [['change', 'select'],['inspect', 'select']];
Chatterbox.template.settings.item.dropdown.frame = '{title}<form>\
                                                <select>\
                                                    {items}\
                                                </select>\
                                            </form>';

Chatterbox.template.settings.item.radio = {};
Chatterbox.template.settings.item.radio.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.radio.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.radioitems
};

Chatterbox.template.settings.item.radio.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.radio.events = [['change', 'input:radio'],['inspect', 'input:radio']];
Chatterbox.template.settings.item.radio.frame = '{title}<div class="{ref} radiobox"><form>{items}</form></div>';

Chatterbox.template.settings.item.checkbox = {};
Chatterbox.template.settings.item.checkbox.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.checkbox.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.checkitems
};

Chatterbox.template.settings.item.checkbox.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.checkbox.events = [['change', 'input:checkbox'],['inspect', 'input:checkbox']];
Chatterbox.template.settings.item.checkbox.frame = '{title}<div class="{ref} checkbox"><form>{items}</form></div>';

Chatterbox.template.settings.item.textfield = {};
Chatterbox.template.settings.item.textfield.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.textfield.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.textfield.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.textfield.events = [['blur', 'input'],['inspect', 'input']];
Chatterbox.template.settings.item.textfield.frame = '{title}<div class="{ref} textfield"><form><input type="text" value="{default}" /></form></div>';

Chatterbox.template.settings.item.textarea = {};
Chatterbox.template.settings.item.textarea.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.textarea.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.textarea.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.textarea.events = [['blur', 'textarea'],['inspect', 'textarea']];
Chatterbox.template.settings.item.textarea.frame = '{title}<div class="{ref} textarea"><form><textarea rows="4" cols="20" value="{default}"></textarea></form></div>';

Chatterbox.template.settings.item.items = {};
Chatterbox.template.settings.item.items.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.items.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.manageditems
};

Chatterbox.template.settings.item.items.post = Chatterbox.template.clean(['ref', 'title', 'items']);
Chatterbox.template.settings.item.items.events = [];
Chatterbox.template.settings.item.items.frame = '{title}<div class="{ref} items">\
    <section class="buttons"><p><a href="#up" title="Move item up" class="button up iconic arrow_up"></a>\
    <a href="#down" title="Move item down" class="button down iconic arrow_down"></a>\
    <a href="#add" title="Add an item" class="button add iconic plus"></a>\
    <a href="#remove" title="Remove item from list" class="button close big square iconic x"></a>\
    </p></section>\
    <section class="mitems">{items}</section>\
    </div>';

Chatterbox.template.settings.item.colour = {};
Chatterbox.template.settings.item.colour.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.colour.render = { 'title': Chatterbox.template.settings.krender.title };

Chatterbox.template.settings.item.colour.post = Chatterbox.template.clean(['ref', 'title', 'default']);
Chatterbox.template.settings.item.colour.events = [['blur', 'input'],['inspect', 'input']];
Chatterbox.template.settings.item.colour.frame = '{title}<div class="{ref} textfield"><form><input type="color" value="{default}" /></form></div>';

Chatterbox.template.settings.item.form = {};
Chatterbox.template.settings.item.form.pre = [
    Chatterbox.template.settings.item.twopane.wrap,
    Chatterbox.template.settings.item.hint.prep
];

Chatterbox.template.settings.item.form.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text,
    'items': Chatterbox.template.settings.krender.dditems
};

Chatterbox.template.settings.item.form.post = Chatterbox.template.clean(['title', 'text', 'items']);
//Chatterbox.template.settings.item.form.events = [['change', 'select'],['inspect', 'select']];
Chatterbox.template.settings.item.form.frame = '{title}<form>\
                                                <section class="labels"></section>\
                                                <section class="fields"></section>\
                                            </form>';

Chatterbox.template.settings.item.form.label = {};
Chatterbox.template.settings.item.form.label.post = Chatterbox.template.clean(['ref', 'label', 'class']);
Chatterbox.template.settings.item.form.label.frame = '<div class="{ref} label{class}"><label for="{ref}">{label}</label></div>';

Chatterbox.template.settings.item.form.field = {};
Chatterbox.template.settings.item.form.field.wrap = {};
Chatterbox.template.settings.item.form.field.wrap.post = Chatterbox.template.clean(['ref', 'field']);
Chatterbox.template.settings.item.form.field.wrap.frame = '<div class="{ref} field">{field}</div>';

Chatterbox.template.settings.item.form.field.dropdown = {};
Chatterbox.template.settings.item.form.field.dropdown.render = { 'items': Chatterbox.template.settings.krender.dditems };
Chatterbox.template.settings.item.form.field.dropdown.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.dropdown.frame = '<select class="{ref}">{items}</select>';

Chatterbox.template.settings.item.form.field.textfield = {};
Chatterbox.template.settings.item.form.field.textfield.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.textfield.frame = '<input class="{ref}" type="text" value="{default}" />';

Chatterbox.template.settings.item.form.field.textarea = {};
Chatterbox.template.settings.item.form.field.textarea.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.textarea.frame = '<textarea class="{ref}" rows="4" cols="20" value="{default}"></textarea>';

Chatterbox.template.settings.item.form.field.radio = {};
Chatterbox.template.settings.item.form.field.radio.render = { 'items': Chatterbox.template.settings.krender.radioitems };
Chatterbox.template.settings.item.form.field.radio.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.radio.frame = '<div class="{ref} radiobox">{items}</div>';

Chatterbox.template.settings.item.form.field.checkbox = {};
Chatterbox.template.settings.item.form.field.checkbox.render = { 'items': Chatterbox.template.settings.krender.checkitems };
Chatterbox.template.settings.item.form.field.checkbox.post = Chatterbox.template.clean(['ref', 'items']);
Chatterbox.template.settings.item.form.field.checkbox.frame = '<div class="{ref} checkbox">{items}</div>';

Chatterbox.template.settings.item.form.field.text = {};
Chatterbox.template.settings.item.form.field.text.pre = Chatterbox.template.settings.item.hint.prep;
Chatterbox.template.settings.item.form.field.text.post = Chatterbox.template.clean(['title', 'text']);
Chatterbox.template.settings.item.form.field.text.render = {
    'title': Chatterbox.template.settings.krender.title,
    'text': Chatterbox.template.settings.krender.text
};

Chatterbox.template.settings.item.form.field.text.frame = '{title}<p>\
                                        {text}\
                                    </p>';

Chatterbox.template.settings.item.form.field.colour = {};
Chatterbox.template.settings.item.form.field.colour.post = Chatterbox.template.clean(['ref', 'default']);
Chatterbox.template.settings.item.form.field.colour.frame = '<input class="{ref}" type="color" value="{default}" />';



