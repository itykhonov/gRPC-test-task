# gRPC test task

## Purpose

Implementation of a client and server program that can maintain the state of a graph and inform clients of the updates that are made to the nodes of a generic graph data structure.

## Local development setup

### Prerequisites

1. Install latest Node and NPM
2. Install all dependencies `npm install`

### Running

#### Server
1. Run `npm run run-server` starts grpc server instance

#### Client
1. Run `npm run run-client` to connect client to server

#### Tests
1. Run `npm run test` to execute tests


## Interesting scenario

Raning client random scenario executes method that gets random number from 0 to 1 and if it less than 0.5 deleting scenario runs (every 10s executes function to delete node and link btw nodes if number of nodes multiple of 3), if it more than 0.5 adding scenario runs (every 5s executes function to add node and add link btw nodes if number of nodes multiple of 5, and update node name if number of nodes multiple of 3)