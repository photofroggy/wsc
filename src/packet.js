/* wsc packets - plaguethenet
 * Methods to parse and create packets for the chat protocol.
 */

// Parse a packet.
function wsc_packet( data ) {
    if(!data) {
        return null;
    }

    try {
        var cmd;
        //We need param to be null so it will fail the if test.
        //This is to make the serializer work properly.
        var param;
        //var param = '';

        var idx = data.search('\n');
        if(idx == 0) {
            return null;
        }
        var headerline = data.substr(0, idx).replace(/\s*$/, '');
        cmd = headerline.match(/\S+/)[0];
        var sidx = headerline.search(' ');
        if(sidx && sidx > 0)
            param = headerline.substr(sidx+1).match(/\S.*/)[0].replace(/\s*$/, '');
        var args = wsc_packet_args(data.substr(idx + 1));

        return {
            'cmd' : cmd,
            'param' : param,
            'arg' : args.args,
            'body' : args.data,
            'serialize': function( ) { return wsc_packetstr(this.cmd, this.param, this.arg, this.body); }
        };
    } catch(e) {
        alert('parser exception:' + e);
        return null;
    }
}

// Parse packet arguments.
function wsc_packet_args( data ) {
    var args = new Object();
    var body = '';
    var work = data;
    while(work && work.search('\n')) {
        var i = work.search('\n');
        var tmp = work.substr(0, i);
        work = work.substr(i + 1);
        i = tmp.search('=');
        if(i == null || i <= 0) {
            throw "bad argument line:" + tmp;
        }
        an = tmp.substr(0, i)
        av = tmp.substr(i + 1)
        args[an.replace(/\s*$/, '')] = av.replace(/\s*$/, '');
    }
    if(work) {
        body = work.substr(1);
    }
    return {
        'args' : args,
        'data' : body
    };
}

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