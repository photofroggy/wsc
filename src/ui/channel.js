/**
 * Object for managing channel interfaces.
 * 
 * @class WscUIChannel
 * @constructor
 * @param ui {Object} WscUI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
function WscUIChannel( ui, ns, hidden, monitor ) {

    var selector = ui.deform_ns(ns).slice(1).toLowerCase();
    this.manager = ui;
    this.hidden = hidden;
    this.monitor = monitor || false;
    this.built = false;
    this.selector = selector;
    this.raw = ui.format_ns(ns);
    this.namespace = ui.deform_ns(ns);

}

/**
 * Draw channel on screen and store the different elements in attributes.
 * 
 * @method build
 */
WscUIChannel.prototype.build = function( ) {
    
    if( this.built )
        return;
    
    var selector = this.selector;
    ns = this.namespace;
    
    // Draw.
    this.tab = this.manager.nav.add_tab( selector, ns );
    this.tabl = this.tab.find('.tab');
    this.tabc = this.tab.find('.closetab');
    this.manager.chatbook.view.append(wsc_html_channel.replacePArg('{selector}', selector).replacePArg('{ns}', ns));
    // Store
    this.window = this.manager.chatbook.view.find('#' + selector + '-window');
    this.logpanel = this.window.find('#' + selector + "-log");
    this.wrap = this.logpanel.find('ul.logwrap');
    this.userpanel = this.window.find('#' + selector + "-users");
    var chan = this;
    
    this.tabl.click(function () {
        chan.manager.toggle_channel(selector);
        return false;
    });
    
    this.tabc.click(function ( e ) {
        chan.manager.trigger( 'tab.close.clicked', {
            'ns': chan.namespace,
            'chan': chan,
            'e': e
        } );
    });
    
    var focus = true;
    
    this.window.click(
        function( e ) {
            if( focus )
                chan.manager.control.focus();
            else
                focus = true;
        }
    );
    
    this.logpanel.select(
        function( ) {
            focus = false;
        }
    );
    
    if( this.hidden ) {
        this.tab.toggleClass('hidden');
    }
    
    this.built = true;
};

/**
 * Hide the channel from view.
 * 
 * @method hide
 */
WscUIChannel.prototype.hide = function( ) {
    //console.log("hide " + this.info.selector);
    this.window.css({'display': 'none'});
    this.tab.removeClass('active');
};

/**
 * Display the channel.
 * 
 * @method show
 */
WscUIChannel.prototype.show = function( ) {
    //console.log("show  " + this.info.selector);
    this.window.css({'display': 'block'});
    this.tab.addClass('active');
    this.tab.removeClass('noise tabbed fill');
    this.resize();
};

/**
 * Remove the channel from the UI.
 * 
 * @method remove
 */
WscUIChannel.prototype.remove = function(  ) {
    this.tab.remove();
    this.window.remove();
};

/**
 * Scroll the log panel downwards.
 * 
 * @method scroll
 */
WscUIChannel.prototype.scroll = function( ) {
    this.pad();
    this.wrap.scrollTop(this.wrap.prop('scrollHeight') - this.wrap.innerHeight());
};

/**
 * Add padding to the channel log's wrapping ul.
 * This is done to make sure messages always appear at the bottom first.
 * 
 * @method pad
 */
WscUIChannel.prototype.pad = function ( ) {
    // Add padding.
    this.wrap.css({'padding-top': 0});
    wh = this.wrap.innerHeight();
    lh = this.logpanel.innerHeight() - this.logpanel.find('header').height() - 3;
    pad = lh - wh;
    
    if( pad > 0 )
        this.wrap.css({'padding-top': pad});
    else
        this.wrap.css({
            'padding-top': 0,
            'height': lh});
};

/**
 * Fix the dimensions of the log window.
 * 
 * @method resize
 */
WscUIChannel.prototype.resize = function( ) {
    this.wrap.css({'padding-top': 0});
    // Height.
    wh = this.manager.chatbook.height();
    this.window.height(wh);
    // Width.
    cw = this.window.width();
    cu = this.window.find('div.chatusers');
    // Header height
    title = this.window.find('header div.title');
    topic = this.window.find('header div.topic');
    
    // Log width.
    if( cu.css('display') != 'none')
        cw = cw - cu.outerWidth();
    
    if( title.css('display') == 'block' )
        wh = wh - title.outerHeight(true);
        
    // Log panel dimensions
    this.logpanel.css({
        height: wh + 1,
        width: cw});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    cu.css({height: this.logpanel.innerHeight() - 3});
};

/**
 * Display a log message.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
WscUIChannel.prototype.log = function( msg ) {
    data = {
        'ns': this.namespace,
        'message': msg};
    this.manager.trigger( 'log.before', data );
    this.log_item(wsc_html_logmsg.replacePArg('{message}', data.message));
};

/**
 * Send a message to the log window.
 * 
 * @method log_item
 * @param msg {String} Message to send.
 */
