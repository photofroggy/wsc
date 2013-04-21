/* wsc lib - photofroggy
 * Generic useful functions or something.
 */


// Fetch url GET variable. 
function $_GET( q, s ) {
    s = s || window.location.search;
    var re = new RegExp('&'+q+'(?:=([^&]*))?(?=&|$)','i'); 
    s = s.replace(/^\?/,'&').match(re); 
    if(s) 
        return typeof s[1] != 'undefined' ? decodeURIComponent(s[1].replace(/\+/g, '%20')) : ''; 
}

//This returns the unix time stamp as a JS Date object in the local timezone.
function UnixTimestamp(ts) {
    ret = new Date(ts * 1000)
    return ret;
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
function caseInsensitiveSort( a, b ) {
    a = a.toLowerCase(); b = b.toLowerCase();
    return ( ( a > b ) ? 1 : ( a < b ? -1 : 0 ) );
}

// Escape special characters for regexes.
function EscapeRegExp( text ) {
    return text.replace((new RegExp('(\\' + [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ].join('|\\') + ')', 'g')), '\\$1');
}

String.format = function() {
  var args = Array.prototype.slice.call(arguments);
  var content = args.shift();
  args = args.shift();
  if( args.length == 0 )
    return content;
  var argsl = args.length;
  
  return content.replace(/{(\d+)}/g, function(match, number) {
    if(argsl <= parseInt(number))
        return match;
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

// Replace all stuff with some shit idk.
replaceAllRaw = function ( text, search, replace ) {
    while( text.indexOf( search ) > -1 ) {
        text = text.replace( search, replace );
    }
    return text;
};

replaceAll = function( text, search, replace ) {
    return text.split(search).join(replace);
};

// Size of an associative array, wooo!
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.steal = function( a, b ) {
    for( var index in b ) {
        if( !a.hasOwnProperty(index) && !b.hasOwnProperty(index) )
            continue;
        if( typeof a[index] == 'object' ) {
            a[index] = Object.extend(a[index], b[index]);
        } else {
            a[index] = b[index];
        }
    }
};

Object.extend = function( a, b ) {
    var obj = {};
    Object.steal(obj, a);
    Object.steal(obj, b);
    return obj;
};

function zeroPad( number, width ) {
    width = width || 2;
    width -= number.toString().length;
    if ( width > 0 ) {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + "";
}

function formatTime( format, date ) {
    date = date || new Date();
    
    HH = date.getHours();
    hh = HH;
    format = replaceAll(format, '{mm}', zeroPad(date.getMinutes(), 2));
    format = replaceAll(format, '{ss}', zeroPad(date.getSeconds(), 2));
    mr = 'am';
    
    if( hh > 11 ) {
        mr = 'pm';
        if( hh > 12 )
            hh = hh - 12;
    } else if( hh == 0 ) {
        hh = '12';
    }
    
    format = replaceAll(format, '{hh}', zeroPad(hh, 2));
    format = replaceAll(format, '{HH}', zeroPad(HH, 2));
    format = replaceAll(format, '{mr}', mr);
    return format;
}

function oxlist( sequence ) {
    last = sequence.pop();
    ret = sequence.join(', ');
    return ret + ( ret.length > 0 ? ', and ' : '' ) + last;
}

function pluralise( measure, num ) {
    return measure + ( num == 1 ? '' : 's' );
}

function timeLengthString( length ) {
    if ( length <= 0 )
        return '0 seconds.';
    
    var elapsed = length;
    var elarr = [];
    elarr.unshift([ 'second', Math.round(elapsed % 60) ]);
    elapsed /= Math.round(60);
    elarr.unshift([ 'minute', Math.round(elapsed % 60) ]);
    elapsed /= Math.round(60);
    elarr.unshift([ 'hour', Math.round(elapsed % 24) ]);
    elapsed /= Math.round(24);
    elarr.unshift([ 'day', elapsed ]);
    
    var ret = [];
    for( i in elarr ) {
        lapse = elarr[i];
        if( lapse[1] < 1 )
            continue;
        ret.push( lapse[1].toString() + ' ' + pluralise(lapse[0], lapse[1]) ); 
    }
    
    return oxlist(ret);
}

/**
 * Sets of unique strings.
 * 
 * Strings in the set are stored lower case.
 * @class StringSet
 * @param [items=[]] {Array} Items to start with
 */
function StringSet( items ) {

    this.items = items || [];

};

/**
 * Add an item.
 * @method add
 * @param item {String} Item to add to the set
 * @param [unshift=false] {Boolean} Pass true to unshift instead of push when adding
 * @return {Boolean} Success or failure
 */
StringSet.prototype.add = function( item, unshift ) {

    if( !item )
        return false;
    
    item = item.toLowerCase();
    
    if( this.contains( item ) )
        return true;
    
    if( unshift )
        this.items.unshift( item );
    else
        this.items.push( item );
    
    return true;

};

/**
 * Remove an item.
 * @method remove
 * @param item {String} Item to remove from the set
 * @return {Boolean} Success or failure
 */
StringSet.prototype.remove = function( item ) {

    if( !item )
        return false;
    
    item = item.toLowerCase();
    
    if( !this.contains( item ) )
        return true;
    
    this.items.splice( this.items.indexOf( item ), 1 );
    return true;

};

/**
 * Check if the set contains an item.
 * @method contains
 * @param item {String} Item to search for
 * @return {Boolean} Found or not found
 */
StringSet.prototype.contains = function( item ) {

    if( !item )
        return false;
    
    return this.items.indexOf( item.toLowerCase() ) != -1;

};
