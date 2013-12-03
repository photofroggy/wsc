/**
 * Ignore extension.
 * 
 * Implements the ignore functionality.
 */
wsc.defaults.Extension.Ignore = function( client, ext ) {

    var settings = {};
    var storage = client.storage.folder('ignore');
    ext.ignore = {
        fignore: '/me is ignoring {user} now',
        funignore: '/me is not ignoring {user} anymore',
        ignored: []
    };
    
    var init = function(  ) {
    
        ext.ignore.load();
        ext.ignore.save(); // Just in case we don't have the stuff stored in the first place.
        
        // Commands
        client.bind('cmd.ignore', cmd_ignore);
        client.bind('cmd.unignore', cmd_unignore);
    
    };
    
    ext.ignore.load = function(  ) {
        
        ext.ignore.fignore = storage.get('ignore', ext.ignore.fignore);
        ext.ignore.funignore = storage.get('unignore', ext.ignore.funignore);
        ext.ignore.ignored = JSON.parse( storage.get('ignored', JSON.stringify(ext.ignore.ignored)) );
        
        client.trigger( 'ignore.loaded', {
            name: 'ignore.loaded',
            ignored: ext.ignore.ignored
        } );
        
    };
    
    ext.ignore.save = function(  ) {
    
        storage.set('ignore', ext.ignore.fignore);
        storage.set('unignore', ext.ignore.funignore);
        storage.set('ignored', JSON.stringify(ext.ignore.ignored));
    
    };
    
    ext.ignore.add = function( user, suppress ) {
    
        var user = user.split(' ');
        var u = '';
        suppress = suppress || false;
        
        for( var i = 0; i < user.length; i++ ) {
        
            if( !user.hasOwnProperty( i ) )
                continue;
            
            u = user[i].toLowerCase();
            
            if( ext.ignore.ignored.indexOf( u ) != -1 )
                continue;
            
            ext.ignore.ignored.push( u );
            client.trigger( 'ignore.add', {
                name: 'ignore.add',
                user: user[i],
                suppress: suppress
            } );
        
        }
        
        ext.ignore.save();
    
    };
    
    ext.ignore.remove = function( user, suppress ) {
    
        var user = user.split(' ');
        var u = '';
        var iidex = -1;
        suppress = suppress || false;
        
        for( var i = 0; i < user.length; i++ ) {
        
            if( !user.hasOwnProperty( i ) )
                continue;
            
            u = user[i].toLowerCase();
            iidex = ext.ignore.ignored.indexOf( u );
            
            if( iidex == -1 )
                continue;
            
            ext.ignore.ignored.splice( iidex, 1 );
            
            client.trigger( 'ignore.remove', {
                name: 'ignore.remove',
                user: user[i],
                suppress: suppress
            } );
        
        }
        
        ext.ignore.save();
    
    };
    
    var cmd_ignore = function( cmd ) {
    
        ext.ignore.add( cmd.args );
    
    };
    
    var cmd_unignore = function( cmd ) {
    
        ext.ignore.remove( cmd.args );
    
    };
    
    init();

};

