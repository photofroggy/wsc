/* wsc tablumps - photofroggy
 * Processes the chat tablumps for a llama-like chat server.
 * 
 * dAmn sends certain information formatted in a specific manner.
 * Links, images, thumbs, and other forms of data are formatted
 * in strings where the different attributes of these values are
 * separated by tab characters (``\\t``). The formatted string always starts
 * with an ampersand followed directly by the name of the tag that the string
 * represents. For example, links start with &a\t, the tab character acting as
 * a separator. Looking for &<tag>\t should allow us to narrow down our searches
 * without resorting to regular expressions.
 *
 * We refer to these items as "tablumps" because of the tab
 * characters being used as delimeters. The job of this class is to
 * replace tablumps with readable strings.
 */

function WscTablumps(  ) {

    this.lumps = this.defaultMap();
    // This array defines the regex for replacing the simpler tablumps.
    this.repl = [/&(\/|)(b|i|u|s|sup|sub|code|p|ul|ol|li|bcode|a|iframe|acro|abbr)\t/g, '<$1$2>'];

}

WscTablumps.prototype.registerMap = function( map ) {
    this.lumps = map;
};

WscTablumps.prototype.defaultMap = function () {
    /* Tablumps formatting rules.
     * This object can be defined as follows:
     *     lumps[tag] => [ arguments, format ]
     * ``tag`` is the tablumps-formatted tag to process.
     * ``arguments`` is the number of arguments contained in the tablump.
     * ``format`` is a function which returns the tablump as valid HTML.
     * Or it's a string template thing. Whichever.
     */
    return {
        '&link\t': [ 3, function( data ) {
            t = data[1] || '[link]';
            return '<a target="_blank" href="'+data[0]+'" title="'+t+'">'+t+'</a>';
        } ],
        '&acro\t': [ 1, '<acronym title="{0}">' ],
        '&abbr\t': [ 1, '<abbr title="{0}">'],
        '&img\t': [ 3, '<img src="{0}" alt="{1}" title="{2}" />'],
        '&iframe\t': [ 3, '<iframe src="{0}" width="{1}" height="{2}" />'],
        '&a\t': [ 2, '<a target="_blank" href="{0}" title="{1}">' ],
        '&br\t': [ 0, '<br/>' ]
    };

};

/* Parse tablumps!
 * This implementation hopefully only uses simple string operations.
 */
WscTablumps.prototype.parse = function( data, sep ) {
    if( !data )
        return '';
    
    sep = sep || '\t';
    
    for( i = 0; i < data.length; i++ ) {
    
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
        lump = this.lumps[tag];
        
        // If we don't know how to parse the tag, leave it be!
        if( lump === undefined )
            continue;
        
        // Crop the rest of the tablump!
        cropping = this.tokens(working, lump[0], sep);
        
        // Parse the tablump.
        if( typeof(lump[1]) == 'string' )
            parsed = lump[1].format.apply(lump[1], cropping[0]);
        else
            parsed = lump[1](cropping[0]);
        
        // Glue everything back together.
        data = primer + parsed + cropping[1];
        i = i + (parsed.length - 2);
        
    }
    
    // Replace the simpler tablumps which do not have arguments.
    data = data.replace(this.repl[0], this.repl[1]);
    
    return data;
};

/* Return n tokens from any given input.
 * Tablumps contain arguments which are separated by tab characters. This
 * method is used to crop a specific number of arguments from a given
 * input.
 */
WscTablumps.prototype.tokens = function( data, limit, sep, end ) {
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

var dAmn_avext = [ 'gif', 'gif', 'jpg', 'png' ];

function dAmn_avatar( un, icon ) {
    icon = parseInt(icon);
    cachebuster = (icon >> 2) & 15;
    icon = icon & 3;
    ext = dAmn_avext[icon] || 'gif';
    
    if (cachebuster) {
        cachebuster = '?' + cachebuster;
    }
    else {
        cachebuster = '';
    }
    
    if( icon == 0 ) { 
        ico = 'default';
    } else {
        ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
        
        ico = '$un[0]/$un[1]/{un}'.replace(ru, function ( m, s, i ) {
            return un[i].toLowerCase();
        });
        ico = ico.replacePArg( '{un}', un.toLowerCase() );
    }
    
    return '<a target="_blank" title=":icon'+un+':" href="http://'+un+'.deviantart.com/"><img class="avatar"\
            alt=":icon'+un+':" src="http://a.deviantart.net/avatars/'+ico+'.'+ext+cachebuster+'" height="50" width="50" /></a>';
}

/**
 * dAmn tablumps map.
 *
 * This function returns a map which can be used by the tablumps parser to parse
 * dAmn's tablumps.
 */
function dAmnLumps( opts ) {
    /* Tablumps formatting rules.
     * This object can be defined as follows:
     *     lumps[tag] => [ arguments, format ]
     * ``tag`` is the tablumps-formatted tag to process.
     * ``arguments`` is the number of arguments contained in the tablump.
     * ``format`` is a function which returns the tablump as valid HTML.
     * Or it's a string template thing. Whichever.
     */
    return {
        '&avatar\t': [ 2, function( data ) { return dAmn_avatar( data[0], data[1] ); }],
        '&emote\t': [ 5, '<img alt="{0}" width="{1}" height="{2}" title="{3}" src="http://e.deviantart.com/emoticons/{4}" />' ],
        '&dev\t': [ 2, '{0}<a target="_blank" alt=":dev{1}:" href="http://{1}.deviantart.com/">{1}</a>' ],
        '&thumb\t': [ 7, function( data ) {
                id = data[0]; t = data[1]; s = data[2][0]; u = data[2].substring(1); dim = data[3].split('x'); b = data[6]; f = data[5];
                server = parseInt(data[4]); tw = w = parseInt(dim[0]); th = h = parseInt(dim[1]);
                if( w > 100 || h > 100) {
                    if( w/h > 1 ) {
                        th = (h * 100) / w;
                        tw = 100;
                    } else {
                        tw = (w * 100) / w;
                        th = 100;
                    }
                    if( tw > w || th > h ) {
                        tw = w;
                        th = h;
                    }
                }
                return '<a target="_blank" href="http://' + u + '.deviantart.com/art/' + t.replacePArg(' ', '-') + '-' + id + '"><img class="thumb" title="' + t + ' by ' + s + u + ', ' + w + 'x' + h + '" width="'+tw+'"\
                        height="'+th+'" alt=":thumb'+id+':" src="http://fc03.deviantart.net/'+f.replace(/\:/, '/')+'" /></a>';
            }
        ],
    };

}