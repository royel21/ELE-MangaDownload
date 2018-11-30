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

async function ZipCover(filename, coverP, basedir) {
    // var zip = new StreamZip({
    //     file: path.join(basedir, filename),
    //     storeEntries: true
    // });
    return new Promise((resolve, reject) => {
        // zip.on('ready', () => {

        var entries = Object.values(zip.entries()).sort((a, b) => {
            return String(a.name).localeCompare(String(b.name))
        });

        var firstImg = entries.find(e => {
            return ['png', 'jpg', 'jpeg', 'gif'].includes(e.name.toLocaleLowerCase().split(
                '.').pop()) &&
                e.size > 1024 * 30
        });

        if (firstImg == undefined) {
            resolve(false);
        } else {
            sharp(zip.entryDataSync(firstImg)).jpeg({
                quality: 80
            }).resize(240).toFile(coverP, (error) => {
                resolve(coverP);
            });
        }
        // });
    });
}

var dir = "D:\\Temp\\processes";
resizeImages = async (ex) => {
    
    var files = windir.ListFiles(dir).filter((f)=> f.isDirectory && f.FileName != "resize");

    for (var f of files) {
        var filePath = path.join(dir, f.FileName);
        await new Promise((resolve, reject) => {
            var newPath = path.join(path.dirname(filePath), "resize", path.basename(filePath));
            fs.mkdirsSync(newPath);
            var imgs = windir.ListFiles(filePath)
                .filter((f) => ['png', 'gif', 'jpg', 'jpeg'].includes(f.extension.toLocaleLowerCase()));

            // for(var i of imgs)
            // {
            //     await new Promise((resolve, reject) => {

            //         var d = imgs.shift();
            //         var newImg = path.join(newPath, d.FileName.split('.')[0])+'.webp';
            //         sharp(path.join(filePath, d.FileName))
            //         .webp({ quality: 75})
            //         .resize(1100).toFile(newImg, (err, info)=>{
            //             resolve(newImg);
            //             console.log(d.FileName, info.size);
            //             //dcount--;
            //         });
            //     });
            // }
            var dcount = 0;
            var workerId = setInterval(() => {
                if (imgs.length > 0 && dcount < 3) {

                    new Promise((resolve, reject) => {

                        var d = imgs.shift();
                    //   var newImg = path.join(newPath, d.FileName.split('.')[0]) + '.webp';
                        var newImg = path.join(newPath, d.FileName.split('.')[0])+".jpg";
                        sharp(path.join(filePath, d.FileName))
                           // .webp({ quality: 75 })
                            .jpeg({quality: 75})
                            .resize(1100).toFile(newImg, (err, info) => {
                                resolve(newImg);
                                console.log(d.FileName, info, err);
                                dcount--;
                            });
                    });
                    dcount++;
                }
                if (dcount === 0 && imgs.length === 0) {
                    clearInterval(workerId);
                    resolve();
                }
            }, 0);
        });
    }
}
console.log("test")
resizeImages(dir)

