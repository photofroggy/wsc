/* wsc packets - photofroggy
 * Methods to parse and create packets for the chat protocol.
 */

var chains = [["recv", "admin"]];

/**
 * Parses a raw packet into a usable object.
 * 
 * @class wsc.Packet
 * @constructor
 * @param data {String} Raw packet data
 * @param [separator='='] {String} Separator character used to delimit arguments
 * @param [recurse=true] {Boolean} Should the parser recursively parse packets
 */
wsc.Packet = function( data, separator, recurse ) {

    if(!( data )) {
        return null;
    }
    
    if( recurse === undefined )
        recurse = true;
    
    separator = separator || '=';
    var pkt = { cmd: null, param: null, arg: {}, body: null, sub: [], raw: data };
    var args = null;
    var idx = -1;
    
    try {
        // Crop the body.
        idx = data.indexOf('\n\n');
        
        if( idx > -1 ) {
            pkt.body = data.substr(idx + 2);
            data = data.substr( 0, idx );
        }
        
        args = data.split('\n');
        
        if( args[0].indexOf( separator ) == -1 ) {
            cline = args.shift().split(' ');
            pkt.cmd = cline.shift() || null;
            pkt.param = cline.join(' ') || null;
        }
        
        for( var n in args ) {
            arg = args[n];
            idx = arg.search(separator);
            
            if( idx == -1 )
                continue;
            
            pkt.arg[arg.substr( 0, idx )] = arg.substr( idx + separator.length ) || '';
        }
        
        if( pkt.body != null && recurse ) {
            subs = pkt.body.split('\n\n');
            for(var i in subs) {
                sub = wsc.Packet( subs[i], separator, false );
                if( sub == null )
                    break;
                sub.body = subs.slice(i + 1).join('\n\n');
                pkt.sub.push( sub );
            }
        }
        
    } catch(e) {
        return null;
    }
    
    pkt.toString = function() { return packetToString(pkt); };
    pkt.name = packetEvtName(pkt);
    
    return pkt;

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

function packetToString(pkt) {
    return wsc_packetstr(pkt.cmd, pkt.param, pkt.arg, pkt.body);
}

// Get the event name of a given packet.
function packetEvtName( pkt ) {
    
    var name = pkt["cmd"];
    var cmds = null;
    for(var index in chains) {
        
        cmds = chains[index];
        
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
}
