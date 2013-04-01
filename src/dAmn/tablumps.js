/**
 * Represents a string that possibly contains tablumps.
 * Use different object methods to render the tablumps differently.
 * 
 * @example
 *     // Parse something.
 *     var msg = new wsc.TablumpString('hey, check &b\t&a\thttp://google.com\tgoogle.com\tgoogle&/a\t&/b\t for answers.');
 *     console.log(msg.raw); // 'hey, check &b\t&a\thttp://google.com\tgoogle.com\tgoogle&/a\t&/b\t for answers.'
 *     console.log(msg.text()); // 'hey, check [link:http://google.com]google[/link] for answers.'
 *     console.log(msg.html()); // 'hey, check <b><a href="http://google.com">google</a></b> for answers.'
 *     console.log(msg.ansi()); // 'hey, check \x1b[1m[link:http://google.com]google[/link]\x1b[22m for answers.'
 * 
 * @class dAmn.TablumpString
 * @extends wsc.MessageString
 * @constructor
 * @param data {String} String possibly containing tablumps.
 * @param [parser] {Object} A reference to a tablumps parser.
 */
wsc.dAmn.TablumpString = function(data, parser) {
    this._parser = parser || new wsc.dAmn.Tablumps();
    this.tokens = this._parser.tokenise(data);
    this.raw = data;
    this._text = null;
    this._html = null;
    this._ansi = null;
};

wsc.dAmn.TablumpString.prototype = new wsc.MessageString;
wsc.dAmn.TablumpString.prototype.constructor = wsc.dAmn.TablumpString;

with(wsc.dAmn.TablumpString.prototype = new String) {
    constructor = wsc.dAmn.TablumpString;
    toString = valueOf = function() { return this.raw; };
}

/**
 * @function html
 * 
 * Render the tablumps as HTML entities.
 */
wsc.dAmn.TablumpString.prototype.html = function() {
    if(this._html == null)
        this._html = this._parser.render(1, this);
    return this._html;
};

/**
 * @function text
 *
 * Render the tablumps in plain text where possible. Some tablumps appear as
 * HTML entities even through this.
 */
