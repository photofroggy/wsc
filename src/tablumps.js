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
 * replace tablumps with readable strings, or to extract the data
 * given in the tablumps.
 */

// Create a tablump parser object.
function wsc_tablumps( client ) {
    
    var tablumps = {
        client: null,
        lumps: null,
        repl: null,
    
        init: function( opts ) {
            // Populate the expressions and replaces used when parsing tablumps.
            if( this.expressions )
                return;
            var domain = opts['domain'];
            var dav = opts['defaultavatar'];
            var avfold = opts['avatarfolder'];
            var avfile = opts['avatarfile'];
            var emfold = opts['emotefolder'];
            var thfold = opts['thumbfolder'];
            
            // This array defines the regex for replacing the simpler tablumps.
            this.repl = [/&(\/|)(b|i|u|s|sup|sub|code|p|ul|ol|li|bcode|a|iframe|acro|abbr)\t/g, '<$1$2>'];
            
            /* Tablumps formatting rules.
             * This object can be defined as follows:
             *     lumps[tag] => [ arguments, format ]
             * ``tag`` is the tablumps-formatted tag to process.
             * ``arguments`` is the number of arguments contained in the tablump.
             * ``format`` is a function which returns the tablump as valid HTML.
             * Or it's a string template thing. Whichever.
             */
            this.lumps = {
                '&avatar\t': [ 2, function( data ) {
                    un = data[0];
                    icon = data[1];
                    ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
                
                    function repl( m, s, i ) {
                        return un[i].toLowerCase();
                    }
                    
                    ico = avfile.replace(ru, repl);
                    ico = icon == '0' ? dav : ico.replacePArg( '{un}', un.toLowerCase() );
                    return '<a target="_blank" title=":icon'+un+':" href="http://$1.'+domain+'"><img class="avatar"\
                            alt=":icon$1:" src="'+avfold+ico+'" height="50" width="50" /></a>';
                }],
                '&dev\t': [ 2, '{0}<a target="_blank" alt=":dev{1}:" href="http://{1}.'+domain+'/">{1}</a>' ],
                '&emote\t': [ 5, '<img alt="{0}" width="{1}" height="{2}" title="{3}" src="'+emfold+'{4}" />' ],
                '&link\t': [ 3, '<a target="_blank" href="{0}" title="{2}">{2}</a>' ],
                '&acro\t': [ 1, '<acronym title="{0}">' ],
                '&abbr\t': [ 1, '<abbr title="{0}">'],
                '&thumb\t': [ 8, function( match, id, t, s, u, w, h, b, f ) {
                        id = data[0]; t = data[1]; s = data[2]; u = data[3]; w = data[4]; h = data[5]; b = data[6]; f = data[7];
                        return '<a target="_blank" href="http://' + u + '.'+domain+'/art/' + t.replacePArg(' ', '-') + '-' + id + '"><img class="thumb" title="' + t + ' by ' + s + u + ', ' + w + 'x' + h + '" width="'+w+'"\
                                height="'+h+'" alt=":thumb'+id+':" src="'+thfold+f.replace(/\:/, '/')+'" /></a>';
                    }
                ],
                '&img\t': [ 3, '<img src="{0}" alt="{1}" title="{2}" />'],
                '&iframe\t': [ 3, '<iframe src="{0}" width="{1}" height="{2}" />'],
                '&a\t': [ 2, '<a target="_blank" href="{0}" title="{1}">' ],
                '&br\t': [ 0, '<br />' ]
            };
        
        },
        
        /* Parse tablumps!
         * This implementation hopefully only uses simple string operations.
         */
        parse: function( data ) {
            if( !data )
                return '';
            
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
                cropping = this.tokens(working, lump[0]);
                
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
        },
        
        /* Return n tokens from any given input.
         * Tablumps contain arguments which are separated by tab characters. This
         * method is used to crop a specific number of arguments from a given
         * input.
         */
        tokens: function( data, limit, sep ) {
            sep = sep || '\t';
            tokens = [];
            
            for( i = limit; i > 0; i-- ) {
                find = data.indexOf(sep);
                if( find == -1 )
                    break;
                tokens.push( data.substring(0, find) );
                data = data.substring(find + 1);
            }
            
            return [tokens, data];
        },
        
    };
    
    tablumps.init(client);
    return tablumps;
    
}
