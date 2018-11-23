const ipcRenderer = require('electron').ipcRenderer;
const {
    Notify
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
            CurrentPage: 0,
            Size: file.Size,
            folderId: dirId
        })
        .then((f) => {
            DManager.updateProgress('Done', 0, d);
            DManager.saveState();
            DManager.remove(d.id);
            DManager.CreateDownload();
            Notify({
                title: "Download Complete:",
                body: d.name,
                type: "success"
            });
        }).catch(function (err) {
            console.log(err);
            console.log(d.name);
        });
});

ipcRenderer.on('loaded', (e, d) => {
    var name = d.name.toLocaleLowerCase().replace(/ \[digital\]| \[chinese\]| \[Decensored\]/ig, "");
    console.log(name);
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
    DManager.removeAll();
    console.log('suspend');
});

ipcRenderer.on('resume', (e) => {
    DManager.CreateDownload();
    console.log('resume');
});

ipcRenderer.on('shutdown', (e) => {
    DManager.removeAll();
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

    var msg = event.target.dataset.title;
    $popup.css({
        display: "block",
        top: -3000,
        left: event.target.offsetLeft + (event.target.offsetWidth / 2) - 120
    }).text(msg == undefined ? event.target.textContent : msg);

    var top = event.target.getBoundingClientRect().top + 8 + event.target.offsetHeight
    if (top + $popup.height() + 10 > window.innerHeight) {
        top = event.target.getBoundingClientRect().top - 22 - $popup.height()
        $popup.addClass('top');
    }
    $popup.css({
        top
    });
}

$('body').on('mouseenter', '.popup-msg', popupShow);

$('body').on('mouseleave', '.popup-msg', popupHide);