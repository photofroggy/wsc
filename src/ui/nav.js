/**
 * wsc/ui/nav.js - photofroggy
 * Object to control the UI for the chat navigation.
 */

function WscUINavigation( ui ) {

    this.manager = ui;
    this.nav = this.manager.view.find('nav.tabs');
    this.tabs = this.manager.view.find('#chattabs');

}

WscUINavigation.prototype.height = function(  ) {
    return this.nav.outerHeight(true);
};

WscUINavigation.prototype.add_tab = function( selector, ns ) {
    this.tabs.append(wsc_html_chattab.replacePArg('{selector}', selector).replacePArg('{ns}', ns));
    return this.tabs.find('#' + selector + '-tab');
};
