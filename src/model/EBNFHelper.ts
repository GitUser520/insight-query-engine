import {LComparison, MComparison, MKey, Negation, SComparison, SKey} from "./QueryInterfaces";
import {EBNF} from "./EBNF";
import Dataset from "./Dataset";

/*
isInstanceOf methods were inspired from StackOverflow
URL: https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
*/
export class EBNFHelper {
	public static checkMKeyUnknownID(mkey: MKey): boolean {
		let mKeyParts = mkey.split("_");

		if (!EBNF.mField.includes(mKeyParts[1])) {
			return false;
		}

		return true;
	}

	public static checkSKeyUnknownID(skey: SKey): boolean {
		let sKeyParts = skey.split("_");

		if (!EBNF.sField.includes(sKeyParts[1])) {
			return false;
		}

		return true;
	}

	public static checkMKey(mkey: MKey, datasets: Dataset[]): boolean {
		let mKeyParts = mkey.split("_");

		if (!EBNF.mField.includes(mKeyParts[1])) {
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

		if (!EBNF.sField.includes(sKeyParts[1])) {
			return false;
		}

		let valid = false;
		datasets.forEach((dataset) => {
			valid = valid || (dataset.id === sKeyParts[0]);
		});

		return valid;
	}

	public static isInstanceOfLComparison(object: object): object is LComparison {
		return "AND" in object || "OR" in object;
	}

	public static isInstanceOfMComparison(object: object): object is MComparison {
		return "LT" in object || "GT" in object || "EQ" in object;
	}

	public static isInstanceOfSComparison(object: object): object is SComparison {
		return "IS" in object;
	}

	public static isInstanceOfNegation(object: object): object is Negation {
		return "NOT" in object;
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
}