wsc.dAmn.TablumpString.prototype.text = function() {
    if(this._text == null)
        this._text = this._parser.render(0, this);
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
wsc.dAmn.TablumpString.prototype.ansi = function() {
    if(this._ansi == null)
        this._ansi = this._parser.render(2, this);
    return this._ansi;
};


/**
 * States for the parser.
 */
wsc.dAmn.PARSE = {
    'RAW': 0,
    'TAG': 1,
    'ARG': 2
};


/**
 * Parser for dAmn Tablumps.
 * 
 * @class dAmn.TablumpParser
 * @extends wsc.MessageParser
 * @constructor
 */
wsc.dAmn.TablumpParser = function(  ) {

    /**
     * This object holds each tablump's parsing and rendering rules. For each tablump,
     * there is a key, which is the tablump's head, or "tag". The entry is an array
     * with the number of arguments in the tablump, followed by different renderers.
     * As a generalisation, it looks like this:
     *
     *      this.lumps[tag] = [ arguments, render_text, render_html, render_ansi ];
     * 
     * Renderers can be formatting strings or functions. All renderers other than the
     * first one are optional. If a particular render is not available, the rendering step
     * falls back to the first renderer in the Array. As a brief example, this is what the
     * img tag's entry looks like:
     *      
     *      this.lumps['&img\t'] = [ 3, '<img src="{0}" alt="{1}" title="{2}" />'];
     * 
     * @property lumps
     * @type Object
     */
    this.lumps = this.defaultMap();

};

wsc.dAmn.TablumpParser.prototype = new wsc.MessageParser;
wsc.dAmn.TablumpParser.prototype.constructor = wsc.dAmn.TablumpParser;

/**
 * I should probably deprecate this. Sets the rendering map to the given map.
 * @method registerMap
 * @deprecated
 */
wsc.dAmn.TablumpParser.prototype.registerMap = function( map ) {
    this.lumps = map;
};

/**
 * Add the given rendering items to the parser's render map.
 * @method extend
 */
wsc.dAmn.TablumpParser.prototype.extend = function( map ) {
    for(index in map) {
        this.lumps[index] = map[index];
    }
};

/**
 * Get all the default nonsense.
 * @method defaultMap
 */
wsc.dAmn.TablumpParser.prototype.defaultMap = function () {
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
        '&b\t': [0, '<b>', '<b>', '\x1b[1m'],
        '&/b\t': [0, '</b>', '</b>', '\x1b[22m'],
        '&i\t': [0, '<i>', '<i>', '\x1b[3m'],
        '&/i\t': [0, '</i>', '</i>', '\x1b[23m'],
        '&u\t': [0, '<u>', '<u>', '\x1b[4m'],
        '&/u\t': [0, '</u>', '</u>', '\x1b[24m'],
        '&s\t': [0, '<s>', '<s>', '\x1b[9m'],
        '&/s\t': [0, '</s>', '</s>', '\x1b[29m'],
        '&sup\t': [0, '<sup>'],
        '&/sup\t': [0, '</sup>'],
        '&sub\t': [0, '<sub>'],
        '&/sub\t': [0, '</sub>'],
        '&code\t': [0, '<code>'],
        '&/code\t': [0, '</code>'],
        '&p\t': [0, '<p>'],
        '&/p\t': [0, '</p>'],
        '&ul\t': [0, '<ul>'],
        '&/ul\t': [0, '</ul>'],
        '&ol\t': [0, '<ol>'],
        '&li\t': [0, '<li>' ],
        '&/li\t': [0, '</li>'],
        '&/ol\t': [0, '</ol>'],
        '&link\t': [ 3,
            function( data ) {
                return data[0] + ( data[1] ? (' (' + data[1] + ')') : '');
            },
            function( data ) {
                t = data[1];
                return '<a target="_blank" href="'+data[0]+'" title="'+( t || data[0] )+'">'+( t || '[link]' )+'</a>';
            }
        ],
        '&acro\t': [ 1, '<acronym title="{0}">' ],
        '&/acro\t': [0, '</acronym>'],
        '&abbr\t': [ 1, '<abbr title="{0}">'],
        '&/abbr\t': [ 0, '</abbr>'],
        '&img\t': [ 3, '<img src="{0}" alt="{1}" title="{2}" />'],
        '&iframe\t': [ 3, '<iframe src="{0}" width="{1}" height="{2}" />'],
        '&/iframe\t': [ 0, '</iframe>'],
        '&a\t': [ 2, '<a href="{0}" title="{1}">' ],
        '&/a\t': [ 0, '</a>'],
        '&br\t': [ 0, '<br/>' ],
        '&bcode\t': [0, '<bcode>', '<span><pre><code>'],
        '&/bcode\t': [0, '</bcode>', '</code></pre></span>'],
        '&avatar\t': [ 2,
            ':icon{0}:',
            function( data ) { return wsc.dAmn.avatar.link( data[0], data[1] ); }
        ],
        '&emote\t': [ 5,
            '{0}',
            '<img alt="{0}" width="{1}" height="{2}" title="{3}" src="http://e.deviantart.com/emoticons/{4}" />'
        ],
        '&dev\t': [ 2,
            ':dev{1}:',
            '{0}<a target="_blank" alt=":dev{1}:" href="http://{1}.deviantart.com/">{1}</a>',
            '{0}\x1b[36m{1}\x1b[39m'
        ],
        '&thumb\t': [ 7,
            ':thumb{0}:',
            wsc.dAmn.Emotes.Tablumps
        ],
        'EOF': [0, '', null, '\x1b[m']
    };

};


/**
 * Parse a message into tokens and return it as a
 * {{#crossLink "dAmn.TablumpString"}}{{/crossLink}} object.
 *
 * @method parse
 * @param data {String} Message to parse
 * @return {Object} Parsed tablump string
 */
wsc.dAmn.TablumpParser.prototype.parse = function( data, sep ) {
    data = replaceAll(data, '<', '&lt;');
    data = replaceAll(data, '>', '&gt;');
    return new wsc.dAmn.TablumpString(data, this);
};

