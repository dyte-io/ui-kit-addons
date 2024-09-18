export type StoreData = {
    [type: string]: any,
}
export interface DyteStore {
    name: string;
    volatile: boolean;
    set(key: string, value: any, sync?: boolean, emit?: boolean): Promise<void>;
    bulkSet(data: {
        key: string;
        payload: any;
    }[]): Promise<void>;
    update(key: string, value: any, sync?: boolean): Promise<void>;
    delete(key: string, sync?: boolean, emit?: boolean): Promise<void>;
    bulkDelete(data: {
        key: string;
    }[]): Promise<void>;
    get(key: string): any;
    getAll(): StoreData;
    subscribe(key: string | '*', cb: (value: any) => any): void;
    unsubscribe(key: string | '*', cb?: (value: any) => any): void;
}