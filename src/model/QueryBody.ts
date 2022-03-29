import Dataset from "./Dataset";
import {Filter, LComparison, MComparison, MKeyPair, Negation, SComparison} from "./QueryInterfaces";
import Section from "./Section";
import {EBNFHelper} from "./EBNFHelper";
import {Utils} from "./Utils";
import {InsightError} from "../controller/IInsightFacade";
import {EBNF} from "./EBNF";


export class QueryBody {
	public static getQueryByFilter(datasets: Dataset[], queryWhere: Filter, notFlag: boolean): Section[] {
		// comparators
		let results: Section[] = [];

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

	private static getAll(datasets: Dataset[]): Section[] {
		let allSections: Section[] = [];

		datasets.forEach((dataset) => {
			allSections = allSections.concat(dataset.data);
		});

		return allSections;
	}

	private static getByNComparator(datasets: Dataset[], queryNegation: Negation, notFlag: boolean): Section[] {
		// take everything that we have in the dataset, and remove queries from
		// getQueryByFilter from it
		let deepNotFilter = queryNegation.NOT;
		let results: Section[] = [];

		results = this.getQueryByFilter(datasets, deepNotFilter, !notFlag);

		return results;
	}

	private static getBySComparator(datasets: Dataset[], querySComparator: SComparison, notFlag: boolean): Section[] {
		// get the queries following the SKey
		let sKey = querySComparator.IS;
		let sKeyPairJson = Utils.parseSKeyPair(sKey);

		let currentSections: Section[] = [];

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
			currentSections = currentSections.concat(tempSections);
		});

		return currentSections;
	}

	// returns all fields that satisfy the comparator
	// get the queries based on the MKeyPair
	// check that there is only one valid pair (even though I think valid EBNF may already do that)
	private static getByMComparator(datasets: Dataset[], queryMComparator: MComparison, notFlag: boolean): Section[] {
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
		if (!EBNF.mField.includes(keys.field)) {
			throw new InsightError("Invalid query.");
		}
		let resultDataset = Utils.filterByID(datasets, keys.id);
		let resultSection: Section[] = [];
		resultDataset.map((dataset) => {
			let filteredDataset = dataset.data.filter((section: any) => {
				return this.filterMComparator(section, keys, flagsLTGTEQ, notFlag);
			});
			resultSection = resultSection.concat(filteredDataset);
		});
		return resultSection;
	}

	private static filterMComparator(section: any, keys: {id: string; field: string; number: number},
		flagsLTGTEQ: {LT: boolean; GT: boolean; EQ: boolean}, notFlag: boolean) {
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
	private static getByLComparator(datasets: Dataset[], queryLComparator: LComparison, notFlag: boolean): Section[] {
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
		let result: Section[] = [];
		if (arrayAnd !== undefined) {
			let currentResults = this.getQueryByFilter(datasets, arrayAnd[0], notFlag);

			for (let i = 1; i < arrayAnd.length; i++) {
				let tempSections = this.getQueryByFilter(datasets, arrayAnd[i], notFlag);
				currentResults = tempSections.filter((tempSection) => {
					return Utils.arraySectionIncludes(currentResults, tempSection);
				});
			}

			result = currentResults;
		}
		if (arrayOr !== undefined) {
			arrayOr.forEach((filter) => {
				let tempResult = this.getQueryByFilter(datasets, filter, notFlag);
				result = result.concat(tempResult);
			});
		}
		return result;
	}
}
