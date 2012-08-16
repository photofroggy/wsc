/**
 * wsc/ui/channel.js - photofroggy
 * Object to control the UI for the channel view.
 */

function WscUIChannel( ui, ns, hidden ) {

    var selector = ui.deform_ns(ns).slice(1).toLowerCase();
    this.manager = ui;
    this.hidden = hidden;
    this.selector = selector;
    this.raw = ui.format_ns(ns);
    this.namespace = ui.deform_ns(ns);

}

// Draw channel on screen and store the different elements in attributes.
WscUIChannel.prototype.build = function( ) {
    
    if( this.built )
        return;
    
    var selector = this.selector;
    ns = this.namespace;
    
    // Draw.
    this.tab = this.manager.nav.add_tab( selector, ns );
    this.manager.chatbook.view.append(wsc_html_channel.replacePArg('{selector}', selector).replacePArg('{ns}', ns));
    // Store
    this.window = this.manager.chatbook.view.find('#' + selector + '-window')
    this.logpanel = this.window.find('#' + selector + "-log");
    this.wrap = this.logpanel.find('ul.logwrap');
    this.userpanel = this.window.find('#' + selector + "-users");
    var chan = this;
    
    this.tab.click(function () {
        chan.manager.toggle_channel(selector);
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

// Toggle the visibility of the channel.
WscUIChannel.prototype.hide = function( ) {
    //console.log("hide " + this.info.selector);
    this.window.css({'display': 'none'});
    this.tab.removeClass('active');
};

WscUIChannel.prototype.show = function( ) {
    //console.log("show  " + this.info.selector);
    this.window.css({'display': 'block'});
    this.tab.addClass('active');
    this.tab.removeClass('noise tabbed fill');
    this.resize();
};

// Scroll the log panel downwards.
WscUIChannel.prototype.scroll = function( ) {
    this.pad();
    this.wrap.scrollTop(this.wrap.prop('scrollHeight') - this.wrap.innerHeight());
};

WscUIChannel.prototype.pad = function ( ) {
    // Add padding.
    this.wrap.css({'padding-top': 0});
    wh = this.wrap.innerHeight();
    lh = this.logpanel.innerHeight() - this.logpanel.find('header').height() - 3;
    pad = lh - wh;
    /*
    console.log(ns + ' log');
    console.log('> log wrap height ' + wh);
    console.log('> window height ' + this.logpanel.innerHeight());
    console.log('> add padding ' + pad);
    /* */
    /* */
    if( pad > 0 )
        this.wrap.css({'padding-top': pad});
    else
        this.wrap.css({
            'padding-top': 0,
            'height': lh});
    /* */
};

// Fix the dimensions of the log window.
WscUIChannel.prototype.resize = function( ) {
    this.wrap.css({'padding-top': 0});
    // Height.
    //console.log('head height: ' + this.window.find("header").height() + '; outer: ' + this.window.find("header").outerHeight());
    wh = this.manager.chatbook.height();
    //console.log(h);
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
    
    //console.log('> lheight',wh);
    
    if( title.css('display') == 'block' )
        wh = wh - title.outerHeight(true);
    //console.log('> wh - th',wh);
        
    // Log panel dimensions
    this.logpanel.css({
        height: wh + 1,
        width: cw});
    
    // Scroll again just to make sure.
    this.scroll();
    
    // User list dimensions
    cu.css({height: this.logpanel.innerHeight() - 3});
};

// Display a log message.
WscUIChannel.prototype.log = function( msg ) {
    this.log_item(wsc_html_logmsg.replacePArg('{message}', msg));
};

// Send a message to the log window.
WscUIChannel.prototype.log_item = function( msg ) {
    if( this.hidden ) {
        if( this.thresh <= 0 )
            return;
        this.thresh--;
    }
    //console.log('logging in channel ' + this.info["namespace"]);
    var ts = new Date().toTimeString().slice(0, 8);
    // Add content.
    this.wrap.append(wsc_html_logitem.replacePArg('{ts}', ts).replacePArg('{message}', msg));
    // Scrollio
    this.scroll();
};

// Send a server message to the log window.
WscUIChannel.prototype.server_message = function( msg, info ) {
    this.log_item(wsc_html_servermsg.replacePArg('{message}', msg).replacePArg('{info}', info));
};

// Set the channel header.
// This can be the title or topic, determined by `head`.
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

WscUIChannel.prototype.set_user_list = function( userlist ) {
    
    if( Object.size(userlist) == 0 )
        return;
    
    html = '<div class="chatusers" id="' + this.selector + '-users">';
    
    for( order in userlist ) {
        pc = userlist[order];
        html += '<div class="pc"><h3>' + pc.name + '</h3><ul>';
        for( un in pc.users ) {
            user = pc.users[un];
            conn = user.conn == 1 ? '' : '[' + user.conn + ']';
            html+= '<li><a target="_blank" href="http://' + user.name + '.' + this.manager.settings['domain'] + '"><em>' + user.symbol + '</em>' + user.name + '</a>' + conn + '</li>'
        }
        html+= '</ul></div>';
    }
    html+= '</div>';
    
    this.window.find('div.chatusers').replaceWith(html);
    this.userpanel = this.window.find('div.chatusers');
    this.userpanel.css({display: 'block'});
    /*
    pcs = this.userpanel.find('h3');
    if(typeof(pcs) == 'object') {
        pcs.addClass('first');
    } else {
        for( index in pcs ) {
            if( index == 0 ) {
                pcs[0].addClass('first');
                continue;
            }
            pcs[index].removeClass('first');
        }
    }*/
    this.resize();
    
};
