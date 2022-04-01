import Dataset from "./Dataset";
import {Filter, LComparison, MComparison, MKeyPair, Negation, SComparison} from "./QueryInterfaces";
import Section from "./Section";
import {EBNFHelper} from "./EBNFHelper";
import {Utils} from "./Utils";
import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import {EBNF} from "./EBNF";
import Room from "./Room";


export interface SectionRoom {
	sections: Section[],
	rooms: Room[]
}

export class QueryBody {
	public static getQueryByFilter(datasets: Dataset[], queryWhere: Filter, notFlag: boolean): SectionRoom {
		// comparators
		let results: SectionRoom = {
			sections: [],
			rooms: []
		};

		if (JSON.stringify(queryWhere) === "{}") {
			results = this.getAll(datasets);
		} else if (EBNFHelper.isInstanceOfLComparison(queryWhere)) {
			results = this.getByLComparator(datasets, queryWhere as LComparison, notFlag);
		} else if (EBNFHelper.isInstanceOfMComparison(queryWhere)) {
			results = this.getByMComparator(datasets, queryWhere as MComparison, notFlag);
		} else if (EBNFHelper.isInstanceOfSComparison(queryWhere)) {
			results = this.getBySComparator(datasets, queryWhere as SComparison, notFlag);
		} else if (EBNFHelper.isInstanceOfNegation(queryWhere)) {
			results = this.getByNComparator(datasets, queryWhere as Negation, notFlag);
		}

		return results;
	}

	private static getAll(datasets: Dataset[]): SectionRoom {
		let allSections: SectionRoom = {
			sections: [],
			rooms: []
		};

		// datasets.forEach((dataset) => {
		// 	allSections = allSections.concat(dataset.data);
		// });

		datasets.forEach((dataset) => {
			if (dataset.kind === InsightDatasetKind.Courses) {
				allSections.sections = allSections.sections.concat(dataset.data);
			} else if (dataset.kind === InsightDatasetKind.Rooms) {
				allSections.rooms = allSections.rooms.concat(dataset.data);
			}
		});

		return allSections;
	}

	private static getByNComparator(datasets: Dataset[], queryNegation: Negation, notFlag: boolean): SectionRoom {
		// take everything that we have in the dataset, and remove queries from
		// getQueryByFilter from it
		let deepNotFilter = queryNegation.NOT;
		let results: SectionRoom;

		results = this.getQueryByFilter(datasets, deepNotFilter, !notFlag);

		return results;
	}

	private static getBySComparator(datasets: Dataset[], querySComparator: SComparison, notFlag: boolean): SectionRoom {
		// get the queries following the SKey
		let sKey = querySComparator.IS;
		let sKeyPairJson = Utils.parseSKeyPair(sKey);

		let currentSectionRoom: SectionRoom = {
			sections: [],
			rooms: []
		};

		// filter through the dataset to get the queries satisfying the conditions
		let currentDataset = Utils.filterByID(datasets, sKeyPairJson.id);

		currentDataset.map((dataset) => {
			let tempSections = dataset.data.filter((section: any) => {
				let field = sKeyPairJson.field;
				if (!notFlag) {
					if (section[field] !== undefined) {
						return Utils.stringMatches(section[field], sKeyPairJson.inputString);
					}
					return false;
				} else {
					if (section[field] !== undefined) {
						return !Utils.stringMatches(section[field], sKeyPairJson.inputString);
					}
					return true;
				}
			});
			if (dataset.kind === InsightDatasetKind.Courses) {
				currentSectionRoom.sections = currentSectionRoom.sections.concat(tempSections);
			} else if (dataset.kind === InsightDatasetKind.Rooms) {
				currentSectionRoom.rooms = currentSectionRoom.rooms.concat(tempSections);
			}
		});

		return currentSectionRoom;
	}

