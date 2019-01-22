const windir = require('win-explorer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs-extra')
const app = require('electron').remote;
const mainWindow = app.getCurrentWindow();

closeWindow = () => mainWindow.close();
minWindow = () => mainWindow.minimize();
maxWindow = () => {
    if (isMaximized === true) {
        mainWindow.unmaximize();
        hideCorner(false);
    } else {
        mainWindow.maximize();
        hideCorner(true);
    }
}

$('#btn-sys-min').on('click', minWindow);
$('#btn-sys-max').on('click', maxWindow);
$('.btn-sys-close').on('click', closeWindow);

// const ipcRenderer = require('electron').ipcRenderer;
// const BrowserWindow = app.BrowserWindow;


// ipcRenderer.on('zip-done', (e, row) => {
//     console.log("zipped done", row)
// });
// zippFile = (data) => {
//     try {
//         var winLoadName = new BrowserWindow({
//             width: 1,
//             height: 1,
//             show: false
//         });
//         var zipper = path.resolve('./background/zip-file.html');
//         winLoadName.loadURL('file://' + zipper);

//         winLoadName.webContents.once('dom-ready', () => {
//             try {
//                 winLoadName.webContents.send('zip-file', data, mainWindow.id);
//             } catch (error) {}
//         });
//         winLoadName.on('closed', (e) => {
//             winLoadName = null;
//         });
//     } catch (error) {
//         console.log(error)
//     }
// }

// var dir = "D:\\Temp\\processes";
// resizeImages = async (ex) => {
    
//     var files = windir.ListFiles(dir).filter((f)=> f.isDirectory && f.FileName != "resize");

//     for (var f of files) {
//         var filePath = path.join(dir, f.FileName);
//         await new Promise((resolve, reject) => {
//             var newPath = path.join(path.dirname(filePath), "resize", path.basename(filePath));
//             fs.mkdirsSync(newPath);
//             var imgs = windir.ListFiles(filePath)
//                 .filter((f) => ['png', 'gif', 'jpg', 'jpeg'].includes(f.extension.toLocaleLowerCase()));

//             var dcount = 0;
//             var workerId = setInterval(() => {
//                 if (imgs.length > 0 && dcount < 3) {

//                     new Promise((resolve, reject) => {

//                         var d = imgs.shift();
//                     //   var newImg = path.join(newPath, d.FileName.split('.')[0]) + '.webp';
//                         var newImg = path.join(newPath, d.FileName.split('.')[0])+".jpg";
//                         sharp(path.join(filePath, d.FileName))
//                            // .webp({ quality: 75 })
//                             .jpeg({quality: 75})
//                             .resize(1100).toFile(newImg, (err, info) => {
//                                 resolve(newImg);
//                                 console.log(d.FileName);
//                                 dcount--;
//                             });
//                     });
//                     dcount++;
//                 }
//                 if (dcount === 0 && imgs.length === 0) {
//                     clearInterval(workerId);
//                     zippFile({dir: newPath});
//                     resolve();
//                 }
//             }, 0);
//         });
//     }
// }
// console.log("test")
// resizeImages(dir)

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
    return elem.value.replace(/[\\|?|<|>|*|:|"]/ig, '').replace("  ", " ");
}

var name = "[MIKARIN]I &quot;Cyai-Cyai&quot; Shitene  Please &quot;Cyai-Cyai&quot; 5 01";
$('#d-add').click(()=>{
    console.log(nameFormat(name))
});