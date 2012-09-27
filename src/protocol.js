/**
 * Parser for dAmn-like protocols.
 * 
 * @class Protocol
 * @constructor
 * @param [tablumps=wsc.Tablumps] {Object} Tablumps parser instance.
 */
wsc.Protocol = function( tablumps ) {

    this.tablumps = tablumps || new wsc.Tablumps;
    this.chains = [["recv", "admin"]];
    
    // Mappings for every packet.
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
    
    // Mapping callbacks!
    var p = this;
    this.mapper = {
        "recv": function( packet, args, mapping ) {
            args.ns = packet.param;
            sub = new wsc.Packet( packet.body );
            
            if( sub.cmd == 'admin' ) {
                ssub = new wsc.Packet( sub.body );
                return p.map(ssub, args, mapping);
            }
            
            return p.map(sub, args, mapping);
        }
        
    };
    
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
        'recv_admin_create': ['<span class="cevent admin">** Privilege class {pc} has been created by {user} with: {privs} *</span>'],
        'recv_admin_update': ['<span class="cevent admin">** Privilege class {pc} has been updated by {user} with: {privs} *</span>'],
        'recv_admin_rename': ['<span class="cevent admin">** Privilege class {prev} has been renamed to {name} by {user} *</span>'],
        'recv_admin_move': ['<span class="cevent admin">** All members of {prev} have been moved to {pc} by {user} -- {affected} affected user(s) *</span>'],
        'recv_admin_remove': ['<span class="cevent admin">** Privilege class {pc} has been removed by {user} -- {affected} affected user(s) *</span>'],
        'recv_admin_show': null,
        'recv_admin_showverbose': null,
        'recv_admin_privclass': ['<span class="cevent admin">** Admin command "{command}" failed: {e} *</span>'],
        'kicked': ['<span class="servermsg">** You have been kicked by {user} * <em>{r}</em></span>'],
        'ping': null, //['<span class="servermsg">** Ping...</span>', true],
        'disconnect': ['<span class="servermsg">** You have been disconnected * <em>{e}</em></span>', false, true],
        // Stuff here is errors, yes?
        'send': ['<span class="servermsg">** Send error: <em>{e}</em></span>'],
        'kick': ['<span class="servermsg">** Could not kick {user}: <em>{e}</em></span>'],
        'get': ['<span class="servermsg">** Could not get {p} info for {ns}: <em>{e}</em></span>'],
        'set': ['<span class="servermsg">** Could not set {p}: <em>{e}</em></span>'],
        'kill': ['<span class="servermsg">** Kill error: <em>{e}</em></span>'],
        'unknown': ['<span class="servermsg">** Received unknown packet in {ns}: <em>{packet}</em></span>', true],
    };

};

/**
 * Extend the protocol maps.
 * 
 * @method extend_maps
 * @param maps {Object} An object containing packet mappings.
 */
wsc.Protocol.prototype.extend_maps = function( maps ) {

    for( key in maps ) {
        this.maps[key] = maps[key];
    }

};

/**
 * Extend the protocol message renderers.
 * 
 * @method extend_messages
 * @param messages {Object} An object containing packet rendering methods.
 */
wsc.Protocol.prototype.extend_messages = function( messages ) {

    for( key in messages ) {
        this.messages[key] = messages[key];
    }

};

/**
 * Parse a packet.
 * 
 * @method parse
 * @param packet {Object} Packet object.
 */
wsc.Protocol.prototype.parse = function( packet ) {

    name = this.event( packet );
    
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
 * @param map {Object} Packet mapping data.
 */
wsc.Protocol.prototype.map = function( packet, event, map ) {

    for(var i in mapping) {
        if( mapping[i] == null)
            continue;
        
        key = mapping[i];
        skey = key;
        switch(parseInt(i)) {
            // e.<map[event][0]> = packet.param
            case 0:
                event[key] = packet['param'];
                break;
            // for n in map[event][1]: e.<map[event][1][n]> = packet.arg.<map[event][1][n]>
            case 1:
                if( mapping[1] instanceof Array ) {
                    for( n in mapping[1] ) {
                        key = mapping[1][n];
                        if( key instanceof Array ) {
                            event[key[1]] = packet['arg'][key[0]];
                            skey = key[1];
                        } else {
                            k = key[0] == '*' ? key.slice(1) : key;
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
                    this.mapPacket(event, new wsc.Packet(packet['body']), key);
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
        val = this.tablumps.parse( event[skey] );
        event[k] = val;
    }

};

/**
 * Render a protocol message in the given format.
 * 
 * @method render
 * @param format {String} Format to render the event in.
 * @param event {Object} Event data.
 * @return {String} Rendered event.
 */
wsc.Protocol.prototype.render = function( event, format ) {

    msgm = this.messages[event.name];
    
    if( !msgm )
        return '';
    
    msg = msgm[0];
    
    for( key in event ) {
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


wsc.Protocol.prototype.log = function( client, event ) {

    msgm = this.messages[event.name];
    
    if( !msgm )
        return;
    
    if( event.s == '0' ) {
        return;
    }
    
    msg = this.render(event, 'html');
    
    if( !msgm[2] ) {
        if( !msgm[1] )
            client.ui.channel(event.ns).log_item(msg);
        else
            client.ui.channel(client.mns).log_item(msg);
    } else {
        client.ui.log_item(msg);
    }

};

