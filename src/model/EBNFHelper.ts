import {
	AnyKey,
	ApplyKey,
	Key,
	LComparison,
	MComparison,
	MKey,
	Negation,
	OrderValue,
	SComparison,
	SKey
} from "./QueryInterfaces";
import {EBNF} from "./EBNF";
import Dataset from "./Dataset";

/*
isInstanceOf methods were inspired from StackOverflow
URL: https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
*/
export class EBNFHelper {
	public static checkMKeyUnknownID(mkey: MKey): boolean {
		let mKeyParts = mkey.split("_");

		if (!EBNF.coursesMField.includes(mKeyParts[1])) {
			return false;
		}

		return true;
	}

	public static checkSKeyUnknownID(skey: SKey): boolean {
		let sKeyParts = skey.split("_");

		if (!EBNF.coursesSField.includes(sKeyParts[1])) {
			return false;
		}

		return true;
	}

	public static checkMKey(mkey: MKey, datasets: Dataset[]): boolean {
		let mKeyParts = mkey.split("_");
		if (!EBNF.coursesMField.includes(mKeyParts[1])) {
			return false;
		}
		let valid = false;
		datasets.forEach((dataset) => {
			valid = valid || (dataset.id === mKeyParts[0]);
		});

		return valid;
	}

	public static checkSKey(skey: SKey, datasets: Dataset[]): boolean {
		let sKeyParts = skey.split("_");

		if (!EBNF.coursesSField.includes(sKeyParts[1])) {
			return false;
		}

		let valid = false;
		datasets.forEach((dataset) => {
			valid = valid || (dataset.id === sKeyParts[0]);
		});

		return valid;
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
		return "dirs" in object && "keys" in object;
	}

	public static checkIsValidAsteriskString(inputString: string): boolean {
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
		if (applyKey === null || applyKey === undefined) {
			return false;
		}
		let applyKeyArray = applyKey.split("_");
		return applyKeyArray.length === 1;
	}
}
