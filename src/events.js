// Taken from dAmnAIR by philo23
// dAmnAIR - http://botdom.com/wiki/DAmnAIR
// philo23 on deviantART - http://philo23.deviantart.com/
/**
 * EventEmitter
 * Simple event framework, based off of NodeJS's EventEmitter
 **/
function EventEmitter() {
    var events = {}, self = this;

    function addListener(event, listener) {
        var callbacks = events[event] || false;
        if(callbacks === false) {
            events[event] = [listener];
            return self;
        }
        events[event].push(listener);
        return self;
    }

    function removeListeners(event) {
        events[event] = [];
        return self;
    }

    function emit(event, args) {
        //var args = Array.prototype.slice.call(arguments);
        //var event = args.shift();
        var callbacks = events[event] || false;
        if(callbacks === false) {
            return self;
        }
        for(var i in callbacks) {
            if(callbacks.hasOwnProperty(i)) {
                callbacks[i](args);
            }
        }
        return self;
    }

    function listeners(event) {
        return events[event] || [];
    }


    this.addListener = addListener;
    this.removeListeners = removeListeners;
    this.emit = emit;
    this.listeners = listeners;
}