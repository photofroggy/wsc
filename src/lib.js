/* wsc lib - photofroggy
 * Generic useful functions or something.
 */

// Function scope binding. Convoluted weirdness. Lol internet.
Function.prototype.bind = function( scope ) {
    var _function = this;
    
    return function () {
        return _function.apply( scope, arguments );
    };
}; 

// Some other constructor type thing?
function scope_methods( scope, methods ) {

    for( cbn in methods ) {
        scope[cbn] = methods[cbn].bind( scope );
    }

}

Function.prototype.scope_methods = function( scope, methods ) {

    for( cbn in methods ) {
        scope[cbn] = methods[cbn].bind( scope );
    }

};

// Alternate binding interface
function bind( scope, cb ) {
    return cb.bind( scope );
}

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

Object.steal = function( a, b ) {
    for( index in b )
        a[index] = b[index];
};

Object.extend = function( a, b ) {
    obj = {};
    Object.steal(obj, a);
    Object.steal(obj, b);
    return obj;
};

function getscrollbarWidth() { 
    if ( $.browser.msie ) {
        var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
            $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
        scrollbarWidth = $textarea1.width() - $textarea2.width();
        $textarea1.add($textarea2).remove();
    } else {
        var $div = $('<div />')
            .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
            .prependTo('body').append('<div />').find('div')
                .css({ width: '100%', height: 200 });
        scrollbarWidth = 100 - $div.width();
        $div.parent().remove();
    }
    return scrollbarWidth;
}

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
