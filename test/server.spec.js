var ServerService = require('../server.ts').ServerService;
var EE = require('../event-emitter.ts').EventEmitter;
var FileService = require('../file-service.ts').FileService;
var StorageService = require('../graph.ts').StorageService;

describe("test methods of ServerService instance", () => {
    var serverInst;
    var mockFunc = jest.fn();
    var mockCallback = jest.fn();
    beforeAll(() => {
        StorageService.prototype.addNode = mockFunc;
        StorageService.prototype.updateNode = mockFunc;
        StorageService.prototype.deleteNode = mockFunc;
        StorageService.prototype.addLinkBtwNodes = mockFunc;
        StorageService.prototype.deleteLinkBtwNodes = mockFunc;
        StorageService.prototype.getData = mockFunc;
        StorageService.prototype.pushDateUpdates = mockFunc;
        EE.prototype.dispatch = mockFunc;
        EE.prototype.addDispatcher = mockFunc;

        serverInst = new ServerService(
            StorageService,
            EE,
            FileService
        );
    });

    it("create user, storage addNode method called", () => {
        serverInst.createUser({request: {}}, () => {});
        expect(mockFunc).toHaveBeenCalled();
    });

    it("update user, storage updateNode method called", () => {
        serverInst.updateUser({request: {}}, () => {});
        expect(mockFunc).toHaveBeenCalled();
    });

    it("delete user, storage deleteNode method called", () => {
        serverInst.deleteUser({request: {}}, () => {});
        expect(mockFunc).toHaveBeenCalled();
    });

    it("add link btw users, storage addLinkBtwNodes method called", () => {
        serverInst.addFriendshipBtwUsers({request: {}}, () => {});
        expect(mockFunc).toHaveBeenCalled();
    });

    it("delete link btw users, storage deleteLinkBtwNodes method called", () => {
        serverInst.deleteFrienshipBtwUsers({request: {}}, () => {});
        expect(mockFunc).toHaveBeenCalled();
    });

    it("push response to all clients on callback, EventEmitter service dispatches event to clients", () => {
        serverInst.callback('event type', mockCallback, {});
        expect(mockFunc).toHaveBeenCalled();
    });

    it("push response to client on calling callback function", () => {
        serverInst.callback('event type', mockCallback, {});
        expect(mockCallback).toHaveBeenCalled();
    });

    it("client connected, added dispatcher to EventEmitter service", () => {
        serverInst.pushDateUpdates({});
        expect(mockFunc).toHaveBeenCalled();
    });
});