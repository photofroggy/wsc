

wsc.defaults.Extension = function( client ) {

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
            this.client.bind('cmd.set', this.setter.bind(extension) );
            this.client.bind('cmd.connect', this.connect.bind(extension) );
            this.client.bind('cmd.join', this.join.bind(extension) );
            this.client.bind('cmd.part', this.part.bind(extension) );
            this.client.bind('cmd.title', this.title.bind(extension) );
            this.client.bind('cmd.promote', this.promote.bind(extension) );
            this.client.bind('cmd.me', this.action.bind(extension) );
            this.client.bind('cmd.kick', this.kick.bind(extension) );
            this.client.bind('cmd.raw', this.raw.bind(extension) );
            this.client.bind('cmd.say', this.say.bind(extension) );
            this.client.bind('cmd.npmsg', this.npmsg.bind(extension) );
            this.client.bind('cmd.clear', this.clear.bind(extension) );
            // lol themes
            this.client.bind('cmd.theme', this.theme.bind(extension));
            // some ui business.
            
            this.client.ui.on('settings.open', this.settings_page.bind(extension));
            this.client.ui.on('settings.open.ran', this.about_page.bind(extension));
        },
        
        settings_page: function( e, ui ) {
        
            page = e.settings.page('Main');
            var client = this.client;
            var orig = {};
            orig.theme = replaceAll(client.ui.settings.theme, 'wsct_', '');
            
            page.item('text', {
                'ref': 'intro',
                'title': 'Main',
                'text': 'Use this window to view and change your settings.\n\nAt\
                        the bottom of this settings page you can see some debug\
                        information, which can come in handy if something goes\
                        wrong.'
            });
            
            themes = [];
            for( i in client.ui.settings.themes ) {
                name = replaceAll(client.ui.settings.themes[i], 'wsct_', '');
                themes.push({ 'value': name, 'title': name, 'selected': orig.theme == name })
            }
            
            page.item('dropdown', {
                'ref': 'theme',
                'title': 'Theme',
                'text': 'Set the theme for the client.',
                'items': themes,
                'event': {
                    'change': function( event ) {
                    
                        client.ui.theme(client.ui.view.find(this).val());
                    
                    }
                }
            });
            
            page.item('text', {
                'ref': 'debug',
                'title': 'Debug Information',
                'text': 'User Agent: <code>' + this.client.settings.agent + '</code>'
            });
        
        },
        
        about_page: function( e, ui ) {
        
            page = e.settings.page('About', true);
            page.item('text', {
                'ref': 'about-wsc',
                'title': 'Wsc',
                'text': 'Currently using <a href="http://github.com/photofroggy/wsc/">wsc</a>\
                        version ' + wsc.VERSION + ' ' + wsc.STATE + '.\n\nWsc\
                        works using HTML5, javascript, and CSS3. WebSocket is used for the connection\
                        where possible. The source code for this client is pretty huge.\n\nWsc was created\
                        by ~<a href="http://photofroggy.deviantart.com/">photofroggy</a>'
            });
        
        },
        
        theme: function( e, client) {
            theme = client.settings.theme;
            select = e.args.split(' ').shift();
            client.ui.theme(select);
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
            extension.client.set(e.target, 'title', e.args);
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
    };
    
    extension.init(client);
    return extension;

};
