/**
 * Represents a string that possibly contains tablumps.
 * Use different object methods to render the tablumps differently.
 * 
 * @example
 *     // Parse something.
 *     msg = new wsc.TablumpString('hey, check &b\t&a\thttp://google.com\tgoogle.com\tgoogle&/a\t&/b\t for answers.');
 *     console.log(msg.raw); // 'hey, check &b\t&a\thttp://google.com\tgoogle.com\tgoogle&/a\t&/b\t for answers.'
 *     console.log(msg.text()); // 'hey, check [link:http://google.com]google[/link] for answers.'
 *     console.log(msg.html()); // 'hey, check <b><a href="http://google.com">google</a></b> for answers.'
 *     console.log(msg.ansi()); // 'hey, check \x1b[1m[link:http://google.com]google[/link]\x1b[22m for answers.'
 * 
 * @class TablumpString
 * @constructor
 * @param data {String} String possibly containing tablumps.
 * @param parser {Object} A reference to a tablumps parser. Not required.
 */
wsc.TablumpString = function(data, parser) {
    this._parser = parser || new wsc.Tablumps();
    this.raw = data;
    this._text = null;
    this._html = null;
    this._ansi = null;
};

with(wsc.TablumpString.prototype = new String) {
    constructor = wsc.TablumpString;
    toString = valueOf = function() { return this.raw; };
}

/**
 * @function html
 * 
 * Render the tablumps as HTML entities.
 */
wsc.TablumpString.prototype.html = function() {
    if(this._html == null)
        this._html = this._parser.render(1, this.raw);
    return this._html;
};

/**
 * @function text
 *
 * Render the tablumps in plain text where possible. Some tablumps appear as
 * HTML entities even through this.
 */
wsc.TablumpString.prototype.text = function() {
    if(this._text == null)
        this._text = this._parser.render(0, this.raw);
    return this._text;
};

/**
 * @function ansi
 * 
 * Render the tablumps with ANSI escape sequences.
 * 
 * For this rendering method to really be worth it, I'll actually have to move
 * away from the simple regex.
 */
wsc.TablumpString.prototype.ansi = function() {
    if(this._ansi == null)
        this._ansi = this._parser.render(2, this.raw);
    return this._ansi;
};


/**
 * @object wsc.Tablumps
 *
 * Constructor for the tablumps parser.
 */
wsc.Tablumps = function(  ) {

    this.lumps = this.defaultMap();
    this._list = [];
    this._dent = 0;

};

/**
 * @function registerMap
 *
 * I should probably deprecate this. Sets the rendering map to the given map.
 */
wsc.Tablumps.prototype.registerMap = function( map ) {
    this.lumps = map;
};

/**
 * @function extend
 *
 * Add the given rendering items to the parser's render map.
 */
wsc.Tablumps.prototype.extend = function( map ) {
    for(index in map) {
        this.lumps[index] = map[index];
    }
};

/**
 * @function _list_start
 * Initiate a list.
 */
wsc.Tablumps.prototype._list_start = function( ol ) {
    list = {};
    list.ol = ol || false;
    list.count = 0;
    ret = this._list[0] ? '' : '\n';
    this._dent++;
    this._list.unshift(list);
    return ret;
};

/**
 * @function _list_end
 * Finish a list.
 */
wsc.Tablumps.prototype._list_end = function( ) {
    if( this._list.length == 0 ) {
        return '';
    }
    
    list = this._list.shift();
    this._dent--;
    return ( this._dent == 0 && list.count == 0 ) ? '\n' : '';
};

/**
 * @function defaultMap
 * 
 * Get all the default nonsense.
 */
