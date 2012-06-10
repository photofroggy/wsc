/* wsc extension - photofroggy
 * Base object for extensions to use. Nothing fancy really.
 */

// Create our extension and return it.
function wsc_extbase( client ) {

    var extension = {
    
        client: null,
        
        init: function( client ) {
            this.client = client;
        },
    };
    
    extension.init( client );
    return extension;
    
}