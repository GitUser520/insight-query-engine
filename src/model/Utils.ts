import {Key, MKey, MKeyPair, SKey, SKeyPair} from "./QueryInterfaces";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import Section from "../model/Section";
import Dataset from "./Dataset";
import {EBNF} from "./EBNF";
import {EBNFHelper} from "./EBNFHelper";

export class Utils {

	public static filterByOptions(resultSection: Section[], jsonFieldTracker: any): InsightResult[] {
		let result: InsightResult[] = [];
		resultSection.forEach((section: any) => {
			let tempJSON: any = {};
			let keys = Object.keys(jsonFieldTracker);
			for (const key of keys) {
				let currentField: string = jsonFieldTracker[key].field;
				if (section[currentField]) {
					tempJSON[key] = (section as any)[currentField];
				}
			}
			result.push(tempJSON as InsightResult);
		});
		return result;
	}

	// public static getInsightResultsFromSections(resultDataset: Dataset[],
	// 	keys: {id: string, field: string, number: number},
	// 	flagsLTGTEQ: {LT: boolean, GT: boolean, EQ: boolean}) {
	//
	// }

	public static parseSKeyPair(sKeyPair: SKeyPair): {id: string, field: string, inputString: string} {
		let sKeyJson = Object.keys(sKeyPair)[0];
		let sKeyValues = sKeyJson.split("_");

		return {
			id: sKeyValues[0],
			field: sKeyValues[1],
			inputString: sKeyPair[sKeyJson]
		};
	}

	public static parseMKeyPair(comparator: MKeyPair): {id: string, field: string, number: number} {
		let mkey = Object.keys(comparator)[0];
		let mkeyValues = mkey.split("_");

		return {
			id: mkeyValues[0],
			field: mkeyValues[1],
			number: comparator[mkey]
		};
	}

	public static parseKey(key: Key): {id: string, field: string} {
		let mKey = key as MKey;
		let sKey = key as SKey;
		let result: {id: string, field: string};

		if (mKey !== undefined && EBNFHelper.checkMKeyUnknownID(mKey)) {
			result = Utils.parseMKey(mKey);
		} else if (sKey !== undefined && EBNFHelper.checkSKeyUnknownID(sKey)) {
			result = Utils.parseSKey(sKey);
		} else {
			// console.log("Error on line: ");
			// return {id: "", field: ""};
			throw new InsightError("Invalid query.");
		}

		return result;
	}

	public static parseMKey(mkey: MKey): {id: string, field: string} {
		let stringArray = mkey.split("_");

		return {
			id: stringArray[0], field: stringArray[1]
		};
	}

	public static parseSKey(skey: SKey): {id: string, field: string} {
		let stringArray = skey.split("_");

		return {
			id: stringArray[0], field: stringArray[1]
		};
	}

	public static stringMatches(fieldString: string, inputString: string): boolean {
		let stringArray = inputString.split("*");

		if (stringArray.length === 1) {
			return fieldString === stringArray[0];
		}

		if (stringArray.length === 2) {
			let stringBeforeAsterisk = stringArray[0];
			let stringAfterAsterisk = stringArray[1];

			if (stringBeforeAsterisk === "") {
				let index = fieldString.indexOf(stringAfterAsterisk);
				if (index === -1) {
					return false;
				}
				let subString = fieldString.substring(index);
				return subString.length === stringAfterAsterisk.length;
			} else if (stringAfterAsterisk === "") {
				let index = fieldString.indexOf(stringBeforeAsterisk);
				let subString = fieldString.substring(0, index + 2);
				return subString.length === stringBeforeAsterisk.length;
			}
		}

		if (stringArray.length === 3) {
			if (stringArray[0] === "" && stringArray[2] === "") {
				return fieldString.includes(stringArray[0]);
			}
		}

		return false;
	}
}
