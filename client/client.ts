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

class ClientService {
    public client;
    private users: IUserData[] = [];

    public constructor(clientInst: any) {
        this.client = new clientInst('localhost:50051', grpc.credentials.createInsecure());
    }

    public getDataOnConnect(callback?: () => void): void {
        const getDataCallback = (error: Error, { results }: IResponse) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.users = results;
            console.log('getData', this.users)
            this.callbackFunc(callback);
        }
        this.client.getData({}, getDataCallback);
    }
    
    getDataUpdates(): void {
        this.client.getDataUpdates({}).on('data', this.onDataUpdated.bind(this));
    }
    
    onDataUpdated({type, data }: IEvent): void {
        switch (type) {
            case 'CREATED_USER':
                console.log('User created - ' , data[0]);
                this.users.push(data[0]);
                break;
            case 'UPDATED_USER':
                console.log('User updated - ' , data[0]);
                this.users = this.users.map((u: IUserData) => {
                    if (u.user.id === data[0].user.id) {
                        return data[0];
                    }
                    return u;
                });
                break;
            case 'DELETED_USER':
                console.log('User deleted - ' , data[0]);
                this.users = this.users.filter((u: IUserData) => {
                    u.friends = u.friends.filter((f: IUser) => f.id !== data[0].user.id);
                    return u.user.id !== data[0].user.id;
                });
                break;
            case 'CREATED_LINK':
                console.log('Created link btw users - ' , data);
                this.users = this.users.map((u: IUserData) => {
                    const currentUser = data.find((d: IUserData) => d.user.id === u.user.id);
                    if (currentUser) {
                        return currentUser;
                    }
                    return u;
                });
                break;
            case 'DELETED_LINK':
                console.log('Deleted link btw users - ' , data);
                this.users = this.users.map((u: IUserData) => {
                    const currentUser: IUserData = data.find((d: IUserData) => d.user.id === u.user.id);
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
    
    public createUserNode(callback?: () => void): void {
        const createCallback: (error: Error, response: IResponse) => void = (error, response) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        this.client.createUser(this.getUser(), createCallback);
    }
    
    public updateUserNode(callback?: () => void): void {
        if (!this.users.length) {
            console.log('You do not have users to update');
            this.callbackFunc(callback);
            return;
        }
        const updateCallback: (error: Error, response: IResponse) => void = (error, response) => {
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
    
    public deleteUserNode(callback?: () => void): void {
        if (!this.users.length) {
            console.log('You should add minimum 1 user instances before delete one');
            this.callbackFunc(callback);
            return;
        }
        const deleteCallback: (error: Error, response: IResponse) => void = (error, response) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        this.client.deleteUser(this.getRandomUser(this.users), deleteCallback);
    }
    
    public deleteLinkBtwUsers(callback?: () => void): void {
        const deleteFrienshipBtwUsersCallback: (error: Error, response: IResponse) => void = (error, response) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        const userWithFriend: IUserData = this.getRandomUserWithFriend(this.users);
        if (userWithFriend) {
            const friend: IUser = userWithFriend.friends[0];
            this.client.deleteFrienshipBtwUsers(
                { users: [userWithFriend.user, friend]},
                deleteFrienshipBtwUsersCallback
            );
        } else {
            console.log('You should add link btw user instances before delete it');
            this.callbackFunc(callback);
        }
    }
    
    public addLinkBtwUsers(callback?: () => void): void {
        if (this.users.length < 2) {
            console.log('You should add minimum 2 user instances before add a link btw them');
            this.callbackFunc(callback);
            return;
        }
        const addFriendshipBtwUsersCallback: (error: Error, response: IResponse) => void = (error, response) => {
            if (error) {
                this.callbackFunc(callback, error);
                return;
            }
            this.callbackFunc(callback);
        }
        const firstUser = this.getRandomUser(this.users);
        const secondUser = this.getRandomUser(this.users.filter(u => u.user.id !== firstUser.id));
        this.client.addFriendshipBtwUsers(
            { users: [firstUser, secondUser]},
            addFriendshipBtwUsersCallback
        );
    }
    
    public applyInterestingScenario(): void {
        let timer: ReturnType<typeof setTimeout>;
        
        const startAddUsers: () => void = () => {
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
    
        const startRemoveUsers: () => void = () => {
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
    
    private getRandomUserWithFriend(users: IUserData[]): IUserData {
        return users.find((u: IUserData) => u.friends && Boolean(u.friends.length));
    }
    
    private getRandomUser(users: IUserData[]): IUser {
        return users[this.getRandomIntInclusive(0, users.length - 1)].user;
    }
    
    private getUser(): IUser {
        return {
            name: 'user name ' + this.getRandomIntInclusive(1, 100)
        };
    }
    
    private getNameToUpdate(): IUser {
        return {
            name: 'updated name ' + this.getRandomIntInclusive(1, 100)
        };
    }
    
    private getRandomIntInclusive(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    private callbackFunc(callback, error = null): void {
        if (error) {
            console.error('error ', error);
        }
        if (callback && typeof callback === 'function') {
            callback(error);
        }
    }
}

function main(): void {
    const client: any = new ClientService(usersController.UsersController);
    client.getDataUpdates();
    client.getDataOnConnect(
        client.applyInterestingScenario.bind(client)
    );
}

main();


// interfaces
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

export interface IEvent {
    type: string;
    data: IUserData[]
}