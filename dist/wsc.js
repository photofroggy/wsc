// Taken from dAmnAIR by philo23
// dAmnAIR - http://botdom.com/wiki/DAmnAIR
// philo23 on deviantART - http://philo23.deviantart.com/
/**
 * EventEmitter
 * Simple event framework, based off of NodeJS's EventEmitter
 **/
function EventEmitter() {
    var events = {}, self = this;

    function addListener(event, listener) {
        var callbacks = events[event] || false;
        if(callbacks === false) {
            events[event] = [listener];
            return self;
        }
        events[event].push(listener);
        return self;
    }

    function removeListeners(event) {
        events[event] = [];
        return self;
    }

    function emit() {
        var args = Array.prototype.slice.call(arguments);
        var event = args.shift();
        var callbacks = events[event] || false;
        if(callbacks === false) {
            return self;
        }
        for(var i in callbacks) {
            if(callbacks.hasOwnProperty(i)) {
                callbacks[i].apply({}, args);
            }
        }
        return self;
    }

    function listeners(event) {
        return events[event] || [];
    }


    this.addListener = addListener;
    this.removeListeners = removeListeners;
    this.emit = emit;
    this.listeners = listeners;
}/* wsc html - photofroggy
 * Provides HTML5 templates for the chat UI.
 */

// Chat UI.
wsc_html_ui = '<nav class="tabs"><ul id="chattabs"></ul>\
        <ul id="tabnav">\
            <li><a href="#left" class="button">&laquo;</a></li>\
            <li><a href="#right" class="button">&raquo;</a></li>\
        </ul>\
        </nav>\
        <div class="chatbook"></div>';

wsc_html_control = '<div class="chatcontrol">\
            <form class="msg">\
                <input type="text" class="msg" />\
                <input type="submit" value="Send" class="sendmsg" />\
            </form>\
        </div>';

// Channel templates.
// Chat tab.
var wsc_html_chattab = '<li id="{selector}-tab"><a href="#{selector}">{ns}</a></li>';

// Chat screen.
var wsc_html_channel = '<div class="chatwindow" id="{selector}-window">\
                    <header>\
                        <div class="title"></div>\
                    </header>\
                    <div class="chatlog" id="{selector}-log">\
                        <header>\
                            <div class="topic"></div>\
                        </header>\
                        <div class="logwrap"></div>\
                    </div>\
                    <div class="chatusers" id="{selector}-users">\
                </div>\
            </div>';

// Channel header HTML.
var wsc_html_cheader = '<div class="{head}">{content}</div>';

// Log message template.
var wsc_html_logmsg = '<span class="message">{message}</span>';

// Simple log template.
var wsc_html_logitem = '<p class="logmsg"><span class="ts">{ts}</span> {message}</p>';

// Server message template.
var wsc_html_servermsg = '<span class="servermsg">** {message} * <em>{info}</em></span>';

// User message template.
var wsc_html_usermsg = '<strong class="user">&lt;{user}&gt;</strong> {message}';
/* wsc lib - photofroggy
 * Generic useful functions or something.
 */

// Function scope binding. Convoluted weirdness. Lol internet.
Function.prototype.bind = function( scope ) {
    var _function = this;
    
    return function () {
        return _function.apply( scope, arguments );
    };
}; 

// Some other constructor type thing?
function scope_methods( scope, methods ) {

    for( cbn in methods ) {
        scope[cbn] = methods[cbn].bind( scope );
    }

}

Function.prototype.scope_methods = function( scope, methods ) {

    for( cbn in methods ) {
        scope[cbn] = methods[cbn].bind( scope );
    }

};

// Alternate binding interface
function bind( scope, cb ) {
    return cb.bind( scope );
}

// Fetch url GET variable. 
function $_GET( q, s ) {
    s = s || window.location.search;
    var re = new RegExp('&'+q+'(?:=([^&]*))?(?=&|$)','i'); 
    s = s.replace(/^\?/,'&').match(re); 
    if(s) 
        return typeof s[1] != 'undefined' ? decodeURIComponent(s[1]) : ''; 
}

//This returns the unix time stamp as a JS Date object in the local timezone.
function UnixTimestamp(ts) {
    ret = new Date(ts * 1000)
    return ret
}

var Months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

function PosEnd( end ) {
    return end == '1' ? 'st' : ( end == '2' ? 'nd' : ( end == '3' ? 'rd' : 'th' ) );
}

// Date stamp
function DateStamp(ts) {
    ts = UnixTimestamp(ts);
    date = String(ts.getDate()); month = ts.getMonth();
    df = date[date.length-1];
    return date + PosEnd( df ) + ' of ' + Months[month] + ', ' + ts.getFullYear();
}

// Case insensitive sort function.
function caseInsensitiveSort( a, b ) {
    x = String(a).toLowerCase(); y = String(b).toLowerCase();
    return ( ( x > y ) ? 1 : ( x == y ? 0 : -1 ) );
}

function CanCreateWebsocket() {
    if(window["WebSocket"]) {
        return true
    }
    return false
}

// TODO: use fallbacks?
function CreateWebSocket(url, onclose, onmessage, onopen) {
    if(!CanCreateWebsocket()) {
        throw "This browser does not support websockets.";
    }
    ret = new WebSocket(url)
    if(onclose)
        ret.onclose = onclose;
    if(onmessage)
        ret.onmessage = onmessage;
    if(onopen)
        ret.onopen = onopen;
    return ret
}

// Escape special characters for regexes.
function EscapeRegExp( text ) {
    return text.replace((new RegExp('(\\' + [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ].join('|\\') + ')', 'g')), '\\$1');
}

// Replace all occurances of `search` with `replace`.
String.prototype.replacePArg = function( search, replace ) {
    return replaceAll(this, search, replace);
};

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

String.prototype.replaceAll = function ( search, replace ) {
    return replaceAllRaw( this, search, replace );
};

// Replace all stuff with some shit idk.
replaceAllRaw = function ( text, search, replace ) {
    while( text.indexOf( search ) > -1 ) {
        text = text.replace( search, replace );
    }
    return text;
};

replaceAll = function( text, search, replace ) {
    search = new RegExp(EscapeRegExp(search), 'g');
    return text.replace(search, replace || '');
};

// Size of an associative array, wooo!
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
/* wsc packets - plaguethenet
 * Methods to parse and create packets for the chat protocol.
 */

function WscPacket( data, separator ) {

    this.raw = data;
    /*this.parse = bind( this, this.parse );
    this.parseArgs = bind( this, this.parseArgs );
    this.setNull = bind( this, this.setNull );
    this.serialize = bind( this, this.serialize );
    this.toString = bind( this, this.toString );*/
    //scope_methods( this, WscPacket.prototype );
    this.setNull();
    this.parse(separator);
    this.raw = this.serialize();

}

WscPacket.prototype.parse = function( separator ) {

    if(!( this.raw )) {
        return null;
    }
    
    separator = separator || '=';
    var data = this.raw;
    
    try {
        // Crop the body.
        idx = data.indexOf('\n\n');
        if( idx > -1 ) {
            this.body = data.substr(idx + 2);
            data = data.substr( 0, idx );
        }
        
        cmdline = null;
        idx = data.indexOf('\n');
        sidx = data.indexOf( separator );
        
        if( idx > -1 && ( sidx == -1 || sidx > idx ) ) {
            cmdline = data.substr( 0, idx );
            data = data.substr( idx + 1 );
        } else if( sidx == -1 ) {
            cmdline = data;
            data = '';
        }
        
        if( cmdline ) {
            seg = cmdline.split(' ');
            this.cmd = seg[0];
            this.param = seg[1] ? seg[1] : null;
        }
        
        this.arg = this.parseArgs(data, separator);
        
    } catch(e) {
        alert('parser exception:' + e);
        this.setNull();
    }

};

WscPacket.prototype.parseArgs = function ( data, separator ) {    
    separator = separator || '=';
    args = {};
    lines = data.split('\n');
    for( n in lines ) {
        line = lines[n];
        si = line.search(separator);
        
        if( si == -1 )
            continue;
        
        args[line.substr( 0, si )] = line.substr( si + separator.length ) || '';
    }
    
    return args;
};

WscPacket.prototype.setNull = function(  ) {

    this.cmd = null;
    this.param = null;
    this.arg = null;
    this.body = null;

};

WscPacket.prototype.toString = function(  ) {
    return this.raw;
};

WscPacket.prototype.serialize = function(  ) {
    return wsc_packetstr( this.cmd, this.param, this.arg, this.body );
};

