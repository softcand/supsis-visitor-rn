import { ObjectLike } from "./types";

export const convertToString = (object: ObjectLike): string => {
	let result = "{";
	for (const key of Object.keys(object)) {
		result += ` ${key}: "${object[key]}",`;
	}
	result = result.slice(0, result.length - 1);
	result += " }";
	return result;
};
