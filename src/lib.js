/* wsc lib - photofroggy
 * Generic useful functions or something.
 */
 
// Fetch url GET variable. 
function $_GET( q, s ) {
    s = s || window.location.search;
    var re = new RegExp('&'+q+'(?:=([^&]*))?(?=&|$)','i'); 
    s = s.replace(/^\?/,'&').match(re); 
    if(s) 
        return typeof s[1] != 'undefined' ? decodeURIComponent(s[1]) : ''; 
}

//This returns the unix time stamp as a JS Date object in the local timezone.
function UnixTimestamp(ts) {
    ret = new Date(ts * 1000)
    return ret
}

var Months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

function PosEnd( end ) {
    return end == '1' ? 'st' : ( end == '2' ? 'nd' : ( end == '3' ? 'rd' : 'th' ) );
}

// Date stamp
function DateStamp(ts) {
    ts = UnixTimestamp(ts);
    date = String(ts.getDate()); month = ts.getMonth();
    df = date[date.length-1];
    return date + PosEnd( df ) + ' of ' + Months[month] + ', ' + ts.getFullYear();
}

// Case insensitive sort function.
function caseInsesitiveSort( a, b ) {
    x = String(a).toLowerCase(); y = string(b).toLowerCase();
    return ( ( x > y ) ? 1 : ( x == y ? 0 : -1 ) );
}

function CanCreateWebsocket() {
    if(window["WebSocket"]) {
        return true
    }
    return false
}

// TODO: use fallbacks?
function CreateWebSocket(url, onclose, onmessage, onopen) {
    if(!CanCreateWebsocket()) {
        throw "This browser does not support websockets.";
    }
    ret = new WebSocket(url)
    if(onclose)
        ret.onclose = onclose;
    if(onmessage)
        ret.onmessage = onmessage;
    if(onopen)
        ret.onopen = onopen;
    return ret
}

// Escape special characters for regexes.
function EscapeRegExp( text ) {
    return text.replace((new RegExp('(\\' + [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ].join('|\\') + ')', 'g')), '\\$1');
}

// Replace all occurances of `search` with `replace`.
String.prototype.replacePArg = function( search, replace ) {
    return replaceAll(this, search, replace);
};

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

String.prototype.replaceAll = function ( search, replace ) {
    return replaceAllRaw( this, search, replace );
};

// Replace all stuff with some shit idk.
replaceAllRaw = function ( text, search, replace ) {
    while( text.indexOf( search ) > -1 ) {
        text = text.replace( search, replace );
    }
    return text;
};

replaceAll = function( text, search, replace ) {
    search = new RegExp(EscapeRegExp(search), 'g');
    return text.replace(search, replace || '');
};

// Size of an associative array, wooo!
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
