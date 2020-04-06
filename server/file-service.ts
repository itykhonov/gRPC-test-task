var fs = require('fs');
var path = require('path');
var sroragePath = '../db/storage.json';

class FileService {
    readData(callback) {
        fs.readFile(path.resolve(__dirname, sroragePath), (error, data) => {
            if (error) {
                console.error(error)
            }
            if (callback && typeof callback === 'function') {
                if (data.toJSON().data.length) {
                    callback(JSON.parse(data));
                    return;
                }
                callback([]);
            }
        });
    }

    writeData(data) {
        fs.writeFile(path.resolve(__dirname, sroragePath), JSON.stringify(data), (error) => {
            if (error) {
                console.error(error)
            }
            console.log("Data has been written to file successfully.");
        });
    }
}

exports.FileService = FileService;