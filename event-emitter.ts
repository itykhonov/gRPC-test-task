// create a EventEmitter class 
class EventEmitter {
    dispatchers = [];

    addDispatcher(dispatcher) {
        this.dispatchers.push(dispatcher);
    }

    dispatch (event) {
        this.dispatchers.forEach(d => d.write(event));
    }
}

exports.EventEmitter = EventEmitter;