// Make a packet string from some given data.
function wsc_packetstr( cmd, param, args, body ) {
    var ret = '';
    if(cmd) {
        ret = cmd
        if(param) {
            ret = ret + " " + param;
        }
    }
    if(args) {
        for(var key in args) {
            ret = ret + "\n" + key + "=" + args[key];
        }
    }
    ret = ret + "\n";
    if(body) {
        ret = ret + "\n" + body;
    }
    return ret;
}

function wsc_packet_serialze(pkt) {
    return wsc_packetstr(pkt.cmd, pkt.param, pkt.arg, pkt.body);
}/* wsc channel - photofroggy
 * Provides a JavaScript representation of a chat channel and handles the UI
 * for the channel.
 */

function WscChannel( client, ns ) {

    var selector = client.deform_ns(ns).slice(1).toLowerCase();
    this.client = client;
    //this.hidden = hidden;
    
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
function wsc_channel( client, ns ) {
    
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
        
        // Initialise! Create a new channel mofo!
        init: function( client, ns, hidden ) {
            var selector = client.deform_ns(ns).slice(1).toLowerCase();
            this.client = client;
            this.hidden = hidden;
        
            this.info["raw"] = client.format_ns(ns);
            this.info["selector"] = selector;
            this.info["namespace"] = client.deform_ns(ns);
            
            /*
            console.log(this.window);
            console.log(this.logpanel);
            console.log(this.wrap);
            console.log(this.tab);
            /**/
    
        },
        
        // Draw channel on screen and store the different elements in attributes.
        build: function( ) {
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
                    pcl = pcl + '<li>' + s + '<a target="_blank" href="http://' + un + '.'+this.client.settings['domain']+'">' + un + '</a>'+ conn + '</li>';
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
            this.client.trigger('set.userlist.wsc', {
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
            this.info['members'] = {};
            
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
    
    channel.init(client, ns);
    return channel;
}/* wsc tablumps - photofroggy
 * Processes the chat tablumps for a llama-like chat server.
 * 
 * dAmn sends certain information formatted in a specific manner.
 * Links, images, thumbs, and other forms of data are formatted
 * in strings where the different attributes of these values are
 * separated by tab characters (``\\t``). The formatted string always starts
 * with an ampersand followed directly by the name of the tag that the string
 * represents. For example, links start with &a\t, the tab character acting as
 * a separator. Looking for &<tag>\t should allow us to narrow down our searches
 * without resorting to regular expressions.
 *
 * We refer to these items as "tablumps" because of the tab
 * characters being used as delimeters. The job of this class is to
 * replace tablumps with readable strings.
 */

function WscTablumps(  ) {

    this.lumps = this.defaultMap();
    // This array defines the regex for replacing the simpler tablumps.
    this.repl = [/&(\/|)(b|i|u|s|sup|sub|code|p|ul|ol|li|bcode|a|iframe|acro|abbr)\t/g, '<$1$2>'];

}

WscTablumps.prototype.registerMap = function( map ) {
    this.lumps = map;
};

WscTablumps.prototype.defaultMap = function () {
    /* Tablumps formatting rules.
     * This object can be defined as follows:
     *     lumps[tag] => [ arguments, format ]
     * ``tag`` is the tablumps-formatted tag to process.
     * ``arguments`` is the number of arguments contained in the tablump.
     * ``format`` is a function which returns the tablump as valid HTML.
     * Or it's a string template thing. Whichever.
     */
    return {
        '&link\t': [ 3, function( data ) {
            t = data[1] || '[link]';
            return '<a target="_blank" href="'+data[0]+'" title="'+t+'">'+t+'</a>';
        } ],
        '&acro\t': [ 1, '<acronym title="{0}">' ],
        '&abbr\t': [ 1, '<abbr title="{0}">'],
        '&img\t': [ 3, '<img src="{0}" alt="{1}" title="{2}" />'],
        '&iframe\t': [ 3, '<iframe src="{0}" width="{1}" height="{2}" />'],
        '&a\t': [ 2, '<a target="_blank" href="{0}" title="{1}">' ],
        '&br\t': [ 0, '<br/>' ]
    };

};

/* Parse tablumps!
 * This implementation hopefully only uses simple string operations.
 */
WscTablumps.prototype.parse = function( data, sep ) {
    if( !data )
        return '';
    
    sep = sep || '\t';
    
    for( i = 0; i < data.length; i++ ) {
    
        // All tablumps start with &!
        if( data[i] != '&' )
            continue;
        
        // We want to work on extracting the tag. First thing is split
        // the string at the current index. We don't need to parse
        // anything to the left of the index.
        primer = data.substring(0, i);
        working = data.substring(i);
        
        // Next make sure there is a tab character ending the tag.
        ti = working.indexOf('\t');
        if( ti == -1 )
            continue;
        
        // Now we can crop the tag.
        tag = working.substring(0, ti + 1);
        working = working.substring(ti + 1);
        lump = this.lumps[tag];
        
        // If we don't know how to parse the tag, leave it be!
        if( lump === undefined )
            continue;
        
        // Crop the rest of the tablump!
        cropping = this.tokens(working, lump[0], sep);
        
        // Parse the tablump.
        if( typeof(lump[1]) == 'string' )
            parsed = lump[1].format.apply(lump[1], cropping[0]);
        else
            parsed = lump[1](cropping[0]);
        
        // Glue everything back together.
        data = primer + parsed + cropping[1];
        i = i + (parsed.length - 2);
        
    }
    
    // Replace the simpler tablumps which do not have arguments.
    data = data.replace(this.repl[0], this.repl[1]);
    
    return data;
};

/* Return n tokens from any given input.
 * Tablumps contain arguments which are separated by tab characters. This
 * method is used to crop a specific number of arguments from a given
 * input.
 */
WscTablumps.prototype.tokens = function( data, limit, sep, end ) {
    sep = sep || '\t';
    end = end || '&';
    tokens = [];
    
    for( i = limit; i > 0; i-- ) {
        find = data.indexOf(sep);
        
        if( find == -1 )
            break;
        
        tokens.push( data.substring(0, find) );
        data = data.substring(find + 1);
        
        if( tokens[tokens.length - 1] == end ) {
            tokens.pop();
            break;
        }
    }
    
    return [tokens, data];
};

var dAmn_avext = [ 'gif', 'gif', 'jpg', 'png' ];

function dAmn_avatar( un, icon ) {
    icon = parseInt(icon);
    cachebuster = (icon >> 2) & 15;
    icon = icon & 3;
    ext = dAmn_avext[icon] || 'gif';
    
    if (cachebuster) {
        cachebuster = '?' + cachebuster;
    }
    else {
        cachebuster = '';
    }
    
    if( icon == 0 ) { 
        ico = 'default';
    } else {
        ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
        
        ico = '$un[0]/$un[1]/{un}'.replace(ru, function ( m, s, i ) {
            return un[i].toLowerCase();
        });
        ico = ico.replacePArg( '{un}', un.toLowerCase() );
    }
    
    return '<a target="_blank" title=":icon'+un+':" href="http://'+un+'.deviantart.com/"><img class="avatar"\
            alt=":icon'+un+':" src="http://a.deviantart.net/avatars/'+ico+'.'+ext+cachebuster+'" height="50" width="50" /></a>';
}

/**
 * dAmn tablumps map.
 *
 * This function returns a map which can be used by the tablumps parser to parse
 * dAmn's tablumps.
 */
function dAmnLumps( opts ) {
    /* Tablumps formatting rules.
     * This object can be defined as follows:
     *     lumps[tag] => [ arguments, format ]
     * ``tag`` is the tablumps-formatted tag to process.
     * ``arguments`` is the number of arguments contained in the tablump.
     * ``format`` is a function which returns the tablump as valid HTML.
     * Or it's a string template thing. Whichever.
     */
    return {
        '&avatar\t': [ 2, function( data ) { return dAmn_avatar( data[0], data[1] ); }],
        '&emote\t': [ 5, '<img alt="{0}" width="{1}" height="{2}" title="{3}" src="http://e.deviantart.com/emoticons/{4}" />' ],
        '&dev\t': [ 2, '{0}<a target="_blank" alt=":dev{1}:" href="http://{1}.deviantart.com/">{1}</a>' ],
        '&thumb\t': [ 7, function( data ) {
                id = data[0]; t = data[1]; s = data[2][0]; u = data[2].substring(1); dim = data[3].split('x'); b = data[6]; f = data[5];
                server = parseInt(data[4]); tw = w = parseInt(dim[0]); th = h = parseInt(dim[1]);
                if( w > 100 || h > 100) {
                    if( w/h > 1 ) {
                        th = (h * 100) / w;
                        tw = 100;
                    } else {
                        tw = (w * 100) / w;
                        th = 100;
                    }
                    if( tw > w || th > h ) {
                        tw = w;
                        th = h;
                    }
                }
                return '<a target="_blank" href="http://' + u + '.deviantart.com/art/' + t.replacePArg(' ', '-') + '-' + id + '"><img class="thumb" title="' + t + ' by ' + s + u + ', ' + w + 'x' + h + '" width="'+tw+'"\
                        height="'+th+'" alt=":thumb'+id+':" src="http://fc03.deviantart.net/'+f.replace(/\:/, '/')+'" /></a>';
            }
        ],
    };

}/* wsc protocol - photofroggy
 * Processes the chat protocol for a llama-like chat server.
 */

// Create a protocol object that will process all incoming packets.
// Protocol constructers are given a wsc object as input.
// Bind events to the `wsc client` object.
// Events have the namespace `<packet_event>.wsc`.
function wsc_protocol( client ) {
    
    var protocol = {
        
        client: null,
        evt_chains: [["recv", "admin"]],
        tablumps: null,
        
        // Mappings for every packet.
        maps: {
            'chatserver': ['version'],
            'dAmnServer': ['version'],
            'login': ['username', ['e'], 'data'],
            'join': ['ns', ['e'] ],
            'part': ['ns', ['e', '*r'] ],
            'property': ['ns', ['p', 'by', 'ts'], '*value' ],
            'recv_msg': [null, [['from', 'user']], '*message'],
            'recv_npmsg': [null, [['from', 'user']], 'message'],
            'recv_action': [null, ['s', ['from', 'user']], '*message'],
            'recv_join': ['user', ['s'], '*info'],
            'recv_part': ['user', ['s', 'r']],
            'recv_privchg': ['user', ['s', 'by', 'pc']],
            'recv_kicked': ['user', ['s', 'by'], '*r'],
            'recv_admin_create': [null, ['p', ['by', 'user'], ['name', 'pc'], 'privs']],
            'recv_admin_update': [null, ['p', ['by', 'user'], ['name', 'pc'], 'privs']],
            'recv_admin_rename': [null, ['p', ['by', 'user'], 'prev', ['name', 'pc']]],
            'recv_admin_move': [null, ['p', ['by', 'user'], 'prev', ['name', 'pc'], ['n', 'affected']]],
            'recv_admin_remove': [null, ['p', ['by', 'user'], ['name', 'pc'], ['n', 'affected']]],
            'recv_admin_show': [null, ['p'], 'info'],
            'recv_admin_showverbose': [null, ['p'], 'info'],
            'recv_admin_privclass': [null, ['p', 'e'], 'command'],
            'kicked': ['ns', [['by', 'user']], '*r'],
            'ping': [],
            'disconnect': [null, ['e']],
            'send': ['ns', ['e']],
            'kick': ['ns', [['u', 'user'], 'e']],
            'get': ['ns', ['p', 'e']],
            'set': ['ns', ['p', 'e']],
            'kill': ['ns', ['e']],
            'unknown': [null, null, null, null, 'packet'],
        },
        
        // Mapping callbacks!
        mapper: {
            "recv": function( args, packet, mapping ) {
                args.ns = packet.param;
                sub = new WscPacket( packet.body );
                
                if( sub.cmd == 'admin' ) {
                    ssub = new WscPacket( sub.body );
                    return protocol.mapPacket(args, ssub, mapping);
                }
                
                return protocol.mapPacket(args, sub, mapping);
            }
            
        },
        
        // Messages for every packet.
        //      pkt_name: [ msg[, monitor[, global]] ]
        // If provided, `monitor` should be true or false. By default the
        // protocol assumes false. When true, the message will be displayed in
        // the monitor channel ONLY. When false, the message will be displayed
        // in the channel the packet came from.
        // If `global` is true, the message is displayed in all open channels.
        messages: {
            'chatserver': ['<span class="servermsg">** Connected to llama {version} *</span>', false, true ],
            'dAmnServer': ['<span class="servermsg">** Connected to dAmnServer {version} *</span>', false, true ],
            'login': ['<span class="servermsg">** Login as {username}: "{e}" *</span>', false, true],
            'join': ['<span class="servermsg">** Join {ns}: "{e}" *</span>', true],
            'part': ['<span class="servermsg">** Part {ns}: "{e}" * <em>{*r}</em></span>', true],
            'property': ['<span class="servermsg">** Got {p} for {ns} *</span>', true],
            'recv_msg': ['<span><strong class="user">&lt;{user}&gt;</strong></span><span class="cmsg">{message}</span>'],
            'recv_action': ['<span class="caction user"><em>* {user}</em></span><span class="caction">{message}</span>'],
            'recv_join': ['<span class="cevent bg">** {user} has joined *</span>'],
            'recv_part': ['<span class="cevent bg">** {user} has left * <em>{r}</em></span>'],
            'recv_privchg': ['<span class="cevent">** {user} has been made a member of {pc} by {by} *</span>'],
            'recv_kicked': ['<span class="cevent">** {user} has been kicked by {by} * <em>{*r}</em></span>'],
            'recv_admin_create': ['<span class="cevent admin">** Privilege class {pc} has been created by {user} with: {privs} *</span>'],
            'recv_admin_update': ['<span class="cevent admin">** Privilege class {pc} has been updated by {user} with: {privs} *</span>'],
            'recv_admin_rename': ['<span class="cevent admin">** Privilege class {prev} has been renamed to {name} by {user} *</span>'],
            'recv_admin_move': ['<span class="cevent admin">** All members of {prev} have been moved to {pc} by {user} -- {affected} affected user(s) *</span>'],
            'recv_admin_remove': ['<span class="cevent admin">** Privilege class {pc} has been removed by {user} -- {affected} affected user(s) *</span>'],
            'recv_admin_show': null,
            'recv_admin_showverbose': null,
            'recv_admin_privclass': ['<span class="cevent admin">** Admin command "{command}" failed: {e} *</span>'],
            'kicked': ['<span class="servermsg">** You have been kicked by {user} * <em>{r}</em></span>'],
            'ping': ['<span class="servermsg">** Ping...</span>', true],
            'disconnect': ['<span class="servermsg">** You have been disconnected * <em>{e}</em></span>', false, true],
            // Stuff here is errors, yes?
            'send': ['<span class="servermsg">** Send error: <em>{e}</em></span>'],
            'kick': ['<span class="servermsg">** Could not kick {user}: <em>{e}</em></span>'],
            'get': ['<span class="servermsg">** Could not get {p} info for {ns}: <em>{e}</em></span>'],
            'set': ['<span class="servermsg">** Could not set {p}: <em>{e}</em></span>'],
            'kill': ['<span class="servermsg">** Kill error: <em>{e}</em></span>'],
            'unknown': ['<span class="servermsg">** Received unknown packet in {ns}: <em>{packet}</em></span>', true],
        },
        
        // Initialise!
        init: function( client ) {
            this.client = client;
            this.mapper['recv'] = this.map_recv;
            this.tablumps = new WscTablumps();
            
            if ( this.client.settings['tablumps'] !== null ) {
                lumpmap = this.client.settings['tablumps']();
                this.client.view.extend(lumpmap, this.tablumps.lumps);
                this.tablumps.registerMap( lumpmap );
            }
            
            //client.bind("data.wsc", this.debug_pkt);
            client.bind('chatserver.wsc', this.chatserver);
            client.bind('dAmnServer.wsc', this.chatserver);
            client.bind('login.wsc', this.login);
            client.bind('join.wsc', this.join);
            client.bind('part.wsc', this.part);
            //client.bind('kicked.wsc', this.kicked);
            client.bind('ping.wsc', this.ping);
            client.bind('property.wsc', this.property);
            client.bind('recv_join.wsc', this.recv_joinpart);
            client.bind('recv_part.wsc', this.recv_joinpart);
            client.bind('recv_msg.wsc', this.recv_msg);
            client.bind('recv_action.wsc', this.recv_msg);
            client.bind('recv_privchg.wsc', this.recv_privchg);
            client.bind('recv_kicked.wsc', this.recv_kicked);
        },
        
        // What to do with every packet.
        debug_pkt: function ( e ) {
            console.log(e.pkt.serialize());
            console.log(e);
        },
    
        // Established a WebSocket connection.
        connected: function( evt ) {
            this.client.trigger('connected.wsc', {name: 'connected', pkt: new WscPacket('connected\n\n')});
            //console.log("Connection opened");
            this.client.connected = true;
            this.client.handshake();
            this.client.attempts = 0;
        },
    
        // WebSocket connection closed!
        closed: function( evt ) {
            console.log(evt);
            this.client.trigger('closed.wsc', {name: 'closed', pkt: new WscPacket('connection closed\n\n')});
            
            if(this.client.connected) {
                this.client.monitorAll("Connection closed");
                this.client.connected = false;
            } else {
                this.client.monitorAll("Connection failed");
            }
            
            // For now we want to automatically reconnect.
            // Should probably be more intelligent about this though.
            if( this.client.attempts > 2 ) {
                this.client.monitorAll("Can't connect. Try again later.");
                this.client.attempts = 0;
                return;
            }
            
            this.client.monitorAll("Connecting in 5 seconds...");
            setTimeout(this.client.connect.bind(this.client), 5000);
        
        }, 
    
        // Received data from WebSocket connection.
        process_data: function( evt ) {
            var pack = new WscPacket(evt.data);
            
            if(pack == null)
                return;
            
            var event = this.client.event_name(pack);
            // Uncomment if you want everything ever in the console.
            //console.log(event + '.wsc');
            //console.log(JSON.stringify(pack));
            pevt = this.packetEvent(event, pack);
            this.log(pevt);
            this.client.trigger('data.wsc', pevt);
            this.client.trigger(event + '.wsc', pevt);
            //this.monitor(data);
        },
        
        // Create a wsc event based on a packet.
        packetEvent: function( name, packet ) {
            var args = { 'name': name, 'pkt': packet, 'ns': this.client.mns };
        
            if( !this.maps[name] )
                return args;
            
            mapping = this.maps[name];
            cmd = packet.cmd;
            
            if( this.mapper[cmd] )
                this.mapper[cmd](args, packet, mapping);
            else
                this.mapPacket(args, packet, mapping);
            
            return args;
            
        },
        
        // Map packet data.
        mapPacket: function( arguments, pkt, mapping ) {
            for(i in mapping) {
                if( mapping[i] == null)
                    continue;
                
                key = mapping[i];
                skey = key;
                switch(i) {
                    // e.<map[event][0]> = pkt.param
                    case "0":
                        arguments[key] = pkt['param'];
                        break;
                    // for n in map[event][1]: e.<map[event][1][n]> = pkt.arg.<map[event][1][n]>
                    case "1":
                        for( n in mapping[1] ) {
                            key = mapping[1][n];
                            if( key instanceof Array ) {
                                arguments[key[1]] = pkt['arg'][key[0]];
                                skey = key[1];
                            } else {
                                k = key[0] == '*' ? key.slice(1) : key;
                                arguments[key] = pkt['arg'][k] || '';
                                skey = key;
                            }
                        }
                        break;
                    // e.<map[event][2]> = pkt.body
                    case "2":
                        if( key instanceof Array )
                            this.mapPacket(arguments, new WscPacket(pkt['body']), key);
                        else
                            arguments[key] = pkt['body'];
                        break;
                }
                
                if( skey[0] != '*' )
                    continue;
                
                k = skey.slice(1);
                arguments[k] = this.tablumps.parse( arguments[skey] );
            }
        },
        
        // Map all recv_* packets.
        map_recv: function( arguments, pkt, mapping ) {
            protocol.mapPacket(arguments, pkt, ['ns', null, mapping]);
        },
        
        // Log a protocol message somewhere.
        log: function( event ) {
            msgm = protocol.messages[event.name];
            
            if( !msgm )
                return;
            msg = msgm[0];
            
            if( event.s == '0' )
                return;
            
            for( key in event ) {
                d = key == 'ns' ? protocol.client.deform_ns(event[key]) : event[key];
                msg = msg.replacePArg( '{'+key+'}', d);
            }
            
            if( !msgm[2] ) {
                if( !msgm[1] )
                    protocol.client.channel(event.ns).logItem(msg);
                else
                    protocol.client.channel(protocol.client.mns).logItem(msg);
            } else
                protocol.client.logItemAll(msg);
        },
        
        /* DANGER!
         * THAR BE PROTOCOL LOGIC BEYOND THIS POINT!
         * Srsly just a load of event handler thingies.
         * lolol.
         */ 
        
        // Respond to pings from the server.
        ping: function( event ) {
            //protocol.client.monitor("Ping...");
            protocol.client.pong();
        },
        
        // Respond to a llama-style handshake.
        chatserver: function ( e ) {
            //protocol.client.monitor(
            //    "Connected to " + e.pkt["cmd"] + " " + e.pkt["arg"]["server"] + " version " +e.pkt["arg"]["version"]+".");
            protocol.client.login();
        },
        
        // Process a login packet
        login: function( e ) {
            
            if(e.pkt["arg"]["e"] == "ok") {
                //protocol.client.monitor("Logged in as " + e.pkt["param"] + '.');
                // Use the username returned by the server!
                info = new WscPacket('info\n' + e.data);
                protocol.client.settings["username"] = e.pkt["param"];
                protocol.client.settings['symbol'] = info.arg.symbol;
                protocol.client.settings['userinfo'] = info.arg;
                // Autojoin!
                // TODO: multi-channel?
                if ( protocol.client.fresh )
                    protocol.client.join(client.settings["autojoin"]);
                else {
                    for( key in protocol.client.channelo ) {
                        if( protocol.client.channelo[key].info['namespace'][0] != '~' )
                            protocol.client.join(key);
                    }
                }
            } else {
                //protocol.client.monitor("Failed to log in: \"" + e.pkt["arg"]["e"] + '"');
            }
            
            if( protocol.client.fresh )
                protocol.client.fresh = false;
            
            
        },
        
        // Received a join packet.
        join: function( e ) {
            if(e.pkt["arg"]["e"] == "ok") {
                ns = protocol.client.deform_ns(e.pkt["param"]);
                //protocol.client.monitor("You have joined " + ns + '.');
                protocol.client.createChannel(ns);
                protocol.client.channel(ns).serverMessage("You have joined " + ns);
            } else {
                protocol.client.cchannel.serverMessage("Failed to join " + protocol.client.deform_ns(e.pkt["param"]), e.pkt["arg"]["e"]);
            }
        },
        
        // Received a part packet.
        part: function( e ) {
            ns = protocol.client.deform_ns(e.ns);
            c = protocol.client.channel(ns);
            
            if(e.e == "ok") {
                info = '';
                if( e.r )
                    info = '[' + e.r + ']';
                
                msg = 'You have left ' + ns;
                c.serverMessage(msg, info);
                
                if( info == '' )
                    protocol.client.removeChannel(ns);
                
                if( protocol.client.channels() == 0 ) {
                    switch( e.r ) {
                        case 'bad data':
                        case 'bad msg':
                        case 'msg too big':
                            break;
                        default:
                            if( e.r.indexOf('killed:') < 0 )
                                return;
                            break;
                    }
                    protocol.process_data( { data: 'disconnect\ne='+e.r+'\n' } );
                }
            } else {
                protocol.client.monitor('Couldn\'t leave ' + ns, e.e);
                c.serverMessage("Couldn't leave "+ns, e.e);
            }
            
        },
        
        // Process a property packet.
        property: function( e ) {
            //console.log(e.pkt["arg"]["p"]);
            chan = protocol.client.channel(e.pkt["param"]);
            
            if( !chan )
                return;
            
            chan.property(e);
        },
        
        // User join or part.
        recv_joinpart: function( e ) {
            c = protocol.client.channel(e.ns);
            if( e.name == 'recv_join')
                c.recv_join(e);
            else
                c.recv_part(e);
        },
        
        // Display a message received from a channel.
        recv_msg: function( e ) {
            protocol.client.channel(e.ns).recv_msg(e);
        },
        
        // Someone was promoted or demoted.
        recv_privchg: function( e ) {
            protocol.client.channel(e.ns).recv_privchg(e);
        },
        
        // Some sucka got kicked foo.
        recv_kicked: function( e ) {
            protocol.client.channel(e.ns).recv_kicked(e);
        }
        
    };
    
    protocol.init(client);
    return protocol;

}/* wsc commands - photofroggy
 * Commands for the user to use.
 */

/**
 * @constructor wsc_extdefault
 * Create our extension and return it.
 * @param [Object] client A reference to a {wsc_client.client wsc client object}.
 * @return [Object] An initialised {wsc_extdefault.extension default extension object}.
 */
function wsc_extdefault( client ) {

    /**
     * @object extension
     * The default extension implements the client's default commands.
     */
    var extension = {
    
        /**
         * @constructor init
         * Initialises the extension.
         * 
         * Here, the extension stores a reference to the client and binds the
         * extension's command handlers to their respective command events.
         * 
         * @param [Object] client A reference to a {wsc_client.client wsc client object}.
         */
        init: function( client ) {
            this.client = client;
            // Commands.
            this.client.bind('cmd.set.wsc', this.setter.bind(extension) );
            this.client.bind('cmd.connect.wsc', this.connect.bind(extension) );
            this.client.bind('cmd.join.wsc', this.join.bind(extension) );
            this.client.bind('cmd.part.wsc', this.part.bind(extension) );
            this.client.bind('cmd.title.wsc', this.title.bind(extension) );
            this.client.bind('cmd.promote.wsc', this.promote.bind(extension) );
            this.client.bind('cmd.me.wsc', this.action.bind(extension) );
            this.client.bind('cmd.kick.wsc', this.kick.bind(extension) );
            this.client.bind('cmd.raw.wsc', this.raw.bind(extension) );
            this.client.bind('cmd.say.wsc', this.say.bind(extension) );
            this.client.bind('cmd.npmsg.wsc', this.npmsg.bind(extension) );
            this.client.bind('cmd.clear.wsc', this.clear.bind(extension) );
            // userlistings
            this.client.bind('set.userlist.wsc', this.setUsers.bind(extension) );
        },
        
        /**
         * @function setter
         * @cmd set set configuration options
         * This command allows the user to change the settings for the client through
         * the input box.
         */
        setter: function( e ) {
            data = e.args.split(' ');
            setting = data.shift().toLowerCase();
            data = data.join(' ');
            if( data.length == 0 ) {
                this.client.cchannel.serverMessage('Could not set ' + setting, 'No data supplied');
                return;
            }
            
            if( !( setting in this.client.settings ) ) {
                this.client.cchannel.serverMessage('Unknown setting "' + setting + '"');
                return;
            }
            
            this.client.settings[setting] = data;
            this.client.cchannel.serverMessage('Changed ' + setting + ' setting', 'value: ' + data);
            this.client.control.setLabel();
            
        },
        
        /**
         * @function connect
         * This command allows the user to force the client to connect to the server.
         */
        connect: function( e ) {
            this.client.connect();
        },
        
        // Join a channel
        join: function( e ) {
            chans = e.args.split(' ');
            chans = chans.toString() == '' ? [] : chans;
            
            if( e.ns != e.target )
                chans.unshift(e.target);
            
            if( chans.toString() == '' )
                return;
            
            for( index in chans )
                extension.client.join(chans[index]);
        },
        
        // Leave a channel
        part: function( e ) {
            chans = e.args.split(' ');
            if( e.ns != e.target )
                chans.unshift(e.target);
            //console.log(chans);
            //console.log(chans.length + ', ' + (chans.toString() == ''));
            if( chans.toString() == '' ) {
                extension.client.part(e.ns);
                return;
            }
            for( index in chans )
                extension.client.part(chans[index]);
        },
        
        // Set the title
        title: function( e ) {
            extension.client.title(e.target, e.args);
        },
        
        // Promote user
        promote: function( e ) {
            bits = e.args.split(' ');
            extension.client.promote(e.target, bits[0], bits[1]);
        },
        
        // Send a /me action thingy.
        action: function( e ) {
            extension.client.action(e.target, e.args);
        },
        
        // Send a raw packet.
        raw: function( e ) {
            extension.client.send( e.args.replace(/\\n/gm, "\n") );
        },
        
        // Kick someone.
        kick: function( e ) {
            d = e.args.split(' ');
            u = d.shift();
            r = d.length > 0 ? d.join(' ') : null;
            extension.client.kick( e.target, u, r );
        },
        
        // Say something.
        say: function( e ) {
            extension.client.say( e.target, e.args );
        },
        
        // Say something without emotes and shit. Zomg.
        npmsg: function( e ) {
            extension.client.npmsg( e.target, e.args );
        },
        
        // Clear the channel's log.
        clear: function( e ) {
            this.client.cchannel.logpanel.find('p.logmsg').remove();
            this.client.cchannel.resize();
        },
        
        // Set users, right?
        setUsers: function( e ) {
            var chan = extension.client.channel(e.ns);
            users = chan.userpanel.find('li a');
            users.each(
                function( index, item ) {
                    var usertag = chan.userpanel.find(item);
                    var username = usertag.html();
                    var info = chan.info['members'][username];
                    var infobox = null;
                    usertag.data('hover', 0);
                    
                    function hovering( elem, x, y, flag ) {
                        o = elem.offset();
                        eb = elem.outerHeight(true) + o.top;
                        er = elem.outerWidth(true) + o.left;
                        
                        if( x >= o.left
                            && x <= er
                            && y >= o.top
                            && y <= eb)
                            return true;
                            
                        if( flag === true ) {
                            if( x <= (er + 30)
                                && x >= o.left
                                && y >= o.top
                                && y <= (o.top + 30) )
                                return true;
                        }
                        
                        return false;
                    }
                    
                    function rembox( e ) {
                        if(hovering( infobox, e.pageX, e.pageY, true ))
                            return;
                        infobox.remove();
                    }
                    
                    ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
                    
                    function repl( match, s, i ) {
                        return info.username[i].toLowerCase();
                    }
                    
                    usertag.hover(
                        function( e ) {
                            chan.window.find(this).data('hover', 1);
                            rn = info.realname ? '<li>'+info.realname+'</li>' : '';
                            tn = info.typename ? '<li>'+info.typename+'</li>' : '';
                            pane = '<div class="userinfo" id="'+info.username+'">\
                                <div class="avatar">\
                                    '+dAmn_avatar( info.username, info.usericon )+'\
                                </div><div class="info">\
                                <strong>\
                                '+info.symbol+'<a target="_blank" href="http://'+info.username+'.'+extension.client.settings['domain']+'/">'+info.username+'</a>\
                                </strong>\
                                <ul>\
                                    '+rn+tn+'\
                                </ul></div>\
                            </div>';
                            chan.window.append(pane);
                            infobox = chan.window.find('.userinfo#'+info.username);
                            pos = usertag.offset();
                            infobox.css({ 'top': (pos.top - usertag.height()) + 10, 'left': (pos.left - (infobox.width())) - 15 });
                            infobox.hover(function(){
                                chan.window.find(this).data('hover', 1);
                            }, rembox);
                            infobox.data('hover', 0);
                            box = chan.window.find('div.userinfo:not(\'#'+info.username+'\')');
                            box.remove();
                        },
                        function( e ) {
                            chan.window.find(this).data('hover', 0);
                            rembox(e);
                        }
                    );
                }
            );
        },
    };
    
    extension.init(client);
    return extension;

}
/* wsc client - photofroggy
 * wsc's chat client. Manages everything pretty much.
 */

/**
 * @constructor wsc_client 
 * @author photofroggy
 * @note To create a client, use the {wsc wsc jQuery method}.
 * 
 * wsc_client is a constructor for the {wsc_client.client wsc client} object.
 * 
 * @param [jQuery] element Main view for the client to be drawn in.
 * @param options
 *  Here the client's settings can be defined, and we store them in ``client.settings``. The settings available are as follows:
 *  [String] domain The domain of the website hosting the client. Used for constructing URLs.
 *  [String] server Address for the WebSocket server to connect to.
 *  [String] agent The client's user-agent. This is sent in the handshake when connecting to the chat server.
 *  [String] username Name of the user using the client.
 *  [String] symbol User symbol for the user. This is automatically updated when the client logs in to the chat server.
 *  [String] pk The user's chat token. Required for logging in to the chat server.
 *  [Array] monitor Configuration for the monitor channel. ``[(String) shorthand_name, (Bool) hidden]``.
 *  [String] welcome Define the message displayed when the client is loaded.
 *  [String] autojoin Define the channel to join when the client logs in successfully.
 *  [Function] protocol A function which returns a protocol parser. By default, {wsc_protocol} is used.
 *  [Array] extend Array of extensions. By default, this only includes {wsc_extdefault}. Refer to {wsc_extbase} for more information.
 *  [String] client Client string to send in the handshake. Defaults to ``chatclient``.
 *  [Function] tablumps Tablumps parser constructor. By default, {wsc_tablumps} is used.
 * @param [Boolean] mozilla Is the browser being used made by mozilla?
 * @return [Object] A {wsc_client.client wsc client} object.
 */
function wsc_client( view, options, mozilla ) {
    
    /**
     * @object client
     * @author photofroggy
     * 
     * @note To create a client, use the {wsc wsc jQuery method}.
     * 
     * This object acts as a client for dAmn-like chat servers.
     * When initialising the object, you can provide different configuration
     * options using the ``options`` parameter.
     */
    var client = {
    
        view: null,
        mozilla: false,
        control: null,
        tabul: null,
        chatbook: null,
        connected: false,
        conn: null,
        fresh: true,
        evt_chains: [["recv", "admin"]],
        events: null,
        attempts: 0,
        settings: {
            "domain": "website.com",
            "server": "ws://website.com/wsendpoint",
            "agent": "wsc 0.1a",
            "symbol": "",
            "username": "",
            "userinfo": {},
            "pk": "",
            // Monitor: `ns`
            "monitor": ['~Monitor', true],
            "welcome": "Welcome to the wsc web client!",
            "autojoin": "chat:channel",
            "protocol": wsc_protocol,
            "extend": [wsc_extdefault],
            "control": wsc_control,
            "stype": 'llama',
            "client": 'chatclient',
            "clientver": '0.3',
            "tablumps": null,
            "avatarfile": '$un[0]/$un[1]/{un}',
            "defaultavatar": 'default.gif',
            "avatarfolder": '/avatars/',
            "emotefolder": '/emoticons/',
            "thumbfolder": '/thumbs/',
            "theme": 'wsct_default',
        },
        // Protocol object.
        protocol: null,
        // Object containing all channel objects.
        channelo: {},
        // Current channel object.
        cchannel: null,
        // Known command names.
        cmds: [],
        
        /**
         * @constructor init
         * @author photofroggy
         * 
         * I guess this is what I would consider the "actual" constructor.
         * 
         * @param [jQuery] element The client's main view.
         * @param [Boolean] mozilla Are we running firefox?
         */
        init: function( view, options, mozilla ) {
            
            view.extend( this.settings, options );
            view.append('<div class="wsc '+this.settings['theme']+'"></div>');
            // Set up variables.
            this.attempts = 0;
            this.view = view.find('.wsc');
            this.mozilla = mozilla;
            this.connected = false;
            this.conn = null;
            this.events = new EventEmitter();
            this.mns = this.format_ns(this.settings['monitor'][0]);
            this.lun = this.settings["username"].toLowerCase();
            this.channelo = {};
            this.protocol = this.settings["protocol"]( this );
            //this.addListener('closed'
            
            // Debug!
            //console.log(this);
            
            // Load in extensions
            this.cmds = [];
            for(var index in this.settings["extend"]) {
                this.settings["extend"][index](this);
            }
            
            // Prepare the UI.
            this.buildUI();
            
            // Welcome!
            this.monitor(this.settings["welcome"]);
            
        },
        
        /**
         * @function registerExtension
         * Use this function to register an extension with the client after
         * creating the client. This method should be called through jQuery
         * as follows:
         * 
         * @example registering an extension
         *  $('.container').wsc( 'registerExtension', my_constructor );
         *  
         *  // The above uses an example 'my_constructor', which can be as simple
         *  // as the following.
         *  function my_constructor( client ) {
         *      client.addListener( 'cmd.slap.wsc',
         *          function( e ) {
         *              // Slap your victim or something.
         *              client.action( e.target, 'slaps ' + ( e.args || e.user ) );
         *          }
         *      );
         *  }
         * 
         * @param [Function] constructor Extension constructor.
         */
        registerExtension: function( constructor ) {
            if( container === undefined )
                return;
            client.settings['extend'].push( constructor );
            constructor( client );
        },
        
        /**
         * @function jq_registerExtension
         * jQuery interface for registerExtension.
         * 
         * @param [jQuery] view jQuery view the method was called through.
         * @param [Function] constructor Extension constructor.
         */
        jq_registerExtension: function( view, constructor ) {
            client.registerExtension(constructor);
        },
        
        /**
         * @function bind
         * Bind an event handler to a specific wsc event. Doing this will make
         * the client call the handler every time the given event is triggered.
         * @param [String] event Name of the event to bind the handler to.
         * @param [Function] handler Event handling function.
         */
        bind: function( event, handler ) {
            this.events.addListener(event, function( e ) { handler( e ); });
            jqi = event.indexOf('.wsc');
            
            if( event.indexOf('cmd.') != 0 || jqi == -1 || jqi == 4 )
                return;
            
            cmd = event.slice(4, jqi).toLowerCase();
            this.cmds.push(cmd);
        },
        
        /**
         * @function jq_bind
         * jQuery interface for the bind method.
         * @param [jQuery] view Element the method was called on.
         * @param [Object] opt Method arguments.
         */
        jq_bind: function( view, opt ) {
            client.bind( opt['event'], opt['handler'] );
        },
        
        /**
         * @function removeListeners
         * Removes all event listeners from the client.
         */
        removeListeners: function( ) {
            this.events.removeListeners();
        },
        
        /**
         * @function trigger
         * Trigger an event in the client.
         * @param [String] event Name of the event to trigger.
         * @param [Object] data Event data.
         */
        trigger: function( event, data ) {
            //console.log("emitting "+ event);
            this.events.emit(event, data, client);
        },
        
        /**
         * @function jq_trigger
         * jQuery interface for the trigger method.
         */
        jq_trigger: function( view, opts ) {
            client.trigger( opts['event'], opts['data'] );
        },
        
        /**
         * @function channel
         * 
         * @overload
         *  Get the channel object associated with the given namespace.
         *  @param [String] namespace
         *  
         * @overload
         *  Set the channel object associated with the given namespace.
         *  @param [String] namespace
         *  @param [Object] chan A {wsc_channel.channel wsc channel object} representing the channel specified.
         */
        channel: function( namespace, chan ) {
            namespace = this.deform_ns(namespace).slice(1).toLowerCase();
            /* 
            console.log(namespace);
            console.log(this.channelo);
            /* */
            if( !this.channelo[namespace] && chan )
                this.channelo[namespace] = chan;
            
            return this.channelo[namespace];
        },
        
        /**
         * @function channels
         * 
         * Determine how many channels the client has open. Hidden channels are
         * not included in this, and we don't include the first channel because
         * there should always be at least one non-hidden channel present in the
         * client.
         * 
         * @return [Integer] Number of channels open in the client.
         */
        channels: function( ) {
            chans = -1;
            for(ns in client.channelo) {
                if( client.channelo[ns].hidden )
                    continue;
                chans++;
            }
            return chans;
        },
        
        /**
         * @function connect
         * 
         * This function can be used to open a connection to the chat server. If
         * we are already connected, this function does nothing.
         * 
         * @todo Create a fallback to use if WebSockets are not available. Like,
         *  really now.
         */
        connect: function( ) {
            if( client.connected )
                return;
            
            this.attempts++;
            
            // Start connecting!
            if(CanCreateWebsocket()) {
                client.conn = client.createChatSocket();
                //console.log("connecting");
                client.trigger('start.wsc', new WscPacket('client connecting\ne=ok\n\n'));
            } else {
                client.monitor("Your browser does not support WebSockets. Sorry.");
                client.trigger('start.wsc', new WscPacket('client connecting\ne=no websockets available\n\n'));
            }
        },
        
        // We need this, dawg.
        jq_connect: function( ) {
            client.connect();
        },
        
        /**
         * @function createChatSocket
         * Does what it says on the tin.
         * @return [Object] WebSocket connection.
         */
        createChatSocket: function( ) {
            
            var client = this;
            return CreateWebSocket(
                this.settings["server"],
                // WebSocket connection closed!
                function( evt ) { client.protocol.closed( evt ); },
                // Received a message from the server! Process!
                function( evt ) { client.protocol.process_data( evt ); },
                // Connection opened.
                function( evt ) { client.protocol.connected( evt ); }
            );
            
        },
        
        // Build the initial UI.
        buildUI: function( ) {
            this.view.append( wsc_html_ui );
            this.control = this.settings['control']( this );
            this.tabul = this.view.find('#chattabs');
            this.chatbook = this.view.find('div.chatbook');
            // The monitor channel is essentially our console for the chat.
            hide = this.settings.monitor[1];
            this.createChannel(this.mns, hide);
            this.control.setInput();
            this.control.focus();
            /*
            this.cchannel.setHeader('title', { pkt: {
                        "arg": { "by": "", "ts": "" },
                        "body": '<p>sample title</p>'
                    }
                }
            );
            /**/
            /*
            this.cchannel.setHeader('topic', { pkt: {
                        'arg': { 'by': '', 'ts': '' },
                        'body': '<p>sample topic</p>'
                    }
                }
            );
            /**/
            // For testing purposes only.
            // this.createChannel("llama2", "~Llama2", "server:llama2");
            this.resizeUI();
        },
        
        resizeUI: function( ) {
            // Resize control panel.
            client.control.resize();
            
            
            // Main view dimensions.
            //console.log('>> pH:',client.view.parent().height());
            client.view.height( client.view.parent().height() );
            client.view.width( '100%' );
            
            h = (client.view.parent().height() - client.tabul.outerHeight(true) - client.control.height());
            //console.log('>> rUI h parts:',client.view.parent().height(),client.tabul.outerHeight(true),client.control.height());
            //console.log('>> rUI h:', h);
            // Chatbook dimensions.
            client.chatbook.height(h);
            
            // Channel dimensions.
            for(select in client.channelo) {
                chan = client.channel(select);
                chan.resize();
            }
            //client.control.resize();
        },
        
        // Called by setInterval every two minutes. Approximately. Maybe. Who cares?
        // It is up to whatever implements the client to set up the loop by
        // calling setInterval(client.loop, 120000); or whatever variations.
        // Wsc's jQuery plugin does this automagically.
        loop: function( ) {
            client.doLoop();
        },
        
        // Ok so I lied, this is the stuff that actually runs on the loop thingy.
        // This is to avoid thingies like scope fucking up. Seriously. Wtf js?
        doLoop: function( ) {
            for( key in this.channelo ) {
                c = this.channelo[key];
                msgs = c.logpanel.find( '.logmsg' );
                
                if( msgs.length < 100 )
                    continue;
                
                while( msgs.length > 100 ) {
                    msgs.slice(0, 10).remove();
                    msgs = c.logpanel.find( '.logmsg' );
                }
                
                c.resize();
            }
        },
        
        // Create a screen for channel `ns` in the UI, and initialise data
        // structures or some shit idk. The `selector` parameter defines the
        // channel without the `chat:` or `#` style prefixes. The `ns`
        // parameter is the string to use for the tab.
        createChannel: function( ns, toggle ) {
            chan = this.channel(ns, wsc_channel(this, ns));
            chan.build();
            this.toggleChannel(ns);
            if( toggle )
                chan.invisible();
        },
        
        // Remove a channel from the client and the GUI.
        // We do this when we leave a channel for any reason.
        // Note: last channel is never removed and when removing a channel
        // we switch to the last channel in the list before doing so.
        removeChannel: function( ns ) {
            if( this.channels() == 0 ) 
                return;
            
            chan = this.channel(ns);
            chan.remove();
            delete this.channelo[chan.info["selector"]];
            
            var select = '';
            for (tmp in this.channelo) {
                if (this.channelo.hasOwnProperty(tmp) && tmp != chan.info['selector'])
                    select = tmp;
            }
            
            this.toggleChannel(select);
            this.channel(select).resize();
        },
        
        // Select which channel is currently being viewed.
        toggleChannel: function( ns ) {
            //console.log("out: "+previous+"; in: "+ns);
            chan = this.channel(ns);
            
            if( !chan )
                return;
            
            if(this.cchannel) {
                if(this.cchannel == chan)
                    return;
                // Hide previous channel, if any.
                //console.log("prevshift ", previous);
                this.cchannel.hideChannel();
                this.control.cacheInput();
            }
            
            // Show clicked channel.
            chan.showChannel();
            this.control.focus();
            this.cchannel = chan;
            this.control.setLabel();
            if( this.settings['monitor'][1] ) {
                mt = this.tabul.find('#' + this.channel(this.mns).info['selector'] + '-tab')
                mt.addClass(this.settings['monitor'][1]);
            }
            this.resizeUI();
        },
    
        // Write a message to the UI.
        // `ns` is the name of the channel. No `chat:` or `#` style prefix.
        // `msg` is the raw string to be desplayed. Provide messages fully
        // formatted in HTML kthxbai.
        log: function( ns, msg ) {
            var chan = this.channel(ns);
            if( !chan )
                return;
            chan.log(msg);
        },
        
        // Send a log message to all channels.
        logAll: function( msg ) {
            for( ns in this.channelo )
                this.channlo[ns].log(msg);
        },
        
        // Send a log item to all channels.
        logItemAll: function( msg ) {
            for( ns in this.channelo )
                this.channelo[ns].logItem(msg);
        },
        
        monitorAll: function( msg, info ) {
            for( ns in this.channelo )
                this.channelo[ns].serverMessage(msg, info);
        },
        
        // Write a server message to the UI.
        serverMessage: function( ns, msg, info ) {
            var chan = this.channel(ns);
            if( !chan )
                return;
            chan.serverMessage(msg, info);
        },
        
        // System message displayed in the monitor window.
        monitor: function( msg, info ) {
            this.serverMessage(this.mns, msg, info);
        },
        
        // Deform a channel namespace.
        deform_ns: function( ns ) {
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
            
            if(ns[0] != '#' && ns[0] != '@' && ns[0] != '~')
                return '#' + ns;
            
            return ns;
        },
        
        // Format a channel namespace.
        format_ns: function( ns ) {
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
        },
        
        // Get the event name of a given packet.
        event_name: function( pkt ) {
            
            var name = pkt["cmd"];
            var cmds = null;
            for(var index in this.evt_chains) {
                
                cmds = this.evt_chains[index];
                
                if(cmds[0] != name)
                    continue;
                
                var sub = new WscPacket(pkt["body"]);
                name = name + '_' + sub["cmd"];
                
                if(cmds.length > 1 && sub["param"] != undefined) {
                    if(cmds[1] == sub["cmd"])
                        return name + '_' + sub["param"];
                }
            
            }
            
            return name;
        },
        
        // Send a message to the server.
        // Uses a raw packet string.
        send: function( msg ) {
            if(this.connected) {
                return this.conn.send(msg);
            }
            return -1;
        },
        
        // Protocol methods. Woop!
        
        // Send the chat user agent.
        handshake: function( ) {
            this.send(wsc_packetstr(this.settings['client'], this.settings["clientver"], {
                "agent": this.settings["agent"]
            }));
        },
        
        // Send a pong!
        pong: function( ) {
            this.send(wsc_packetstr("pong"));
        },
        
        // Send login details.
        login: function( ) {
            pkt = 'login ' + this.settings["username"] + '\npk=' + this.settings["pk"] + '\n';
            this.send( pkt );
        },
        
        // Join a channel.
        join: function( ns ) {
            this.send(wsc_packetstr("join", this.format_ns(ns)));
        },
        
        // Part a channel.
        part: function( ns ) {
            this.send(wsc_packetstr('part', this.format_ns(ns)));
        },
        
        // Promote a user.
        promote: function( ns, user, pc ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('promote', user, {}, ( !pc ? '' : pc ))));
        },
        
        // Send a message to a channel.
        say: function( ns, msg ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('msg', 'main', {}, msg)
            ));
        },
        
        // Send a non-parsed message to a channel.
        npmsg: function( ns, msg ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('npmsg', 'main', {}, msg)
            ));
        },
        
        // Send an action message to a channel.
        action: function( ns, action ) {
            this.send(wsc_packetstr('send', this.format_ns(ns), {},
                wsc_packetstr('action', 'main', {}, action)
            ));
        },
        
        // Set the title.
        title: function( ns, title ) {
            this.send(wsc_packetstr('set', this.format_ns(ns), {
                'p': 'title'}, title));
        },
        
        // Kick some mofo
        kick: function( ns, user, r ) {
            this.send(wsc_packetstr('kick', this.format_ns(ns), {
                'u': user }, r ? r : null));
        },
    
    };
    
    client.init(view, options, mozilla);
    return client;

}
/* wsc control - photofroggy
 * Input panel for the wsc web client. Manages the UI and controlling the
 * client via commands.
 */


