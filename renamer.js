const winEX = require('win-explorer');
const path = require('path')
const fs = require('fs-extra');
const NormalizeName = (name, padding = 3) => {
    name = name.replace(/.mp4|.mkv|.avi|webm|ogg/ig, '');
    var res1 = name.split(/\d+/g);
    if (res1.length === 1) return name;
    var res2 = name.match(/\d+/g);
    var temp = "";
    if (res1 !== null && res2 !== null) {
        for (let [i, s] of res2.entries()) {
            temp += res1[i] + String(Number(s)).padStart(padding, 0);
        }
        temp = temp + res1[res1.length - 1];
    }
    return Capitalize(temp).replace(/vol. |  /ig, 'Vol.').replace('-00', '-0').replace('(C0', '(C');
}

const Capitalize = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        let temp = [];
        let count = 0;
        for (let l of splitStr[i].split('')) {
            if (count == 0 && /[a-zA-Z]/ig.test(l)) {
                count++;
                temp.push(l.toUpperCase());
                continue;
            }
            temp.push(l);
        }
        splitStr[i] = temp.join('');
    }
    // Directly return the joined string
    let name = splitStr.join(' ');
    while (true) {
        if (name[name.length - 1] == '.') {
            name = name.substr(0, name.length - 2);
        } else {
            break;
        }
    }
    return name;
}

let basedir = 'E:\\Temp\\t';
let files = winEX.ListFiles(basedir);

// for (let f of files) {
//     let oFile = path.join(basedir, f.FileName);
//     let nFile = path.join(basedir, NormalizeName(f.FileName));

//     fs.moveSync(oFile, nFile);

// }
let name = 'Weekly Kairakuten  Vol. 19.zip';
console.log(name, ' - ', NormalizeName(name))