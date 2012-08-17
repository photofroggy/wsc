/*
 * wsc/ui/nav.js - photofroggy
 * Object to control the UI for the chat navigation.
 */

/**
 * Navigation UI element. Provides helpers for controlling the chat navigation.
 *
 * @class WscUINavigation
 * @constructor
 * @param ui {Object} WscUI object.
 */
function WscUINavigation( ui ) {

    this.manager = ui;
    this.nav = this.manager.view.find('nav.tabs');
    this.tabs = this.manager.view.find('#chattabs');

}

/**
 * Get the height of the navigation bar.
 *
 * @method height
 * @return {Integer} The height of the navigation bar in pixels.
 */
WscUINavigation.prototype.height = function(  ) {
    return this.nav.height();
};

/**
 * Add a channel tab to the navigation bar.
 * 
 * @method add_tab
 * @param selector {String} Shorthand lower case name for the channel with no prefixes.
 * @param ns {String} Shorthand namespace for the channel. Used as the label
 *   for the tab.
 */
WscUINavigation.prototype.add_tab = function( selector, ns ) {
    this.tabs.append(wsc_html_chattab.replacePArg('{selector}', selector).replacePArg('{ns}', ns));
    return this.tabs.find('#' + selector + '-tab');
};
