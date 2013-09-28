/**
 * Parser for dAmn-like protocols.
 * 
 * @class wsc.Protocol
 * @constructor
 * @param [mparser=wsc.MessageParser] {Object} Message parser instance.
 */
wsc.Protocol = function( mparser ) {

    this.mparser = mparser || new wsc.MessageParser;
    this.chains = [["recv", "admin"]];
    
    /**
     * Mapping object.
     * 
     * This object determines how each protocol packet should be mapped from a `packet object`
     * to an `event object`. For each packet, there is an entry, where the key is the
     * {{#crossLink "wsc.Protocol/event:method"}}event name{{/crossLink}} of the packet.
     * 
     * Each entry is an array. The array consists of names under which to store packet data.
     * The array is of the structure `[ param, args, body ]`. All items are optional, but
     * positional. To discard a particular piece of data, `null` can be used.
     * 
     * When `args` is present it must be an array. This array names the arguments to store.
     * Each item in the `args` array can be a string or a pair of strings. For strings,
     * the corresponding packet argument is stored using its own name. For pairs, the packet
     * argument named by the first string is stored using the second string as the key.
     * 
     * When `body` is present, it can either be a string or an array. If a string is provided,
     * the entire body is stored using the string as the key. If an array is provided, it
     * treated as another mapping array. This is handled recursively.
     * 
     * Keys in the mapping array can start with an asterisks (`*`). This indicates that the
     * value is a formatted string and needs to be parsed using a
     * {{#crossLink "wsc.MessageParser"}}message parser{{/crossLink}}. The asterisks is
     * removed from the key in the final object.
     * 
     * As an example, property packets use this mapping array:
     * 
     *      this.maps['property'] = ['ns', ['p', 'by', 'ts'], '*value' ];
     * 
     * When mapping a property packet, the returned object looks like the following:
     *      
     *      {
     *          "name": "property",
     *          "ns": pkt.param,
     *          "p": pkt.arg.p,
     *          "by": pkt.arg.by,
     *          "ts": pkt.arg.ts,
     *          "value": pkt.body
     *      }
     * 
     * For an example of arguments being mapped to different keys, kick
     * (error) packets use this mapping array:
     * 
     *      this.maps['kick'] = ['ns', [['u', 'user'], 'e']];
     * 
     * For this array, the returned object looks like the following:
     *      
     *      {
     *          "name": "kick",
     *          "ns": pkt.param,
     *          "user": pkt.arg.u,
     *          "e": pkt.body
     *      }
     *
     * @property maps
     * @type Object
     */
    this.maps = {
        'chatserver': ['version'],
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
        'recv_kicked': ['user', [['i', 's'], 'by'], '*r'],
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
        'unknown': [null, null, null, 'packet'],
    };
    
    // template keys for search/replace
    this.tkeys = {};
    this.populate_keys();
    
    // Mapping callbacks!
    var p = this;
    this.mapper = {
        "recv": function( packet, args, mapping ) {
            args.ns = packet.param;
            return p.map(packet.sub[0], args, mapping);
        }
        
    };
    
    /**
     * Messages object.
     * 
     * This object determines how each protocol packet should be rendered based
     * data from an `event object`. For each packet, there is an entry, where the key is the
     * {{#crossLink "wsc.Protocol/event:method"}}event name{{/crossLink}} of the packet.
     * 
     * Each entry is an array. The array consists of options for rendering and
     * logging. The array is of the structure `[ renderers, monitor, global ]`.
     * All items are optional, but positional. There are default options that
     * can be used.
     * 
     * When `renderers` is present it must be an array. This array contains
     * renderers for different kinds of formats. Renderers can be either a
     * formatted string or a callback that returns a string. There must be at
     * least one renderer, for text output. Otherwise the array should contain
     * a renderer for text ouput, a renderer for HTML output, and a renderer
     * for ANSI output. If a renderer is missing then everything falls back to
     * text renderer.
     * 
     * The `monitor` option determines whether or not to display the log
     * message in the monitor channel. The default for this is `false`.
     * 
     * The `global` option determines whether or not to display the log message
     * in every open channel. The default for this is also `false`.
     * 
     * An example for an entry in this object:
     *      
     *      { 'join': [
     *          [
     *              '** Join {ns}: "{e}" *',
     *              '<span class="servermsg">** Join {ns}: "{e}" *</span>'
     *          ],
     *          true
     *      ] }
     * 
     * This shows how the join packet will render in the monitor channel. If a
     * channel is set to display in the monitor channel, then it should not
     * be displayed in the event channel.
     *
     * At the moment, we only have to render using HTML, so the `renderers`
     * array in the entries are only HTML renderers at the moment. No array,
     * just formatting strings.
     * 
     * To display absolutely nothing for an event, the whole entry can simply
     * be `null`.
     * @property messages
     * @type Object
     */
    //  'event': [ template, monitor, global ]
    this.messages = {
        'chatserver': ['<span class="servermsg">** Connected to llama {version} *</span>', false, true ],
        'login': ['<span class="servermsg">** Login as {username}: "{e}" *</span>', false, true],
        'join': ['<span class="servermsg">** Join {ns}: "{e}" *</span>', true],
        'part': ['<span class="servermsg">** Part {ns}: "{e}" * <em>{r}</em></span>', true],
        'property': ['<span class="servermsg">** Got {p} for {ns} *</span>', true],
        'recv_msg': ['<span class="cmsg user u-{user}"><strong>&lt;{user}&gt;</strong></span><span class="cmsg u-{user}">{message}</span>'],
        'recv_npmsg': ['<span class="cmsg user u-{user}"><strong>&lt;{user}&gt;</strong></span><span class="cmsg u-{user}">{message}</span>'],
        'recv_action': ['<span class="caction user u-{user}"><em>* {user}</em></span><span class="caction u-{user}">{message}</span>'],
        'recv_join': ['<span class="cevent bg">** {user} has joined *</span>'],
        'recv_part': ['<span class="cevent bg">** {user} has left * <em>{r}</em></span>'],
        'recv_privchg': ['<span class="cevent">** {user} has been made a member of {pc} by {by} *</span>'],
        'recv_kicked': ['<span class="cevent">** {user} has been kicked by {by} * <em>{r}</em></span>'],
        'recv_admin_create': ['<span class="cevent admin">** Privilege class {pc} has been created by {user} * <em>{privs}</em></span>'],
        'recv_admin_update': ['<span class="cevent admin">** Privilege class {pc} has been updated by {user} * <em>{privs}</em></span>'],
        'recv_admin_rename': ['<span class="cevent admin">** Privilege class {prev} has been renamed to {pc} by {user} *</span>'],
        'recv_admin_move': ['<span class="cevent admin">** All members of {prev} have been moved to {pc} by {user} * <em>{affected} affected user(s)</em></span>'],
        'recv_admin_remove': ['<span class="cevent admin">** Privilege class {pc} has been removed by {user} * <em>{affected} affected user(s)</em></span>'],
        'recv_admin_show': null,
        'recv_admin_showverbose': null,
        'recv_admin_privclass': ['<span class="cevent admin">** Admin command "{command}" failed * <em>{e}</em></span>'],
        'kicked': ['<span class="servermsg">** You have been kicked by {user} * <em>{r}</em></span>'],
        'ping': null, //['<span class="servermsg">** Ping...</span>', true],
        'disconnect': ['<span class="servermsg">** You have been disconnected * <em>{e}</em></span>', false, true],
        // Stuff here is errors, yes?
        'send': ['<span class="servermsg">** Send error: <em>{e}</em></span>'],
        'kick': ['<span class="servermsg">** Could not kick {user} * <em>{e}</em></span>'],
        'get': ['<span class="servermsg">** Could not get {p} info for {ns} * <em>{e}</em></span>'],
        'set': ['<span class="servermsg">** Could not set {p} * <em>{e}</em></span>'],
        'kill': ['<span class="servermsg">** Kill error * <em>{e}</em></span>'],
        'unknown': ['<span class="servermsg">** Received unknown packet in {ns} * <em>{packet}</em></span>', true],
    };

};