WscUIChannel.prototype.log_item = function( msg ) {
    var ts = new Date().toTimeString().slice(0, 8);
    // Add content.
    this.wrap.append(wsc_html_logitem.replacePArg('{ts}', ts).replacePArg('{message}', msg));
    // Scrollio
    this.scroll();
    this.noise();
};

/**
 * Send a server message to the log window.
 * 
 * @method server_message
 * @param msg {String} Server message.
 * @param [info] {String} Extra information for the message.
 */
WscUIChannel.prototype.server_message = function( msg, info ) {
    data = {
        'ns': this.namespace,
        'message': msg,
        'info': info};
    this.manager.trigger( 'server_message.before', data );
    this.log_item(wsc_html_servermsg.replacePArg('{message}', data.message).replacePArg('{info}', data.info));
};

/**
 * Set the channel header.
 * This can be the title or topic, determined by `head`.
 * 
 * @method set_header
 * @param head {String} Should be 'title' or 'topic'.
 * @param content {String} HTML to use for the header.
 */
WscUIChannel.prototype.set_header = function( head, content ) {
    headd = this.window.find("header div." + head);
    headd.replaceWith(
        wsc_html_cheader.replacePArg('{head}', head).replacePArg('{content}', content || '')
    );
    headd = this.window.find('header div.' + head);
    
    if( content ) {
        headd.css({display: 'block'});
    } else {
        this.window.find('header div.' + head).css({display: 'none'});
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
WscUIChannel.prototype.get_header = function( head ) {

    return this.window.find('header div.' + head);

};

/**
 * Set the channel user list.
 * 
 * @method set_user_list
 * @param userlist {Array} Listing of users in the channel.
 */
WscUIChannel.prototype.set_user_list = function( userlist ) {
    
    if( Object.size(userlist) == 0 )
        return;
    
    infoboxes = [];
    html = '<div class="chatusers" id="' + this.selector + '-users">';
    
    for( order in userlist ) {
        pc = userlist[order];
        html += '<div class="pc"><h3>' + pc.name + '</h3><ul>';
        for( un in pc.users ) {
            user = pc.users[un];
            conn = user.conn == 1 ? '' : '[' + user.conn + ']';
            html+= '<li><a target="_blank" id="' + user.name + '" href="http://' + user.name + '.' + this.manager.settings['domain'] + '"><em>' + user.symbol + '</em>' + user.name + '</a>' + conn + '</li>'
            if( user.hover )
                infoboxes.push(user.hover);
        }
        html+= '</ul></div>';
    }
    html+= '</div>';
    
    this.window.find('div.chatusers').replaceWith(html);
    this.userpanel = this.window.find('div.chatusers');
    this.userpanel.css({display: 'block'});
    
    for( index in infoboxes ) {
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
WscUIChannel.prototype.highlight = function( message ) {
    
    var tab = this.tab;
    ( message || this.window.find('.logmsg').last() ).addClass('highlight');
    
    if( tab.hasClass('active') )
        return;
    
    if( tab.hasClass('tabbed') )
        return;
    
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
WscUIChannel.prototype.noise = function(  ) {
    
    if( !this.tab.hasClass('active') )
        this.tab.addClass('noise');
    
};

/**
 * Display a user info hover box.
 * 
 * @method userinfo
 * @param user {Object} Information about a user.
 * @return {Object} jQuery object representing the information box.
 */
WscUIChannel.prototype.userinfo = function( user ) {

    var link = this.window.find( 'a#' + user.name );
    
    if( link.length == 0 )
        return;

    var chan = this;
    var box = null;
    
    link.hover(
        function( e ) {
            ed = { 'ns': chan.namespace, 'user': user};
            chan.manager.trigger( 'userinfo.before', ed );
            user = ed.user;
            infoli = '';
            for( index in user.info ) {
                infoli+= '<li>' + user.info[index] + '</li>';
            }
            
            chan.window.append(wsc_html_userinfo
                .replacePArg('{username}', user.name)
                .replacePArg('{avatar}', user.avatar)
                .replacePArg('{link}', user.link)
                .replacePArg('{info}', infoli));
            
            box = chan.window.find('.userinfo#'+user.name);
            chan.window.find('div.userinfo:not(\'#' + user.name + '\')').remove();
            pos = link.offset();
            box.css({ 'top': (pos.top - link.height()) + 10, 'left': (pos.left - (box.width())) - 6 });
            
            box.hover(
                function(){ box.data('hover', 1); },
                function( e ) {
                    box.data('hover', 0);
                    chan.unhover_user( box, event );
                }
            );
            
            box.data('hover', 0);
        },
        function( e ) {
            link.data('hover', 0);
            chan.unhover_user(box, event);
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
WscUIChannel.prototype.unhover_user = function( box, event ) {

    o = box.offset();
    eb = box.outerHeight(true) + o.top;
    er = box.outerWidth(true) + o.left;
    x = event.pageX; y = event.pageY;
    
    if( x > o.left
        && x < er
        && y > o.top
        && y < eb)
        return;
    
    if( x < (er + 10)
        && x > o.left
        && y > o.top
        && y < (o.top + 10) )
        return;
    
    box.remove();

};


