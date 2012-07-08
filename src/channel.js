/* wsc channel - photofroggy
 * Provides a JavaScript representation of a chat channel and handles the UI
 * for the channel.
 */

function WscChannel( client, ns, hidden ) {

    var selector = client.deform_ns(ns).slice(1).toLowerCase();
    this.client = client;
    this.hidden = hidden;
    
    this.info = {
        'raw': null,
        'selector': null,
        'namespace': null,
        'members': {},
        'pc': {},
        'pc_order': [],
        'title': {
            'content': '',
            'by': '',
            'ts': ''
        },
        'topic': {
            'content': '',
            'by': '',
            'ts': ''
        },
    };

    this.info.raw = client.format_ns(ns);
    this.info.selector = selector;
    this.info['namespace'] = this.info.ns = client.deform_ns(ns);
    
    //this.property = this.property.bind( this );
    scope_methods( this, WscChannel.prototype );

}

WscChannel.prototype.property = function( e ) {
    var prop = e.pkt["arg"]["p"];
    switch(prop) {
        case "title":
        case "topic":
            this.setHeader(prop, e);
            break;
        case "privclasses":
            this.setPrivclasses(e);
            break;
        case "members":
            this.setMembers(e);
            break;
        default:
            this.client.monitor("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
            break;
    }
};

// Set the channel header.
// This can be the title or topic, determined by `head`.
WscChannel.prototype.setHeader = function( head, e ) {
    this.info[head]["content"] = e.value || '';
    this.info[head]["by"] = e.by;
    this.info[head]["ts"] = e.ts;
    //console.log("set " + head);
    if(!this.info[head]["content"]) {
        /*
        this.setHeader('title', { pkt: {
                    "arg": { "by": "", "ts": "" },
                    "body": '<p>sample title</p>'
                }
            }
        );
        /**/
        /*
        this.setHeader('topic', { pkt: {
                    'arg': { 'by': '', 'ts': '' },
                    'body': '<p>sample topic</p>'
                }
            }
        );
        /**/
        /*
        return;/**/
    }
    //this.ui.setHeader();
};

// Set the channel's privclasses.
// TODO: Draw UI componentories!
WscChannel.prototype.setPrivclasses = function( e ) {
    this.info["pc"] = {};
    this.info["pc_order"] = [];
    var lines = e.pkt["body"].split('\n');
    //console.log(lines);
    for(var i in lines) {
        if( !lines[i] )
            continue;
        bits = lines[i].split(":");
        this.info["pc_order"].push(parseInt(bits[0]));
        this.info["pc"][parseInt(bits[0])] = bits[1];
    }
    this.info["pc_order"].sort(function(a,b){return b-a});
    /* 
    console.log("got privclasses");
    console.log(this.info["pc"]);
    console.log(this.info["pc_order"]);
    /* */
};

// Store each member of the this.
// TODO: GUI stuffs!
WscChannel.prototype.setMembers = function( e ) {
    pack = new WscPacket(e.pkt["body"]);
    this.info['members'] = {};
    
    while(pack["cmd"] == "member") {
        this.registerUser(pack);
        pack = new WscPacket(pack.body);
        if(pack == null)
            break;
    }
    //console.log("registered users");
    this.setUserList();
};

// Register a user with the this.
WscChannel.prototype.registerUser = function( pkt ) {
    //delete pkt['arg']['s'];
    un = pkt["param"];
    
    if(this.info["members"][un] == undefined) {
        this.info["members"][un] = pkt["arg"];
        this.info["members"][un]["username"] = un;
        this.info["members"][un]["conn"] = 1;
    } else {
        this.info["members"][un]["conn"]++;
    }
};

// Unregister a user.
WscChannel.prototype.removeUser = function( user ) {
    member = this.info['members'][user];
    
    if( member == undefined )
        return;
    
    member['conn']--;
    
    if( member['conn'] == 0 )
        delete this.info['members'][user];
};

// Joins
WscChannel.prototype.recv_join = function( e ) {
    info = new WscPacket('user ' + e.user + '\n' + e['*info']);
    this.registerUser( info );
    this.setUserList();
};

// Process someone leaving or whatever.
WscChannel.prototype.recv_part = function( e ) {
    
    this.removeUser(e.user);
    this.setUserList();
    
};
/*
// Display a message sent by a user.
WscChannel.prototype.recv_msg = function( e ) {

    tabl = this.tab.find('a');
    
    if( !this.tab.hasClass('active') )
        tabl.css({'font-weight': 'bold'});
    
    u = channel.client.settings['username'].toLowerCase();
    msg = e['message'].toLowerCase();
    p = channel.window.find('p.logmsg').last();
    
    if( msg.indexOf(u) < 0 || p.html().toLowerCase().indexOf(u) < 0 )
        return;
    
    p.addClass('highlight');
    
    if( this.tab.hasClass('active') )
        return;
    
    console.log(tabl);
    tabl
        .animate( { 'backgroundColor': '#990000' }, 500)
        .animate( { 'backgroundColor': '#EDF8FF' }, 250)
        .animate( { 'backgroundColor': '#990000' }, 250)
        .animate( { 'backgroundColor': '#EDF8FF' }, 250)
        .animate( { 'backgroundColor': '#990000' }, 250)
        .animate( { 'backgroundColor': '#EDF8FF' }, 250)
        .animate( { 'backgroundColor': '#990000' }, 250);

};
*/
// Changed privclass buddy?
WscChannel.prototype.recv_privchg = function( e ) {
    member = this.info['members'][e.user];
    
    if( !member )
        return;
    
    member['pc'] = event.pc;
    this.setUserList();
};

// Process a kick event thingy.
WscChannel.prototype.recv_kicked = function( e ) {
    if( !this.info['members'][e.user] )
        return;
    
    delete this.info['members'][e.user];
    this.setUserList();
};

// Create a screen for channel `ns` in the UI, and initialise data
// structures or some shit idk. The `selector` parameter defines the
// channel without the `chat:` or `#` style prefixes. The `ns`
// parameter is the string to use for the tab.
function wsc_channel( client, ns, hidden ) {
    
    var channel = {
        
        client: null,
        info: {
            "raw": "",
            "selector": "",
            "namespace": "",
            "members": {},
            "pc": {},
            "pc_order": [],
            "title": {
                "content": "",
                "by": "",
                "ts": ""
            },
            "topic": {
                "content": "",
                "by": "",
                "ts": ""
            }
        },
        
        window: null,
        logpanel: null,
        wrap: null,
        userpanel: null,
        tab: null,
        built: false,
        hidden: false,
        monitor: false,
        thresh: null,
        
        // Initialise! Create a new channel mofo!
        init: function( client, ns, hidden ) {
            var selector = client.deform_ns(ns).slice(1).toLowerCase();
            this.client = client;
            this.hidden = hidden;
        
            this.info["raw"] = client.format_ns(ns);
            this.info["selector"] = selector;
            this.info["namespace"] = client.deform_ns(ns);
            
            this.monitor = Object.size(this.client.channelo) == 0;
            this.thresh = 6;
            
            /*
            console.log(this.window);
            console.log(this.logpanel);
            console.log(this.wrap);
            console.log(this.tab);
            /**/
    
        },
        
        // Draw channel on screen and store the different elements in attributes.
        build: function( ) {
            this.info['members'] = {};
            
            if( this.built )
                return;
            
            var selector = this.info['selector']
            ns = this.info['namespace']
            
            // Draw.
            this.client.tabul.append(wsc_html_chattab.replacePArg('{selector}', selector).replacePArg('{ns}', ns));
            this.client.chatbook.append(wsc_html_channel.replacePArg('{selector}', selector).replacePArg('{ns}', ns));
            // Store
            this.tab = this.client.tabul.find('#' + selector + '-tab')
            this.window = this.client.chatbook.find('#' + selector + '-window')
            this.logpanel = this.client.view.find('#' + selector + "-log");
            this.wrap = this.logpanel.find('div.logwrap');
            this.userpanel = this.client.view.find('#' + selector + "-users");
            
            this.client.view.find('a[href="#' + selector + '"]').click(function () {
                channel.client.toggleChannel(selector);
                return false;
            });
            
            var focus = true;
            
            this.window.click(
                function( e ) {
                    if( focus )
                        channel.client.control.focus();
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
        },
        
        invisible: function( ) {
            channel.hidden = true;
            channel.tab.addClass('hidden');
        },
        
        // Remove a channel from the screen entirely.
        remove: function( ) {
            selector = this.info['selector'];
            this.tab.remove();
            this.window.remove();
        },
        
        // Toggle the visibility of the channel.
        hideChannel: function( ) {
            //console.log("hide " + this.info.selector);
            this.window.css({'display': 'none'});
            this.tab.removeClass('active');
        },
        
        showChannel: function( ) {
            //console.log("show  " + this.info.selector);
            this.window.css({'display': 'block'});
            this.tab.addClass('active');
            this.tab.removeClass('noise tabbed fill');
            this.resize();
        },
        
        // Toggle a class on the chat tab.
        toggleTabClass: function( cls ) {
            this.tab.toggleClass(cls);
        },
        
        // Scroll the log panel downwards.
        scroll: function( ) {
            this.pad();
            this.wrap.scrollTop(this.wrap.prop('scrollHeight') - this.wrap.innerHeight());
        },
        
        pad: function ( ) {
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
        },
        
        // Fix the dimensions of the log window.
        resize: function( ) {
            this.wrap.css({'padding-top': 0});
            // Height.
            //console.log('head height: ' + this.window.find("header").height() + '; outer: ' + this.window.find("header").outerHeight());
            wh = this.client.chatbook.height();
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
        },
        
        // Display a log message.
        log: function( msg ) {
            this.logItem(wsc_html_logmsg.replacePArg('{message}', msg));
        },
        
        // Send a message to the log window.
        logItem: function( msg ) {
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
        },
        
        // Send a server message to the log window.
        serverMessage: function( msg, info ) {
            this.logItem(wsc_html_servermsg.replacePArg('{message}', msg).replacePArg('{info}', info));
        },
        
        // Set a channel property.
        property: function( e ) {
            var prop = e.pkt["arg"]["p"];
            switch(prop) {
                case "title":
                case "topic":
                    this.setHeader(prop, e);
                    break;
                case "privclasses":
                    this.setPrivclasses(e);
                    break;
                case "members":
                    this.setMembers(e);
                    break;
                default:
                    client.monitor("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
                    break;
            }
        },
        
        // Set the channel header.
        // This can be the title or topic, determined by `head`.
        setHeader: function( head, e ) {
            this.info[head]["content"] = e.value || '';
            this.info[head]["by"] = e.by;
            this.info[head]["ts"] = e.ts;
            //console.log("set " + head);
            if(!this.info[head]["content"]) {
                /*
                this.setHeader('title', { pkt: {
                            "arg": { "by": "", "ts": "" },
                            "body": '<p>sample title</p>'
                        }
                    }
                );
                /**/
                /*
                this.setHeader('topic', { pkt: {
                            'arg': { 'by': '', 'ts': '' },
                            'body': '<p>sample topic</p>'
                        }
                    }
                );
                /**/
                /*
                return;/**/
            }
            headd = this.window.find("header div." + head);
            headd.replaceWith(
                wsc_html_cheader.replacePArg('{head}', head).replacePArg('{content}', this.info[head]['content'])
            );
            headd = this.window.find('header div.' + head);
            
            if( this.info[head]['content'] ) {
                headd.css({display: 'block'});
                /*
                console.log(this.logpanel.width() + ', ' + this.window.width());
                console.log((this.window.width() - this.logpanel.width()) - 10);
                
                headd.css({'margin-right': (this.window.width() - this.logpanel.width()) - 2});
                */
            } else
                this.window.find('header div.' + head).css({display: 'none'});
                
            this.resize();
        },
        
        // Set the channel user list.
        setUserList: function( ) {
            if( Object.size(this.info['members']) == 0 )
                return;
            
            ulist = '<div class="chatusers" id="' + this.info["selector"] + '-users">';
            
            //console.log(this.info["pc_order"])
            for(var index in this.info["pc_order"]) {
                pco = this.info["pc_order"][index];
                pc = this.info['pc'][pco];
                pcl = '';
                /* 
                console.log(pco);
                console.log("set users " + pc);
                /* */
                
                for(var un in this.info["members"]) {
                    member = this.info['members'][un];
                    if( member['pc'] != pc )
                        continue;
                    conn = member['conn'] == 1 ? '' : '[' + member['conn'] + ']';
                    s = member.symbol;
                    pcl = pcl + '<li><a target="_blank" href="http://' + un + '.'+this.client.settings['domain']+'"><em>'+s+'</em>' + un + '</a>'+ conn + '</li>';
                }
                
                if( pcl.length > 0 )
                    ulist = ulist + '<div class="pc"><h3>' + pc + '</h3><ul>' + pcl + '</ul></div>';
                
            }
            ulist = ulist + '</div>'
            
            //console.log(ulist);
            
            this.window.find('div.chatusers').replaceWith(ulist);
            this.userpanel = this.window.find('div.chatusers');
            this.userpanel.css({display: 'block'});
            
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
            }
            /* */
            //console.log(this.window.find("div.chatusers").height());
            //var h = this.window.innerWidth() - this.window.find('div.chatusers').outerWidth();
            //console.log(h);
            //this.window.find("div.chatlog").width(h - 50);
            this.resize();
            this.client.trigger('set.userlist', {
                name: 'set.userlist',
                ns: this.info['namespace']
            });
        },
        
        // Set the channel's privclasses.
        // TODO: Draw UI componentories!
        setPrivclasses: function( e ) {
            this.info["pc"] = {};
            this.info["pc_order"] = [];
            var lines = e.pkt["body"].split('\n');
            //console.log(lines);
            for(var i in lines) {
                if( !lines[i] )
                    continue;
                bits = lines[i].split(":");
                this.info["pc_order"].push(parseInt(bits[0]));
                this.info["pc"][parseInt(bits[0])] = bits[1];
            }
            this.info["pc_order"].sort(function(a,b){return b-a});
            /* 
            console.log("got privclasses");
            console.log(this.info["pc"]);
            console.log(this.info["pc_order"]);
            /* */
        },
        
        // Store each member of the this.
        // TODO: GUI stuffs!
        setMembers: function( e ) {
            pack = new WscPacket(e.pkt["body"]);
            
            while(pack["cmd"] == "member") {
                this.registerUser(pack);
                pack = new WscPacket(pack.body);
                if(pack == null)
                    break;
            }
            //console.log("registered users");
            this.setUserList();
        },
        
        // Register a user with the this.
        registerUser: function( pkt ) {
            //delete pkt['arg']['s'];
            un = pkt["param"];
            
            if(this.info["members"][un] == undefined) {
                this.info["members"][un] = pkt["arg"];
                this.info["members"][un]["username"] = un;
                this.info["members"][un]["conn"] = 1;
            } else {
                this.info["members"][un]["conn"]++;
            }
        },
        
        // Unregister a user.
        removeUser: function( user ) {
            member = this.info['members'][user];
            
            if( member == undefined )
                return;
            
            member['conn']--;
            
            if( member['conn'] == 0 )
                delete this.info['members'][user];
        },
        
        // Joins
        recv_join: function( e ) {
            info = new WscPacket('user ' + e.user + '\n' + e['*info']);
            channel.registerUser( info );
            channel.setUserList();
        },
        
        // Process someone leaving or whatever.
        recv_part: function( e ) {
            
            channel.removeUser(e.user);
            channel.setUserList();
            
        },
        
        // Display a message sent by a user.
        recv_msg: function( e ) {
        
            var tabl = this.tab;
            
            if( !this.tab.hasClass('active') )
                tabl.addClass('noise');
            
            u = channel.client.settings['username'].toLowerCase();
            msg = e['message'].toLowerCase();
            p = channel.window.find('p.logmsg').last();
            
            if( msg.indexOf(u) < 0 || p.html().toLowerCase().indexOf(u) < 0 )
                return;
            
            p.addClass('highlight');
            
            if( tabl.hasClass('active') )
                return;
            
            if( tabl.hasClass('tabbed') )
                return;
            
            var runs = 0;
            tabl.addClass('tabbed');
            
            function toggles() {
                runs++;
                tabl.toggleClass('fill');
                if( runs == 6 )
                    return;
                setTimeout( toggles, 1000 );
            }
            
            toggles();
        
        },
        
        // Changed privclass buddy?
        recv_privchg: function( e ) {
            member = channel.info['members'][e.user];
            
            if( !member )
                return;
            
            member['pc'] = event.pc;
            channel.setUserList();
        },
        
        // Process a kick event thingy.
        recv_kicked: function( e ) {
            if( !channel.info['members'][e.user] )
                return;
            
            delete channel.info['members'][e.user];
            channel.setUserList();
        }
        
    };
    
    channel.init(client, ns, hidden);
    return channel;
}