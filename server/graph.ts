import { FileService, IUserData, IUser, ICallback} from './file-service';

export class StorageService {
    private fileService = new FileService();

    public getData(callback: ICallback): void {
        this.fileService.readData((data: IUserData[]) => {
            callback({ results: data });
        });
    }

    public addNode(node: IUser, callback: ICallback): void {
        this.fileService.readData((data: IUserData[]) => {
            this.onAddedNode(data, node, callback);
        });
    }

    public onAddedNode(data: IUserData[], node: IUser, callback: ICallback): void {
        const userData: IUserData = {
            user: Object.assign(node, {id: this.getId()}),
            friends: []
        };
        data.push(userData);
        this.fileService.writeData(data);
        callback({ results: [userData] });
    }

    public updateNode(node: IUser, callback: ICallback): void {
        this.fileService.readData((data) => {
            this.onUpdatedNode(data, node, callback);
        });
    }

    public onUpdatedNode(data: IUserData[], node: IUser, callback: ICallback): void {
        if (!this.isNodeExist(data, node.id)) {
            console.error('User with id - ' + node.id + ' does not exist');
            return;
        }
        let updatedUserData: IUserData;
        data = data.map((el: IUserData) => {
            if (el.user.id === node.id) {
                updatedUserData = {
                    user: node,
                    friends: el.friends ? el.friends : []
                };
                return updatedUserData;
            }
            return el;
        });
        this.fileService.writeData(data);
        callback({results: [updatedUserData]});
    }

    public deleteNode(node: IUser, callback: ICallback): void {
        this.fileService.readData((data: IUserData[]) => {
            this.onDeletedNode(data, node, callback);
        });
    }

    public onDeletedNode(data: IUserData[], node: IUser, callback: ICallback): void {
        if (!this.isNodeExist(data, node.id)) {
            console.error('User with id - ' + node.id + ' does not exist')
            return;
        }
        let deletedNode: IUserData;
        data = data.map((el: IUserData) => {
            el.friends = el.friends.filter((f: IUser) => f.id !== node.id);
            return el;
        }).filter((el: IUserData) => {
            if (el.user.id === node.id) {
                deletedNode = el;
                return false;
            }
            return true;
        });
        this.fileService.writeData(data);
        callback({results: [deletedNode]});
    }

    public addLinkBtwNodes(users: IUser[], callback: ICallback): void {
        this.fileService.readData((data: IUserData[]) => {
            this.onAddedLinkBtwNodes(data, users, callback)
        });
    }

    public onAddedLinkBtwNodes(data: IUserData[], users: IUser[], callback: ICallback): void {
        const isUsersExist: boolean = users.every((u: IUser) => this.isNodeExist(data, u.id));
        if (!isUsersExist) {
            console.error('Some of users for linking does not exist');
            return;
        }
        const user1: IUserData = data.find((u: IUserData) => u.user.id === users[0].id);
        const user2: IUserData = data.find((u: IUserData) => u.user.id === users[1].id);
        if (!user1.friends.some((f: IUser) => f.id === users[1].id)) {
            user1.friends.push(users[1]);
        }
        if (!user2.friends.some((f: IUser) => f.id === users[0].id)) {
            user2.friends.push(users[0]);
        }
        data = data.map((el: IUserData) => {
            if (el.user.id === user1.user.id) {
                return user1;
            }
            if (el.user.id === user2.user.id) {
                return user2;
            }
            return el;
        });
        this.fileService.writeData(data);
        callback({ results: [user1, user2] });
    }

    public deleteLinkBtwNodes(users: IUser[], callback: ICallback): void {
        this.fileService.readData((data: IUserData[]) => {
            this.onDeletedLinkBtwNodes(data, users, callback)
        });
    }

    public onDeletedLinkBtwNodes(data: IUserData[], users: IUser[], callback: ICallback): void {
        const isUsersExist: boolean = users.every((u: IUser) => this.isNodeExist(data, u.id));
        if (!isUsersExist) {
            console.error('Some of users for linking does not exist');
            return;
        }
        const user1: IUserData = data.find((u: IUserData) => u.user.id === users[0].id);
        const user2: IUserData = data.find((u: IUserData) => u.user.id === users[1].id);
        if (user1.friends.some((f: IUser) => f.id === users[1].id)) {
            user1.friends = user1.friends.filter((f: IUser) => f.id !== users[1].id);
        }
        if (user2.friends.some((f: IUser) => f.id === users[0].id)) {
            user2.friends = user2.friends.filter((f: IUser) => f.id !== users[0].id);
        }
        data = data.map((el: IUserData) => {
            if (el.user.id === user1.user.id) {
                return user1;
            }
            if (el.user.id === user2.user.id) {
                return user2;
            }
            return el;
        })
        this.fileService.writeData(data);
        callback({ results: [user1, user2] });
    }

    public isNodeExist(data: IUserData[], id: string): boolean {
        return data.some(el => el.user.id === id);
    }

    public getId(): string {
        return Date.now() + '-id';
    }
}
