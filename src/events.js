// Taken from dAmnAIR by philo23
// dAmnAIR - http://botdom.com/wiki/DAmnAIR
// philo23 on deviantART - http://philo23.deviantart.com/

/*
 * EventEmitter
 * Simple event framework, based off of NodeJS's EventEmitter
 * @class EventEmitter
 * @constructor
 **/
function EventEmitter() {
    var events = {}, self = this;

    function addListener(event, listener) {
        var callbacks = events[event] || false;
        if(callbacks === false) {
            events[event] = [listener];
            return self;
        }
        events[event].unshift(listener);
        return self;
    }

    function removeListeners(event) {
        events[event] = [];
        return self;
    }

    function emit() {
        var args = Array.prototype.slice.call(arguments);
        var event = args.shift();
        var callbacks = events[event] || false;
        var called = 0;
        if(callbacks === false) {
            return called;
        }
        for(var i in callbacks) {
            if(callbacks.hasOwnProperty(i)) {
                bubble = callbacks[i].apply({}, args);
                called++;
                if( bubble === false )
                    break;
            }
        }
        return called;
    }

    function listeners(event) {
        return events[event] || [];
    }


    this.addListener = addListener;
    this.removeListeners = removeListeners;
    this.emit = emit;
    this.listeners = listeners;
}