/**
 * Controls the input panel of the client.
 * 
 * @class Control
 * @constructor
 * @param client {Object} wsc.Client object.
 */
wsc.Control = function( client ) {

    this.client = client;
    this.ui = this.client.ui.control;
    this.history = {};
    this.tab = {
        hit: false,
        cache: '',
        matched: [],
        index: -1,
        type: 0,
        prefix: ['', '/', ''],
    };
    
    this.set_input();

};

wsc.Control.prototype.focus = function(  ) {};
wsc.Control.prototype.cache_input = function( event ) {};
wsc.Control.prototype.set_input = function(  ) {};
wsc.Control.prototype.get_history = function(  ) {};
wsc.Control.prototype.append_history = function( data ) {};
wsc.Control.prototype.scroll_history = function( up ) {};
wsc.Control.prototype.tab_item = function( event ) {};
wsc.Control.prototype.start_tab = function( event ) {};
wsc.Control.prototype.end_tab = function( event ) {};
wsc.Control.prototype.submit = function( event ) {};
wsc.Control.prototype.keypress = function( event ) {};
wsc.Control.prototype.handle = function( event, message ) {};


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
            this.ui = this.client.ui.control;
            this.set_input();
        },
        
        // Steal the lime light. Brings the cursor to the input panel.
        focus: function( ) {
            this.ui.focus();
        },
        
        // Returns `<symbol><username>`;
        userLine: function( ) {
            return this.client.settings["symbol"] + this.client.settings["username"];
        },
        
        // Save current input.
        cache_input: function( event ) {
            h = this.getHistory( event.prev.namespace );
            
            if( h.index > -1 )
                return;
            
            h.tmp = this.ui.get_text();
            this.ui.set_text(this.getHistory( event.chan.namespace ).tmp);
        },
        
        // Set up the control for the UI input.
        set_input: function( ) {
            this.ui.set_handlers(this.keypress, this.submit);
        },
        
        // Create history for a channel.
        getHistory: function( ns ) {
            ns = ns || this.client.cchannel.namespace;
            
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
            data = this.ui.get_text();
            
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
            
            this.ui.set_text(history.list[history.index] || history.tmp);
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
            msg = control.ui.get_text();
            control.appendHistory(msg);
            control.ui.set_text('');
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
            needle = this.ui.chomp();
            this.ui.unchomp(needle);
            
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
                        this.tab.matched.push(this.client.channel(chan).namespace);
            }
        
        },
        
        // Handle the tab key. Woooo.
        tabItem: function( event ) {
            if( !this.tab.hit )
                this.newtab(event);
            
            this.ui.chomp();
            this.tab.index++;
            
            if( this.tab.index >= this.tab.matched.length )
                this.tab.index = -1;
            
            if( this.tab.index == -1 ) {
                this.ui.unchomp(this.tab.prefix[this.tab.type] + this.tab.cache);
                return;
            }
            
            suf = this.ui.get_text() == '' ? ( this.tab.type == 0 ? ': ' : ' ' ) : '';
            this.ui.unchomp(this.tab.prefix[this.tab.type] + this.tab.matched[this.tab.index] + suf);
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
            ens = this.client.cchannel.namespace;
            etarget = ens;
            
            if( bits[0] ) {
                hash = bits[0][0];
                if( (hash == '#' || hash == '@') && bits[0].length > 1 ) {
                    etarget = this.client.format_ns(bits.shift());
                }
            }
            
            arg = bits.join(' ');
            
            this.client.trigger('cmd.' + cmdn, {
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
