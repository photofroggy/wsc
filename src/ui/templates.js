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

    if( !Chatterbox.template.hasOwnProperty(template) )
        return '';
    
    html = Chatterbox.template[template];
    
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
            <li><a href="#settings" title="Change client settings" class="button iconic cog"></a></li>\
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
                        
Chatterbox.template.loginfobox = '<li class="loginfo {ref}"><a href="#{ref}" class="close iconic x"></a>{content}</li>';
Chatterbox.template.whois = {};
Chatterbox.template.whoiswrap = '<div class="whoiswrap">\
                                <div class="avatar">{avatar}</div>\
                                <div class="info">{info}</div>\
                                </div>';
Chatterbox.template.whoisinfo = '<p>{username}</p><ul>{info}</ul>{connections}';
