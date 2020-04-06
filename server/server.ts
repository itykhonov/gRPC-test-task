var path = require('path');
var StorageInst = require('./graph.ts').StorageService;
var EE = require('./event-emitter.ts').EventEmitter;
var FileServiceInst = require('./file-service.ts').FileService;

var PROTO_PATH = path.resolve(__dirname + '/../protos/model.proto');

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var usersController = grpc.loadPackageDefinition(packageDefinition).userscontroller;

class ServerService {
    dataStorage;
    eventEmitter;

    constructor (StorageInst, EE, FileServiceInst) {
        this.dataStorage = new StorageInst(FileServiceInst);
        this.eventEmitter = new EE();
    }

    createUser(call, callback) {
        this.dataStorage.addNode(call.request, (response) => {
            this.callback("CREATED_USER", callback, response);
        });
    }

    updateUser(call, callback) {
        this.dataStorage.updateNode(call.request, (response) => {
            this.callback("UPDATED_USER", callback, response);
        });
    }

    deleteUser(call, callback) {
        this.dataStorage.deleteNode(call.request, (response) => {
            this.callback("DELETED_USER", callback, response);
        });
    }

    addFriendshipBtwUsers(call, callback) {
        this.dataStorage.addLinkBtwNodes(call.request.users, (response) => {
            this.callback("CREATED_LINK", callback, response);
        });
    }

    deleteFrienshipBtwUsers(call, callback) {
        this.dataStorage.deleteLinkBtwNodes(call.request.users, (response) => {
            this.callback("DELETED_LINK", callback, response);
        });
    }

    getData(call, callback) {
        this.dataStorage.getData((response) => {
            this.callback("DATA_RETURNED", callback, response);
        });
    }

    pushDateUpdates(call) {
        console.log("USER_SUBSCRIBED --- *******");
        this.eventEmitter.addDispatcher(call);
    }

    callback(type, callback, response) {
        this.eventEmitter.dispatch({
            type: type,
            data: response && response.userDatas ? response.userDatas : response,
        });
        callback(null, response);
    }
}

function getServer() {
    var server = new grpc.Server();
    var serverClassInst = new ServerService(
        StorageInst,
        EE,
        FileServiceInst,
    );
    server.addProtoService(usersController.UsersController.service, {
        createUser: serverClassInst.createUser.bind(serverClassInst),
        updateUser: serverClassInst.updateUser.bind(serverClassInst),
        deleteUser: serverClassInst.deleteUser.bind(serverClassInst),
        getData: serverClassInst.getData.bind(serverClassInst),
        getDataUpdates: serverClassInst.pushDateUpdates.bind(serverClassInst),
        addFriendshipBtwUsers: serverClassInst.addFriendshipBtwUsers.bind(serverClassInst),
        deleteFrienshipBtwUsers: serverClassInst.deleteFrienshipBtwUsers.bind(serverClassInst),
    });
    return server;
}

if (require.main === module) {
    // If this is run as a script, start a server on an unused port
    var grpcServer = getServer();
    grpcServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    grpcServer.start();
}

exports.getServer = getServer;
exports.ServerService = ServerService;