wsc.Tablumps.prototype.defaultMap = function () {
    /* Tablumps formatting rules.
     * This object can be defined as follows:
     *     lumps[tag] => [ arguments, render[, render[, ...]] ]
     * ``tag`` is the tablumps-formatted tag to process.
     * ``arguments`` is the number of arguments contained in the tablump.
     * ``render`` defines a rendering for the tablump. The render argument
     *            can be a formatting string or a function that returns a
     *            string. The first render method should render plain text;
     *            the second, html; the third, ansi escape sequences.
     */
    
    return {
        // There are a lot of 0 arg things here...
        // Would use regex but that'd be less flexible.
        '&b\t': [0, '', '<b>', '\x1b[1m'],
        '&/b\t': [0, '', '</b>', '\x1b[22m'],
        '&i\t': [0, '', '<i>', '\x1b[3m'],
        '&/i\t': [0, '', '</i>', '\x1b[23m'],
        '&u\t': [0, '', '<u>', '\x1b[4m'],
        '&/u\t': [0, '', '</u>', '\x1b[24m'],
        '&s\t': [0, '', '<s>', '\x1b[9m'],
        '&/s\t': [0, '', '</s>', '\x1b[29m'],
        '&sup\t': [0, '/', '<sup>'],
        '&/sup\t': [0, '/', '</sup>'],
        '&sub\t': [0, '\\', '<sub>'],
        '&/sub\t': [0, '\\', '</sub>'],
        '&code\t': [0, '``', '<code>'],
        '&/code\t': [0, '``', '</code>'],
        '&p\t': [0, '\n', '<p>'],
        '&/p\t': [0, '\n', '</p>'],
        '&ul\t': [0, function( data ) { return this._list_start(); }, '<ul>'],
        '&/ul\t': [0, function( data ) { return this._list_end(); }, '</ul>'],
        '&ol\t': [0, function( data ) { return this._list_start(true); }, '<ol>'],
        '&li\t': [0, function( data ) {
                list = this._list[0] || {count: 0, ol: false};
                list.count++;
                buf = '\n';
                for(var ind = 0; ind < this._dent; ind++) {
                    buf = buf + '  ';
                }
                if( list.ol ) {
                    buf = buf + String(list.count) + '.';
                } else {
                    buf = buf + '*';
                }
                return buf + ' ';
            }, '<li>' ],
        '&/li\t': [0, '\n', '</li>'],
        '&/ol\t': [0, function( data ) { return this._list_end(true); }, '</ol>'],
        '&link\t': [ 3,
            function( data ) {
                return '[link:' + data[0] + ']' + (data[1] || '') + '[/link]';
            },
            function( data ) {
                t = data[1];
                return '<a target="_blank" href="'+data[0]+'" title="'+( t || data[0] )+'">'+( t || '[link]' )+'</a>';
            }
        ],
        '&acro\t': [ 1, '[acro:{0}]', '<acronym title="{0}">' ],
        '&/acro\t': [0, '[/acro]', '</acronym>'],
        '&abbr\t': [ 1, '[abbr:{0}]', '<abbr title="{0}">'],
        '&/abbr\t': [ 0, '[/abbr]', '</abbr>'],
        '&img\t': [ 3, '`{2}`({0})', '<img src="{0}" alt="{1}" title="{2}" />'],
        '&iframe\t': [ 3, '[iframe:{0}]', '<iframe src="{0}" width="{1}" height="{2}" />'],
        '&/iframe\t': [ 0, '', '</iframe>'],
        '&a\t': [ 2, '[link:{0}]', '<a target="_blank" href="{0}" title="{1}">' ],
        '&/a\t': [ 0, '[/link]', '</a>'],
        '&br\t': [ 0, '\n', '<br/>' ],
        '&bcode\t': [0, '\n', '<span><pre><code>'],
        '&/bcode\t': [0, '\n', '</code></pre></span>'],
        // Used to terminate a line.
        // Allows us to reset graphic rendition parameters.
        'EOF': [0, '', null, '\x1b[m']
    };

};


/**
 * @function parse
 *
 * Create a wsc.TablumpString obejct and return it.
 */
wsc.Tablumps.prototype.parse = function( data, sep ) {
    return new wsc.TablumpString(data, this);
};

/**
 * @function render
 *
 * Render tablumps in a given format.
 * 
 * Here, the flag should be a number, and defines the index of the renderer
 * to use when rendering a tablump. Setting `flag` to 0 will result in the
 * first renderer being used. In the render map, the plain text renderers come
 * first, and also act as a default.
 * 
 * Setting `flag` to 1 causes the parser to render tablumps as HTML elements
 * where possible. Setting `flag` to 2 causes the parser to render tablumps as
 * ANSI escape sequence formatted strings where possible.
 */
wsc.Tablumps.prototype.render = function( flag, data ) {
    if( !data )
        return '';
    
    sep = '\t';
    flag = flag + 1;
    
    for( var i = 0; i < data.length; i++ ) {
        
        // All tablumps start with &!
        if( data[i] != '&' )
            continue;
        
        // We want to work on extracting the tag. First thing is split
        // the string at the current index. We don't need to parse
        // anything to the left of the index.
        primer = data.substring(0, i);
        working = data.substring(i);
        
        // Next make sure there is a tab character ending the tag.
        ti = working.indexOf('\t');
        if( ti == -1 )
            continue;
        
        // Now we can crop the tag.
        tag = working.substring(0, ti + 1);
        working = working.substring(ti + 1);
        
        // Render the tablump.
        rendered = this.renderOne(flag, tag, working);
        
        // Didn't manage to render?
        if( rendered === null ) {
            i++;
            continue;
        }
        
        // Glue everything back together.
        data = primer + rendered[0];
        i = i + (rendered[1] - 1);
        
    }
    
    // Replace the simpler tablumps which do not have arguments.
    //data = data.replace(this.repl[0], this.repl[1]);
    
    return data + this.renderOne( flag, 'EOF', '' )[0];
};

/**
 * @function renderOne
 * Render a single tablump.
 */
wsc.Tablumps.prototype.renderOne = function( type, tag, working ) {
    lump = this.lumps[tag];
    
    // If we don't know how to parse the tag, leave it be!
    if( lump === undefined ) {
        return null;
    }

    // Crop the rest of the tablump!
    if( lump[0] == 0 )
        cropping = [[], working];
    else
        cropping = this.tokens(working, lump[0], sep);
    
    // Get our renderer.
    renderer = lump[type] || lump[1];
    
    // Parse the tablump if we can.
    if( typeof(renderer) == 'string' )
        parsed = String.format(renderer, cropping[0]);
    else
        parsed = renderer.call(this, cropping[0]);
    
    return [parsed + cropping[1], parsed.length];
};

/**
 * @function tokens
 * Return n tokens from any given input.
 *
 * Tablumps contain arguments which are separated by tab characters. This
 * method is used to crop a specific number of arguments from a given
 * input.
 */
wsc.Tablumps.prototype.tokens = function( data, limit, sep, end ) {
    sep = sep || '\t';
    end = end || '&';
    tokens = [];
    
    for( i = limit; i > 0; i-- ) {
        find = data.indexOf(sep);
        
        if( find == -1 )
            break;
        
        tokens.push( data.substring(0, find) );
        data = data.substring(find + 1);
        
        if( tokens[tokens.length - 1] == end ) {
            tokens.pop();
            break;
        }
    }
    
    return [tokens, data];
};

