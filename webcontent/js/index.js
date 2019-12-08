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

            if ($clipContent.length === 1) {
                var link = $clipContent[0];
                if (link.href && link.href.includes('https://nhentai')) {
                    DManager.addDownload(link.href);
                }
            } else {

                $clipContent.find('a').each((i, el) => {
                    var link = el.href;
                    if (link && link.includes('https://nhentai')) {
                        DManager.addDownload(link);
                    }
                });
            }
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
    dialog.showOpenDialog(mainWindow, {
        title: "Select the folder",
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        defaultPath: DManager.dir
    }).then(result => {
        if (result.filePaths[0]) {
            DManager.setDirectory(result.filePaths[0]);
            $dwPath.find('span').text(result.filePaths[0]);
        }
    }).catch(err => {
        console.log(err);
    });
};


$('body table').on('click', 'tr .fa-trash-alt', (e) => {
    var id = $(e.target).closest('tr')[0].id.replace('d-', '');
    DManager.delete({ id });

    $('tbody #d-' + id).fadeOut(300, 'linear', () => {
        $('tbody #d-' + id).remove();
        $('#file-pending').text((DManager.getTotal() - DManager.getPending()) + '/' + DManager.getTotal());
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
            if (folder)
                dirId = folder[0].Id;
        })
    });
    updateOnlineStatus();
});

$(document.body).keydown((e) => {
    var $row = $(event.target.closest('tr'));

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
    // var $tbCopy = $('tbody').clone();
    var toDelete = [];
    for (var d of DManager.getCompleted()) {
        DManager.delete(d);
        $('tbody').find('#d-' + d.id).hide();
        toDelete.push('#d-' + d.id);
    }
    // $('tbody').empty().append($tbCopy.children());
    for (let id of toDelete) {
        $('tbody').find(id).remove();
    }
    $('#file-pending').text((DManager.getTotal() - DManager.getPending()) + '/' + DManager.getTotal());
});

$('#check-all').change((e) => {
    var value = e.target.checked;
    $('tr input[type=checkbox]').prop('checked', value);
});

$('#clean-notify').click((e) => {
    $('#notifications .noty').remove();
});
var filterTable = (val) => {
    if (val.length > 1) {
        $("tbody tr").each((i, el) => {
            if (!el.textContent.toUpperCase().includes(val.toUpperCase())) {
                el.classList.add("d-none");
            } else {
                el.classList.remove("d-none");
            }
        });
    } else {
        $("tbody tr").removeClass("d-none");
    }
}
$("#filter").on("keydown", e => {
    let val = e.target.value;
    filterTable(val);
});

$("#filter").on('mousedown', (e) => {
    let val = clipboard.readText();
    if(e.which === 3){
        if(val){
            e.target.value = val.trimRight();
            filterTable(val.trimRight());
        }
    }
});


$("#btn-clear").click(() => {
    $("tbody tr").removeClass("d-none");
    $("#filter").val("");
});


$(window).on('keydown', (e) => {
    console.log("test")
    switch (e.keyCode) {

        case 123:
            {
                mainWindow.toggleDevTools();
                break;
            }
    }
});