const fs = require('fs')
const path = require('path')

function Template(file, data) {
    var template = fs.readFileSync(path.resolve(file), { encoding: 'utf-8' });
    for (var key in data) {
        var regex = new RegExp(eval("/({" + key + "})/ig"));
        template = template.replace(regex, data[key]);
    }
    return template;
}

Object.defineProperty(Array.prototype, "last", {
    get: function () {
        return this[this.length - 1];
    }
});

Array.prototype.removeById = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] instanceof Object && this[i].id == obj.id) {
            return this.splice(i, 1);
        }
    }
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    if(value == "undefined") return [];
    return value && JSON.parse(value);
}


function FormattBytes(b) {
    var div = [];
    var mul = 1024
    if (typeof b === 'number') {
        switch (b) {
            case ((b >= 0 && b <= mul) ? b : -1):
                {
                    div.push(0)
                    div.push("B")
                    break;
                }
            case ((b >= mul && b <= mul**2) ? b : -1):
                {
                    div.push(1)
                    div.push("KB")
                    break;
                }
            case ((b >= mul**2 && b <= mul**3) ? b : -1):
                {
                    div.push(2)
                    div.push("MB")
                    break;
                }
            default:
                {
                    div.push(3)
                    div.push("GB")
                    break;
                }
        }
        return Number(b/1024**div[0]).toFixed(2)+div[1];
    } else
        return "0";
}


var id = 0;

Notify = (data) => {
    var $notyPanel = $('#notify-panel');
    var lastChild = $notyPanel.children().last()[0];
    if (lastChild != undefined) {
        id = lastChild.id.replace('noty-', '');
    }
    var $noty = $(`<div id="noty-${++id}" class="noty">`)
    $noty.append(`<div class="noty-title">${data.title}</div>`);
    $noty.append(`<div class="noty-body">${data.body}</div>`);
    $noty.addClass('bg-' + data.type);
    $noty.click((e) => {
        $(e.target).fadeOut('slow',()=>{
            $(e.target).remove();
        })
    });

    $notyPanel.prepend($noty);
    $noty.fadeIn('slow');
}

module.exports = {
    Notify,
    Template,
    FormattBytes
}

