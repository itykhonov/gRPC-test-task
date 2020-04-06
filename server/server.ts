import { EventEmitter } from './event-emitter';
import { StorageService } from './graph';
import { IResponse } from './file-service';
import * as path from "path";
import * as grpc from "grpc";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH: string = path.resolve(__dirname + '/../static/model.proto');
const packageDefinition: any = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const usersController: any = grpc.loadPackageDefinition(packageDefinition).userscontroller;

export class ServerService {
    private storageService: StorageService = new StorageService();
    private eventEmitter: EventEmitter = new EventEmitter();

    public createUser(call: any, callback: () => void): void {
        this.storageService.addNode(call.request, (response) => {
            this.callback("CREATED_USER", callback, response);
        });
    }

    public updateUser(call: any, callback: () => void): void {
        this.storageService.updateNode(call.request, (response) => {
            this.callback("UPDATED_USER", callback, response);
        });
    }

    public deleteUser(call: any, callback: () => void): void {
        this.storageService.deleteNode(call.request, (response) => {
            this.callback("DELETED_USER", callback, response);
        });
    }

    public addFriendshipBtwUsers(call: any, callback: () => void): void {
        this.storageService.addLinkBtwNodes(call.request.users, (response) => {
            this.callback("CREATED_LINK", callback, response);
        });
    }

    public deleteFrienshipBtwUsers(call: any, callback: () => void): void {
        this.storageService.deleteLinkBtwNodes(call.request.users, (response) => {
            this.callback("DELETED_LINK", callback, response);
        });
    }

    public getData(call: any, callback: () => void): void {
        this.storageService.getData((response: IResponse) => {
            this.callback("DATA_RETURNED", callback, response);
        });
    }

    public pushDateUpdates(call: any): void {
        console.log("USER_SUBSCRIBED --- *******");
        this.eventEmitter.addDispatcher(call);
    }

    public callback(type: string, callback: (err: Error, response: IResponse) => void, response: IResponse): void {
        this.eventEmitter.dispatch({
            type: type,
            data: response.results,
        });
        callback(null, response);
    }
}

function getServer(): any {
    const server: any = new grpc.Server();
    const serverClassInst: ServerService = new ServerService();
    server.addService(usersController.UsersController.service, {
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

// If this is run as a script, start a server on an unused port
const grpcServer: any = getServer();
grpcServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
grpcServer.start();