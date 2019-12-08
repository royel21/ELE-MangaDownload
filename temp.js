const windir = require('win-explorer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs-extra')
const app = require('electron').remote;
const mainWindow = app.getCurrentWindow();

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

var dir = "E:\\Temp\\processes";
resizeImages = async(ex) => {

    var files = windir.ListFiles(dir).filter((f) => f.isDirectory && f.FileName != "resize");

    for (var f of files) {
        var filePath = path.join(dir, f.FileName);
        await new Promise((resolve, reject) => {
            var newPath = path.join(path.dirname(filePath), "resize", path.basename(filePath));
            fs.mkdirsSync(newPath);
            var imgs = windir.ListFiles(filePath)
                .filter((f) => ['png', 'gif', 'jpg', 'jpeg'].includes(f.extension.toLocaleLowerCase()));

            var dcount = 0;
            var workerId = setInterval(() => {
                if (imgs.length > 0 && dcount < 3) {

                    new Promise((resolve, reject) => {

                        var d = imgs.shift();
                        //   var newImg = path.join(newPath, d.FileName.split('.')[0]) + '.webp';
                        var newImg = path.join(newPath, d.FileName.split('.')[0]) + ".jpg";
                        sharp(path.join(filePath, d.FileName))
                            // .webp({ quality: 75 })
                            .jpeg({ quality: 75 })
                            .resize(1100).toFile(newImg, (err, info) => {
                                resolve(newImg);
                                console.log(d.FileName);
                                dcount--;
                            });
                    });
                    dcount++;
                }
                if (dcount === 0 && imgs.length === 0) {
                    clearInterval(workerId);
                    zippFile({ dir: newPath });
                    resolve();
                }
            }, 0);
        });
    }
}
console.log("test")
resizeImages(dir)