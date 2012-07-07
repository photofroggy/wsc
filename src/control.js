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
            
            suf = '';
            
            if( this.input.val() == '' ) {
                suf = this.tab.type == 0 ? ': ' : ' ';
            }
            
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
