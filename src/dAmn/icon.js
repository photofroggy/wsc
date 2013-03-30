
/**
 * This object provides a few helper functions relating to deviantART avatars.
 * 
 * @class dAmn.avatar
 */
wsc.dAmn.avatar = {};

/**
 * An array containing the different file types avatars can be.
 *
 * @property ext
 * @type Array
 * @default [ 'gif', 'gif', 'jpg', 'png' ]
 */
wsc.dAmn.avatar.ext = [ 'gif', 'gif', 'jpg', 'png' ];

/**
 * Produces an avatar link.
 * 
 * @method link
 * @param un {String} Username to generate an avatar link for
 * @param icon {String} Icon number as provided by dAmn's protocol
 * @return {String} Valid avatar link
 */
wsc.dAmn.avatar.link = function( un, icon ) {
    
    var src = wsc.dAmn.avatar.src( un, icon );
    
    return '<a target="_blank" title=":icon'+un+':" href="http://'+un+'.deviantart.com/"><img class="avatar"\
            alt=":icon'+un+':" src="' + src + '" height="50" /></a>';
};


/**
 * Works out the source url for an avatar.
 *
 * @method src
 * @param un {String} Username to resolve the avatar source for
 * @param icon {String} The user's icon number
 * @return {String} The source URL
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