/**
 * Parse a message possibly containing tablumps into tokens.
 * 
 * @method tokenise
 * @param data {String} Message to parse
 * @return {Array} Tokens
 */
wsc.dAmn.TablumpParser.prototype.tokenise = function( data ) {

    if( !data )
        return [];
    
    var state = wsc.dAmn.PARSE.RAW;
    var result = [];
    var argbuf = '';
    var argc = 0;
    var item = [];
    var buf = '';
    var tag = '';
    var c = '';
    
    for( var i = 0; i < data.length; i++ ) {
    
        c = data[i];
        
        switch(state) {
        
            case wsc.dAmn.PARSE.RAW:
                if( c != '&' ) {
                    buf+= c;
                    break;
                }
                argbuf = c;
                state = wsc.dAmn.PARSE.TAG
                break;
            
            case wsc.dAmn.PARSE.TAG:
                argbuf+= c;
                if( c == ' ' || c == '\t' || c == '&' ) {
                    if( c == ' ' || c == '&' || !this.lumps.hasOwnProperty(argbuf) ) {
                        buf+= argbuf;
                        argbuf = '';
                        if( c == '&' ) {
                            i--;
                            buf = buf.substr(0, buf.length-1);
                        }
                        state = wsc.dAmn.PARSE.RAW;
                    } else {
                        if( buf.length > 0 ) {
                            result.push([ 'raw', buf ]);
                            buf = '';
                        }
                        
                        item = [argbuf, []];
                        argc = this.lumps[argbuf][0];
                        result.push(item);
                        argbuf = '';
                        
                        if( argc > 0 ) {
                            state = wsc.dAmn.PARSE.ARG;
                        } else {
                            state = wsc.dAmn.PARSE.RAW;
                        }
                    }
                }
                break;
            
            case wsc.dAmn.PARSE.ARG:
                if( c == '\t' ) {
                    argc--;
                    
                    if( argbuf == '&' ) {
                        state = wsc.dAmn.PARSE.RAW;
                        argbuf = '';
                        break;
                    }
                    
                    item[1].push(argbuf);
                    argbuf = '';
                    
                    if( argc == 0 )
                        state = wsc.dAmn.PARSE.RAW;
                    break;
                }
                
                argbuf+= c;
                break;
        
        }
    
    }
    
    if( buf.length > 0 || argbuf.length > 0 ) {
        result.push([ 'raw', buf + argbuf ]);
    }
    
    return result;

};

/**
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
 * 
 * @method render
 * @param flag {Integer} Determines how the message should be rendered
 * @param data {Object} TablumpString to be rendered
 * @return {String} Rendered tablump string
 */
wsc.dAmn.TablumpParser.prototype.render = function( flag, data ) {
    if( !data )
        return '';
    
    if( !data.hasOwnProperty('tokens') )
        return '';
    
    flag = flag + 1;
    var rendered = '';
    var token = [];
    
    for( var i in data.tokens ) {
        
        if( !data.tokens.hasOwnProperty(i) )
            continue;
        
        token = data.tokens[i];
        
        if( token[0] == 'raw' ) {
            rendered+= token[1];
            continue;
        }
        
        rendered+= this.renderOne( flag, token[0], token[1] );
        
    }
    
    return rendered + this.renderOne( flag, 'EOF', '' );
};

/**
 * Render a single tablump.
 * @method renderOne
 * @param type {Integer} Type of renderer to use
 * @param tag {String} Name of the tablump tag
 * @param tokens {Array} Tablump arguments
 * @return {String} The rendered tablump
 */
wsc.dAmn.TablumpParser.prototype.renderOne = function( type, tag, tokens ) {
    var lump = this.lumps[tag];
    
    // If we don't know how to parse the tag, leave it be!
    if( lump === undefined ) {
        return '&' + tag + '\t' + tokens.join('\t');;
    }
    
    // Get our renderer.
    var renderer = lump[type] || lump[1];
    // Parse the tablump if we can.
    if( typeof(renderer) == 'string' )
        return String.format(renderer, tokens);
    else
        return renderer.call(this, tokens);
};

