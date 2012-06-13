/* wsc html - photofroggy
 * Provides HTML5 templates for the chat UI.
 */

// Chat UI.
wsc_html_ui = '<nav class="tabs"><ul id="chattabs"></ul>\
        <ul id="tabnav">\
            <li><a href="#left" class="button">&laquo;</a></li>\
            <li><a href="#right" class="button">&raquo;</a></li>\
        </ul>\
        </nav>\
        <div class="chatbook"></div>';

wsc_html_control = '<div class="chatcontrol">\
            <form class="msg">\
                <input type="text" class="msg" />\
                <input type="submit" value="Send" class="sendmsg" />\
            </form>\
        </div>';

// Channel templates.
// Chat tab.
var wsc_html_chattab = '<li id="{selector}-tab"><a href="#{selector}">{ns}</a></li>';

// Chat screen.
var wsc_html_channel = '<div class="chatwindow" id="{selector}-window">\
                    <header>\
                        <div class="title"></div>\
                    </header>\
                    <div class="chatlog" id="{selector}-log">\
                        <header>\
                            <div class="topic"></div>\
                        </header>\
                        <div class="logwrap"></div>\
                    </div>\
                    <div class="chatusers" id="{selector}-users">\
                </div>\
            </div>';

// Channel header HTML.
var wsc_html_cheader = '<div class="{head}">{content}</div>';

// Log message template.
var wsc_html_logmsg = '<span class="message">{message}</span>';

// Simple log template.
var wsc_html_logitem = '<p class="logmsg"><span class="ts">{ts}</span> {message}</p>';

// Server message template.
var wsc_html_servermsg = '<span class="servermsg">** {message} * <em>{info}</em></span>';

// User message template.
var wsc_html_usermsg = '<strong class="user">&lt;{user}&gt;</strong> {message}';
