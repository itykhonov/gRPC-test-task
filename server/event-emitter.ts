import { IUserData } from './file-service';

export class EventEmitter {
    private dispatchers: any = [];

    public addDispatcher(dispatcher: any): void {
        this.dispatchers.push(dispatcher);
    }

    public dispatch (event: IEvent): void {
        console.log(event.type);
        this.dispatchers.forEach((d: any) => d.write(event));
    }
}

export interface IEvent {
    type: string;
    data: IUserData[]
}