// Object representing the input control panel for the user interface.
// Provides methods for interacting with the input panel, and handles user
// input via the input panel.
function wsc_control( client ) {
    
    var control = {
    
        client: null,
        panel: null,
        form: null,
        // Input history. Aww yeah.
        history: {},
        tab: {
            hit: false,
            cache: '',
            matched: [],
            index: -1,
            type: 0,
            prefix: ['', '/', ''],
        },
        
        init: function( client ) {
            this.client = client;
            this.draw();
            this.panel = this.client.view.find('div.chatcontrol');
            this.form = this.panel.find('form.msg');
            this.input = this.form.find('input.msg');
        },
        
        // Draw the panel.
        draw: function( ) {
            this.client.view.append( wsc_html_control );
        },
        
        // Steal the lime light. Brings the cursor to the input panel.
        focus: function( ) {
            control.input.focus();
        },
        
        // Returns `<symbol><username>`;
        userLine: function( ) {
            return this.client.settings["symbol"] + this.client.settings["username"];
        },
        
        // Resize the control panel.
        resize: function( ) {
            this.panel.css({
                width: '100%'});
            // Form dimensionals.
            this.form.css({'width': '100%'});
            this.input.css({'width': this.client.view.width() - 80});
        },
        
        height: function( ) {
            return this.panel.height() + 17;
        },
        
        // Edit the input bar's label.
        setLabel: function( ) {
            ns = this.client.cchannel.info['namespace'];
            //this.panel.find('p').replaceWith(
            //    '<p>' + this.userLine() + ' - ' + ns + '</p>'
            //);
            this.untab();
            h = this.getHistory();
            this.input.val( h.index == -1 ? h.tmp : h.list[h.index] );
            if( h.index == -1 )
                h.tmp = '';
        },
        
        // Save current input.
        cacheInput: function( ) {
            h = this.getHistory();
            
            if( h.index > -1 )
                return;
            
            h.tmp = this.input.val();
        },
        
        // Set up the control for the UI input.
        setInput: function( ) {
            if( this.client.mozilla )
                this.input.keypress( this.keypress );
            else
                this.input.keydown( this.keypress );
            
            this.form.submit( this.submit );
        },
        
        // Create history for a channel.
        getHistory: function( ) {
            ns = this.client.cchannel.info['namespace'];
            
            if( !this.history[ns] )
                this.history[ns] = { index: -1, list: [], tmp: '' };
            
            return this.history[ns];
        },
        
        // Append to the history.
        appendHistory: function( data ) {
            if( !data )
                return;
            h = this.getHistory();
            h.list.unshift(data);
            h.index = -1;
            if( h.list.length > 100 )
                h.list.pop();
        },
        
        // Scroll history or something.
        scrollHistory: function( up ) {
            history = this.getHistory();
            data = this.input.val();
            
            if( history.index == -1 )
                if( data )
                    history.tmp = data;
            else
                history.list[history.index] = data;
            
            if( up ) {
                if( history.list.length > 0 && history.index < (history.list.length - 1) )
                    history.index++;
            } else {
                if( history.index > -1)
                    history.index--;
            }
            
            this.setLabel();
        },
        
        // Handle a single keypress thingy.
        keypress: function( event ) {
            key = event.which || event.keypress;
            ut = control.tab.hit;
            bubble = false;
            
            switch( key ) {
                case 13: // Enter
                    control.submit(event);
                    break;
                case 38: // Up
                    control.scrollHistory(true);
                    break;
                case 40: // Down
                    control.scrollHistory(false);
                    break;
                case 9: // Tab
                    control.tabItem( event );
                    ut = false;
                    break;
                default:
                    bubble = true;
                    break;
            }
            
            if( ut )
                control.untab( event );
                
            return bubble;
        },
        
        // Handle submit events woop.
        submit: function( event ) {
            msg = control.input.val();
            control.appendHistory(msg);
            control.input.val('');
            control.handleInput(event, msg);
            return false;
        },
        
        // Stop with the tabbing already, jeez.
        untab: function( event ) {
        
            this.tab.hit = false;
            this.tab.matched = [];
            this.tab.cache = '';
            this.tab.index = -1;
        
        },
        
        // New tabatha! Woop!
        newtab: function( event ) {
        
            this.tab.hit = true;
            this.tab.index = -1;
            this.tab.matched = [];
            this.tab.type = 0;
            
            // We only tab the last word in the input. Slice!
            needle = this.chomp();
            this.unchomp(needle);
            
            // Check if we's dealing with commands here
            if( needle[0] == "/" || needle[0] == "#" ) {
                this.tab.type = needle[0] == '/' ? 1 : 2;
                needle = needle.slice(1);
            } else {
                this.tab.type = 0;
            }
            
            this.tab.cache = needle;
            needle = needle.toLowerCase();
            
            // Nows we have to find our matches. Fun.
            // Lets start with matching users.
            this.tab.matched = [];
            if( this.tab.type == 0 ) {
                for( user in this.client.cchannel.info['members'] )
                    if( user.toLowerCase().indexOf(needle) == 0 )
                        this.tab.matched.push(user);
            } else if( this.tab.type == 1 ) {
                for( i in this.client.cmds ) {
                    cmd = this.client.cmds[i];
                    if( cmd.indexOf(needle) == 0 )
                        this.tab.matched.push(cmd);
                }
            } else if( this.tab.type == 2 ) {
                for( chan in this.client.channelo )
                    if( chan.toLowerCase().indexOf(needle) == 0 )
                        this.tab.matched.push(this.client.channel(chan).info['namespace']);
            }
        
        },
        
        // Handle the tab key. Woooo.
        tabItem: function( event ) {
            if( !this.tab.hit )
                this.newtab(event);
            
            this.chomp();
            this.tab.index++;
            
            if( this.tab.index >= this.tab.matched.length )
                this.tab.index = -1;
            
            if( this.tab.index == -1 ) {
                this.unchomp(this.tab.prefix[this.tab.type] + this.tab.cache);
                return;
            }
            suf = this.input.val() == '' && this.tab.type == 0 ? ': ' : ' ';
            this.unchomp(this.tab.prefix[this.tab.type] + this.tab.matched[this.tab.index] + suf);
        },
        
        chomp: function( ) {
            d = this.input.val();
            i = d.lastIndexOf(' ');
            
            if( i == -1 ) {
                this.input.val('');
                return d;
            }
            
            chunk = d.slice(i + 1);
            this.input.val( d.slice(0, i) );
            
            if( chunk.length == 0 )
                return this.chomp();
            
            return chunk;
        },
        
        unchomp: function( data ) {
            d = this.input.val();
            if( !d )
                this.input.val(data);
            else
                this.input.val(d + ' ' + data);
        },
        
        // Handle UI input.
        handleInput: function( e, data ) {
            if( data == '' )
                return;
            
            if( data[0] != '/' ) {
                if( !this.client.cchannel )
                    return;
            }
            
            data = (e.shiftKey ? '/npmsg ' : ( data[0] == '/' ? '' : '/say ' )) + data;
            data = data.slice(1);
            bits = data.split(' ');
            cmdn = bits.shift();
            ens = this.client.cchannel.info['namespace'];
            etarget = ens;
            
            if( bits[0] ) {
                hash = bits[0][0];
                if( (hash == '#' || hash == '@') && bits[0].length > 1 ) {
                    etarget = this.client.format_ns(bits.shift());
                }
            }
            
            arg = bits.join(' ');
            
            this.client.trigger('cmd.' + cmdn + '.wsc', {
                name: 'cmd',
                cmd: cmdn,
                args: arg,
                target: etarget,
                ns: ens
            });
        },
    
    };
    
    control.init(client);
    return control;
}
// @include templates.js
// @include lib.js
// @include packet.js
// @include channel.js
// @include tablumps.js
// @include protocol.js
// @include commands.js
// @include client.js
// @include control.js

