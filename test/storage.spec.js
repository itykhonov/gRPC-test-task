var FileService = require('../file-service.ts').FileService;
var StorageService = require('../graph.ts').StorageService;

describe("test methods of StorageService instance", () => {
    var storageInst;
    var mockCallbackFunc = jest.fn();
    var mockFuncReadDataFromDB = jest.fn();
    var mockFuncWriteDataToDB = jest.fn();
    beforeAll(() => {
        FileService.prototype.readData = mockFuncReadDataFromDB;
        FileService.prototype.writeData = mockFuncWriteDataToDB;

        storageInst = new StorageService(
            FileService
        );
    });

    beforeEach(() => {
        mockCallbackFunc.mockClear();
        mockFuncReadDataFromDB.mockClear();
        mockFuncWriteDataToDB.mockClear();
    });

    it("deletedLinkBtwNodes callback after node link deleted, if one node does not exist in db", () => {
        storageInst.onAddedLinkBtwNodes(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'other test id'
                        }
                    ]
                },
                {
                    user: {
                        name: 'test',
                        id: 'other test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'test id'
                        }
                    ]
                },
            ],
            [
                {
                    name: 'test',
                    id: 'test id that does not exist'
                },
                {
                    name: 'test',
                    id: 'other test id'
                },
            ],
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).not.toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith();
    });

    it("deletedLinkBtwNodes callback after node link deleted, delete link btw nodes data method called, callback function called", () => {
        storageInst.onDeletedLinkBtwNodes(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'other test id'
                        }
                    ]
                },
                {
                    user: {
                        name: 'test',
                        id: 'other test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'test id'
                        }
                    ]
                },
            ],
            [
                {
                    name: 'test',
                    id: 'test id'
                },
                {
                    name: 'test',
                    id: 'other test id'
                },
            ],
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).toHaveBeenCalled();
        expect(mockFuncWriteDataToDB).toHaveBeenCalledWith([
            {
                user: {
                    name: 'test',
                    id: 'test id'
                },
                friends: []
            },
            {
                user: {
                    name: 'test',
                    id: 'other test id'
                },
                friends: []
            },
        ]);
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith({
            userDatas: [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                },
                {
                    user: {
                        name: 'test',
                        id: 'other test id'
                    },
                    friends: []
                },
            ]
        });
    });

    it("addedLinkBtwNodes callback after node link added, if one node does not exist in db", () => {
        storageInst.onAddedLinkBtwNodes(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                },
                {
                    user: {
                        name: 'test',
                        id: 'other test id'
                    },
                    friends: []
                },
            ],
            [
                {
                    name: 'test',
                    id: 'test id that does not exist'
                },
                {
                    name: 'test',
                    id: 'other test id'
                },
            ],
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).not.toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith();
    });

    it("addedLinkBtwNodes callback after node link added, add link btw nodes data method called, callback function called", () => {
        storageInst.onAddedLinkBtwNodes(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                },
                {
                    user: {
                        name: 'test',
                        id: 'other test id'
                    },
                    friends: []
                },
            ],
            [
                {
                    name: 'test',
                    id: 'test id'
                },
                {
                    name: 'test',
                    id: 'other test id'
                },
            ],
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).toHaveBeenCalled();
        expect(mockFuncWriteDataToDB).toHaveBeenCalledWith([
            {
                user: {
                    name: 'test',
                    id: 'test id'
                },
                friends: [
                    {
                        name: 'test',
                        id: 'other test id'
                    }
                ]
            },
            {
                user: {
                    name: 'test',
                    id: 'other test id'
                },
                friends: [
                    {
                        name: 'test',
                        id: 'test id'
                    }
                ]
            },
        ]);
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith({
            userDatas: [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'other test id'
                        }
                    ]
                },
                {
                    user: {
                        name: 'test',
                        id: 'other test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'test id'
                        }
                    ]
                },
            ]
        });
    });

    it("deleteNode callback after node deleted, if deleted node does not exist in db", () => {
        storageInst.onDeletedNode(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                },
            ],
            {
                name: 'test',
                id: 'some does not exist id'
            },
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).not.toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith();
    });

    it("deleteNode callback after node deleted, if alreay exists link with deleted node", () => {
        storageInst.onDeletedNode(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'another test id'
                        }
                    ]
                },
                {
                    user: {
                        name: 'test',
                        id: 'another test id'
                    },
                    friends: [
                        {
                            name: 'test',
                            id: 'test id'
                        }
                    ]
                },
            ],
            {
                name: 'test',
                id: 'test id'
            },
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).toHaveBeenCalled();
        expect(mockFuncWriteDataToDB).toHaveBeenCalledWith([
            {
                user: {
                    name: 'test',
                    id: 'another test id'
                },
                friends: []
            },
        ]);
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith([
            {
                user: {
                    name: 'test',
                    id: 'test id'
                },
                friends: [
                    {
                        name: 'test',
                        id: 'another test id'
                    }
                ]
            }
        ]);
    });

    it("deleteNode callback after node deleted, delete data method called, callback function called", () => {
        storageInst.onDeletedNode(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                },
            ],
            {
                name: 'test',
                id: 'test id'
            },
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).toHaveBeenCalled();
        expect(mockFuncWriteDataToDB).toHaveBeenCalledWith([]);
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith([
            {
                user: {
                    name: 'test',
                    id: 'test id'
                },
                friends: []
            }
        ]);
    });

    it("updateNode callback after data updated, update data method called, callback function called", () => {
        storageInst.onUpdatedNode(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                },
            ],
            {
                name: 'updated test name',
                id: 'test id'
            },
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).toHaveBeenCalled();
        expect(mockFuncWriteDataToDB).toHaveBeenCalledWith(
            [
                {
                    user: {
                        name: 'updated test name',
                        id: 'test id'
                    },
                    friends: []
                },
            ]
        );
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith(
            [
                {
                    user: {
                        name: 'updated test name',
                        id: 'test id'
                    },
                    friends: []
                }
            ]
        );
    });

    it("addNode to db callback after data readed, write data to db method called, callback function called", () => {
        StorageService.prototype.getId = jest.fn(() => 'test id');
        storageInst.onAddedNode(
            [],
            {name: 'test'},
            mockCallbackFunc
        );

        expect(mockFuncWriteDataToDB).toHaveBeenCalled();
        expect(mockFuncWriteDataToDB).toHaveBeenCalledWith(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                }
            ]
        );
        expect(mockCallbackFunc).toHaveBeenCalled();
        expect(mockCallbackFunc).toHaveBeenCalledWith(
            [
                {
                    user: {
                        name: 'test',
                        id: 'test id'
                    },
                    friends: []
                }
            ]
        );
    });

    it("addNode to db, read data from db method called", () => {
        storageInst.addNode({}, () => {});
        expect(mockFuncReadDataFromDB).toHaveBeenCalled();
    });

    it("update existing node in db, read data from db method calle", () => {
        storageInst.updateNode(() => {});
        expect(mockFuncReadDataFromDB).toHaveBeenCalled();
    });

    it("delete node from db, read data from db method calle", () => {
        storageInst.deleteNode(() => {});
        expect(mockFuncReadDataFromDB).toHaveBeenCalled();
    });

    it("add link btw nodes, read data from db method calle", () => {
        storageInst.addLinkBtwNodes(() => {});
        expect(mockFuncReadDataFromDB).toHaveBeenCalled();
    });

    it("delete link btw nodes, read data from db method calle", () => {
        storageInst.deleteLinkBtwNodes(() => {});
        expect(mockFuncReadDataFromDB).toHaveBeenCalled();
    });
});