/**
 * Extend the protocol maps.
 * 
 * @method extend_maps
 * @param maps {Object} An object containing packet mappings.
 */
wsc.Protocol.prototype.extend_maps = function( maps ) {

    for( var key in maps ) {
        this.maps[key] = maps[key];
    }
    
    this.populate_keys();

};

/**
 * Extend the protocol message renderers.
 * 
 * @method extend_messages
 * @param messages {Object} An object containing packet rendering methods.
 */
wsc.Protocol.prototype.extend_messages = function( messages ) {

    for( var key in messages ) {
        this.messages[key] = messages[key];
    }

};

/**
 * Generate template keys based on current protocol maps.
 * 
 * @method populate_keys
 */
wsc.Protocol.prototype.populate_keys = function(  ) {

    this.tkeys = {};
    
    for( var evt in this.maps ) {
        
        if( !this.maps.hasOwnProperty( evt ) )
            continue;
        
        var keys = this.maps[evt];
        var key = '';
        
        this.tkeys[evt] = [];
        
        for( var i in keys ) {
            if( !keys.hasOwnProperty( i ) )
                continue;
            
            key = keys[i];
            
            if( !key )
                continue;
            
            if( i == 1 ) {
                
                var sk = '';
                
                for( var x in key ) {
                    if( !key.hasOwnProperty( x ) )
                        continue;
                    
                    sk = key[x];
                    
                    if( !sk )
                        continue;
                    
                    if( sk instanceof Array ) {
                        sk = sk[1];
                    }
                    
                    if( sk[0] == '*' )
                        this.tkeys[evt].push( sk.substr( 1 ) );
                    else
                        this.tkeys[evt].push( sk );
                }
                
                continue;
                
            }
            
            if( key[0] == '*' )
                this.tkeys[evt].push( key.substr( 1 ) );
            else
                this.tkeys[evt].push( key );
        }
    
    }

};