/* wsc - photofroggy
 * jQuery plugin allowing an HTML5/CSS chat client to connect to llama-like
 * chat servers and interact with them.
 */

(function( $ ) {
    
    // Client containment.
    //var client = null;
    
    $('*').hover(
        function( e ) {
            $(this).data('hover', true);
        },
        function( e ) {
            $(this).data('hover', false);
        }
    );
    
    /**
     * @function wsc
     * 
     * This function is the plugin method allowing you to run wsc using jQuery.
     * The client is designed to work with jQuery, but the objects are
     * abstracted out of this file/function to make it easier to maintain and
     * such.
     * 
     * This function generates a new {wsc_client.client wsc_client object} if there is no client
     * present in the window. Apart from that, this function can be used to
     * invoke functions on the client object. 
     * 
     * @example
     *  // Create a client inside div.container
     *  $('.container').wsc( 'init' );
     *  
     *  // The above code will create a new chat client which will draw itself
     *  // inside div.container on the page. This example is not too good as no
     *  // configuration options have been supplied. The example connecting is an
     *  // example of a simple configuration using dummy values. In this example,
     *  // we also start a connection to the WebSocket chat server.
     *  
     *  $('.container').wsc( 'init', {
     *      // Connection information.
     *      'domain': 'mywebsite.com',
     *      'server': 'ws://website.com/my/wsproxy:0000',
     *      // Login details.
     *      'username': 'username',
     *      'pk': 'token'
     *  });
     *  
     *  // After creating our client, we can start connecting to the server.
     *  $('.container').wsc( 'connect' );
     * 
     * @param [String] method Name of the method to call on the client object.
     * @param [Object] options Use this to pass arguments to the method being called.
     * @return [Object] Client object on init, something else on different methods.
     */
    $.fn.wsc = function( method, options ) {
        
        client = $(window).data('wscclient');
        
        if( method == 'init' || client === undefined ) {
            if( client == undefined ) {
                client = wsc_client( $(this), options, $.browser.mozilla );
                $(window).resize(client.resizeUI);
                $(window).focus(function( ) { client.control.focus(); });
                setInterval(client.loop, 120000);
            }
            $(window).data('wscclient', client);
        }
        
        if( method != 'init' && method != undefined ) {
            method = 'jq_' + method;
            if( method in client )
                client[method]( $(this), options);
        }
        
        return client;
        
    };
    
})( jQuery );
