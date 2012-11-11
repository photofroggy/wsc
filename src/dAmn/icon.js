
wsc.dAmn.avatar = {};
wsc.dAmn.avatar.ext = [ 'gif', 'gif', 'jpg', 'png' ];

/**
 * Produces an avatar link.
 * 
 * @class avatar_link
 * @constructor
 */
wsc.dAmn.avatar.link = function( un, icon ) {
    icon = parseInt(icon);
    cachebuster = (icon >> 2) & 15;
    icon = icon & 3;
    ext = wsc.dAmn.avatar.ext[icon] || 'gif';
    
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
        ico = replaceAll( ico, '{un}', un.toLowerCase() );
    }
    
    return '<a target="_blank" title=":icon'+un+':" href="http://'+un+'.deviantart.com/"><img class="avatar"\
            alt=":icon'+un+':" src="http://a.deviantart.net/avatars/'+ico+'.'+ext+cachebuster+'" height="50" width="50" /></a>';
};
