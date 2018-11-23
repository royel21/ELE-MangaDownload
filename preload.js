const win = require('electron').remote.getCurrentWindow();

win.webContents.session.webRequest
    .onBeforeRequest({
        urls: ["<all_urls>"]
    }, function (details, callback) {
        var cancel = details.referrer.length > 0 ? true : false;
        callback({
            cancel
        });
    });

window.N = {
    reader: function (t) {
        return t
    },
    init: function (t) {
        return t
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    const BrowserWindow = require('electron').remote.BrowserWindow
    const ipc = require('electron').ipcRenderer
    window.$ = require('jquery');
    var img = document.querySelector('#image-container img').src;
    ipc.on('load-name', (e, id, index) => {
        var fromWindow = BrowserWindow.fromId(id);
        var g = reader.gallery;
        var d = {
            id: index,
            name: nameFormat(g.title.english),
            pages: g.num_pages,
            state: 0,
            url: img,
            oUrl: document.location.href
        }
        fromWindow.webContents.send('loaded', d);
        win.webContents.session.webRequest
            .onBeforeRequest(null);
        window.close();
    });
});

function nameFormat(name, padding = 3) {
    var str = name.replace(/[\\|?|<|>|*|:|"]/ig, '');
    var res1 = str.split(/\d+/g);
    var res2 = str.match(/\d+/g);
    var temp = "";
    if (res1 == null || res2 == null) return str;

    for (let [i, s] of res2.entries()) {
        temp += res1[i] + s.padStart(padding, 0);
    }

    var elem = document.createElement('textarea');
    elem.innerHTML = temp + res1[res1.length - 1];
    return elem.value;
}