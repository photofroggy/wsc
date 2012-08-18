/* wsc commands - photofroggy
 * Commands for the user to use.
 */

function hovering( elem, x, y, flag ) {
    o = elem.offset();
    eb = elem.outerHeight(true) + o.top;
    er = elem.outerWidth(true) + o.left;
    
    if( x > o.left
        && x < er
        && y > o.top
        && y < eb)
        return true;
        
    if( flag === true ) {
        if( x < (er + 10)
            && x > o.left
            && y > o.top
            && y < (o.top + 10) )
            return true;
    }
    
    return false;
}

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
            // userlistings
            //this.client.bind('set.userlist', this.setUsers.bind(extension) );
            this.client.ui.on('userinfo.before', this.userinfo.bind(extension) );
            // lol themes
            this.client.bind('cmd.theme', this.theme.bind(extension));
        },
        
        theme: function( e, client) {
            theme = client.settings.theme;
            select = e.args.split(' ').shift();
            if( client.default_themes.indexOf(select) == -1 || theme == select)
                return;
            client.view.removeClass( theme ).addClass( select );
            client.settings.theme = select;
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
        userinfo: function( event, ui ) {
            event.user.avatar = dAmn_avatar(event.user.name, event.user.member.usericon);
            
            if( event.user.member.realname )
                event.user.info.push(event.user.member.realname);
            
            if( event.user.member.typename )
                event.user.info.push(event.user.member.typename);
        },
    };
    
    extension.init(client);
    return extension;

}
