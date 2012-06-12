/* wsc commands - photofroggy
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
            this.client.bind('cmd.set.wsc', this.setter);
            this.client.bind('cmd.connect.wsc', this.connect);
            this.client.bind('cmd.join.wsc', this.join);
            this.client.bind('cmd.part.wsc', this.part);
            this.client.bind('cmd.title.wsc', this.title);
            this.client.bind('cmd.promote.wsc', this.promote);
            this.client.bind('cmd.me.wsc', this.action);
            this.client.bind('cmd.kick.wsc', this.kick);
            this.client.bind('cmd.raw.wsc', this.raw);
            this.client.bind('cmd.say.wsc', this.say);
            this.client.bind('cmd.npmsg.wsc', this.npmsg);
            // userlistings
            this.client.bind('set.userlist.wsc', this.setUsers);
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
                            infobox.css({ 'top': (pos.top - usertag.height()) + 10, 'left': (pos.left - (infobox.width())) - 18 });
                            infobox.hover(function(){
                                chan.window.find(this).data('hover', 1);
                            }, rembox);
                            infobox.data('hover', 0);
                            box = chan.userpanel.find('div.userinfo:not(\'#'+info.username+'\')');
                            box.remove();
                        },
                        function( e ) {
                            chan.window.find(this).data('hover', 0);
                            if(hovering( infobox, e.pageX, e.pageY, true ))
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
