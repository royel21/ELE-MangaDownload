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

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    if (value == "undefined") return [];
    return value && JSON.parse(value);
}

$.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().trim().toUpperCase().includes(arg.trim().toUpperCase());
    };
});

$.expr[":"].textequalto = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().trim().toUpperCase() === arg.trim().toUpperCase();
    };
});

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
            case ((b >= mul && b <= mul ** 2) ? b : -1):
                {
                    div.push(1)
                    div.push("KB")
                    break;
                }
            case ((b >= mul ** 2 && b <= mul ** 3) ? b : -1):
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
        return Number(b / 1024 ** div[0]).toFixed(2) + div[1];
    } else
        return "0";
}

Notify = (data) => {
    var $notyPanel = $('#notifications');
    if ($notyPanel.find('.noty-body:contains(' + data.body + ')')[0] == undefined) {
        var id = 0;
        var lastChild = $notyPanel.children().first()[0];
        if (lastChild != undefined && lastChild.id !== "clean-notify") {
            id = lastChild.id.replace('noty-', '');
        }

        var $noty = $(`<div id="noty-${++id}" class="noty bg-${data.type}">` +
            `<div class="noty-title">${data.title}</div>` +
            `<div class="noty-body">${data.body}</div></div>`);

        $noty.click((e) => {
            $(e.target).closest('.noty').fadeOut('slow', () => {
                $(e.target).remove();
            })
        });

        $notyPanel.prepend($noty);
        $noty.fadeIn('slow');
    }
}

function nameFormat(name, padding = 3) {
    var str = name;
    var res1 = name.split(/\d+/g);
    var res2 = str.match(/\d+/g);
    var temp = "";
    if (res1 !== null && res2 !== null){
        for (let [i, s] of res2.entries()) {
            temp += res1[i] + String(Number(s)).padStart(padding, 0);
        }
        temp = temp + res1[res1.length - 1];
    }else{
        temp = name;
    }
    var elem = document.createElement('textarea');
    elem.innerHTML = temp;
    let strTemp = elem.value.replace(/[\\|?|<|>|*|:|"|/|,]/ig, '').replace("  ", " ").replace("\t","");
    
    if(strTemp[strTemp.length-1] == ".") strTemp = strTemp.substr(0, strTemp.length-2);
    console.log(strTemp);
    return strTemp;
}

module.exports = {
    Notify,
    Template,
    FormattBytes,
    nameFormat
}