/**
 * Parse a packet.
 * 
 * @method parse
 * @param packet {Object} Packet object.
 */
wsc.Protocol.prototype.parse = function( packet ) {

    var name = this.event( packet );
    
    if( !(name in this.maps) ) {
        console.log('unknown: ',name);
        console.log(this.maps);
        mapping = this.maps.unknown;
        name = 'unknown';
    } else {
        mapping = this.maps[name];
    }
    
    var args = { 'name': name, 'pkt': packet, 'ns': null };
    cmd = packet.cmd;
    
    if( this.mapper[cmd] )
        this.mapper[cmd](packet, args, mapping);
    else
        this.map(packet, args, mapping);
    
    return args;

};

/**
 * Get the event name of a packet.
 * 
 * @method event
 * @param pkt {Object} Packet object.
 * @return {String} Packet event name.
 */
wsc.Protocol.prototype.event = function( pkt ) {

    var name = pkt["cmd"];
    var cmds = null;
    for(var index in this.chains) {
        
        cmds = this.chains[index];
        
        if(cmds[0] != name)
            continue;
        
        var sub = pkt.sub[0];
        name = name + '_' + sub["cmd"];
        
        if(cmds.length > 1 && sub["param"] != undefined) {
            if(cmds[1] == sub["cmd"])
                return name + '_' + sub["param"];
        }
    
    }
    
    return name;

};

/**
 * Map a packet to an event object.
 * 
 * @method map
 * @param packet {Object} Packet object.
 * @param event {Object} Event data object.
 * @param mapping {Object} Packet mapping data.
 */
wsc.Protocol.prototype.map = function( packet, event, mapping ) {

    for(var i in mapping) {
        if( mapping[i] == null)
            continue;
        
        var key = mapping[i];
        var skey = key;
        var k = '', val = '';
        
        switch(parseInt(i)) {
            // e.<map[event][0]> = packet.param
            case 0:
                event[key] = packet['param'];
                break;
            // for n in map[event][1]: e.<map[event][1][n]> = packet.arg.<map[event][1][n]>
            case 1:
                if( mapping[1] instanceof Array ) {
                    for( var n in mapping[1] ) {
                        key = mapping[1][n];
                        if( key instanceof Array ) {
                            event[key[1]] = packet['arg'][key[0]];
                            skey = key[1];
                        } else {
                            var k = key[0] == '*' ? key.slice(1) : key;
                            event[key] = packet['arg'][k] || '';
                            skey = key;
                        }
                    }
                }
                
                if( typeof mapping[1] == 'string' ) {
                    // Here we want to accept the packet args as they are. All of them.
                    event[key] = packet.arg.slice(0);
                }
                break;
            // e.<map[event][2]> = packet.body
            case 2:
                if( key instanceof Array ) {
                    packet.sub[0].sub = packet.sub.slice(1);
                    this.map(packet.sub[0], event, key);
                } else {
                    event[key] = packet['body'];
                }
                break;
            case 3:
                event[key] = packet.raw;
                break;
        }
        
        if( skey[0] != '*' )
            continue;
        
        k = skey.slice(1);
        val = this.mparser.parse( event[skey] );
        event[k] = val;
    }

};

