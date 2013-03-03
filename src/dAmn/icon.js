
wsc.dAmn.avatar = {};
wsc.dAmn.avatar.ext = [ 'gif', 'gif', 'jpg', 'png' ];

/**
 * Produces an avatar link.
 * 
 * @class avatar_link
 * @constructor
 */
wsc.dAmn.avatar.link = function( un, icon ) {
    
    var src = wsc.dAmn.avatar.src( un, icon );
    
    return '<a target="_blank" title=":icon'+un+':" href="http://'+un+'.deviantart.com/"><img class="avatar"\
            alt=":icon'+un+':" src="' + src + '" height="50" /></a>';
};


/**
 * Works out the src url for an avatar.
 *
 * @method src
 */
wsc.dAmn.avatar.src = function( un, icon ) {

    icon = parseInt(icon);
    var cachebuster = (icon >> 2) & 15;
    icon = icon & 3;
    var ext = wsc.dAmn.avatar.ext[icon] || 'gif';
    var ico = 'default';
    
    if (cachebuster) {
        cachebuster = '?' + cachebuster;
    }
    else {
        cachebuster = '';
    }
    
    if( icon != 0 ) {
        var ru = new RegExp('\\$un(\\[([0-9]+)\\])', 'g');
        
        var ico = '$un[0]/$un[1]/{un}'.replace(ru, function ( m, s, i ) {
            return un[i] == '-' ? '_' : un[i].toLowerCase();
        });
        ico = replaceAll( ico, '{un}', un.toLowerCase() );
    }
    
    return 'http://a.deviantart.net/avatars/' + ico + '.' + ext + cachebuster;
};