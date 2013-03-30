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

wsc.MessageString.prototype.html = function(  ) {
    return this.raw;
};

/**
 * @function text
 *
 * Render the tablumps in plain text where possible. Some tablumps appear as
 * HTML entities even through this.
 */
wsc.MessageString.prototype.text = function() {
    return this.raw;
};

/**
 * @function ansi
 * 
 * Render the tablumps with ANSI escape sequences.
 * 
 * For this rendering method to really be worth it, I'll actually have to move
 * away from the simple regex.
 */
wsc.MessageString.prototype.ansi = function() {
    return this.raw;
};

wsc.MessageParser = function(  ) {};

wsc.MessageParser.prototype.parse = function( data ) {

    return new wsc.MessageString(data, this);

};

wsc.MessageParser.prototype.render = function( mode, data ) {

    return data.raw;

};



