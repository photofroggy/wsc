/**
 * Popup window base class.
 * Should allow people to easily create popups... or something.
 * Subclasses of the popups should provide a way of closing the popup, or
 * maybe I could change things around a bit so there's always a close button in
 * the top right corner. That said, the settings window looks good with the
 * close button at the bottom. Maybe make that configurable. Use a flag to
 * determine whether or not this class applies the close function or not?
 * 
 * @class Popup
 * @constructor
 * @param ui {Object} Chatterbox.UI object.
 */
Chatterbox.Popup = function( ui, options ) {

    this.manager = ui;
    this.window = null;
    this.closeb = null;
    this.options = Object.extend({
        'ref': 'popup',
        'title': 'Popup',
        'close': true,
        'content': ''
    }, (options || {}));

};

/**
 * Build the popup window.
 * This should be pretty easy.
 *
 * @method build
 */
Chatterbox.Popup.prototype.build = function(  ) {

    var fill = this.options;
    
    if( this.options.close ) {
        fill.title+= '<a href="#close" class="button close medium iconic x"></a>';
    }
    
    this.manager.view.append(Chatterbox.render( 'popup', fill ));
    this.window = this.manager.view.find('.floater.' + fill.ref);
    
    if( this.options.close ) {
        this.closeb = this.window.find('a.close');
        var popup = this;

        this.closeb.click(
            function( event ) {
                popup.close();
                return false;
            }
        );
    }

};

/**
 * Close the popup.
 * 
 * @method close
 */
Chatterbox.Popup.prototype.close = function(  ) {
    
    this.window.remove();
    
};

/**
 * Prompt popup.
 * This should be used for retrieving input from the user.
 */
Chatterbox.Popup.Prompt = function( ui, options ) {

    options = options || {};
    options = Object.extend( {
        'position': [0, 0],
        'ref': 'prompt',
        'title': 'Input',
        'close': false,
        'label': '',
        'default': '',
        'submit-button': 'Submit',
        'event': {
            'submit': function(  ) {},
            'cancel': function(  ) {}
        }
    }, options );
    
    Chatterbox.Popup.call( this, ui, options );
    this.data = this.options['default'];

};

Chatterbox.Popup.Prompt.prototype = new Chatterbox.Popup();
Chatterbox.Popup.Prompt.prototype.constructor = Chatterbox.Popup.Prompt;

/**
 * Build the prompt.
 * 
 * @method build
 */
