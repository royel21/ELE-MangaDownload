const shell = require('child_process');
const fs = require('fs-extra')

var $searchList = $('#search-list');

var currentPage = 1;
var numberPerPage = 500;
var numberOfPages = 0;
var list = []

$('#d-search').click(() => {
    if ($searchList.is(':visible')) {
        $searchList.fadeOut(300);
    } else {
        if ($('#found-list').find('li').length == 0)
            loadNewPage();
        $searchList.fadeIn(300);
    }
});

$('#btn-close-list').click(() => {
    $searchList.fadeOut(300);
});

$('#search').on('input', (e) => {
    loadNewPage();
});

$('#search').on('mousedown', (e) => {
    if(e.which === 3){
        let val = clipboard.readText();
        if(val){
            e.target.value = val.trimRight();
            loadNewPage();
        }
    }
});

var loadNewPage = (page = 1) => {
    var val = $('#search').val().toLowerCase();
    var begin = ((page - 1) * numberPerPage);
    db.File.findAndCountAll({
        order: ['Name'],
        offset: begin, limit: numberPerPage,
        where: { Name: { [db.Op.like]: "%" + val + "%" } },
        include: { model: db.Folder }
    }).then(files => {
        list = files.rows;
        numberOfPages = Math.ceil(files.count / numberPerPage);
        $('#search-total').html((list.length + begin) + " / " + files.count);
        loadList();
    });
}

var loadList = () => {
    var $new_ul = $('#found-list').empty().clone();
    for (let value of list) {
        let li = `<li id="${value.Id}" class="popup-msg" data-title=${value.folder.Name} ><span class="del-file"><i class="fas fa-trash-alt"/></span><div class="file-name">${value.Name}</div></li>`;
        $new_ul.append(li);
    }
    $('#found-list').replaceWith($new_ul);
    $('#current-page').text(currentPage + '/' + numberOfPages);
}

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

$('#current-page').on('click', function () {

    if (numberOfPages !== 1) {
        this.textContent = "";
        var $input = $(`<input type="number" value=${currentPage} min=1 max=${numberOfPages}>`)
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

$('#btn-clear-search').click(() => {
    $('#search').val("");
    loadNewPage();
    $('#search')[0].focus();
})
var processing = false;

var processFile = async (e, cmd) => {
    if (!processing) {
        processing = true;

        let li = e.target.closest('li');
        if (li) {
            let file = await db.File.findOne({
                where: { Id: li.id }, include: { model: db.Folder }
            });
            if (file) {
                let filePath = path.join(file.folder.Name, file.Name);
                if (cmd.includes('open')) {
                    shell.execSync(`explorer "${filePath}"`);
                } else {

                    fs.removeSync(filePath);
                    await file.destroy();
                    $(li).fadeOut(100, () => { li.remove(); });
                }
            }
        }
        processing = false;
    }

}

$('#search-list').on('dblclick', 'li', (e) => {
    e.stopPropagation();
    processFile(e, "open").catch(err => {
        processing = false;
        console.log(err);
    });
});

$('#search-list').on('click', '.del-file', (e) => {
    e.stopPropagation();
    processFile(e, "del").catch(err => {
        processing = false;
        console.log(err);
    });
});