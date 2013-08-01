/**
 * Object for managing channel interfaces.
 * 
 * @class Chatterbox.Channel
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 * @param ns {String} The name of the channel this object will represent.
 * @param hidden {Boolean} Should the channel's tab be visible?
 * @param monitor {Boolean} Is this channel the monitor?
 */
Chatterbox.Channel = function( ui, ns, hidden, monitor ) {
    Chatterbox.BaseTab.call( this, ui, ns, hidden, monitor );
};

Chatterbox.Channel.prototype = new Chatterbox.BaseTab;
Chatterbox.Channel.prototype.constructor = Chatterbox.Channel;

/**
 * Draw the channel on screen and store the different elements in attributes.
 * 
 * @method build
 */
Chatterbox.Channel.prototype.build = function( ) {
    
    if( !this.manager )
        return;
    
    if( this.built )
        return;
    
    var selector = this.selector;
    var ns = this.namespace;
    var raw = this.raw;
    
    Chatterbox.BaseTab.prototype.build.call(
        this,
        Chatterbox.render('channel', {'selector': selector, 'ns': ns})
    );
    
    // Store
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
    
    this.setup_header('title');
    this.setup_header('topic');
    
    if( this.namespace[0] == '@' ) {
        this.build_user_list( { 100: 'Room Members' }, [ 100 ] );
    }
    
    this.built = true;
};

/**
 * Set up a header so it can be edited in the UI.
 * 
 * @method setup_header
 */
