var pageList = new Array();
var currentPage = 1;
var numberPerPage = 1000;
var numberOfPages = 0;
var list = []
var $list_modal = $('#modal-file-list');
const { FormattBytes } = require('./webcontent/js/utils');

function getNumberOfPages() {
    return Math.ceil(list.length / numberPerPage);
}

loadPage = (e) => {
    currentPage = e.target.id.replace('page-', '');
    loadList();
}

function loadList() {
    var begin = ((currentPage - 1) * numberPerPage);
    var end = begin + numberPerPage;

    pageList = list.slice(begin, end);
    drawList();
}

function drawList() {
    var $the_ul = $('#file-list');
    var $new_ul = $the_ul.empty().clone();
    $new_ul.append(`<li id="scan-list-empty" class="list-group-item">Empty</li>`);
    for (let value of pageList) {
        $new_ul.append(`<li class="list-group-item popup-msg" data-title="${value.FileName} ${FormattBytes(value.Size)}"><span>${value.FileName}</span></li>`)
    }
    $('#file-list').replaceWith($new_ul);
    $('#file-found').html(list.length);

    $('#pagination-list').empty()
    numberOfPages = getNumberOfPages();

    if (numberOfPages > 1) {
        var page = 0;
        while (page < numberOfPages) {
            $('#pagination-list').append($(`<li class="page-item"><span id="page-${++page}" class="page-link">${page}</span></li>`));
        }
        $('#page-' + currentPage).parent().addClass('active');
    }
}


$('#file-list-show').click(() => {
    if ($list_modal[0].style.display != "flex") {
        list = filesList;
        $('#file-list-content').css({ height: $list_modal.height() - 95 });
        $list_modal.fadeIn('slow', () => {
            $list_modal.css({ display: 'flex', zIndex: zIndex++ });
            loadList();
        });
    }
});

$('#file-list-hide').click(() => {
    $list_modal.fadeOut('slow');
    $list_modal.css({ zIndex: zIndex-- });
});

$('#files-filter').keyup((e) => {
    currentPage = 1;
    var val = $('#files-filter').val().toLowerCase();
    if (val.length > 2) {
        list = filesList.filter((f) => {
            return f.FileName.toLocaleLowerCase().indexOf(val) > -1
        });
        loadList();
    } else {
        if (list.length != filesList.length) {
            list = filesList
            loadList();
        }
    }
});

$('#pagination-list').on('click', '.page-link', loadPage);