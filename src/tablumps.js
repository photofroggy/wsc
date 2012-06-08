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
 *
 * At the moment we use regular expressions to parse tablumps, this is
 * a terrible idea! TODO: Use simpler string operations to avoid using regex
 * everywhere. To do this we need to define the tablump syntax a little more
 * concretely.
 */

// Create a tablump parser object.
function wsc_tablumps( client ) {
    
    var tablumps = {
        client: null,
        expressions: null,
        replace: null,
        titles: null,
        subs: null,
    
        init: function( client ) {
            // Populate the expressions and replaces used when parsing tablumps.
            if( this.expressions )
                return;
            this.client = client;
            var domain = client.settings['domain'];
            var dav = client.settings['defaultavatar'];
            var avfold = client.settings['avatarfolder'];
            var avfile = client.settings['avatarfile'];
            var emfold = client.settings['emotefolder'];
            var thfold = client.settings['thumbfolder'];
            // Regular expression objects used to find any complicated tablumps.
            this.expressions = [
                new RegExp('\&avatar\t([a-zA-Z0-9-]+)\t([0-9]+)\t', 'g'),
                new RegExp('\&dev\t(.)\t([a-zA-Z0-9-]+)\t', 'g'),
                new RegExp("\&emote\t([^\t]+)\t([0-9]+)\t([0-9]+)\t(.*?)\t([a-z0-9./=-_]+)\t", 'g'),
                new RegExp("\&a\t([^\t]+)\t([^\t]*)\t", 'g'),
                new RegExp("\&link\t([^\t]+)\t&\t", 'g'),
                new RegExp("\&link\t([^\t]+)\t([^\t]+)\t&\t", 'g'),
                new RegExp("\&acro\t([^\t]+)\t(.*)&\/acro\t", 'g'),
                new RegExp("\&abbr\t([^\t]+)\t(.*)&\/abbr\t", 'g'),
                //new RegExp("\&thumb\t(?P<ID>[0-9]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t", 'g'),
                new RegExp("\&img\t([^\t]+)\t([^\t]*)\t([^\t]*)\t", 'g'),
                new RegExp("\&iframe\t([^\t]+)\t([0-9%]*)\t([0-9%]*)\t&\/iframe\t", 'g'),
            ]
            this.titles = ['avatar', 'dev', 'emote', 'a', 'link', 'link', 'acronym', 'abbr', 'thumb', 'img', 'iframe'];
            // Regular expression objects used to find and replace complicated tablumps.
            this.subs = [
                [new RegExp("\&avatar\t([a-zA-Z0-9-]+)\t([0-9]+)\t", 'g'),
                    function( match, un, icon ) {
                        ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
                    
                        function repl( m, s, i ) {
                            return un[i].toLowerCase();
                        }
                        
                        ico = avfile.replace(ru, repl);
                        ico = icon == '0' ? dav : ico.replacePArg( '{un}', un.toLowerCase() );
                        return '<a target="_blank" title=":icon'+un+':" href="http://$1.'+domain+'"><img class="avatar"\
                                alt=":icon$1:" src="'+avfold+ico+'" height="50" width="50" /></a>';
                    }],
                [new RegExp("\&dev\t(.)\t([a-zA-Z0-9-]+)\t", 'g'),
                    '$1<a target="_blank" alt=":dev$2:" href="http://$2.'+domain+'/">$2</a>'],
                [new RegExp("\&emote\t([^\t]+)\t([0-9]+)\t([0-9]+)\t(.*?)\t([a-z0-9./=-_]+)\t", 'g'),
                    '<img alt="$1" width="$2" height="$3" title="$4" src="'+emfold+'$5" />'],
                [new RegExp("\&a\t([^\t]+)\t([^\t]*)\t", 'g'), "<a target=\"_blank\" href=\"$1\" title=\"$2\">"],
                [new RegExp("\&link\t([^\t]+)\t&\t", 'g'), "<a target=\"_blank\" href=\"$1\">[link]</a>"],
                [new RegExp("\&link\t([^\t]+)\t([^\t]+)\t&\t", 'g'), "<a target=\"_blank\" href=\"$1\" title=\"$2\">$2</a>"],
                [new RegExp("\&acro\t([^\t]+)\t", 'g'), "<acronym title=\"$1\">"],
                [new RegExp("\&abbr\t([^\t]+)\t", 'g'), "<abbr title=\"$1\">"],
                [new RegExp("\&thumb\t([0-9]+)\t([^\t]+)\t([^\ta-zA-Z0-9])([^\t]+)\t([0-9]+)x([[0-9]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t", 'g'), 
                    function( match, id, t, s, u, w, h, b, f ) {
                        return '<a target="_blank" href="http://' + u + '.'+domain+'/art/' + t.replacePArg(' ', '-') + '-' + id + '"><img class="thumb" title="' + t + ' by ' + s + u + ', ' + w + 'x' + h + '" width="'+w+'"\
                                height="'+h+'" alt=":thumb'+id+':" src="'+thfold+f.replace(/\:/, '/')+'" /></a>';
                    }
                ],
                // <img class="thumb" title=":stare: by ~Link3Kokiri, 15x15" width="15" height="15" alt=":thumb$1:" src="http://fc03.deviantart.net/fs70/f/2010/222/1/5/_stare__by_Link3Kokiri.png">
                [new RegExp("\&thumb\t([0-9]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t", 'g'), "<abbr title=\"$2\">:thumb$1:</abbr>"],
                [new RegExp("\&img\t([^\t]+)\t([^\t]*)\t([^\t]*)\t", 'g'), "<img src=\"$1\" alt=\"$2\" title=\"$3\" />"],
                [new RegExp("\&iframe\t([^\t]+)\t([0-9%]*)\t([0-9%]*)\t&\/iframe\t", 'g'), "<iframe src=\"$1\" width=\"$2\" height=\"$3\" />"],
                [new RegExp("<([^>]+) (width|height|title|alt)=\"\"([^>]*?)>", 'g'), "<$1$3>"],
            ];
            // Search and replace pairs used to parse simple HTML tags.
            this.replace = [
                [new RegExp(EscapeRegExp("&b\t"), 'g'), "<b>"],
                [new RegExp(EscapeRegExp("&/b\t"), 'g'), "</b>"],
                [new RegExp(EscapeRegExp("&i\t"), 'g'), "<i>"],
                [new RegExp(EscapeRegExp("&/i\t"), 'g'), "</i>"],
                [new RegExp(EscapeRegExp("&u\t"), 'g'), "<u>"],
                [new RegExp(EscapeRegExp("&/u\t"), 'g'), "</u>"],
                [new RegExp(EscapeRegExp("&s\t"), 'g'), "<s>"],
                [new RegExp(EscapeRegExp("&/s\t"), 'g'), "</s>"],
                [new RegExp(EscapeRegExp("&sup\t"), 'g'), "<sup>"],
                [new RegExp(EscapeRegExp("&/sup\t"), 'g'), "</sup>"],
                [new RegExp(EscapeRegExp("&sub\t"), 'g'), "<sub>"],
                [new RegExp(EscapeRegExp("&/sub\t"), 'g'), "</sub>"],
                [new RegExp(EscapeRegExp("&code\t"), 'g'), "<code>"],
                [new RegExp(EscapeRegExp("&/code\t"), 'g'), "</code>"],
                [new RegExp(EscapeRegExp("&p\t"), 'g'), "<p>"],
                [new RegExp(EscapeRegExp("&/p\t"), 'g'), "</p>"],
                [new RegExp(EscapeRegExp("&ul\t"), 'g'), "<ul>"],
                [new RegExp(EscapeRegExp("&/ul\t"), 'g'), "</ul>"],
                [new RegExp(EscapeRegExp("&ol\t"), 'g'), "<ol>"],
                [new RegExp(EscapeRegExp("&/ol\t"), 'g'), "</ol>"],
                [new RegExp(EscapeRegExp("&li\t"), 'g'), "<li>"],
                [new RegExp(EscapeRegExp("&/li\t"), 'g'), "</li>"],
                [new RegExp(EscapeRegExp("&bcode\t"), 'g'), "<bcode>"],
                [new RegExp(EscapeRegExp("&/bcode\t"), 'g'), "</bcode>"],
                [new RegExp(EscapeRegExp("&br\t"), 'g'), "\n"],
                [new RegExp(EscapeRegExp("&/a\t"), 'g'), "</a>"],
                [new RegExp(EscapeRegExp("&/acro\t"), 'g'), "</acronym>"],
                [new RegExp(EscapeRegExp("&/abbr\t"), 'g'), "</abbr>"]
            ];
        
        },
        
        // Parse any dAmn Tablumps found in our input data.
        // 
        // This method will simply return a string with the tablumps
        // parsed into readable formats.
        parse: function( data ) {
            if( !data )
                return '';
            for( i in this.replace ) {
                lump = this.replace[i][0];
                repl = this.replace[i][1];
                data = data.replace(lump, repl);
           }
           for( i in this.subs ) {
                expression = this.subs[i][0];
                repl = this.subs[i][1];
                //if( typeof(repl) == 'function' )
                //    data = repl(data, expression);
                //else
                    data = data.replace(expression, repl);
            }
            return data.replace(/\n/gm, "<br/>") ;
        },
    
        /* Return any dAmn Tablumps found in our input data.
         *
         * Rather than parsing the tablumps, this method returns the
         * data given by tablumps. This only works for tablumps where
         * a regular expression is used for parsing.                    */
        capture: function( text ) {
            lumps = {};
            for( i in this.expressions ) {
                expression = self.expressions[i];
                cc = false; //expression.findall(text);
                if( !cc )
                    continue;
                lumps[this.titles[i]] = cc;
            }
            return lumps;
        },
    };
    
    tablumps.init(client);
    return tablumps;
    
}
