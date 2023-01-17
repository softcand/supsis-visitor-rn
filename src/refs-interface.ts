import { ObjectLike } from "./types";

export interface RefsInterface {
	setUserData: (payload: ObjectLike) => void;
	autoLogin: (payload: ObjectLike) => void;
	setDepartment: (payload: string) => void;
	open: () => void;
	close: () => void;
}