Chatterbox.Popup.Prompt.prototype.build = function(  ) {

    this.options.content = Chatterbox.template.prompt.main;
    Chatterbox.Popup.prototype.build.call(this);
    this.window.css({
        'left': this.options.position[0],
        'top': this.options.position[1]
    });
    
    var prompt = this;
    
    this.window.find('.button.close').click( function(  ) {
        prompt.options.event.cancel( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('.button.submit').click( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );
    
    this.window.find('form').submit( function(  ) {
        prompt.data = prompt.window.find('input').val();
        prompt.options.event.submit( prompt );
        prompt.close();
        return false;
    } );

};

/**
 * Emote picker.
 * This should be used for retrieving input from the user.
 */
Chatterbox.Popup.ItemPicker = function( ui, options ) {

    options = options || {};
    options = Object.extend( {
        'position': [10, 60],
        'ref': 'item-picker',
        'title': 'Items',
        'event': {
            'select': function( item ) {}
        }
    }, options );
    
    Chatterbox.Popup.call( this, ui, options );
    this.data = this.options['default'];
    this.pages = [];
    this.cpage = null;

};

Chatterbox.Popup.ItemPicker.prototype = new Chatterbox.Popup();
Chatterbox.Popup.ItemPicker.prototype.constructor = Chatterbox.Popup.ItemPicker;

Chatterbox.Popup.ItemPicker.prototype.build = function(  ) {

    this.options.content = Chatterbox.render('ip.main', {});
    Chatterbox.Popup.prototype.build.call(this);
    this.window.css({
        'left': this.options.position[0],
        'bottom': this.options.position[1]
    });
    this.closeb.removeClass('medium');
    this.pbook = this.window.find('section.pages');
    this.tabs = this.window.find('section.tabs ul');
    this.buttons = this.window.find('section.buttons');
    
    var ip = this;
    var page = null;
    
    for( var i in this.pages ) {
        if( !this.pages.hasOwnProperty(i) )
            continue;
        page = this.pages[i];
        page.build();
        if( i == 0 )
            this.select_page(page);
    }

};

Chatterbox.Popup.ItemPicker.prototype.refresh = function(  ) {
    
    if( this.cpage == null ) {
        return;
    } else {
        this.cpage.refresh();
    }

};

Chatterbox.Popup.ItemPicker.prototype.page = function( name, dpage ) {

    name = name.toLowerCase();
    
    for( var i in this.pages ) {
        if( !this.pages.hasOwnProperty(i) )
            continue;
        if( this.pages[i].name.toLowerCase() == name )
            return this.pages[i];
    }
    
    return (dpage || null);

};

Chatterbox.Popup.ItemPicker.prototype.add_page = function( options, pclass ) {

    this.pages.push( new ( pclass || Chatterbox.Popup.ItemPicker.Page )( this, options ) );

};

Chatterbox.Popup.ItemPicker.prototype.add_button = function( options ) {

    options = Object.extend( {
        'href': '#button',
        'title': 'Button',
        'label': 'Button'
    }, ( options || {} ) );
    
    this.buttons.append(Chatterbox.render( 'ip.button', options ));
    return this.buttons.find('a[href='+options.href+']');

};

Chatterbox.Popup.ItemPicker.prototype.select = function( item ) {

    this.options.event.select(item);

};

Chatterbox.Popup.ItemPicker.prototype.select_page = function( page ) {

    if( !page )
        return;
    
    if( this.cpage != null )
        this.cpage.hide();
    
    this.cpage = page || null;
    
    if( this.cpage != null )
        this.cpage.show();

};

Chatterbox.Popup.ItemPicker.Page = function( picker, options ) {

    this.picker = picker;
    this.options = Object.extend( {
        'ref': 'page',
        'href': '#page',
        'label': 'Page',
        'title': 'page',
        'items': [],
        'content': '',
    }, ( options || {} ));
    this.name = this.options.label;

};

Chatterbox.Popup.ItemPicker.Page.prototype.build = function(  ) {

    var list = this.build_list();
    if( list.length == 0 ) {
        this.options.content = '<em>No items on this page.</em>';
    } else {
        this.options.content = '<ul>' + list + '</ul>';
    }
    
    this.picker.pbook.append( Chatterbox.render('ip.page', this.options) );
    this.picker.tabs.append(Chatterbox.render('ip.tab', this.options));
    this.view = this.picker.pbook.find('div.page#'+this.options.ref);
    this.items = this.view.find('ul');
    this.tab = this.picker.tabs.find('#'+this.options.ref);
    this.hook_events();
    
    var page = this;
    this.tab.find('a').click( function(  ) {
        page.picker.select_page( page );
        return false;
    } );

};

Chatterbox.Popup.ItemPicker.Page.prototype.refresh = function(  ) {

    var content = this.build_list();
    if( content.length == 0 ) {
        this.options.content = '<em>No items on this page.</em>';
    } else {
        this.options.content = '<ul>' + content + '</ul>';
    }
    this.view.html(this.options.content);
    this.items = this.view.find('ul');
    this.hook_events();

};

Chatterbox.Popup.ItemPicker.Page.prototype.hook_events = function(  ) {

    var page = this;
    this.items.find('li').each( function( index, elem ) {
        var obj = page.view.find(elem);
        var item = obj.find('.value').html();
        obj.click( function(  ) {
            page.picker.select(item);
        } );
    } );

};

Chatterbox.Popup.ItemPicker.Page.prototype.build_list = function(  ) {

    var ul = [];
    var item = null;
    var title, val, html;
    for( var i in this.options.items ) {
        if( !this.options.items.hasOwnProperty(i) )
            continue;
        item = this.options.items[i];
        val = item.value || item;
        title = item.title || val;
        html = item.html || false;
        ul.push(
            '<li class="item" title="'+title+'">\
            <span class="hicon"><i class="iconic check"></i></span>\
            '+ ( html ? val : '<span class="value">'+val+'</span>' ) + '\
            </li>'
        );
    }
    
    return ul.join('');

};

Chatterbox.Popup.ItemPicker.Page.prototype.show = function(  ) {

    this.tab.addClass('selected');
    this.view.css('display', 'block');
    this.refresh();

};

Chatterbox.Popup.ItemPicker.Page.prototype.hide = function(  ) {

    this.tab.removeClass('selected');
    this.view.css('display', 'none');
    this.view.find('ul').remove();

};







