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
var $dwPath = $('#download-path');
const db = require('./webcontent/js/models');

window.onbeforeunload = (e) => {
    DManager.saveState();
    local.setObject(scnList, scanList);
    ipcRenderer.send('log', "saved");
}

var dirId;

var monitorId, lastDownload;

/**************************************/

$('#d-m-clip').change((e) => {
    if (e.target.checked) {
        monitorId = setInterval(() => {
            var clip = clipboard.readText();
            if (clip.indexOf('https://nhentai') > -1 && lastDownload != clip && navigator.onLine) {
                lastDownload = clip;
                DManager.addDownload(clip);
            }
        }, 200);
    } else {
        clearInterval(monitorId);
    }
});

openDir = () => {
    var dir = dialog.showOpenDialog(mainWindow, {
        title: "Select the folder",
        properties: ['openDirectory']
    });
    if (dir) {
        DManager.setDirectory(dir);
        $dwPath.text('Download: ' + dir);
    }
};


$('body table').on('click', 'tr .fa-trash-alt', (e) => {
    var id = $(e.target).closest('tr')[0].id.replace('d-', '');
    DManager.delete(id);
    $('tbody #d-' + id).fadeOut(300, 'linear', () => {
        $('tbody #d-' + id).remove();
    });
})

$dwPath.text('Download: ' + DManager.dir);
$dwPath.click(openDir);

$('#win-top').on('change', (e) => {
    mainWindow.setAlwaysOnTop(e.target.checked);
});


$('#d-add').click(() => {
    var clip = clipboard.readText();
    if (clip.indexOf('https://nhentai') > -1) DManager.addDownload(clip);
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

$(document.body).keydown((e)=>{
    var $row = $(event.target.closest('tr'));
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
    }
});

cleanNoty = (e)=>{
    var el = e.target.closest('span');
    $('#notify-panel').empty().append(el);
    $(el).click(cleanNoty);
}
$('#clean-notify').click(cleanNoty);