var pageList = new Array();
var currentPage = 1;
var numberPerPage = 500;
var numberOfPages = 0;
var list = []
var $list_modal = $('#modal-list-file');
var totalFiles = 0;

$('#prev-list-page').click((e) => {
    if (currentPage > 1) {
        loadNewPage(--currentPage);
    }
});

$('#next-list-page').click((e) => {
    if (currentPage < numberOfPages) {
        loadNewPage(++currentPage);
    }
});

$('.list-file-show').click((event) => {
    if ($list_modal[0].style.display != "flex") {
        var $toolbar = $(event.target).closest('#viewer .footer');

        if ($toolbar[0] != undefined) {
            $('#modal-list-file').appendTo($('#viewer .footer'));
        } else {
            $('#modal-list-file').appendTo('body');
        }
        $list_modal.fadeIn('slow', () => {
            $list_modal.css({ display: 'flex' });
            $('.list-file-content').css({ height: $('#modal-list-file').height() - 93 });
            loadNewPage(0);
        });
    }
});

$('#list-file-hide').click(() => {
    $list_modal.fadeOut('slow');
});

$('#files-filter').keyup((e) => {
    loadNewPage(1);
});

const $modalScnList = $('#modal-scan-folder');

$('#scan-list-hide').click(() => {
    $modalScnList.fadeOut('slow');
});

$('#scan-list-show').click(() => {
    if ($modalScnList[0].style.display != "block") {
        $modalScnList.fadeIn('slow');
    }
});

$('#list-add-folder').click(() => {
    dialog.showOpenDialog(mainWindow, {
        title: "Select folder",
        properties: ['openDirectory']
    }).then(dir => {
        if (dir) {
            if (scanList.find((f) => { return f.dir == dir[0] }) == undefined) {
                id = 0;
                if (scanList.length > 0) id = scanList.last.id + 1;
                scanList.push({ id, dir: dir[0] });
                scanOneDir(dir[0]).then(() => {
                    $scanList.append(template('./template/folder-row.html', { id, dir: dir[0] }));
                })
            }
        }
    }); //end dialog
});

$('#current-page').on('click', function () {

    if (numberOfPages !== 1) {
        this.textContent = "";
        var $input = $(`<input type="number" value=${currentPage}
                         style="width:70px; padding:0; font-size:15px; color: black;" min=1 
                         max=${numberOfPages}>`)
            .appendTo($(this)).focus();

        $input.click((event) => {
            event.stopPropagation();
        });

        $input.on('keyup', (event) => {
            if (event.keyCode === 13) {
                currentPage = parseInt($input.val());

                if (currentPage > numberOfPages) {
                    currentPage = numberOfPages;
                }
                event.stopPropagation();
                event.preventDefault();
                $input = null;
                loadNewPage(currentPage);
            }
        });
        $input.focus();
    }
});

$('#list-file-content').on('click', '#delete-list', (event) => {
    event.stopPropagation();
    event.preventDefault();
    var li = event.target.closest('li').dataset;
    var elToRemove = event.target.closest('li');
    var file = path.join(li.dir, li.title);
    if (fs.existsSync(file)) {
        deleteFile(file, false).then(resp => {
            if (resp == 0) {
                $(elToRemove).fadeOut('slow', () => {
                    $(elToRemove).remove();
                });
            }
        });
    }
});

$('#list-file-content').on('dblclick', '#delete-list', (event) => {
    event.stopPropagation();
    event.preventDefault();
});

