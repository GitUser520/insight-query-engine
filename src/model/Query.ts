import Dataset from "./Dataset";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import {Utils} from "./Utils";
import {
	QueryStructure, Filter, LComparison, MComparison, MKeyPair, Negation, SComparison
} from "./QueryInterfaces";
import Section from "./Section";
import {EBNFHelper} from "./EBNFHelper";
import {EBNF} from "./EBNF";

export class Query {
	public datasets: Dataset[];

	constructor(datasets: Dataset[]) {
		this.datasets = datasets;
	}

	// gets the elements from the dataset using the query
	public getQuery(queryObject: QueryStructure): InsightResult[] {
		// query
		let queryWhere = queryObject.WHERE;
		let queryOptions = queryObject.OPTIONS;
		// options
		let queryColumns = queryOptions.COLUMNS;
		let queryOrder = queryOptions.ORDER;

		let jsonFieldTracker: any = {};

		queryColumns.forEach((key) => {
			let keyValues = Utils.parseKey(key);
			let stringID = keyValues.id + "_" + keyValues.field;

			jsonFieldTracker[stringID] = keyValues;
		});

		// results
		let queryResults = this.getQueryByFilter(queryWhere, jsonFieldTracker);

		if (queryOrder !== undefined) {
			let keyValues = Utils.parseKey(queryOrder);
			let sortByString = keyValues.field;

			queryResults.sort((a: any,b: any) => {
				if (typeof a[sortByString] === "string") {
					return a[sortByString].localeCompare(b[sortByString]);
				} else {
					if (a[sortByString] < b[sortByString]) {
						return -1;
					} else if (a[sortByString] > b[sortByString]) {
						return 1;
					} else {
						return 0;
					}
				}
			});
		}

		return queryResults;
	}

	private getQueryByFilter(queryWhere: Filter, jsonFieldTracker: any): InsightResult[] {
		// comparators
		let queryLResults: InsightResult[] = [];
		let queryMResults: InsightResult[] = [];
		let querySResults: InsightResult[] = [];
		let queryNResults: InsightResult[] = [];

		if (EBNFHelper.isInstanceOfLComparison(queryWhere)) {
			queryLResults = this.getByLComparator(queryWhere as LComparison, jsonFieldTracker);
		}

		if (EBNFHelper.isInstanceOfMComparison(queryWhere)) {
			queryMResults = this.getByMComparator(queryWhere as MComparison, jsonFieldTracker);
		}

		if (EBNFHelper.isInstanceOfSComparison(queryWhere)) {
			querySResults = this.getBySComparator(queryWhere as SComparison, jsonFieldTracker);
		}

		if (EBNFHelper.isInstanceOfNegation(queryWhere)) {
			queryNResults = this.getByNComparator(queryWhere as Negation, jsonFieldTracker);
		}

		let results: InsightResult[] = [];
		results = results.concat(queryLResults).concat(queryMResults).concat(querySResults).concat(queryNResults);

		return results;
	}

	private getByNComparator(queryNegation: Negation, jsonFieldTracker: any): InsightResult[] {
		// take everything that we have in the dataset, and remove queries from
		// getQueryByFilter from it
		let deepNotFilter = queryNegation.NOT;
		let results: InsightResult[] = [];

		if (EBNFHelper.isInstanceOfNegation(deepNotFilter)) {
			let deepNotNotFilter = (deepNotFilter as Negation).NOT;
			results = this.getQueryByFilter(deepNotNotFilter, jsonFieldTracker);
		} else {
			let excludeResults = this.getQueryByFilter(deepNotFilter, jsonFieldTracker);
			let ALL: Filter = {

			};
			results = this.getQueryByFilter(ALL, jsonFieldTracker);

			results = results.filter((value) => {
				return (!excludeResults.includes(value));
			});
		}

		return results;
	}

