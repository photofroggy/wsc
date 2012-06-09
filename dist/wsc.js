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

    function emit(event, args) {
        //var args = Array.prototype.slice.call(arguments);
        //var event = args.shift();
        var callbacks = events[event] || false;
        if(callbacks === false) {
            return self;
        }
        for(var i in callbacks) {
            if(callbacks.hasOwnProperty(i)) {
                callbacks[i](args);
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
wsc_html_ui = '<ul id="chattabs"></ul>\
        <div class="chatbook"></div>';

wsc_html_control = '<div class="chatcontrol">\
            <p>{user} - {ns}</p>\
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
function caseInsesitiveSort( a, b ) {
    x = String(a).toLowerCase(); y = string(b).toLowerCase();
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

// Parse a packet.
function wsc_packet( data ) {
    if(!data) {
        return null;
    }

    try {
        var cmd;
        //We need param to be null so it will fail the if test.
        //This is to make the serializer work properly.
        var param;
        //var param = '';

        var idx = data.search('\n');
        if(idx == 0) {
            return null;
        }
        var headerline = data.substr(0, idx).replace(/\s*$/, '');
        cmd = headerline.match(/\S+/)[0];
        var sidx = headerline.search(' ');
        if(sidx && sidx > 0)
            param = headerline.substr(sidx+1).match(/\S.*/)[0].replace(/\s*$/, '');
        var args = wsc_packet_args(data.substr(idx + 1));

        return {
            'cmd' : cmd,
            'param' : param,
            'arg' : args.args,
            'body' : args.data,
            'serialize': function( ) { return wsc_packetstr(this.cmd, this.param, this.arg, this.body); }
        };
    } catch(e) {
        alert('parser exception:' + e);
        return null;
    }
}

// Parse packet arguments.
function wsc_packet_args( data ) {
    var args = new Object();
    var body = '';
    var work = data;
    while(work && work.search('\n')) {
        var i = work.search('\n');
        var tmp = work.substr(0, i);
        work = work.substr(i + 1);
        i = tmp.search('=');
        if(i == null || i <= 0) {
            throw "bad argument line:" + tmp;
        }
        an = tmp.substr(0, i)
        av = tmp.substr(i + 1)
        args[an.replace(/\s*$/, '')] = av.replace(/\s*$/, '');
    }
    if(work) {
        body = work.substr(1);
    }
    return {
        'args' : args,
        'data' : body
    };
}

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
            
            if( this.hidden )
                this.tab.addClass('hidden');
            
            this.built = true;
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
                height: wh,
                width: cw});
            
            // Scroll again just to make sure.
            this.scroll();
            
            // User list dimensions
            cu.css({height: this.logpanel.innerHeight() - 2});
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
            pack = wsc_packet(e.pkt["body"]);
            this.info['members'] = {};
            
            while(pack["cmd"] == "member") {
                this.registerUser(pack);
                pack = wsc_packet(pack.body);
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
            info = wsc_packet('user ' + e.user + '\n' + e['*info']);
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
        
            u = channel.client.settings['username'].toLowerCase();
            msg = e['message'].toLowerCase();
            p = channel.window.find('p.logmsg').last();
            
            if( msg.indexOf(u) < 0 || p.html().toLowerCase().indexOf(u) < 0 )
                return;
            
            p.addClass('highlight');
        
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
 * replace tablumps with readable strings, or to extract the data
 * given in the tablumps.
 *
 * At the moment we use regular expressions to parse tablumps, this is
 * a terrible idea! TODO: Use simpler string operations to avoid using regex
 * everywhere. To do this we need to define the tablump syntax a little more
 * concretely.
 */

// Create a tablump parser object.
function wsc_tablumps( client ) {
    
    var tablumps = {
        client: null,
        expressions: null,
        replace: null,
        titles: null,
        subs: null,
    
        init: function( client ) {
            // Populate the expressions and replaces used when parsing tablumps.
            if( this.expressions )
                return;
            this.client = client;
            var domain = client.settings['domain'];
            var dav = client.settings['defaultavatar'];
            var avfold = client.settings['avatarfolder'];
            var avfile = client.settings['avatarfile'];
            var emfold = client.settings['emotefolder'];
            var thfold = client.settings['thumbfolder'];
            // Regular expression objects used to find any complicated tablumps.
            this.expressions = [
                new RegExp('\&avatar\t([a-zA-Z0-9-]+)\t([0-9]+)\t', 'g'),
                new RegExp('\&dev\t(.)\t([a-zA-Z0-9-]+)\t', 'g'),
                new RegExp("\&emote\t([^\t]+)\t([0-9]+)\t([0-9]+)\t(.*?)\t([a-z0-9./=-_]+)\t", 'g'),
                new RegExp("\&a\t([^\t]+)\t([^\t]*)\t", 'g'),
                new RegExp("\&link\t([^\t]+)\t&\t", 'g'),
                new RegExp("\&link\t([^\t]+)\t([^\t]+)\t&\t", 'g'),
                new RegExp("\&acro\t([^\t]+)\t(.*)&\/acro\t", 'g'),
                new RegExp("\&abbr\t([^\t]+)\t(.*)&\/abbr\t", 'g'),
                //new RegExp("\&thumb\t(?P<ID>[0-9]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t", 'g'),
                new RegExp("\&img\t([^\t]+)\t([^\t]*)\t([^\t]*)\t", 'g'),
                new RegExp("\&iframe\t([^\t]+)\t([0-9%]*)\t([0-9%]*)\t&\/iframe\t", 'g'),
            ]
            this.titles = ['avatar', 'dev', 'emote', 'a', 'link', 'link', 'acronym', 'abbr', 'thumb', 'img', 'iframe'];
            // Regular expression objects used to find and replace complicated tablumps.
            this.subs = [
                [new RegExp("\&avatar\t([a-zA-Z0-9-]+)\t([0-9]+)\t", 'g'),
                    function( match, un, icon ) {
                        ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
                    
                        function repl( m, s, i ) {
                            return un[i].toLowerCase();
                        }
                        
                        ico = avfile.replace(ru, repl);
                        ico = icon == '0' ? dav : ico.replacePArg( '{un}', un.toLowerCase() );
                        return '<a target="_blank" title=":icon'+un+':" href="http://$1.'+domain+'"><img class="avatar"\
                                alt=":icon$1:" src="'+avfold+ico+'" height="50" width="50" /></a>';
                    }],
                [new RegExp("\&dev\t(.)\t([a-zA-Z0-9-]+)\t", 'g'),
                    '$1<a target="_blank" alt=":dev$2:" href="http://$2.'+domain+'/">$2</a>'],
                [new RegExp("\&emote\t([^\t]+)\t([0-9]+)\t([0-9]+)\t(.*?)\t([a-z0-9./=-_]+)\t", 'g'),
                    '<img alt="$1" width="$2" height="$3" title="$4" src="'+emfold+'$5" />'],
                [new RegExp("\&a\t([^\t]+)\t([^\t]*)\t", 'g'), "<a target=\"_blank\" href=\"$1\" title=\"$2\">"],
                [new RegExp("\&link\t([^\t]+)\t&\t", 'g'), "<a target=\"_blank\" href=\"$1\">[link]</a>"],
                [new RegExp("\&link\t([^\t]+)\t([^\t]+)\t&\t", 'g'), "<a target=\"_blank\" href=\"$1\" title=\"$2\">$2</a>"],
                [new RegExp("\&acro\t([^\t]+)\t", 'g'), "<acronym title=\"$1\">"],
                [new RegExp("\&abbr\t([^\t]+)\t", 'g'), "<abbr title=\"$1\">"],
                [new RegExp("\&thumb\t([0-9]+)\t([^\t]+)\t([^\ta-zA-Z0-9])([^\t]+)\t([0-9]+)x([[0-9]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t", 'g'), 
                    function( match, id, t, s, u, w, h, b, f ) {
                        return '<a target="_blank" href="http://' + u + '.'+domain+'/art/' + t.replacePArg(' ', '-') + '-' + id + '"><img class="thumb" title="' + t + ' by ' + s + u + ', ' + w + 'x' + h + '" width="'+w+'"\
                                height="'+h+'" alt=":thumb'+id+':" src="'+thfold+f.replace(/\:/, '/')+'" /></a>';
                    }
                ],
                // <img class="thumb" title=":stare: by ~Link3Kokiri, 15x15" width="15" height="15" alt=":thumb$1:" src="http://fc03.deviantart.net/fs70/f/2010/222/1/5/_stare__by_Link3Kokiri.png">
                [new RegExp("\&thumb\t([0-9]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t", 'g'), "<abbr title=\"$2\">:thumb$1:</abbr>"],
                [new RegExp("\&img\t([^\t]+)\t([^\t]*)\t([^\t]*)\t", 'g'), "<img src=\"$1\" alt=\"$2\" title=\"$3\" />"],
                [new RegExp("\&iframe\t([^\t]+)\t([0-9%]*)\t([0-9%]*)\t&\/iframe\t", 'g'), "<iframe src=\"$1\" width=\"$2\" height=\"$3\" />"],
                [new RegExp("<([^>]+) (width|height|title|alt)=\"\"([^>]*?)>", 'g'), "<$1$3>"],
            ];
            // Search and replace pairs used to parse simple HTML tags.
            this.replace = [
                [new RegExp(EscapeRegExp("&b\t"), 'g'), "<b>"],
                [new RegExp(EscapeRegExp("&/b\t"), 'g'), "</b>"],
                [new RegExp(EscapeRegExp("&i\t"), 'g'), "<i>"],
                [new RegExp(EscapeRegExp("&/i\t"), 'g'), "</i>"],
                [new RegExp(EscapeRegExp("&u\t"), 'g'), "<u>"],
                [new RegExp(EscapeRegExp("&/u\t"), 'g'), "</u>"],
                [new RegExp(EscapeRegExp("&s\t"), 'g'), "<s>"],
                [new RegExp(EscapeRegExp("&/s\t"), 'g'), "</s>"],
                [new RegExp(EscapeRegExp("&sup\t"), 'g'), "<sup>"],
                [new RegExp(EscapeRegExp("&/sup\t"), 'g'), "</sup>"],
                [new RegExp(EscapeRegExp("&sub\t"), 'g'), "<sub>"],
                [new RegExp(EscapeRegExp("&/sub\t"), 'g'), "</sub>"],
                [new RegExp(EscapeRegExp("&code\t"), 'g'), "<code>"],
                [new RegExp(EscapeRegExp("&/code\t"), 'g'), "</code>"],
                [new RegExp(EscapeRegExp("&p\t"), 'g'), "<p>"],
                [new RegExp(EscapeRegExp("&/p\t"), 'g'), "</p>"],
                [new RegExp(EscapeRegExp("&ul\t"), 'g'), "<ul>"],
                [new RegExp(EscapeRegExp("&/ul\t"), 'g'), "</ul>"],
                [new RegExp(EscapeRegExp("&ol\t"), 'g'), "<ol>"],
                [new RegExp(EscapeRegExp("&/ol\t"), 'g'), "</ol>"],
                [new RegExp(EscapeRegExp("&li\t"), 'g'), "<li>"],
                [new RegExp(EscapeRegExp("&/li\t"), 'g'), "</li>"],
                [new RegExp(EscapeRegExp("&bcode\t"), 'g'), "<bcode>"],
                [new RegExp(EscapeRegExp("&/bcode\t"), 'g'), "</bcode>"],
                [new RegExp(EscapeRegExp("&br\t"), 'g'), "\n"],
                [new RegExp(EscapeRegExp("&/a\t"), 'g'), "</a>"],
                [new RegExp(EscapeRegExp("&/acro\t"), 'g'), "</acronym>"],
                [new RegExp(EscapeRegExp("&/abbr\t"), 'g'), "</abbr>"]
            ];
        
        },
        
        // Parse any dAmn Tablumps found in our input data.
        // 
        // This method will simply return a string with the tablumps
        // parsed into readable formats.
        parse: function( data ) {
            if( !data )
                return '';
            for( i in this.replace ) {
                lump = this.replace[i][0];
                repl = this.replace[i][1];
                data = data.replace(lump, repl);
           }
           for( i in this.subs ) {
                expression = this.subs[i][0];
                repl = this.subs[i][1];
                //if( typeof(repl) == 'function' )
                //    data = repl(data, expression);
                //else
                    data = data.replace(expression, repl);
            }
            return data.replace(/\n/gm, "<br/>") ;
        },
    
        /* Return any dAmn Tablumps found in our input data.
         *
         * Rather than parsing the tablumps, this method returns the
         * data given by tablumps. This only works for tablumps where
         * a regular expression is used for parsing.                    */
        capture: function( text ) {
            lumps = {};
            for( i in this.expressions ) {
                expression = self.expressions[i];
                cc = false; //expression.findall(text);
                if( !cc )
                    continue;
                lumps[this.titles[i]] = cc;
            }
            return lumps;
        },
    };
    
    tablumps.init(client);
    return tablumps;
    
}
/* wsc protocol - photofroggy
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
        mapper: {},
        
        // Messages for every packet.
        //      pkt_name: [ msg[, monitor]]
        // If provided, `monitor` should be true or false. By default the
        // protocol assumes false. When true, the message will be displayed in
        // the monitor channel ONLY. When false, the message will be displayed
        // in the channel the packet came from.
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
            //'kill': ['** Kill error: {1}'],*/
            //'unknown': ['** Received unknown packet in {0}: {packet}', true],
        },
        
        // Initialise!
        init: function( client ) {
            this.client = client;
            this.mapper['recv'] = this.map_recv;
            this.tablumps = this.client.settings['tablumps'](client);
            
            //var proto = this;
            //console.log(client.view);
            //client.addListener("data.wsc", this.debug_pkt);
            client.addListener('chatserver.wsc', this.chatserver);
            client.addListener('dAmnServer.wsc', this.chatserver);
            client.addListener('login.wsc', this.login);
            client.addListener('join.wsc', this.join);
            client.addListener('part.wsc', this.part);
            //client.addListener('kicked.wsc', this.kicked);
            client.addListener('ping.wsc', this.ping);
            client.addListener('property.wsc', this.property);
            client.addListener('recv_join.wsc', this.recv_joinpart);
            client.addListener('recv_part.wsc', this.recv_joinpart);
            client.addListener('recv_msg.wsc', this.recv_msg);
            client.addListener('recv_action.wsc', this.recv_msg);
            client.addListener('recv_privchg.wsc', this.recv_privchg);
            client.addListener('recv_kicked.wsc', this.recv_kicked);
        },
        
        // What to do with every packet.
        debug_pkt: function ( e ) {
            console.log(e.pkt.serialize());
            console.log(e);
        },
    
        // Established a WebSocket connection.
        connected: function( evt ) {
            this.client.trigger('connected.wsc', {name: 'connected', pkt: wsc_packet('connected\n\n')});
            //console.log("Connection opened");
            this.client.connected = true;
            this.client.handshake();
        },
    
        // WebSocket connection closed!
        closed: function( evt ) {
            console.log(evt);
            this.client.trigger('closed.wsc', {name: 'closed', pkt: wsc_packet('connection closed\n\n')});
            this.client.monitorAll("Connection closed");
            
            if(this.client.connected)
                this.client.connected = false;
        
        }, 
    
        // Received data from WebSocket connection.
        process_data: function( evt ) {
            var pack = wsc_packet(evt.data);
            
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
            args = { 'name': name, 'pkt': packet, 'ns': this.client.mns };
        
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
                            this.mapPacket(arguments, wsc_packet(pkt['body']), key);
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
                info = wsc_packet('info\n' + e.data);
                protocol.client.settings["username"] = e.pkt["param"];
                protocol.client.settings['symbol'] = info.arg.symbol;
                protocol.client.settings['userinfo'] = info.arg;
                // Autojoin!
                // TODO: multi-channel?
                protocol.client.join(client.settings["autojoin"]);
            } else {
                //protocol.client.monitor("Failed to log in: \"" + e.pkt["arg"]["e"] + '"');
            }
            
            
        },
        
        // Received a join packet.
        join: function( e ) {
            if(e.pkt["arg"]["e"] == "ok") {
                ns = protocol.client.deform_ns(e.pkt["param"]);
                //protocol.client.monitor("You have joined " + ns + '.');
                protocol.client.createChannel(ns);
                protocol.client.channel(ns).serverMessage("You have joined " + ns);
            } else {
                protocol.client.cchannel.serverMessage("Failed to join " + protocol.client.deform_ns(e.pkt["param"]), '[' + e.pkt["arg"]["e"] + ']');
            }
        },
        
        // Received a part packet.
        part: function( e ) {
            ns = protocol.client.deform_ns(e.ns);
            if(e.e == "ok") {
                console.log(e);
                info = '';
                if( e.pkt["arg"]["r"] )
                    info = '[' + e.pkt["arg"]["r"] + ']';
                
                msg = 'You have left ' + ns;
                c = protocol.client.channel(ns);
                c.serverMessage(msg, info);
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
                protocol.client.monitor('Couldn\'t leave ' + protocol.client.deform_ns(e.pkt['param']), '[' + e.pkt['arg']['e'] + ']');
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

// Create our extension and return it.
function wsc_extdefault( client ) {

    var extension = {
    
        client: null,
        
        init: function( client ) {
            this.client = client;
            // Commands.
            this.client.addListener('cmd.set.wsc', this.setter);
            this.client.addListener('cmd.connect.wsc', this.connect);
            this.client.addListener('cmd.join.wsc', this.join);
            this.client.addListener('cmd.part.wsc', this.part);
            this.client.addListener('cmd.title.wsc', this.title);
            this.client.addListener('cmd.promote.wsc', this.promote);
            this.client.addListener('cmd.me.wsc', this.action);
            this.client.addListener('cmd.kick.wsc', this.kick);
            this.client.addListener('cmd.raw.wsc', this.raw);
            this.client.addListener('cmd.say.wsc', this.say);
            this.client.addListener('cmd.npmsg.wsc', this.npmsg);
            // userlistings
            this.client.addListener('set.userlist.wsc', this.setUsers);
        },
        
        /* Set an option!
         * We need to be able to set stuff like the username and token if
         * we want to be able to make a client which can be started without
         * any configuration information being passed to the init stuff. Woop.
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
        
        // Connect to the server.
        connect: function( e ) {
            this.client.connect();
        },
        
        // Join a channel
        join: function( e ) {
            chans = e.args.split(' ');
            
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
                    
                    function hovering( elem, x, y ) {
                        o = elem.offset();
                        eb = elem.outerHeight(true) + o.top;
                        er = elem.outerWidth(true) + o.left;
                        return x >= o.left
                            && x <= er
                            && y >= o.top
                            && y <= eb;
                    }
                    
                    function rembox( ) {
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
                            ico = extension.client.settings['avatarfile'].replace(ru, repl);
                            ico = info.usericon == '0' ? extension.client.settings['defaultavatar'] : ico.replacePArg( '{un}', info.username.toLowerCase() );
                            //<div class="damncri-member">
                            //  <div class="aside-left avatar alt1">
                            //      <a target="_blank" href="http://photofroggy.deviantart.com/">
                            //         <img class="avvie" alt=":iconphotofroggy:" src="http://a.deviantart.net/avatars/p/h/photofroggy.png?1" title="photofroggy">
                            //      </a></div><div class="bodyarea alt1-border"><div class="b pp"><strong>~<a target="_blank" href="http://photofroggy.deviantart.com/">photofroggy</a></strong><div><ul><li>Procrastination is my name...</li></ul></div></div></div></div>
                            pane = '<div class="userinfo" id="'+info.username+'">\
                                <div class="avatar">\
                                    <a class="avatar" target="_blank" href="http://'+info.username+'.'+extension.client.settings['domain']+'/">\
                                        <img class="avatar" alt=":icon'+info.username+':"\
                                        src="'+extension.client.settings['avatarfolder']+ico+'" />\
                                    </a>\
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
                            infobox.css({ 'top': pos.top - usertag.height(), 'left': pos.left - (infobox.width()) });
                            infobox.hover(function(){
                                chan.window.find(this).data('hover', 1);
                            }, rembox);
                            infobox.data('hover', 0);
                            box = chan.userpanel.find('div.userinfo:not(\'#'+info.username+'\')');
                            box.remove();
                        },
                        function( e ) {
                            chan.window.find(this).data('hover', 0);
                            if(hovering( infobox, e.pageX, e.pageY ))
                                return;
                            rembox();
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

function wsc_client( view, options, mozilla ) {
    
    var client = {
    
        view: null,
        mozilla: false,
        control: null,
        tabul: null,
        chatbook: null,
        connected: false,
        conn: null,
        evt_chains: [["recv", "admin"]],
        events: null,
        settings: {
            "domain": "website.com",
            "server": "ws://website.com/wsendpoint",
            "agent": "wsc 0.1a",
            "symbol": "",
            "username": "",
            "userinfo": {},
            "pk": "",
            // Monitor: `ns`
            "monitor": ['~Wsc', ''],
            "welcome": "Welcome to the wsc web client!",
            "autojoin": "chat:channel",
            "protocol": wsc_protocol,
            "extend": [wsc_extdefault],
            "control": wsc_control,
            "stype": 'llama',
            "client": 'chatclient',
            "tablumps": wsc_tablumps,
            "avatarfile": '$un[0]/$un[1]/{un}.png',
            "defaultavatar": 'default.gif',
            "avatarfolder": '/avatars/',
            "emotefolder": '/emoticons/',
            "thumbfolder": '/thumbs/',
        },
        // Protocol object.
        protocol: null,
        // Object containing all channel objects.
        channelo: {},
        // Current channel object.
        cchannel: null,
        // Known command names.
        cmds: [],
    
        // Initialise mo'fo'.
        init: function( view, options, mozilla ) {
            
            view.append('<div class="wsc"></div>');
            // Set up variables.
            this.view = view.find('.wsc');
            this.mozilla = mozilla;
            this.connected = false;
            this.conn = null;
            this.events = new EventEmitter();
            this.view.extend( this.settings, options );
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
            
            select = this.deform_ns(this.mns).slice(1).toLowerCase();
            this.view.find('#' + select + '-tab').addClass(this.settings["monitor"][1]);
            
        },
        
        // Register a listener with an event.
        addListener: function( event, handler ) {
            this.events.addListener(event, function( e ) { handler( e ); });
            jqi = event.indexOf('.wsc');
            
            if( event.indexOf('cmd.') != 0 || jqi == -1 || jqi == 4 )
                return;
            
            cmd = event.slice(4, jqi).toLowerCase();
            this.cmds.push(cmd);
        },
        
        // Remove listeners.
        removeListeners: function( ) {
            this.events.removeListeners();
        },
        
        // Run events dawg.
        trigger: function( event, data ) {
            //console.log("emitting "+ event);
            this.events.emit(event, data);
        },
        
        // Channel method wooo
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
        
        // How many channels are we joined in?
        channels: function( ) {
            // - 2 because we always has at least 2 tabs open. Change for release.
            return Object.size(this.channelo) - 2;
        },
        
        // Start the client.
        connect: function( ) {
            if( client.connected )
                return;
            // Start connecting!
            if(CanCreateWebsocket()) {
                client.conn = client.createChatSocket();
                //console.log("connecting");
                client.trigger({name: 'start.wsc', pkt: wsc_packet('client connecting\ne=ok\n\n')});
            } else {
                client.monitor("Your browser does not support WebSockets. Sorry.");
                client.trigger({name: 'start.wsc', pkt: wsc_packet('client connecting\ne=no websockets available\n\n')});
            }
        },
        
        // Create a new WebSocket chat connection.
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
            this.createChannel(this.settings["monitor"][0], this.settings["monitor"][1]);
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
            client.view.height( client.view.parent().height() );
            client.view.width( '100%' );
            
            h = (client.view.parent().height() - client.tabul.outerHeight(true) - client.control.height());
            //console.log('>>',client.view.parent().innerHeight(),client.tabul.outerHeight(true),client.control.height())
            // Chatbook dimensions.
            client.chatbook.height(h);
            
            // Channel dimensions.
            for(select in client.channelo) {
                chan = client.channel(select);
                chan.resize();
            }
            //client.control.resize();
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
                chan.toggleTabClass(toggle);
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
                for(var name in names) {
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
                
                var sub = wsc_packet(pkt["body"]);
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
            this.send(wsc_packetstr(this.settings['client'], "0.3", {
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
            this.input.css({'width': this.client.cchannel.logpanel.width() - 250});
        },
        
        height: function( ) {
            return this.panel.height() + 30;
        },
        
        // Edit the input bar's label.
        setLabel: function( ) {
            ns = this.client.cchannel.info['namespace'];
            this.panel.find('p').replaceWith(
                '<p>' + this.userLine() + ' - ' + ns + '</p>'
            );
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
            untab = true;
            ret = false;
            
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
                    untab = false;
                    break;
                default:
                    ret = true;
                    break;
            }
            
            if( untab )
                control.untab( event );
            
            return ret;
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
            
            r = d.slice(i + 1);
            this.input.val( d.slice(0, i) );
            
            if( r.length == 0 )
                return this.chomp();
            
            return r;
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
                //this.client.say(this.client.cchannel.info["namespace"], data);
                //return;
                data = (e.shiftKey ? '/npmsg ' : '/say ') + data;
            }
            
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
        function( ) {
            $(this).data('hover', true);
        },
        function( ) {
            $(this).data('hover', false);
        }
    );
    
    $.fn.wsc = function( method, options ) {
        
        client = $(window).data('wscclient');
        
        if( method == 'init' || client === undefined ) {
            if( client == undefined ) {
                client = wsc_client( $(this), options, $.browser.mozilla );
                $(window).resize(client.resizeUI);
                $(window).focus(function( ) { client.control.focus(); });
            }
            $(window).data('wscclient', client);
        }
        
        if( method != 'init' && method != undefined ) {
            pieces = method.split('.');
            o = client;
            for( i in pieces ) {
                p = pieces[i];
                if( p in o )
                    o = o[p];
                else
                    return this;
            }
            o( $(this), options);
        }
        
        return this;
        
    };
    
})( jQuery );
