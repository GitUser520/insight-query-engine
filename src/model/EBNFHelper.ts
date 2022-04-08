import {
	AnyKey,
	ApplyKey,
	Key,
	LComparison,
	MComparison,
	MKey,
	Negation, Options,
	OrderValue,
	SComparison,
	SKey, Transformation
} from "./QueryInterfaces";
import {EBNF} from "./EBNF";
import Dataset from "./Dataset";

/*
isInstanceOf methods were inspired from StackOverflow
URL: https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
*/
export class EBNFHelper {
	public static checkMKeyUnknownID(mkey: MKey): boolean {
		if (typeof mkey !== "string") {
			return false;
		}
		let mKeyParts = mkey.split("_");
		if (!EBNF.allMField.includes(mKeyParts[1])) {
			return false;
		}
		return true;
	}

	public static checkSKeyUnknownID(skey: SKey): boolean {
		if (typeof skey !== "string") {
			return false;
		}
		let sKeyParts = skey.split("_");
		if (!EBNF.allSField.includes(sKeyParts[1])) {
			return false;
		}
		return true;
	}

	public static checkMKey(mkey: MKey, datasets: Dataset[]): boolean {
		if (typeof mkey !== "string") {
			return false;
		}
		let mKeyParts = mkey.split("_");
		if (!EBNF.allMField.includes(mKeyParts[1])) {
			return false;
		}
		let valid = false;
		datasets.forEach((dataset) => {
			valid = valid || (dataset.id === mKeyParts[0]);
		});

		return valid;
	}

	public static checkSKey(skey: SKey, datasets: Dataset[]): boolean {
		if (typeof skey !== "string") {
			return false;
		}
		let sKeyParts = skey.split("_");
		if (!EBNF.allSField.includes(sKeyParts[1])) {
			return false;
		}
		let valid = false;
		datasets.forEach((dataset) => {
			valid = valid || (dataset.id === sKeyParts[0]);
		});

		return valid;
	}

	public static isInstanceOfApplyKey(object: any): object is ApplyKey {
		return typeof object === "string" && object.split("_").length === 1;
	}

	public static isInstanceOfLComparison(object: any): object is LComparison {
		return typeof object === "object" && (object.AND !== undefined || object.OR !== undefined);
	}

	public static isInstanceOfMComparison(object: any): object is MComparison {
		return typeof object === "object"
			&& (object.LT !== undefined || object.GT !== undefined || object.EQ !== undefined);
	}

	public static isInstanceOfSComparison(object: any): object is SComparison {
		return typeof object === "object" && object.IS !== undefined;
	}

	public static isInstanceOfNegation(object: any): object is Negation {
		return typeof object === "object" && object.NOT !== undefined;
	}

	public static isInstanceOfOrderValue(object: any): object is OrderValue {
		return typeof object === "object" && (object.dir !== undefined && object.keys !== undefined);
	}

	public static isInstanceOfTransformation(object: any): object is Transformation {
		let validType = typeof object === "object";
		let keys = ["GROUP", "APPLY"];
		let objectKeys = Object.keys(object);
		let validKeys = true;
		objectKeys.forEach((key) => {
			validKeys = validKeys && keys.includes(key);
		});
		return validType && validKeys;
	}

	public static isInstanceOfOptions(object: any): object is Options {
		let validType = typeof object === "object";
		let objectKeys = Object.keys(object);
		if (objectKeys.length === 1) {
			let keys = ["COLUMNS"];
			let validKeys = true;
			objectKeys.forEach((key) => {
				validKeys = validKeys && keys.includes(key);
			});
			return validType && validKeys;
		} else if (objectKeys.length === 2) {
			let keys = ["COLUMNS", "ORDER"];
			let validKeys = true;
			objectKeys.forEach((key) => {
				validKeys = validKeys && keys.includes(key);
			});
			return validType && validKeys;
		}
		return false;
	}

	public static checkIsValidAsteriskString(inputString: string): boolean {
		if (typeof inputString !== "string") {
			return false;
		}
		let stringArray = inputString.split("*");
		if (stringArray.length === 1) {
			return true;
		} else if (stringArray.length === 2) {
			return stringArray[0] === "" || stringArray[1] === "";
		} else if (stringArray.length === 3) {
			return stringArray[0] === "" && stringArray[2] === "";
		}
		return false;
	}

	// check the validity of a key
	public static checkValidKey(key: Key, datasets: Dataset[]): boolean {
		if (key === null || key === undefined) {
			return false;
		}
		let keyString = key as Key;
		let mkey = keyString as MKey;
		let skey = keyString as SKey;
		return EBNFHelper.checkMKey(mkey, datasets) || EBNFHelper.checkSKey(skey, datasets);
	}

	// check valid apply key
	public static checkValidApplyKey(applyKey: ApplyKey) {
		// if (applyKey === null || applyKey === undefined) {
		// 	return false;
		// }
		if (typeof applyKey !== "string") {
			return false;
		}
		let applyKeyArray = applyKey.split("_");
		return applyKeyArray.length === 1;
	}
}
