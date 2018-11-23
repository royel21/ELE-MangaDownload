const {
    Template,
    Notify
} = require('./utils');
const DStore = require('./dstore')
const fs = require('fs-extra');
const path = require('path');
const Download = require('./download');
const app = require('electron').remote;

const BrowserWindow = app.BrowserWindow;
const win = app.getCurrentWindow();
var local = localStorage;
if (local.getItem('downloads-dir') === null) {
    local.setItem('downloads-dir', app.app.getPath('downloads'));
    local.setItem('max-download', 2);
}

var states = ['Pending', 'Running', 'Paused', 'Stopped', 'Done']

module.exports = class Downloads {
    constructor() {
        this.store = new DStore();
        this.maxDownload = local.getItem('max-download');
        this.runningDownload = [];
        this.dir = local.getItem('downloads-dir');
        this.lastId = this.store.length() > 0 ? this.store.last().id + 1 : 0;

        for (var d of this.store.store) {
            this.addRow(d);
        }
        this.CreateDownload();
    }

    CreateDownload() {
        for (let dw of this.store.getPendding()) {
            if (this.runningDownload.find(d => d.id == dw.id) != undefined) continue;

            if (fs.existsSync(path.join(this.dir, dw.name + '.zip'))) {
                this.zippFile(0, {
                    dir: path.join(this.dir, dw.name),
                    id: dw.id
                });
            } else if (this.runningDownload.length < this.maxDownload) {
                var d = new Download(dw, this.dir, this.updateProgress, this.zippFile);
                this.runningDownload.push(d);
                d.startDownload();
            }
        }
    }

    delete(id) {
        this.runningDownload.removeById({
            id
        });
        var str = this.store;
        var downloaded = str.getAll().length - str.getPendding().length;
        $('#file-pending').text('Downloads: ' + downloaded + '/' + str.getAll().length);
        return this.store.removeById(id);
    }

    remove(id) {
        return this.runningDownload.removeById({
            id
        });
    }

    removeAll(id) {
        var i = this.runningDownload.length;

        while (i--) {
            var d = this.runningDownload.splice(i, 1);
            if ([0, 1].indexOf(d.state) > -1) d.stop = true;
        }
    }

    findDownload(id) {
        return this.runningDownload.find((d) => {
            return d.id == id;
        })
    }

    addRow(data) {
        var temp = {
            id: data.id,
            name: data.name,
            pages: data.pages,
            state: states[data.state],
        }
        var row = Template('./webcontent/template/download-row.html', temp);

        $('table tbody').append(row);
        if ($('thead tr').hasClass('tb-empty')) $('thead tr').removeClass('tb-empty');
        if (data.state === 4) this.DoneState('', data);
    }

    setMaxDownload(max) {
        local.setItem('max-download', max);
        this.maxDownload = max;
    }

    setDirectory(dir) {
        if (dir) {
            localStorage.setItem('downloads-dir', dir);
        }
    }

    addDownload(url) {
        var address = url.indexOf('/1/') > -1 ? url : url + '1/';
        var s = this.store.exist(address);
        if (s == undefined) {
            var winLoadName = new BrowserWindow({
                width: 1,
                height: 1,
                show: false,
                webPreferences: {
                    preload: path.resolve('./preload.js'),
                    nodeIntegration: false
                }
            });

            winLoadName.loadURL(address);

            winLoadName.webContents.once('dom-ready', () => {
                try {
                    if (this.lastId > 1000) this.lastId = 0;
                    winLoadName.webContents.send('load-name', win.id, this.lastId++);
                } catch (error) {}
            });

            winLoadName.on('closed', (e) => {
                winLoadName = null;
            });
        } else {
            Notify({
                title: "Download is in the list:",
                body: s.name,
                type: "danger"
            });
        }
    }

    pauseDownload(id, state) {
        var d = this.findDownload(id);
        if (d !== undefined) {
            d.pause = state;
        }
        CreateDownload();
    }

    saveState() {
        this.store.saveData()
    }

    updateProgress(event, progress, data) {
        var $tr = $('tbody #d-' + data.id);
        switch (event) {
            case "Update":
                {
                    var p = ((parseFloat(progress / data.pages)) * 100).toFixed(2) + '%';
                    $tr.find('.progress-bar').css({
                        'width': p
                    });
                    $tr.find('#progr-text').text(progress + '/' + data.pages)
                    break;
                }
            case "Running":
                {
                    data.state = 1;
                    $tr.find('td:eq(2)').text('Running');
                    break;
                }
            case "Zipping":
                {
                    this.DoneState('Zipping', data);
                    break;
                }
            case "Done":
                {
                    data.state = 4;
                    this.DoneState('Done', data);
                    break;
                }
        }

    }

    DoneState(action, data) {
        var $tr = $('tbody #d-' + data.id);
        if (action.length > 0) $tr.find('td:eq(2)').text(action);
        $tr.find('.progress-bar').css({
            'width': '100%'
        });
        $tr.find('.progress-bar').removeClass('progress-bar-animated');
        $tr.find('#progr-text').text(data.pages + '/' + data.pages);
        var str = this.store;
        var downloaded = str.getAll().length - str.getPendding().length
        $('#file-pending').text('Downloads: ' + downloaded + '/' + str.getAll().length);
    }

    zippFile(d_id, data) {
        try {
            var winLoadName = new BrowserWindow({
                width: 1,
                height: 1,
                show: false
            });
            var zipper = path.resolve('./background/zip-file.html');
            winLoadName.loadURL('file://' + zipper);

            winLoadName.webContents.once('dom-ready', () => {
                try {
                    winLoadName.webContents.send('zip-file', data, win.id);
                } catch (error) {}
            });
            winLoadName.on('closed', (e) => {
                winLoadName = null;
            });
        } catch (error) {
            console.log(error)
        }
        clearInterval(d_id);
    }
}