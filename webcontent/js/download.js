const fs = require('fs-extra');
const path = require('path');
const http = require('https');
const sharp = require('sharp');

module.exports = class Download {

    constructor(data, dir, cb, zippFile) {
        this.pages = data.pages;
        this.data = data;
        this.cb = cb;
        this.id = data.id;
        this.dir = path.join(dir, data.name);
        this.baseUrl = data.url.slice(0, -5);
        this.pause = false;
        this.stop = false;
        this.downloadid;
        this.zippFile = zippFile;
        this.zipping = false;
    }

    async startDownload() {
        var fromPage = 1;
        if (!fs.existsSync(this.dir)) {
            try {
                fs.mkdirsSync(this.dir);
            } catch (err) {
                console.log(err, this.dir)
            }
        } else {
            fromPage = fs.readdirSync(this.dir).length + 1;
        }

        var downloads = [];
        var i = 0;
        for (let index = fromPage; index <= this.data.pages; index++) {
            downloads[i++] = {
                url: this.data.url.slice(0, -5) + (index) + '.jpg',
                toFile: path.join(this.dir, String(index).padStart(3, "0") + '.jpg')
            };
        }

        this.cb('Running', 0, this.data);
        var dthis = {
            dcount: 0,
            data: this.data,
            cb: this.cb
        };

        this.downloadid = setInterval(() => {
            if (this.pause) return;
            if (this.stop) clearInterval(this.downloadid);
            if (downloads.length > 0 && dthis.dcount < 3) {

                new Promise((resolve, reject) => {

                    var d = downloads.shift();
                    var req = http.request(d.url, function(response) {
                        if (response.statusCode === 404) {
                            d.url = d.url.slice(0, -3) + "png"
                            downloads.unshift(d);
                            dthis.dcount--;
                            return resolve('done');
                        }
                        var data = [];
                        response.on('data', function(chunk) {
                            data.push(chunk);
                        });
                        response.on('end', function() {
                            var img = new Image();
                            img.src = 'data:image/jpeg;base64,' + Buffer.concat(data).toString(
                                'base64');
                            img.onload = function() {
                                if (img.width < 1100 || img.height > 3000) {
                                    sharp(Buffer.concat(data))
                                        .jpeg({
                                            quality: 75
                                        }).toFile(d.toFile, (err, info) => {
                                            resolve('done');
                                            dthis.dcount--;
                                        });
                                } else {
                                    sharp(Buffer.concat(data))
                                        .jpeg({
                                            quality: 75
                                        })
                                        .resize(1100).toFile(d.toFile, (err, info) => {
                                            resolve('done');
                                            dthis.dcount--;
                                        });
                                }

                                if (typeof dthis.cb === "function")
                                    dthis.cb('Update', dthis.data.pages - downloads.length,
                                        dthis.data);
                            }
                        });
                    });

                    req.on('socket', function(socket) {
                        socket.setTimeout(20000);
                        socket.on('timeout', function() {
                            req.abort();
                        });
                    });

                    req.on('error', function(err) {
                        downloads.unshift(d);
                        dthis.dcount--;
                        console.log(err)
                    });
                    req.end();
                });
                dthis.dcount++;
            }
            if (dthis.dcount === 0 && downloads.length === 0) {
                if (!this.zipping) {
                    this.zipping = true;
                    this.zippFile(this.downloadid, {
                        dir: this.dir,
                        id: this.data.id
                    });
                }
            }
        }, 50);
        return dthis;
    }
}