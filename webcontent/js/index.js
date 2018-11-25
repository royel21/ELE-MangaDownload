const app = require('electron').remote;
const Downloads = require('./webcontent/js/DownloadManager');
const winex = require('win-explorer');
const path = require('path');
const {
    clipboard
} = require('electron');
const {
    Template
} = require('./webcontent/js/utils');

const mainWindow = app.getCurrentWindow();
const dialog = app.dialog;
var DManager = new Downloads('table');
var local = localStorage;
var template_path = path.join(__dirname, 'webcontent', 'template/');
var $dwPath = $('#d-path');
const db = require('./webcontent/js/models');

window.onbeforeunload = (e) => {
    DManager.saveState();
    local.setObject(scnList, scanList);
    ipcRenderer.send('log', "saved");
}

var dirId;

var monitorId, lastDownload;

/**************************************/

loadFromClipBoard = () => {
    var recent = clipboard.readText();
    if (lastDownload != recent && navigator.onLine) {
        lastDownload = recent;

        if (clipboard.availableFormats()[1] === "text/html") {
            var $clipContent = $(clipboard.readHTML());
            $clipContent.find('a').each((i, el) => {
                var link = el.href;
                if (link.includes('https://nhentai')) {
                    DManager.addDownload(link);
                }
            });
        } else {
            if (recent.includes('https://nhentai')) {
                DManager.addDownload(recent);
            }
        }

    }
}


$('#d-m-clip').change((e) => {
    if (e.target.checked) {
        monitorId = setInterval(() => {
            loadFromClipBoard();
        }, 200);
    } else {
        clearInterval(monitorId);
    }
});

openDir = () => {
    var dir = dialog.showOpenDialog(mainWindow, {
        title: "Select the folder",
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        defaultPath: DManager.dir
    });
    if (dir) {
        DManager.setDirectory(dir);
        $dwPath.find('span').text(dir);
    }
};


$('body table').on('click', 'tr .fa-trash-alt', (e) => {
    var id = $(e.target).closest('tr')[0].id.replace('d-', '');
    DManager.delete({ id });

    $('tbody #d-' + id).fadeOut(300, 'linear', () => {
        $('tbody #d-' + id).remove();
    });
})

$dwPath.find('span').text(DManager.dir);
$dwPath.click(openDir);

$('#round-check-input').on('change', (e) => {
    mainWindow.setAlwaysOnTop(e.target.checked);
});

$('#d-add').click(() => {
    loadFromClipBoard();
});

$(() => {
    $('#btn-sys-min').on('click', minWindow);
    $('#btn-sys-max').on('click', maxWindow);
    $('.btn-sys-close').on('click', closeWindow);

    db.init().then(() => {
        $('#content').animate({
            scrollTop: $('#table-container').height()
        }, 0);
        db.Folder.findOrCreate({
            where: {
                Name: DManager.dir
            }
        }).then(folder => {
            dirId = folder[0].Id;
        })
    });
    updateOnlineStatus();
});

$(document.body).keydown((e) => {
    var $row = $(event.target.closest('tr'));
    console.log(event.keyCode);
    if ($row[0] != undefined) {
        switch (event.keyCode) {

            case 38:
                {
                    if ($row.prev()[0].id == "") {
                        $row.closest('tbody').find('tr').last().focus();
                    } else {
                        $row.prev().focus();
                    }
                    break;
                }

            case 40:
                {
                    if ($row.next()[0] == undefined) {
                        $row.closest('tbody').find('tr').get(1).focus();
                    } else {
                        $row.next().focus();
                    }
                    break;
                }
            case 32: {
                event.preventDefault();
                var checkRow = $row.find("input[type=checkbox]");
                checkRow.prop('checked', !checkRow.prop('checked'));
                break;
            }
        }
    }
});

$('#d-clean-complete').click(e => {
    var $tbCopy = $('tbody').clone();
    for (var d of DManager.getCompleted()) {
        DManager.delete(d);
        $tbCopy.find('#d-' + d.id).remove();
    }
    $('tbody').empty().append($tbCopy.children());
    $('#file-pending').text((DManager.getTotal() - DManager.getPending()) + '/' + DManager.getTotal());
});

$('#check-all').change((e) => {
    var value = e.target.checked;
    $('tr input[type=checkbox]').prop('checked', value);
});

$('#clean-notify').click((e) => {
    $('#notifications .noty').remove();
});