Chatterbox.Channel.prototype.setup_header = function( head ) {
    
    var chan = this;
    var h = {};
    h.m = this.el.m.find('header.' + head + ' div');
    h.e = this.el.m.find('header.' + head + ' a[href=#edit]');
    h.t = this.el.m.find('header.' + head + ' textarea');
    h.s = this.el.m.find('header.' + head + ' a[href=#save]');
    h.c = this.el.m.find('header.' + head + ' a[href=#cancel]');
    
    this.el.h[head] = h.m;
    
    h.m.parent().mouseover( function( e ) {
        if( !h.editing ) {
            h.e.css('display', 'block');
            return;
        }
        h.s.css('display', 'block');
        h.c.css('display', 'block');
    } );
    
    h.m.parent().mouseout( function( e ) {
        if( !h.editing ) {
            h.e.css('display', 'none');
            return;
        }
        h.s.css('display', 'none');
        h.c.css('display', 'none');
    } );
    
    h.e.click( function( e ) {
        h.t.text(chan.manager.client.channel(chan.namespace).info[head].content);
        
        h.t.css({
            'display': 'block',
            'width': chan.el.h[head].innerWidth() - 10,
        });
        
        chan.el.h[head].css('display', 'none');
        h.e.css('display', 'none');
        h.editing = true;
        
        chan.resize();
        
        return false;
    } );
    
    var collapse = function(  ) {
        var val = h.t.val();
        h.t.text('');
        h.t.css('display', 'none');
        chan.el.h[head].css('display', 'block');
        h.s.css('display', 'none');
        h.c.css('display', 'none');
        h.editing = false;
        
        //setTimeout( function(  ) {
            chan.resize();
        //}, 100 );
        
        return val;
    };
    
    h.s.click( function( e ) {
        var val = collapse();
        
        chan.manager.trigger( head + '.save', {
            ns: chan.raw,
            value: val
        } );
        
        h.t.text('');
        return false;
    } );
    
    h.c.click( function( e ) {
        collapse();
        return false;
    } );
    
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
    var lh = this.el.l.p.innerHeight() - this.el.h.topic.parent().outerHeight();
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
Chatterbox.Channel.prototype.resize = function( width, height ) {
    
    Chatterbox.BaseTab.prototype.resize.call( this, width, height );
    
    var heads = {
        'title': {
            m: this.el.m.find( 'header div.title' ),
            e: this.el.m.find('header.title a[href=#edit]')
        },
        'topic': {
            m: this.el.m.find( 'header div.topic' ),
            e: this.el.m.find('header.topic a[href=#edit]')
        }
    };
    
    this.el.l.w.css({'padding-top': 0});
    // Height.
    height = height || this.manager.chatbook.height();
    width = width || this.manager.chatbook.width();
    var wh = height;
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
    wh = wh - heads.title.m.parent().outerHeight();
        
    // Log panel dimensions
    this.el.l.p.css({
        height: wh - 3,
        width: cw - 10});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    this.d.u[1] = this.el.l.p.innerHeight();
    this.el.u.css({height: this.d.u[1]});
    
    // Make sure edit buttons are in the right place.
    for( var head in heads ) {
        if( !heads.hasOwnProperty( head ) )
            continue;
        
        if( heads[head].m.html().length == 0 )
            continue;
        
        var tline = (heads[head].m.outerHeight(true) - 5) * (-1);
        heads[head].e.css('top', tline);
    }
};

/**
 * Called every now and then.
 * Does stuff like clear channels of excess log messages.
 * Maybe this is something that the UI lib should handle.
 * 
 * @method loop
 */
Chatterbox.Channel.prototype.loop = function(  ) {

    var msgs = this.el.l.p.find( '.logmsg' );
    
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
    
    var chan = this;
    
    this.manager.cascade( 'log',
        function( data ) {
            chan.log_item({ 'html': Chatterbox.render('logmsg', {'message': data.message}) });
        }, {
            'ns': this.raw,
            'sns': this.namespace,
            'message': msg
        }
    );
};

/**
 * Send a message to the log window.
 * 
 * @method log_item
 * @param item {Object} Message to send.
 */
Chatterbox.Channel.prototype.log_item = function( item ) {
    var date = new Date();
    var ts = '';
    
    if( this.manager.settings.clock ) {
        ts = formatTime('{HH}:{mm}:{ss}', date);
    } else {
        ts = formatTime('{hh}:{mm}:{ss} {mr}', date);
    }
    
    var chan = this;;
    
    this.manager.cascade( 'log_item',
        function( data ) {
            if( chan.visible ) {
                chan.st = chan.el.l.w.scrollTop();
            }
            
            // Add content.
            chan.el.l.w.append(Chatterbox.render('logitem', data));
            chan.manager.trigger( 'log_item.after', {'item': chan.el.l.w.find('li').last(), 'chan': chan } );
            if( chan.visible ) {
                chan.st+= chan.el.l.w.find('li.logmsg').last().height();
                chan.el.l.w.scrollTop( chan.st );
            }
            
            // Scrollio
            chan.scroll();
            chan.noise();
        }, {
            'ns': this.namespace,
            'ts': ts,
            'ms': date.getTime(),
            'message': item.html,
            'user': (item.user || 'system' ).toLowerCase()
        }
    );
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
    var chan = this;
    
    this.manager.cascade( 'server_message',
        function( data ) {
            chan.log_item({ 'html': Chatterbox.render('servermsg', {'message': data.message, 'info': data.info}) });
        }, {
            'ns': this.namespace,
            'message': msg,
            'info': info
        }
    );
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
    var data = {
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
            ui.el.l.w.find(this).parent().remove();
            ui.resize();
            return false;
        }
    );
    
    this.scroll();
    
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
            var stamp = (new Date - (rcon.online * 1000));
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
        for( var x in conn ) {
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
 * 
 * This can be the title or topic, determined by `head`.
 * 
 * @method set_header
 * @param head {String} Should be 'title' or 'topic'.
 * @param content {Object} Content for the header
 * @param by {String} Username of the person who set the header
 * @param ts {String} Timestamp for when the header was set
 */
Chatterbox.Channel.prototype.set_header = function( head, content, by, ts ) {
    
    head = head.toLowerCase();
    var edit = this.el.m.find('header.' + head + ' a[href=#edit]');
    //var c = this.manager.client.channel( this.namespace );
    
    if( this.el.h[head].html() != '' ) {
    
        if ( content.html().length != 0 ) {
            this.server_message( head + " set by " + by );
        }
    
    }
    
    this.el.h[head].html( content.html() );
    
    var chan = this;
    
    setTimeout( function(  ) {
        if( content.text().length > 0 ) {
            chan.el.h[head].css( { display: 'block' } );
            var tline = (chan.el.h[head].outerHeight(true) - 5) * (-1);
            edit.css('top', tline);
        } else {
            chan.el.h[head].css( { display: 'none' } );
        }
            
        chan.resize();
    }, 100 );
    
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
 * Build the user list.
 * 
 * @method build_user_list
 * @param names {Object} Privilege class names
 * @param order {Array} Privilege class orders
 */
Chatterbox.Channel.prototype.build_user_list = function( names, order ) {
    
    var uld = this.el.u;
    var pc = '';
    var pcel = null;
    
    uld.html('');
    
    for(var index in order) {
        var pc = names[order[index]];
        uld.append('<div class="pc" id="' + replaceAll( pc, ' ', '-' ) + '"><h3>' + pc + '</h3><ul></ul>');
        pcel = uld.find('.pc#' + pc);
        pcel.css('display', 'none');
    }

};

/**
 * Reveal or hide the userlist depending on the number of users present.
 * 
 * @method reveal_user_list
 */
Chatterbox.Channel.prototype.reveal_user_list = function(  ) {

    var uld = this.el.u;
    var total = 0;
    var count = 0;
    var pc = null;
    
    uld.find('div.pc').each( function( i, el ) {
        pc = uld.find(this);
        count = pc.find('ul li').length;
        total+= count;
        pc.css('display', ( count == 0 ? 'none' : 'block' ));
    } );
    
    uld.css('display', ( total == 0 ? 'none' : 'block' ));
    
    var c = this;
    setTimeout( function( ) {
        c.resize();
    }, 100);

};

/**
 * Set the channel user list.
 * 
 * @method set_user_list
 * @param users {Array} Listing of users in the channel.
 */
Chatterbox.Channel.prototype.set_user_list = function( users ) {
    
    if( Object.size(users) == 0 )
        return;
    
    var uld = this.el.u;
    var user = null;
    
    for( var index in users ) {
        
        user = users[index];
        this.set_user( user, true );
    
    }
    
    this.reveal_user_list();
    
};

/**
 * Set a user in the user list.
 * 
 * @method set_user
 * @param user {Object} Information about the user
 * @param noreveal {Boolean} Do not run the reveal method
 */
Chatterbox.Channel.prototype.set_user = function( user, noreveal ) {

    var uld = this.el.u.find( 'div.pc#' + replaceAll( user.pc, ' ', '-' ) );
    var ull = uld.find('ul');
    var conn = user.conn == 1 ? '' : '[' + user.conn + ']';
    var html = '<li><a target="_blank" id="' + user.name + '" href="http://' + user.name + '.' + this.manager.settings['domain'] + '"><em>' + user.symbol + '</em>' + user.name + '</a>' + conn + '</li>';
    
    if( ull.find('a#' + user.name).length == 1 )
        return;
    
    if( ull.find('li').length == 0 ) {
        ull.append( html );
    } else {
    
        var mname = user.name.toLowerCase();
        var link = null;
        var done = false;
        
        ull.find('li a').each( function(  ) {
            
            if( done )
                return;
            
            link = ull.find(this);
            
            if( mname < link.prop('id').toLowerCase() ) {
                link.parent().before( html );
                done = true;
            }
            
        } );
        
        if( !done )
            ull.append( html );
    
    }
    
    var c = this;
    this.manager.cascade( 'user.hover', function( data ) { c.userinfo( data ); }, user.hover);
    
    noreveal = noreveal || false;
    
    if( !( noreveal ) )
        this.reveal_user_list();
        

};

/**
 * Remove a user from the user list.
 * 
 * @method remove_user
 * @param user to remove
 */
Chatterbox.Channel.prototype.remove_user = function( user, noreveal ) {

    this.el
        .u.find('div.pc ul li a#' + user)
        .parent().remove();
    
    noreveal = noreveal || false;
    
    if( !( noreveal ) )
        this.reveal_user_list();

};

/**
 * Remove a single instance of a user from the user list.
 * 
 * @method remove_one_user
 * @param user {String} Username
 */
Chatterbox.Channel.prototype.remove_one_user = function( user ) {

    this.remove_user( user, true );
    
    var member = this.manager.client.channel(this.namespace).info.members[user];
    
    if( !member ) {
        this.reveal_user_list();
        return;
    }
    
    this.set_user( member );

};

/**
 * Move a user from one privclass to another.
 * 
 * @method privchg
 * @param event {Object} recv_privchg event data
 * @param done {Function} Next method
 */
Chatterbox.Channel.prototype.privchg = function( data, done ) {

    this.remove_user( data.user, true );
    
    var member = this.manager.client.channel(this.namespace).info.members[data.user];
    
    if( !member ) {
        this.reveal_user_list();
        done( data );
        return;
    }
    
    member = Object.extend( member, {} );
    member.pc = data.pc;
    
    this.set_user( member );
    done( data );

};

/**
 * Handle the register user event.
 * 
 * @method register_user
 * @param user {String} Name of the user to register
 */
Chatterbox.Channel.prototype.register_user = function( user ) {

    this.remove_user( user, true );
    var member = this.manager.client.channel(this.namespace).info.members[user];
    
    if( !member ) {
        this.reveal_user_list();
        return;
    }
    
    this.set_user( member );

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
    
    var c = this;
    
    this.manager.cascade( 'highlight', function( data, done ) {
        var tab = c.el.t.o;
        var message = data.message;
        
        if( message !== false ) {
            ( message || c.el.l.w.find('.logmsg').last() ).addClass('highlight');
        }
        
        if( tab.hasClass('active') ) {
            if( !c.manager.viewing )
                c.manager.sound.click();
            return;
        }
        
        if( !c.hidden ) {
            c.manager.sound.click();
        }
        
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
    }, { 'c': c, 'message': message } );
    
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
    
    var menter = function( e ) {
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
    };
    
    var mleave = function( e ) {
        link.data('hover', 0);
        chan.unhover_user(box, e);
    };
    
    link.off( 'mouseenter', menter );
    link.off( 'mouseleave', mleave );
    
    link.on( 'mouseenter', menter );
    link.on( 'mouseleave', mleave );

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
 * When we have just joined a channel we want to reset certain things like
 * the topic and title. We will be receiving these from the server again soon.
 * @method pkt_join
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.Channel.prototype.pkt_join = function( event, client ) {

    if( event.e != 'ok' )
        return;
    
    this.set_header('title', (new wsc.MessageString('')), '', '' );
    this.set_header('topic', (new wsc.MessageString('')), '', '' );

};

/**
 * Handle a recv_msg packet.
 * @method pkt_recv_msg
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.Channel.prototype.pkt_recv_msg = function( event, client ) {

    var c = this;
    
    this.manager.cascade( 'chan.recv_msg', function( e, done ) {
        var u = c.manager.client.settings['username'].toLowerCase(); 
        
        if( u == e.user.toLowerCase() )
            return;
        
        var msg = e['message'].toLowerCase();
        var hlight = msg.indexOf(u) != -1;
        
        if( !hlight && e.sns[0] != '@' )
            return;
        
        if( hlight ) {
            c.highlight( );
        } else {
            c.highlight( false );
        }
        
        c.manager.trigger( 'tabbed', e );
    }, event );

};
/**
 * Handle a recv_action packet.
 * @method pkt_recv_action
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
// do the exact same thing as above
Chatterbox.Channel.prototype.pkt_recv_action = Chatterbox.Channel.prototype.pkt_recv_msg;

/**
 * Handle a property packet.
 * @method pkt_property
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
Chatterbox.Channel.prototype.pkt_property = function( event, client ) {

    var prop = event.pkt.arg.p;
    var c = client.channel( this.namespace );
    
    switch(prop) {
        case "title":
        case "topic":
            this.set_header(prop, event.value || (new wsc.MessageString( '' )), event.by, event.ts );
            break;
        case "privclasses":
            this.build_user_list( c.info.pc, c.info.pc_order.slice(0) );
            break;
        case "members":
            // this.set_members(e);
            break;
        default:
            // this.server_message("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
            break;
    }

};


