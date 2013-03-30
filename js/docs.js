
(function( $ ) {

    $('ul.tabs li a').on(
        'click',
        function( e ) {
            var em = $(this).parent();
            
            if( em.hasClass('active') )
                return false;
            
            var type = em.prop('id');
            var current = $('ul.tabs li.active');
            var ctype = current.prop('id');
            
            current.removeClass('active');
            $('div.index.' + ctype).css('display', 'none');
            $('.listing#' + ctype).css('display', 'none');
            
            em.addClass('active');
            $('div.index.' + type).css('display', 'block');
            $('.listing#' + type).css('display', 'block');
            
            return false;
        }
    );

})( Zepto );
