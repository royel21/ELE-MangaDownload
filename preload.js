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
            name: g.title.english,
            pages: g.num_pages,
            state: "Pending",
            url: img,
            oUrl: document.location.href
        }
        fromWindow.webContents.send('loaded', d);
        win.webContents.session.webRequest
            .onBeforeRequest(null);
        window.close();
    });
});