	// returns all fields that satisfy the comparator
	// get the queries based on the MKeyPair
	// check that there is only one valid pair (even though I think valid EBNF may already do that)
	private static getByMComparator(datasets: Dataset[], queryMComparator: MComparison, notFlag: boolean): SectionRoom {
		let LT = queryMComparator.LT;
		let GT = queryMComparator.GT;
		let EQ = queryMComparator.EQ;
		let comparator: MKeyPair;
		let flagsLTGTEQ: {LT: boolean, GT: boolean, EQ: boolean} = {
			LT: false, GT: false, EQ: false
		};
		if ((LT !== undefined && GT !== undefined && EQ !== undefined)
			|| (LT !== undefined && GT !== undefined && EQ === undefined)
			|| (LT !== undefined && GT === undefined && EQ !== undefined)
			|| (LT === undefined && GT !== undefined && EQ !== undefined)) {
			throw new InsightError("Invalid query.");
		}
		if (LT !== undefined) {
			comparator = LT;
			flagsLTGTEQ.LT = true;
		} else if (GT !== undefined) {
			comparator = GT;
			flagsLTGTEQ.GT = true;
		} else if (EQ !== undefined) {
			comparator = EQ;
			flagsLTGTEQ.EQ = true;
		} else {
			// has to be one of the three comparators above
			throw new InsightError("Invalid query.");
		}
		let keys = Utils.parseMKeyPair(comparator);
		if (!EBNF.coursesMField.includes(keys.field)) {
			throw new InsightError("Invalid query.");
		}
		let resultDataset = Utils.filterByID(datasets, keys.id);
		if (resultDataset.length !== 1) {
			throw new InsightError("Invalid query result dataset.");
		}
		let dataset = resultDataset[0];
		let resultArray: SectionRoom = {
			sections: [],
			rooms: []
		};
		if (dataset.kind === InsightDatasetKind.Courses) {
			resultArray.sections = dataset.data.filter((section: any) => {
				return this.filterMComparator(section, keys, flagsLTGTEQ, notFlag);
			});
		} else if (dataset.kind === InsightDatasetKind.Rooms) {
			resultArray.rooms = dataset.data.filter((room: any) => {
				return this.filterMComparator(room, keys, flagsLTGTEQ, notFlag);
			});
		}
		return resultArray;
		// let resultSection: Section[] = [];
		// let resultRoom: Room[] = [];
		// resultDataset.map((dataset) => {
		// 	if (dataset.kind === InsightDatasetKind.Courses) {
		// 		let filteredDataset = dataset.data.filter((section: any) => {
		// 			return this.filterMComparator(section, keys, flagsLTGTEQ, notFlag);
		// 		});
		// 		resultSection = resultSection.concat(filteredDataset);
		// 	} else if (dataset.kind === InsightDatasetKind.Rooms) {
		// 		let filteredDataset = dataset.data.filter((section: any) => {
		// 			return this.filterMComparator(section, keys, flagsLTGTEQ, notFlag);
		// 		});
		// 		resultRoom = resultRoom.concat(filteredDataset);
		// 	}
		// });
		// return result;
	}

	private static filterMComparator(section: any, keys: {id: string; field: string; number: number},
		flagsLTGTEQ: {LT: boolean; GT: boolean; EQ: boolean}, notFlag: boolean): boolean {
		if ((typeof section[keys.field]) === "number") {
			if (!notFlag) {
				if (flagsLTGTEQ.LT) {
					return (section as any)[keys.field] < keys.number;
				} else if (flagsLTGTEQ.GT) {
					return (section as any)[keys.field] > keys.number;
				} else if (flagsLTGTEQ.EQ) {
					return (section as any)[keys.field] === keys.number;
				}
			} else {
				if (flagsLTGTEQ.LT) {
					return !((section as any)[keys.field] < keys.number);
				} else if (flagsLTGTEQ.GT) {
					return !((section as any)[keys.field] > keys.number);
				} else if (flagsLTGTEQ.EQ) {
					return !((section as any)[keys.field] === keys.number);
				}
			}
		}
		return false;
	}

	// returns all fields satisfying AND or OR
	private static getByLComparator(datasets: Dataset[], queryLComparator: LComparison, notFlag: boolean): SectionRoom {
		// check if it is AND or OR
		// then write everything based on that
		let arrayAnd = queryLComparator.AND;
		let arrayOr = queryLComparator.OR;
		if (
			(arrayAnd === undefined && arrayOr === undefined)
			|| (arrayAnd !== undefined && arrayOr !== undefined)
		) {
			throw new InsightError("Invalid query.");
		}
		let result: SectionRoom = {
			sections: [],
			rooms: []
		};
		if (arrayAnd !== undefined) {
			let currentResults = this.getQueryByFilter(datasets, arrayAnd[0], notFlag);

			for (let i = 1; i < arrayAnd.length; i++) {
				let tempSections = this.getQueryByFilter(datasets, arrayAnd[i], notFlag);
				currentResults.sections = tempSections.sections.filter((tempSection) => {
					return Utils.arraySectionIncludes(currentResults.sections, tempSection);
				});
				currentResults.rooms = tempSections.rooms.filter((tempSection) => {
					return Utils.arrayRoomIncludes(currentResults.rooms, tempSection);
				});
			}

			result = currentResults;
		}
		if (arrayOr !== undefined) {
			arrayOr.forEach((filter) => {
				let tempResult = this.getQueryByFilter(datasets, filter, notFlag);
				result.sections = result.sections.concat(tempResult.sections);
				result.rooms = result.rooms.concat(tempResult.rooms);
			});
		}
		return result;
	}
}
