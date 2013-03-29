
(function( $ ) {

    $.ajax({
        type: 'GET',
        url: '/wsc/js/dfshort.json',
        complete: function( e ) {
            if( e.status != 200 )
                return;
            
            var data = JSON.parse(e.responseText);
            var entry = { name: 'name', description: 'description', ref: 'ref' };
            var link = '';
            var clist = $('ul.complete');
            
            for( var index in data.complete ) {
                entry = data.complete[index];
                link = '<b>' + ( entry.experimental ? '<em>' : '' ) + '<a href="features.html#' + entry.ref + '">';
                link+= entry.name + '</a>' + ( entry.experimental ? '</em>' : '' ) + ':</b>';
                clist.append('<li>' + link + ' <i>' + entry.description + '<i></li>');
            }
        }
    });

})( Zepto );
