
(function( $ ) {

    $.ajax({
        type: 'GET',
        url: '/wsc/js/dflong.json',
        complete: function( e ) {
            if( e.status != 200 )
                return;
            
            var data = JSON.parse(e.responseText);
            var entry = { name: 'name', description: 'description', ref: 'ref' };
            var link = '';
            var desc = '';
            var clist = $('nav.contents ul');
            var body = $('section.items');
            var count = 0;
            var exp = '';
            var title = '';
            
            for( var index in data ) {
                count++;
                entry = data[index];
                link = '<a href="#' + entry.ref + '">' + entry.name + '</a>';
                exp = entry.experimental ? '<span>experimental feature</span>' : '';
                title = '<h3>' + count + '. ' + entry.name + exp + '</h3>';
                desc = '<section class="description">' + entry.description.join('') + '</section>';
                
                clist.append('<li>' + count + '. ' + link + '</li>');
                body.append('<article class="item" id="' + entry.ref + '">' + title + desc + '</article>');
            }
            
            if( !window.location.hash )
                return;
            
            var el = $(window.location.hash)[0];
            
            if( !el )
                return;
            
            $('body')[0].scrollTop = el.offsetTop - 10;
            
        }
    });

})( Zepto );
