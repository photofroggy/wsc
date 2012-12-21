/**
 * Rendered message object.
 */
wsc.MessageString = function( data, parser ) {
    this._parser = parser || new wsc.MessageParser();
    this.raw = data;
    this._text = null;
    this._html = null;
    this._ansi = null;
};

with(wsc.MessageString.prototype = new String) {
    constructor = wsc.MessageParser;
    toString = valueOf = function() { return this.raw; };
}

wsc.MessageString.prototype.html = function(  ) {
    if(this._html == null)
        this._html = this._parser.render(1, this);
    return this._html;
};

/**
 * @function text
 *
 * Render the tablumps in plain text where possible. Some tablumps appear as
 * HTML entities even through this.
 */
wsc.MessageString.prototype.text = function() {
    if(this._text == null)
        this._text = this._parser.render(0, this);
    return this._text;
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
    if(this._ansi == null)
        this._ansi = this._parser.render(2, this);
    return this._ansi;
};

wsc.MessageParser = function(  ) {};

wsc.MessageParser.prototype.parse = function( data ) {

    return new wsc.MessageString(data, this);

};

wsc.MessageParser.prototype.render = function( mode, data ) {

    return data.raw;

};



