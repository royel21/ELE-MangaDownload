const local = localStorage

State = { Pending: "Pending", Running: "Running", Pause: "Paused", Done: "Done", Stopped: "Stopped" }

module.exports = class DStore {

    constructor() {
        this.store = [];
        if (local.getObject('download-list') != "undefined" && local.getObject('download-list') != null) {
            this.store = local.getObject('download-list');
        }
    }
    length() {
        return this.store.length;
    }

    add(data) {
        if (data instanceof Object) {
            var s = this.getByName(data.name);
            if (s == undefined) {
                this.store.push(data);
                return data;
            }
        }
    }

    addAll(data) {
        if (Array.isArray(data)) {
            this.store = this.store.concat(data);
            return this;
        }
    }

    getById(id) {
        return this.store.find((s) => {
            return s.id === id;
        });
    }

    getByName(name) {
        return this.store.find((s) => {
            return s.name === name;
        });
    }

    getPendding() {
        var temp = this.store.filter(d => {
            return d.state == State.Pending || d.state == State.Running;
        });
        return temp;
    }

    getAll() {
        return this.store.slice();
    }

    remove(item) { return removeById(item.id); }

    removeById(id) { return this.store.removeById({ id }); }

    clear() { this.store = []; }

    saveData() {
        local.setObject('download-list', this.store);
    }
    exist(url) {
        return this.store.find((s) => { return s.oUrl === url });
    }

    last() {
        return this.store.last;
    }
}