var listofFile = []
var $list_modal = $('.modal-list-file');

$('.list-file-content').on('dblclick', '#delete-list', consumeEvent);

$('.list-file-content').on('mousedown', 'ul li', (e) => {
    if (e.which === 3) {
        if ($(e.target).closest('#recent')[0] == undefined && $(e.target).closest('#current-list')[0] == undefined &&
         $(e.target).is("li")) {
            var $li = $(e.target.closest('li'));
            showCtxMenu($li.data('title'), $li.data('isfile'), e);
        }
    } else {
        selectListRow(e.target, e.ctrlKey);
        hideCMenu();
    }
    console.log(e.which)
});


createEntry = (value, isFile) => {
    var listIcon = "&#xf07b";
    if (isFile) {

        var listIcon = videoFilter.includes(value.Name.toLowerCase().split('.').pop()) ? "&#xf03d;" : "&#xf1c6;";
    }
    var div = document.createElement('div');
    div.innerHTML = `<li id="file-${value.Id}" class="list-group-item popup-msg" data-isFile="${isFile}" data-title="${value.Name}" tabindex="0">` +
        `<span id="delete-list"><i class="fas fa-trash-alt fa-1x"></i></span>` +
        `<span class="list-text">${listIcon} ${value.Name}</li>`;

    return div.firstElementChild;
}


$('.list-file-content').on('keydown', 'li', (event) => {
    var $row = $(event.target);
    var $list = $row.closest('ul');
    switch (event.keyCode) {
        case 13:
            {
                processRow(event);
                break;
            }

        case 38:
            {
                if ($row.prev()[0].id == "") {
                    if ($list[0].id == "list-files" && currentPage > 1) {
                        loadNewPage(--currentPage).then(() => {
                            selectListRow($('#list-files').find('li').get(1), event.ctrlKey);
                        });
                    }
                    selectListRow($row.closest('ul').find('li').last()[0], event.ctrlKey);
                } else {
                    selectListRow($row.prev()[0], event.ctrlKey);
                }
                event.preventDefault();
                break;
            }

        case 40:
            {
                if ($row.next()[0] == undefined) {
                    if ($list[0].id == "list-files" && currentPage < numberOfPages) {
                        loadNewPage(++currentPage).then(() => {
                            selectListRow($('#list-files').find('li').get(1), event.ctrlKey);
                        });
                    }
                    selectListRow($list.find('li').get(1), event.ctrlKey);
                } else {
                    selectListRow($row.next()[0], event.ctrlKey);
                }
                event.preventDefault();
                break;
            }
    }
});


positionModal = (e, $modal) => {
    var pos = $(e.target).offset();
    var m = $modal[0];
    moveEl(m, pos.left-($modal.width()/2), (pos.top - m.offsetHeight - 10), $modal.width(), $modal.height());
    $modal.fadeIn('slow');
};

$('#list-file-hide').click((e) => {
    $list_modal.removeClass('show-modal');
    hideCreateFav($fav_dialog);
    consumeEvent(e);
});
$('.list-file-show').click((e) => {
    $list_modal.addClass('show-modal');
    positionModal(e, $list_modal);
});