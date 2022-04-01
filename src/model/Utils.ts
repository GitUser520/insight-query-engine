import {Key, MKey, MKeyPair, SKey, SKeyPair} from "./QueryInterfaces";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import Section from "../model/Section";
import Dataset from "./Dataset";
import {EBNF} from "./EBNF";
import {EBNFHelper} from "./EBNFHelper";
import Room from "./Room";
import {SectionRoom} from "./QueryBody";

export class Utils {

	public static filterByOptions(resultSection: SectionRoom, jsonFieldTracker: any): InsightResult[] {
		let result: InsightResult[] = [];
		resultSection.sections.forEach((section: any) => {
			let tempJSON: any = {};
			let keys = Object.keys(jsonFieldTracker);
			for (const key of keys) {
				let currentField: string = jsonFieldTracker[key].field;
				if (section[currentField] !== undefined) {
					tempJSON[key] = (section as any)[currentField];
				}
			}
			result.push(tempJSON as InsightResult);
		});
		resultSection.rooms.forEach((section: any) => {
			let tempJSON: any = {};
			let keys = Object.keys(jsonFieldTracker);
			for (const key of keys) {
				let currentField: string = jsonFieldTracker[key].field;
				if (section[currentField] !== undefined) {
					tempJSON[key] = (section as any)[currentField];
				}
			}
			result.push(tempJSON as InsightResult);
		});
		return result;
	}

	public static filterByID(datasets: Dataset[], key: string): Dataset[] {
		let resultDatasets = datasets.filter((dataset) => {
			return dataset.id === key;
		});
		return resultDatasets;
	}

	public static arraySectionIncludes(array: Section[], object: Section): boolean {
		let contains = false;
		array.forEach((tempObject) => {
			let keysEqual = tempObject.dept === object.dept
				&& tempObject.id === object.id && tempObject.avg === object.avg
				&& tempObject.instructor === object.instructor
				&& tempObject.title === object.title && tempObject.pass === object.pass
				&& tempObject.fail === object.fail && tempObject.audit === object.audit
				&& tempObject.uuid === object.uuid && tempObject.year === object.year;
			contains = contains || keysEqual;
		});
		return contains;
	}

	public static arrayRoomIncludes(array: Room[], object: Room): boolean {
		let contains = false;
		array.forEach((tempObject) => {
			let keysEqual = tempObject.fullname === object.fullname
				&& tempObject.shortname === object.shortname
				&& tempObject.number === object.number
				&& tempObject.name === object.name
				&& tempObject.address === object.address
				&& tempObject.lat === object.lat && tempObject.lon === object.lon
				&& tempObject.seats === object.seats && tempObject.type === object.type
				&& tempObject.furniture === object.furniture
				&& tempObject.href === object.href;
			contains = contains || keysEqual;
		});
		return contains;
	}

	// may be slow
	public static arrayObjectIncludes(array: object[], object: object): boolean {
		let contains = false;
		let result1 = JSON.stringify(object);
		array.forEach((tempObject) => {
			let result2 = JSON.stringify(tempObject);
			contains = contains || result1 === result2;
		});
		return contains;
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
		let mKey = key as MKey;
		let sKey = key as SKey;
		let result: {id: string, field: string};

		if (mKey !== undefined && EBNFHelper.checkMKeyUnknownID(mKey)) {
			result = Utils.parseMKey(mKey);
		} else if (sKey !== undefined && EBNFHelper.checkSKeyUnknownID(sKey)) {
			result = Utils.parseSKey(sKey);
		} else {
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
		// ["6723", ""]
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
				let subString = fieldString.substring(0, index + stringBeforeAsterisk.length);
				return subString.length === stringBeforeAsterisk.length;
			}
		}

		if (stringArray.length === 3) {
			if (stringArray[0] === "" && stringArray[2] === "") {
				return fieldString.includes(stringArray[1]);
			}
		}

		return false;
	}
}
