/**
 * Rendered message object.
 * 
 * @class wsc.MessageString
 * @constructor
 * @param data {String} Unparsed message.
 * @param [parser=wsc.MessageParser] {Object} Object used to parse messages.
 */
wsc.MessageString = function( data, parser ) {
    this._parser = parser || new wsc.MessageParser();
    this.raw = data;
};

with(wsc.MessageString.prototype = new String) {
    constructor = wsc.MessageParser;
    toString = valueOf = function() { return this.raw; };
}

/**
 * Render the message in HTML where possible.
 * @method html
 * @return {String} The message rendered as an HTML string
 */
wsc.MessageString.prototype.html = function(  ) {
    return this.raw;
};

/**
 * Render the message in plain text where possible.
 * @method text
 * @return {String} The message rendered as a plain text string
 */
wsc.MessageString.prototype.text = function() {
    return this.raw;
};

/**
 * Render the message with ANSI escape sequences.
 * @method ansi
 * @return {String} The message rendered as an ANSI-formatted string
 */
wsc.MessageString.prototype.ansi = function() {
    return this.raw;
};


/**
 * A parser for formatted messages.
 * 
 * @class wsc.MessageParser
 * @constructor
 */
wsc.MessageParser = function(  ) {};

/**
 * Parse a given message.
 * @method parse
 * @param data {String} Raw message data
 * @return {Object} Message string object.
 */
wsc.MessageParser.prototype.parse = function( data ) {

    return new wsc.MessageString(data, this);

};

/**
 * Render a given message string.
 * @method render
 * @param mode {Integer} Determine how the message should be rendered
 * @param data {Object} Message string to render
 * @return {String} Rendered message
 */
wsc.MessageParser.prototype.render = function( mode, data ) {

    return data.raw;

};



