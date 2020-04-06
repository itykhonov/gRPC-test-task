const fs = require('fs');
const path = require('path');

export class FileService {
    private sroragePath = '../static/storage.json';
    readData(callback: (data: IUserData[]) => void) {
        fs.readFile(path.resolve(__dirname, this.sroragePath), (error: Error, data: Buffer) => {
            if (error) {
                console.error(error)
            }
            if (callback && typeof callback === 'function') {
                if (data.toJSON().data.length) {
                    callback(JSON.parse(data.toString()));
                    return;
                }
                callback([]);
            }
        });
    }

    writeData(data: IUserData[]): void {
        fs.writeFile(path.resolve(__dirname, this.sroragePath), JSON.stringify(data), (error: Error) => {
            if (error) {
                console.error(error)
            }
            console.log("Data has been written to file successfully.");
        });
    }
}

export interface IUserData {
    user: IUser;
    friends: IUser[];
}

export interface IUser {
    name: string;
    id?: string;
}

export interface IResponse {
    results: IUserData[]
}

export type ICallback = (data: IResponse) => void;
