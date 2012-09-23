/**
 * Container object for HTML5 templates for the chat UI.
 * 
 * @class template
 */
Chatterbox.template = {};

/**
 * Helper method to render templates.
 * This method is actually a static method on the Chatterbox module.
 * 
 * @method render
 * @param template {String} Name of the template to render.
 * @param fill {Object} Variables to render the template with.
 */
Chatterbox.render = function( template, fill ) {

    html = Chatterbox.template;
    tparts = template.split('.');
    
    for( ind in tparts ) {
        part = tparts[ind];
        if( !html.hasOwnProperty( part ) )
            return '';
        html = html[part];
    }
    
    for( key in fill ) {
        if( !fill.hasOwnProperty(key) )
            continue;
        html = replaceAll(html, '{'+key+'}', fill[key]);
    }
    
    return html;

};

/**
 * This template provides the HTML for a chat client's main view.
 *
 * @property ui
 * @type String
 */
Chatterbox.template.ui = '<nav class="tabs"><ul id="chattabs"></ul>\
        <ul id="tabnav">\
            <li><a href="#left" class="button iconic arrow_left"></a></li>\
            <li><a href="#right" class="button iconic arrow_right"></a></li>\
            <li><a href="#settings" title="Change client settings" class="button iconic cog" id="settings-button"></a></li>\
        </ul>\
        </nav>\
        <div class="chatbook"></div>';

/**
 * HTML for an input panel.
 * 
 * @property control
 * @type String
 */
Chatterbox.template.control = '<div class="chatcontrol">\
            <p><a href="#multiline" title="Toggle multiline input" class="button iconic list"></a></p>\
            <form class="msg">\
                <input type="text" class="msg" />\
                <input type="submit" value="Send" class="sendmsg" />\
            </form>\
        </div>';

/**
 * HTML for a channel tab.
 * 
 * @property tab
 * @type String
 */
Chatterbox.template.tab = '<li id="{selector}-tab"><a href="#{selector}" class="tab">{ns}<a href="#{selector}" class="close iconic x"></a></a></li>';

/**
 * HTML template for a channel view.
 * 
 * @property channel
 * @type String
 */
Chatterbox.template.channel = '<div class="chatwindow" id="{selector}-window">\
                    <header>\
                        <div class="title"></div>\
                    </header>\
                    <div class="chatlog" id="{selector}-log">\
                        <header>\
                            <div class="topic"></div>\
                        </header>\
                        <ul class="logwrap"></ul>\
                    </div>\
                    <div class="chatusers" id="{selector}-users">\
                </div>\
            </div>';

/**
 * Channel header HTML template.
 * 
 * @property header
 * @type String
 */
Chatterbox.template.header = '<div class="{head}">{content}</div>';

/**
 * Log message template.
 * 
 * @property logmsg
 * @type String
 */
Chatterbox.template.logmsg = '<span class="message">{message}</span>';

/**
 * Simple log template.
 * 
 * @property logitem
 * @type String
 */
Chatterbox.template.logitem = '<li class="logmsg"><span class="ts">{ts}</span> {message}</li>';

/**
 * Server message template.
 * 
 * @property servermsg
 * @type String
 */
Chatterbox.template.servermsg = '<span class="servermsg">** {message} * <em>{info}</em></span>';

/**
 * User message template.
 * 
 * @property usermsg
 * @type String
 */
Chatterbox.template.usermsg = '<strong class="user">&lt;{user}&gt;</strong> {message}';

/**
 * User info box (userlist hover)
 * 
 * @property userinfo
 * @type String
 */
Chatterbox.template.userinfo = '<div class="userinfo" id="{username}">\
                            <div class="avatar">\
                                {avatar}\
                            </div><div class="info">\
                            <strong>\
                            {link}\
                            </strong>\
                            <ul>{info}</ul></div>\
                        </div>';

/**
 * Container for popup shit.
 * 
 * @property popup
 * @type String
 */
Chatterbox.template.popup = '<div class="floater"><div class="inner">{content}</div></div>';

/**
 * Settings stuff.
 *
 * @class settings
 */
Chatterbox.template.settings = {};

Chatterbox.template.settings.main = '<h2>Settings<a href="#closesettings" class="close iconic x"></a></h2>\
                            <nav class="tabs">\
                                <ul>{tabs}</ul>\
                            </nav>\
                            <div class="book">\
                                {pages}\
                            </div>';


Chatterbox.template.settings.page = '<div class="page" id="{ref}-page">\
                                {content}\
                            </div>';

Chatterbox.template.settings.tab = '<li><a href="#{ref}" class="tab" id="{ref}-tab">{name}</a></li>';


Chatterbox.template.settings.item = '<div class="item {type} {ref}">\
                                    {content}\
                                </div>';

