import {Key, MKey, MKeyPair, SKey, SKeyPair} from "./QueryInterfaces";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import Section from "../model/Section";

export class Utils {

	public static filterByOptions(resultSection: Section[], jsonFieldTracker: any): InsightResult[] {
		let result: InsightResult[] = [];
		resultSection.forEach((section: any) => {
			let tempJSON: any = {};
			for (let key in Object.keys(jsonFieldTracker)) {
				let currentField: string = jsonFieldTracker[key].field;
				if (section[currentField]) {
					tempJSON[key] = (section as any)[currentField];
				}
			}
			result.push(tempJSON as InsightResult);
		});
		return result;
	}

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
		let mKey = key.mKey;
		let sKey = key.sKey;

		if (
			(mKey === undefined && sKey === undefined)
			|| (mKey !== undefined && sKey !== undefined)
		) {
			// console.log("Error on line: ");
			// return {id: "", field: ""};
			throw new InsightError("Invalid query.");
		}

		let result: {id: string, field: string};

		if (mKey !== undefined) {
			result = Utils.parseMKey(mKey);
		} else if (sKey !== undefined) {
			result = Utils.parseSKey(sKey);
		} else {
			// console.log("Error on line: ");
			// return {id: "", field: ""};
			throw new InsightError("Invalid query.");
		}

		return result;
	}

	public static parseMKey(mkey: MKey): {id: string, field: string} {
		let stringArray = mkey.mKey.split("_");

		return {
			id: stringArray[0], field: stringArray[1]
		};
	}

	public static parseSKey(skey: SKey): {id: string, field: string} {
		let stringArray = skey.sKey.split("_");

		return {
			id: stringArray[0], field: stringArray[1]
		};
	}
}
