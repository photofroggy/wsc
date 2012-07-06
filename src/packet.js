/* wsc packets - plaguethenet
 * Methods to parse and create packets for the chat protocol.
 */

function WscPacket( data, separator ) {

    this.raw = data;
    /*this.parse = bind( this, this.parse );
    this.parseArgs = bind( this, this.parseArgs );
    this.setNull = bind( this, this.setNull );
    this.serialize = bind( this, this.serialize );
    this.toString = bind( this, this.toString );*/
    //scope_methods( this, WscPacket.prototype );
    this.setNull();
    this.parse(separator);
    this.raw = this.serialize();

}

WscPacket.prototype.parse = function( separator ) {

    if(!( this.raw )) {
        return null;
    }
    
    separator = separator || '=';
    var data = this.raw;
    
    try {
        // Crop the body.
        idx = data.indexOf('\n\n');
        if( idx > -1 ) {
            this.body = data.substr(idx + 2);
            data = data.substr( 0, idx );
        }
        
        cmdline = null;
        idx = data.indexOf('\n');
        sidx = data.indexOf( separator );
        
        if( idx > -1 && ( sidx == -1 || sidx > idx ) ) {
            cmdline = data.substr( 0, idx );
            data = data.substr( idx + 1 );
        } else if( sidx == -1 ) {
            cmdline = data;
            data = '';
        }
        
        if( cmdline ) {
            seg = cmdline.split(' ');
            this.cmd = seg[0];
            this.param = seg[1] ? seg[1] : null;
        }
        
        this.arg = this.parseArgs(data, separator);
        
    } catch(e) {
        alert('parser exception:' + e);
        this.setNull();
    }

};

WscPacket.prototype.parseArgs = function ( data, separator ) {    
    separator = separator || '=';
    args = {};
    lines = data.split('\n');
    for( n in lines ) {
        line = lines[n];
        si = line.search(separator);
        
        if( si == -1 )
            continue;
        
        args[line.substr( 0, si )] = line.substr( si + separator.length ) || '';
    }
    
    return args;
};

WscPacket.prototype.setNull = function(  ) {

    this.cmd = null;
    this.param = null;
    this.arg = null;
    this.body = null;

};

WscPacket.prototype.toString = function(  ) {
    return this.raw;
};

WscPacket.prototype.serialize = function(  ) {
    return wsc_packetstr( this.cmd, this.param, this.arg, this.body );
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

function wsc_packet_serialze(pkt) {
    return wsc_packetstr(pkt.cmd, pkt.param, pkt.arg, pkt.body);
}