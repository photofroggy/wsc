/**
 * WebSocket Chat client module.
 * 
 * @module wsc
 */
var wsc = {};
wsc.VERSION = '0.10.76';
wsc.STATE = 'beta';
wsc.defaults = {};
wsc.defaults.theme = 'wsct_default';
wsc.defaults.themes = [ 'wsct_default', 'wsct_dAmn' ];

wsc.base = {};
wsc.base.UI = function( view, options, mozilla, events ) {

    this.LIB = 'base';
    this.VERSION = '1';
    this.STATE = 'rc';
    this.channels = [];
    
};

wsc.base.UI.prototype.build = function(  ) {};
wsc.base.UI.prototype.on = function( event, handler ) {};
wsc.base.UI.prototype.loop = function(  ) {};
wsc.base.UI.prototype.create_channel = function( namespace, hidden ) {};
wsc.base.UI.prototype.remove_channel = function( namespace ) {};
wsc.base.UI.prototype.channel = function( namespace ) {};

wsc.base.UI.Channel = function( namespace, hidden ) {

    this.namespace = namespace;
    this.hidden = hidden;

};

wsc.defaults.UI = wsc.base.UI;
