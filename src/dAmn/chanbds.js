
wsc.dAmn.BDS.Channel = function( client, storage, settings ) {

    var init = function(  ) {
        client.bind('BDS.CHANNEL.NEW', handler.newc);
        client.bind('BDS.CHANNEL.DESTROYED', handler.destroyed);
        client.bind('BDS.CHANNEL.RESERVED', handler.reserved);
        client.bind('BDS.CHANNEL.REGISTERED', handler.registered);
        client.bind('BDS.CHANNEL.ACKREG', handler.ackreg);
        client.bind('BDS.CHANNEL.MESSAGE', handler.message);
        client.bind('BDS.CHANNEL.END', handler.end);
        client.bind('BDS.CHANNEL.FAILED', handler.failed);
    };
    
    var handler = {
        newc: null,
        destroyed: null,
        reserved: null,
        ackreg: null,
        message: null,
        end: null,
        failed: null
    };
    
    init();

};