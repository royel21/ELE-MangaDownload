const ipcRenderer = require('electron').ipcRenderer;
const {
    Notify,
    nameFormat
} = require('./webcontent/js/utils');
var isMaximized = false;

ipcRenderer.on('zip-zipping', (e, row) => {
    DManager.updateProgress('Zipping', 0, DManager.store.getById(row.id));
});

ipcRenderer.on('zip-done', (e, row) => {

    var d = DManager.store.getById(row.id);
    var file = winex.ListFiles(DManager.dir).find((f) => {
        return f.FileName == d.name + '.zip';
    });

    db.File
        .create({
            Name: d.name + '.zip',
            Current: 0,
            Size: file.Size,
            folderId: dirId
        })
        .then((f) => {
            DManager.updateProgress('Done', 0, d);
            DManager.saveState();
            DManager.removeRunning(d.id);
            DManager.CreateDownload();
        }).catch(function (err) {
            console.log(err);
            console.log(d.name);
        });
});

ipcRenderer.on('loaded', (e, d) => {
    var name = nameFormat(d.name.toLocaleLowerCase().replace(/ \[digital\]| \[chinese\]| \[Decensored\]/ig, ""), 3);
    d.name = nameFormat(d.name, 3);
    db.File.findOne({
        where: {
            Name: {
                [db.Op.like]: "%" + name + "%"
            }
        }
    }).then((f) => {
        try {
            if (f == null) {
                DManager.store.add(d);
                DManager.addRow(d);
                DManager.saveState();
                DManager.CreateDownload();
                $('#file-pending').text((DManager.getTotal() - DManager.getPending()) + '/' + DManager.getTotal());
            } else {
                Notify({
                    title: "Download Exist:",
                    body: d.name,
                    type: "warning"
                });
            }
        } catch (error) {
            console.log(error);
            console.log(d.name);
        }
    });
});

ipcRenderer.on('suspend', (e) => {
    DManager.saveState();
    DManager.removeAllRunning();
    console.log('suspend');
});

ipcRenderer.on('resume', (e) => {
    DManager.CreateDownload();
    console.log('resume');
});

ipcRenderer.on('shutdown', (e) => {
    DManager.removeAllRunning();
    DManager.saveState();
});

hideCorner = (state) => {
    if (state === false) {
        $('.main-container').removeClass('unCorner');
        $('.d-controls').removeClass('unCorner');
        $('.btn-sys-close').removeClass('unCorner');
        $('footer').removeClass('unCorner');
    } else {
        $('.main-container').addClass('unCorner');
        $('.d-controls').addClass('unCorner');
        $('footer').addClass('unCorner');
        $('.btn-sys-close').addClass('unCorner');
    }
    isMaximized = state;
}

mainWindow.on('maximize', (event, a) => {
    hideCorner(true);
});

mainWindow.on('unmaximize', (event, a) => {
    hideCorner(false);
});

closeWindow = () => mainWindow.close();
minWindow = () => mainWindow.minimize();
maxWindow = () => {
    if (isMaximized === true) {
        mainWindow.unmaximize();
        hideCorner(false);
    } else {
        mainWindow.maximize();
        hideCorner(true);
    }
}

var $popup = $('#popup')

popupHide = (event) => {
    $popup.css({
        display: "none"
    }).text("");
    $popup.removeClass('top');
}

popupShow = (event) => {
    var pos = event.target.getBoundingClientRect();
    var msg = event.target.dataset.title;
    $popup.css({
        display: "block",
        top: -3000,
        left: -300
    }).text(msg == undefined ? event.target.textContent : msg);

    var top = event.target.getBoundingClientRect().top + 8 + event.target.offsetHeight
    if (top + $popup.height() + 10 > window.innerHeight) {
        top = pos.top - 22 - $popup.height()
        $popup.addClass('top');
    }
    var popupW = $popup.width() / 2;
    var left = (pos.x + pos.width / 2) - popupW;
    if (left < 0) {
        left = 5;
    }

    $popup.css({
        top,
        left
    });
}

$('body').on('mouseenter', '.popup-msg', popupShow);

$('body').on('mouseleave', '.popup-msg', popupHide);

updateOnlineStatus = () => {
    $('#online-status').css({ color: navigator.onLine ? "#007bff" : 'red' });
    if (navigator.onLine) {
        $('#online-status').removeClass("offline");
    } else {
        $('#online-status').addClass("offline");
    }
    DManager.handleOffline(navigator.onLine);
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)