	private getBySComparator(querySComparator: SComparison, jsonFieldTracker: any): InsightResult[] {
		// get the queries following the SKey
		let sKey = querySComparator.IS;
		let sKeyPairJson = Utils.parseSKeyPair(sKey);

		let currentSections: Section[] = [];

		// filter through the dataset to get the queries satisfying the conditions
		let currentDataset = this.datasets.filter((dataset) => {
			return dataset.id === sKeyPairJson.id;
		});

		currentDataset.map((dataset) => {
			let tempSections = dataset.data.filter((section: any) => {
				let field = sKeyPairJson.field;
				if (section[field] !== undefined) {
					return Utils.stringMatches(section[field], sKeyPairJson.inputString);
				}
				return false;
			});
			currentSections = currentSections.concat(tempSections);
		});

		return Utils.filterByOptions(currentSections, jsonFieldTracker);
	}

	// returns all fields that satisfy the comparator
	// get the queries based on the MKeyPair
	// check that there is only one valid pair (even though I think valid EBNF may already do that)
	private getByMComparator(queryMComparator: MComparison, jsonFieldTracker: any): InsightResult[] {
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
			// console.log("Error on line: ");
			// return [];
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
			// todo What is this block of code for?
			// console.log("Error on line: ");
			// let resultSection: Section[] = [];
			// let resultDataset = this.datasets.map((dataset) => {
			// 	dataset.data.filter((section: any) => {
			// 		return Query.filterMComparator(section, keys, flagsLTGTEQ);
			// 	});
			// 	resultSection.concat(dataset.data);
			// });
			// return Utils.filterByOptions(resultSection, jsonFieldTracker);
			throw new InsightError("Invalid query.");
		}
		let keys = Utils.parseMKeyPair(comparator);
		if (!EBNF.mField.includes(keys.field)) {
			// console.log("Error on line: ");
			// return [];
			throw new InsightError("Invalid query.");
		}
		let resultDataset = this.datasets.filter((dataset) => {
			return dataset.id === keys.id;
		});
		let resultSection: Section[] = [];
		resultDataset.map((dataset) => {
			let filteredDataset = dataset.data.filter((section: any) => {
				return Query.filterMComparator(section, keys, flagsLTGTEQ);
			});
			resultSection = resultSection.concat(filteredDataset);
		});
		return Utils.filterByOptions(resultSection, jsonFieldTracker);
	}

	private static filterMComparator(section: any, keys: {id: string; field: string; number: number},
		flagsLTGTEQ: {LT: boolean; GT: boolean; EQ: boolean}) {
		if (section[keys.field]) {
			if (flagsLTGTEQ.LT) {
				return (section as any)[keys.field] < keys.number;
			} else if (flagsLTGTEQ.GT) {
				return (section as any)[keys.field] > keys.number;
			} else if (flagsLTGTEQ.EQ) {
				return (section as any)[keys.field] === keys.number;
			}
		}
		return false;
	}

	// returns all fields satisfying AND or OR
	private getByLComparator(queryLComparator: LComparison, jsonFieldTracker: any): InsightResult[] {
		// check if it is AND or OR
		// then write everything based on that
		let arrayAnd = queryLComparator.AND;
		let arrayOr = queryLComparator.OR;

		if (
			(arrayAnd === undefined && arrayOr === undefined)
			|| (arrayAnd !== undefined && arrayOr !== undefined)
		) {
			// console.log("Error on line: ");
			// return [];
			throw new InsightError("Invalid query.");
		}

		let result: InsightResult[] = [];

		if (arrayAnd !== undefined) {
			let arrayAnd2d: InsightResult[][] = [];

			arrayAnd.forEach((filter) => {
				arrayAnd2d.push(this.getQueryByFilter(filter, jsonFieldTracker));
			});

			result = arrayAnd2d.reduce((resultArray1, resultArray2): InsightResult[] => {
				let currentIntersection = resultArray1.filter((tempResult) => {
					return resultArray2.includes(tempResult);
				});

				return currentIntersection;
			});
		}

		if (arrayOr !== undefined) {
			arrayOr.forEach((filter) => {
				let tempResult = this.getQueryByFilter(filter, jsonFieldTracker);
				result.concat(tempResult);
			});
		}
		return result;
	}
}
