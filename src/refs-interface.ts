import { ObjectLike } from "./types";

export interface RefsInterface {
	setUserData: (payload: ObjectLike) => void;
	setContactProperty: (payload: ObjectLike) => void;
	autoLogin: (payload: ObjectLike) => void;
	setDepartment: (payload: string) => void;
	clearCache: () => void;
	open: () => void;
	close: () => void;
}
