import {Clause, AbstractDataBase, UserRecord} from "../abs-db/AbstractDataBase";
import { ipcMain } from "electron";

enum AuthType {
    LOGIN = 0,
    REGISTER = 1
}

export interface AuthState {
    readonly status: boolean;
    readonly type: AuthType;
    readonly message: string;
}


class Authenticator {
    private static account: number | undefined = undefined;

    private static makeRequest(email: string, clause: Clause): UserRecord | boolean {
        return AbstractDataBase.getRecord(email, clause);
    }

    private static validate(user: UserRecord): AuthState {
        let clause: Clause = user.password.length === 2 ? "EXISTENCE" : "RETRIEVAL";
        let result = Authenticator.makeRequest(user.email, clause);
        let output: AuthState;
        if (typeof result === "boolean") {
            output = {
                status: !result,
                type: AuthType.REGISTER,
                message: result ?
                    "Your E-mail is already registered!" : "Your account has been registered correctly!"
            } as AuthState;
        }
        else {
            let email = result.email === user.email;
            let password = result.password[0] === user.password[0];
            output = {
                status: email && password,
                type: AuthType.LOGIN,
                message: email && password ?
                    "You have been successfully logged-in!" : "Your E-mail or password is incorrect!"
            } as AuthState;
        }
        return output;
    }

    public static authenticate(user: UserRecord): void {
        let result = Authenticator.validate(user);
        if (result.status) {
            if (result.type === AuthType.REGISTER) {
                this.account = AbstractDataBase.setRecord(user);
            }
            else {
                this.account = AbstractDataBase.getMainKey(user.email);
            }
        }
        ipcMain.emit("auth-response", result.message);
    }

}