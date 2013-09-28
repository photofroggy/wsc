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
    
    // Mapping callbacks!
    var p = this;
    this.mapper = {
        "recv": function( packet, args, mapping ) {
            args.ns = packet.param;
            return p.map(packet.sub[0], args, mapping);
        }
        
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

