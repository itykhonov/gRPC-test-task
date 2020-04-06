class StorageService {
    storage;
    constructor(FileServiceInst) {
        this.storage = new FileServiceInst();
    }

    getId() {
        return Date.now() + '-id';
    }

    getData(callback) {
        this.storage.readData((data) => {
            callback({ userDatas: data });
        });
    }

    addNode(node, callback) {
        this.storage.readData((data) => {
            this.onAddedNode(data, node, callback);
        });
    }

    onAddedNode(data, node, callback) {
        var userData = {
            user: Object.assign(node, {id: this.getId()}),
            friends: []
        };
        data.push(userData);
        this.storage.writeData(data);
        callback([userData]);
    }

    updateNode(node, callback) {
        this.storage.readData((data) => {
            this.onUpdatedNode(data, node, callback);
        });
    }

    onUpdatedNode(data, node, callback) {
        if (!this.isNodeExist(data, node.id)) {
            console.error('User with id - ' + node.id + ' does not exist');
            callback();
            return;
        }
        var updatedUserData;
        data = data.map(el => {
            if (el.user.id === node.id) {
                updatedUserData = {
                    user: node,
                    friends: el.friends ? el.friends : []
                };
                return updatedUserData;
            }
            return el;
        });
        this.storage.writeData(data);
        callback([updatedUserData]);
    }

    deleteNode(node, callback) {
        this.storage.readData((data) => {
            this.onDeletedNode(data, node, callback);
        });
    }

    onDeletedNode(data, node, callback) {
        if (!this.isNodeExist(data, node.id)) {
            console.error('User with id - ' + node.id + ' does not exist')
            callback();
            return;
        }
        var deletedNode;
        data = data.map(el => {
            el.friends = el.friends.filter(f => f.id !== node.id);
            return el;
        }).filter(el => {
            if (el.user.id === node.id) {
                deletedNode = el;
                return false;
            }
            return true;
        });
        this.storage.writeData(data);
        callback([deletedNode]);
    }

    addLinkBtwNodes(users, callback) {
        this.storage.readData((data) => {
            this.onAddedLinkBtwNodes(data, users, callback)
        });
    }

    onAddedLinkBtwNodes(data, users, callback) {
        var isUsersExist = users.every(u => this.isNodeExist(data, u.id));
        if (!isUsersExist) {
            console.error('Some of users for linking does not exist')
            callback();
            return;
        }
        var user1 = data.find(u => u.user.id === users[0].id);
        var user2 = data.find(u => u.user.id === users[1].id);
        if (!user1.friends.some(f => f.id === users[1].id)) {
            user1.friends.push(users[1]);
        }
        if (!user2.friends.some(f => f.id === users[0].id)) {
            user2.friends.push(users[0]);
        }
        data = data.map(el => {
            if (el.user.id === user1.user.id) {
                return user1;
            }
            if (el.user.id === user2.user.id) {
                return user2;
            }
            return el;
        });
        this.storage.writeData(data);
        callback({ userDatas: [user1, user2] });
    }

    deleteLinkBtwNodes(users, callback) {
        this.storage.readData((data) => {
            this.onDeletedLinkBtwNodes(data, users, callback)
        });
    }

    onDeletedLinkBtwNodes(data, users, callback) {
        var isUsersExist = users.every(u => this.isNodeExist(data, u.id));
        if (!isUsersExist) {
            console.error('Some of users for linking does not exist');
            callback();
            return;
        }
        var user1 = data.find(u => u.user.id === users[0].id);
        var user2 = data.find(u => u.user.id === users[1].id);
        if (user1.friends.some(f => f.id === users[1].id)) {
            user1.friends = user1.friends.filter(f => f.id !== users[1].id);
        }
        if (user2.friends.some(f => f.id === users[0].id)) {
            user2.friends = user2.friends.filter(f => f.id !== users[0].id);
        }
        data = data.map(el => {
            if (el.user.id === user1.user.id) {
                return user1;
            }
            if (el.user.id === user2.user.id) {
                return user2;
            }
            return el;
        })
        this.storage.writeData(data);
        callback({ userDatas: [user1, user2] });
    }

    isNodeExist(data, id) {
        return data.some(el => el.user.id === id);
    }
}

exports.StorageService = StorageService;