/**
 * Render a protocol message in the given format.
 * 
 * @method render
 * @param format {String} Format to render the event in
 * @param event {Object} Event data
 * @return {String} Rendered event
 */
wsc.Protocol.prototype.render = function( event, format ) {

    var msgm = this.messages[event.name];
    console.log('hi');
    if( !msgm )
        return '';
    
    var msg = msgm[0];
    var d = '';
    var keys = this.map[event.name] || [];
    var key = '';
    console.log('>',event.name);
    for( var i in keys ) {
        if( !keys.hasOwnProperty( i ) )
            continue;
        
        key = keys[i];
        
        if( key instanceof Array )
            key = key[1];
        
        console.log('>>',key);
        
        if( !event.hasOwnProperty(key) || key == 'pkt' )
            continue;
        
        d = event[key];
        
        if( key == 'ns' || key == 'sns' ) {
            key = 'ns';
            d = event['sns'];
        }
        if( d.hasOwnProperty('_parser') ) {
            switch(format) {
                case 'text':
                    d = d.text();
                    break;
                case 'html':
                    d = d.html();
                    break;
                case 'ansi':
                    d = d.ansi();
                    break;
                default:
                    d = d.text();
                    break;
            }
        }
        msg = replaceAll(msg, '{'+key+'}', d);
    }
    
    return msg;

};

/**
 * Produce a log message for an event.
 * @method log
 * @param event {Object} Event data to produce a log message with
 * @return {Object} A log message object on success. Null if failed.
 */
wsc.Protocol.prototype.log = function( event ) {

    var msgm = this.messages[event.name];
    //console.log(this.map[event.name]);
    return new wsc.Protocol.LogMessage( event, msgm, this.tkeys[event.name] );

};


/**
 * Log message object represents a log message.
 * @class wsc.Protocol.LogMessage
 * @constructor
 * @param event {Object} Event data
 * @param options {Array} Log message options
 */
wsc.Protocol.LogMessage = function( event, options, keys ) {
    
    options = options || [ '', false, false ];
    this.event = event;
    this.template = options[0] || '';
    this.keys = keys || [];
    this.monitor = options[1] || false;
    this.global = options[2] || false;
    this._html = false;
    this._text = false;
    this._ansi = false;

};

/**
 * Get a text rendition.
 * @method text
 * @return {String} Rendered message
 */
wsc.Protocol.LogMessage.prototype.text = function(  ) {

    if( this._text === false )
        this._text = this.render( 0 );
    
    return this._text;

};

/**
 * Get an HTML rendition.
 * @method html
 * @return {String} Rendered message
 */
wsc.Protocol.LogMessage.prototype.html = function(  ) {

    if( this._html === false )
        this._html = this.render( 1 );
    
    return this._html;

};

/**
 * Get an ANSI rendition.
 * @method ansi
 * @return {String} Rendered message
 */
wsc.Protocol.LogMessage.prototype.ansi = function(  ) {

    if( this._ansi === false )
        this._ansi = this.render( 2 );
    
    return this._ansi;

};

/**
 * Render a log message in the given format.
 * 
 * @method render
 * @param [format=0] {Integer} What rendering format to use. 0 is text, 1 is
 *      html, 2 is ansi.
 * @return {String} Rendered event
 */
wsc.Protocol.LogMessage.prototype.render = function( format ) {
    
    if( format === undefined )
        format = 0;
    
    /*
    var render = this.render[ format ];
    
    try {
        return render( this, this.event );
    } catch( err ) {
    */
    
    var render = this.template;
    var d = '';
    
    for( var i in this.keys ) {
    
        if( !this.keys.hasOwnProperty( i ) )
            continue;
        
        key = this.keys[i];
        
        if( key instanceof Array )
            key = key[1];
        
        if( !this.event.hasOwnProperty(key) || key == 'pkt' )
            continue;
        
        d = this.event[key];
        
        if( d == null )
            continue;
        
        if( key == 'ns' || key == 'sns' ) {
            key = 'ns';
            d = this.event['sns'];
        }
        
        if( d.hasOwnProperty('_parser') ) {
            switch(format) {
                case 1:
                    d = d.html();
                    break;
                case 2:
                    d = d.ansi();
                    break;
                case 0:
                default:
                    d = d.text();
                    break;
            }
        }
        
        render = replaceAll( render, '{' + key + '}', d );
        
    }
    
    return render;

};

