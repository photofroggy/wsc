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
    
    // Draw.
    this.tab = this.manager.nav.add_tab( selector, ns );
    this.tabl = this.tab.find('.tab');
    this.tabc = this.tab.find('.close');
    this.manager.chatbook.view.append(Chatterbox.render('channel', {'selector': selector, 'ns': ns}));
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
        return false;
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
Chatterbox.Channel.prototype.hide = function( ) {
    //console.log("hide " + this.info.selector);
    this.window.css({'display': 'none'});
    this.tab.removeClass('active');
    this.visible = false;
};

/**
 * Display the channel.
 * 
 * @method show
 */
Chatterbox.Channel.prototype.show = function( ) {
    //console.log("show  " + this.info.selector);
    this.visible = true;
    this.window.css({'display': 'block'});
    this.tab.addClass('active');
    this.tab.removeClass('noise chatting tabbed fill');
    var c = this;
    setTimeout( function(  ) {
        c.wrap.scrollTop(c.wrap.prop('scrollHeight') - c.wrap.innerHeight());
        c.resize();
        c.scroll();
        c.wrap.scrollTop(c.wrap.prop('scrollHeight') - c.wrap.innerHeight());
    }, 500);
};

/**
 * Remove the channel from the UI.
 * 
 * @method remove
 */
Chatterbox.Channel.prototype.remove = function(  ) {
    this.tab.remove();
    this.window.remove();
};

/**
 * Scroll the log panel downwards.
 * 
 * @method scroll
 */
Chatterbox.Channel.prototype.scroll = function( ) {
    this.pad();
    var ws = this.wrap.prop('scrollWidth') - this.wrap.innerWidth();
    var hs = this.wrap.prop('scrollHeight') - this.wrap.innerHeight();
    if( ws > 0 )
        hs += ws;
    if( hs < 0 || (hs - this.wrap.scrollTop()) > 100 )
        return;
    this.wrap.scrollTop(hs);
};

/**
 * Add padding to the channel log's wrapping ul.
 * This is done to make sure messages always appear at the bottom first.
 * 
 * @method pad
 */
Chatterbox.Channel.prototype.pad = function ( ) {
    // Add padding.
    this.wrap.css({'padding-top': 0, 'height': 'auto'});
    wh = this.wrap.innerHeight();
    lh = this.logpanel.innerHeight() - this.logpanel.find('header').height() - 3;
    pad = lh - wh;
    
    if( pad > 0 )
        this.wrap.css({'padding-top': pad});
    else
        this.wrap.css({
            'padding-top': 0,
            'height': lh});
    this.wrap.scrollTop(this.st);
};

/**
 * Fix the dimensions of the log window.
 * 
 * @method resize
 */
Chatterbox.Channel.prototype.resize = function( ) {
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
    if( cu.css('display') != 'none') {
        cu.width(1);
        userwidth = cu[0].scrollWidth + this.manager.swidth + 5;
        max = parseInt(cu.css('max-width').slice(0,-2));
        if( userwidth > max ) {
            userwidth = max;
        }
        cu.width(userwidth);
        cw = cw - cu.outerWidth();
    }
    
    if( title.css('display') == 'block' )
        wh = wh - title.outerHeight(true);
        
    // Log panel dimensions
    this.logpanel.css({
        height: wh - 3,
        width: cw - 3});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    cu.css({height: this.logpanel.innerHeight()});
};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Channel.prototype.loop = function(  ) {

    msgs = this.logpanel.find( '.logmsg' );
    
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
        this.st = this.wrap.scrollTop();
    }
    
    // Add content.
    this.wrap.append(Chatterbox.render('logitem', data));
    this.manager.trigger( 'log_item.after', {'item': this.wrap.find('li').last() } );
    if( this.visible ) {
        this.st+= this.wrap.find('li.logmsg').last().height();
        this.wrap.scrollTop( this.st );
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
    var wrap = this.wrap;

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
    this.logpanel.find('li.logmsg').remove();
    this.logpanel.find('li.loginfo').remove();
    this.wrap.height(0);
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
    var b = this.wrap.append(Chatterbox.render( 'loginfobox', data ));
    this.scroll();
    
    var ui = this;
    var box = this.wrap.find('li.' + data.ref);
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
    headd = this.window.find("header div." + head);
    headd.replaceWith(
        Chatterbox.render('header', {'head': head, 'content': content || ''})
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
Chatterbox.Channel.prototype.get_header = function( head ) {

    return this.window.find('header div.' + head);

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
    
    infoboxes = [];
    html = '';
    
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
    
    this.window.find('div.chatusers').html(html);
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
Chatterbox.Channel.prototype.highlight = function( message ) {
    
    var tab = this.tab;
    ( message || this.window.find('.logmsg').last() ).addClass('highlight');
    
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
    var msg = this.window.find('.logmsg').last();
    
    for( var i in this.manager.umuted ) {
        if( !this.manager.umuted.hasOwnProperty(i) )
            continue;
        
        if( msg.hasClass('u-' + this.manager.umuted[i]) ) {
            msg.css({'display': 'none'});
            this.scroll();
            return;
        }
    }
    
    if( !this.tab.hasClass('active') ) {
        this.tab.addClass('noise');
        if( !this.tab.hasClass('tabbed') ) {
            if( msg.find('.cevent').length == 0 ) {
                this.tab.addClass('chatting');
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

    var link = this.window.find( 'a#' + user.name );
    
    if( link.length == 0 )
        return;

    var chan = this;
    var box = null;
    
    link.hover(
        function( e ) {
            user.info = [];
            ed = { 'ns': chan.namespace, 'user': user };
            chan.manager.trigger( 'userinfo.before', ed );
            user = ed.user;
            infoli = '';
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
            pos = link.offset();
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

    o = box.offset();
    eb = box.outerHeight(true) + o.top;
    er = box.outerWidth(true) + o.left;
    x = event.pageX; y = event.pageY;
    
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
    this.wrap.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'none'});
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
    this.wrap.find('li.logmsg.u-' + user.toLowerCase()).css({'display': 'list-item'});
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
    this.wrap.find('li.logmsg.u-' + user.toLowerCase()).remove();
    this.scroll();

};


