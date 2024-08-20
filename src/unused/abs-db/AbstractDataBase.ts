export type Clause = "EXISTENCE" | "RETRIEVAL";

export interface UserRecord {
    readonly id?: number;
    readonly email: string;
    password: string[];
    name?: string;
    surname?: string;
}

interface Record {
    readonly mainKey: any;
    [key: string]: any;
}

export class AbstractDataBase {

    private static readonly _instance: Map<string, Record[]> = new Map<string, Record[]>();

    public static getRecord(key: any, clause: Clause): any {
        console.log(key, clause)
    }

    public static getMainKey(sk /* secondary key */ : any): any {
        console.log(sk);
        return 1;
    }

    public static setRecord(v: any): any {
        console.log(v);
        return 1;
    }

}
