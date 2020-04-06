var path = require('path');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = path.resolve(__dirname + '/../protos/model.proto');

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var usersController = grpc.loadPackageDefinition(packageDefinition).userscontroller.UsersController;

class ClientService {
    client;
    users = [];
    constructor(clientInst) {
        this.client = new clientInst('localhost:50051', grpc.credentials.createInsecure());
    }

    getDataOnConnect(callback = () => {}) {
        var getDataCallback = (error, usersData) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.users = usersData.userDatas;
            console.log('getData', this.users)
            this.callbackFunc(callback);
        }
        this.client.getData({}, getDataCallback);
    }
    
    getDataUpdates() {
        this.client.getDataUpdates({}).on('data', this.onDataUpdated.bind(this));
    }
    
    onDataUpdated(event) {
        switch (event.type) {
            case 'CREATED_USER':
                console.log('User created - ' , event.data[0]);
                this.users.push(event.data[0]);
                break;
            case 'UPDATED_USER':
                console.log('User updated - ' , event.data[0]);
                this.users = this.users.map(u => {
                    if (u.user.id === event.data[0].user.id) {
                        return event.data[0];
                    }
                    return u;
                });
                break;
            case 'DELETED_USER':
                console.log('User deleted - ' , event.data[0]);
                this.users = this.users.filter(u => {
                    u.friends = u.friends.filter(f => f.id !== event.data[0].user.id);
                    return u.user.id !== event.data[0].user.id;
                });
                break;
            case 'CREATED_LINK':
                console.log('Created link btw users - ' , event.data);
                this.users = this.users.map(u => {
                    var currentUser = event.data.find(d => d.user.id === u.user.id);
                    if (currentUser) {
                        return currentUser;
                    }
                    return u;
                });
                break;
            case 'DELETED_LINK':
                console.log('Deleted link btw users - ' , event.data);
                this.users = this.users.map(u => {
                    var currentUser = event.data.find(d => d.user.id === u.user.id);
                    if (currentUser) {
                        return currentUser;
                    }
                    return u;
                });
                break;
            default:
                break;
        }
    }
    
    createUserNode(callback = () => {}) {
        var createCallback = (error, user) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        this.client.createUser(this.getUser(), createCallback);
    }
    
    updateUserNode(callback = () => {}) {
        if (!this.users.length) {
            console.log('You do not have users to update');
            this.callbackFunc(callback);
            return;
        }
        var updateCallback = (error, user) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        this.client.updateUser(
            Object.assign(
                this.getRandomUser(this.users),
                this.getNameToUpdate()
            ),
            updateCallback
        );
    }
    
    deleteUserNode(callback = () => {}) {
        if (!this.users.length) {
            console.log('You should add minimum 1 user instances before delete one');
            this.callbackFunc(callback);
            return;
        }
        var deleteCallback = (error, users) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        this.client.deleteUser(this.getRandomUser(this.users), deleteCallback);
    }
    
    deleteLinkBtwUsers(callback = () => {}) {
        var deleteFrienshipBtwUsersCallback = (error, users) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        var userWithFriend = this.getRandomUserWithFriend(this.users);
        if (userWithFriend) {
            var friend = userWithFriend.friends[0];
            this.client.deleteFrienshipBtwUsers(
                { users: [userWithFriend.user, friend]},
                deleteFrienshipBtwUsersCallback
            );
        } else {
            console.log('You should add link btw user instances before delete it');
            this.callbackFunc(callback);
        }
    }
    
    addLinkBtwUsers(callback = () => {}) {
        if (this.users.length < 2) {
            console.log('You should add minimum 2 user instances before add a link btw them');
            this.callbackFunc(callback);
            return;
        }
        var addFriendshipBtwUsersCallback = (error, user) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        var firstUser = this.getRandomUser(this.users);
        var secondUser = this.getRandomUser(this.users.filter(u => u.user.id !== firstUser.id));
        this.client.addFriendshipBtwUsers(
            { users: [firstUser, secondUser]},
            addFriendshipBtwUsersCallback
        );
    }
    
    getRandomUserWithFriend(users) {
        return users.find(u => u.friends && u.friends.length)
    }
    
    getRandomUser(users) {
        return users[this.getRandomIntInclusive(0, users.length - 1)].user;
    }
    
    getUser() {
        return {
            name: 'user name ' + this.getRandomIntInclusive(1, 100)
        };
    }
    
    getNameToUpdate() {
        return {
            name: 'updated name ' + this.getRandomIntInclusive(1, 100)
        };
    }
    
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    callbackFunc(callback, error = null) {
        if (error) {
            console.error('error ', error);
        }
        if (callback && typeof callback === 'function') {
            callback(error);
        }
    }
    
    applyInterestingScenario() {
        var timer;
        
        var startAddUsers = () => {
            clearInterval(timer);
            timer = setInterval(() => {
                this.createUserNode(() => {
                    if (this.users.length && this.users.length % 5 === 0) {
                        this.addLinkBtwUsers();
                        return;
                    }
                    if (this.users.length && this.users.length % 3 === 0) {
                        this.updateUserNode();
                        return;
                    }
                });
            }, 5000);
        }
    
        var startRemoveUsers = () => {
            clearInterval(timer);
            timer = setInterval(() => {
                this.deleteUserNode(() => {
                    if (this.users.length && this.users.length % 3 === 0) {
                        this.deleteLinkBtwUsers();
                        return;
                    }
                });
            }, 10000);
        }

        if (Math.random() > 0.5) {
            startAddUsers();
        } else {
            startRemoveUsers();
        }
    }
}

function main() {
    var client = new ClientService(usersController);
    client.getDataUpdates();
    client.getDataOnConnect(
        client.applyInterestingScenario.bind(client)
    );
}

if (require.main === module) {
  main();
}