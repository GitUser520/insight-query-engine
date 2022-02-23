import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import {loadFromDisk, parseCourse, persistToDisk} from "../services/DatasetProcessor";
import JSZip = require("jszip");
import Dataset from "../model/Dataset";
import Section from "../model/Section";
import {query} from "express";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

	public addedDatasets: Dataset[];

	constructor() {
		this.addedDatasets = loadFromDisk();
		console.log("InsightFacadeImpl::init()");
	}

	public getAddedDatasetIds (): string[] {
		return this.addedDatasets.map((dataset: Dataset) => dataset.id);
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let promises = Array<Promise<string>>();
		let dataset: Dataset;
		return new Promise((resolve, reject) => {
			const newZip = new JSZip();
			if (id == null || id.includes("_") || id.trim().length === 0) {
				return reject(new InsightError("invalid id"));
			}
			if (this.getAddedDatasetIds().includes(id)) {
				return reject(new InsightError("dataset already added"));
			}
			newZip.loadAsync(content, {base64: true})
				.then((zip) => {
					if(zip.folder(/courses/).length === 0) {
						return reject(new InsightError("no folder named courses in the zip file"));
					}
					zip.folder("courses")?.forEach(((relativePath, file) => {
						promises.push(file.async("string"));
					}));
					Promise.all(promises).then( async (promise: string[]) => {
						dataset = new Dataset(id, kind);
						let allSections: Section[] = [];
						for (const courseData of promise) {
							const json = JSON.parse(courseData);
							const result = parseCourse(json);
							allSections = [...allSections, ...result];
						}
						if (allSections.length === 0) {
							return reject(new InsightError("no valid section in this dataset"));
						}
						dataset.data = allSections;
						dataset.size = allSections.length;
						this.addedDatasets.push(dataset);
						await persistToDisk(this.addedDatasets);
						return resolve(this.getAddedDatasetIds());
					});
				})
				.catch(() => {
					// console.log(err);
					return reject(new InsightError("error in loading zip file"));
				});
		});

	}

	public removeDataset(id: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (id == null || id.includes("_") || id.trim().length === 0) {
				return reject(new InsightError("invalid id"));
			}
			if (!this.getAddedDatasetIds().includes(id)) {
				return reject(new NotFoundError("dataset not yet added"));
			}
			this.addedDatasets = this.addedDatasets.filter((dataset) => dataset.id !== id);
			persistToDisk(this.addedDatasets).then(() => resolve(id));
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let datasetList: InsightDataset[] = [];
		return new Promise<InsightDataset[]>((resolve) => {
			let insightDataset: InsightDataset;
			for (const dataset of this.addedDatasets) {
				insightDataset = {
					id: dataset.id,
					kind: dataset.kind,
					numRows: dataset.size
				};
				datasetList.push(insightDataset);
			}
			return resolve(datasetList);
		});

	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// check data is valid


		// verify query is in valid EBNF form
		// if this executes, then that means that we already know query is a valid JSON object
		this.checkQueryValidEBNF(query);

		return Promise.reject("Not implemented");
	}

	private checkQueryValidEBNF(query: unknown): boolean {
		// check if null, check if undefined
		if (query === null || query === undefined) {
			return false;
		}
		// check if query is not of type object
		if (typeof query !== "object") {
			return false;
		}
		// split the query into two parts
		// one part is based on the body, forms a json object
		// other part is based on the options, forms a json object
		let queryBody = (query as Query).WHERE;
		let queryOptions = (query as Query).OPTIONS;

		if (queryBody === null || queryBody === undefined) {
			return false;
		}
		if (queryOptions === null || queryOptions === undefined) {
			return false;
		}

		// check the body
		let validBody = this.checkQueryBody(queryBody);
		// check the options
		let validOptions = this.checkQueryOptions(queryOptions);

		return validBody && validOptions;
	}

	// checks the filters
	private checkQueryBody(body: object): boolean {
		// split query into four parts
		let queryLComparison = (body as Filter).LCOMPARISON;
		let queryMComparison = (body as Filter).MCOMPARISON;
		let querySComparison = (body as Filter).SCOMPARISON;
		let queryNegation = (body as Filter).NEGATION;

		// check if each part is valid
		// check that none of them are null
		if (
			queryLComparison === null ||
			queryMComparison === null ||
			querySComparison === null ||
			queryNegation === null
		) {
			return false;
		}

		// check that at least one of them is defined
		if (
			queryLComparison === undefined &&
			queryMComparison === undefined &&
			querySComparison === undefined &&
			queryNegation === undefined
		) {
			return false;
		}

		let validLComparison = true;
		let validMComparison = true;
		let validSComparison = true;
		let validNegation = true;

		if (queryLComparison !== undefined) {
			validLComparison = this.checkLogicComparison(queryLComparison);
		}
		if (queryMComparison !== undefined) {
			validMComparison = this.checkMComparison(queryMComparison);
		}
		if (querySComparison !== undefined) {
			validSComparison = this.checkSComparison(querySComparison);
		}
		if (queryNegation !== undefined) {
			validNegation = this.checkNegation(queryNegation);
		}

		return validLComparison && validMComparison && validSComparison && validNegation;
	}

	private checkLogicComparison(lComparator: object): boolean {
		let filterANDArray = (lComparator as LComparison).AND;
		let filterORArray = (lComparator as LComparison).OR;

		if (filterANDArray === null || filterORArray === null) {
			return false;
		}
		if (filterANDArray === undefined && filterORArray === undefined) {
			return false;
		}

		let validANDFilter = true;
		let validORFilter = true;

		if (filterANDArray !== undefined) {
			filterANDArray.forEach((filter) => {
				validANDFilter = validANDFilter && this.checkQueryBody(filter);
			});
		}

		if (filterORArray !== undefined) {
			filterORArray.forEach((filter) => {
				validORFilter = validORFilter && this.checkQueryBody(filter);
			});
		}

		return validANDFilter && validORFilter;
	}

	private checkMComparison(mComparator: object): boolean {
		let GTComparator = (mComparator as MComparison).GT;
		let LTComparator = (mComparator as MComparison).LT;
		let EQComparator = (mComparator as MComparison).EQ;
		// check that none of them are null
		if (GTComparator === null || LTComparator === null || EQComparator === null) {
			return false;
		}
		// check that at least one of them is defined
		if (GTComparator === undefined && LTComparator === undefined && EQComparator === undefined) {
			return false;
		}

		let validGT = true;
		let validLT = true;
		let validEQ = true;
		// check that at most one of them is defined
		if (GTComparator !== undefined) {
			if (LTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}

			let key = (GTComparator as MKeyPair).mkey;
			let value = (GTComparator as MKeyPair).number;

			validGT = (key !== undefined) && (value !== undefined);
		}
		// check that at most one of them is defined
		if (LTComparator !== undefined) {
			if (GTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}

			let key = (LTComparator as MKeyPair).mkey;
			let value = (LTComparator as MKeyPair).number;

			validLT = (key !== undefined) && (value !== undefined);
		}
		// check that at most one of them is defined
		if (EQComparator !== undefined) {
			if (GTComparator !== undefined || LTComparator !== undefined) {
				return false;
			}

			let key = (EQComparator as MKeyPair).mkey;
			let value = (EQComparator as MKeyPair).number;

			validEQ = (key !== undefined) && (value !== undefined);
		}

		return validGT && validLT && validEQ;
	}

	private checkSComparison(sComparator: object): boolean {
		let ISObject = (sComparator as SComparison).IS;

		if (ISObject === null || ISObject === undefined) {
			return false;
		}

		let ISValue = (ISObject as SKey).skey;

		if (ISValue === null || ISValue === undefined) {
			return false;
		}

		return true;
	}

	private checkNegation(negation: object): boolean {
		let queryNegation = (negation as Negation).NOT;

		if (queryNegation === null || queryNegation === undefined) {
			return false;
		}

		return this.checkQueryBody(queryNegation);
	}

	private checkQueryOptions(options: object): boolean {
		let queryColumns = (options as Options).COLUMNS;
		let queryOrder = (options as Options).ORDER;

		if (queryColumns === null || queryColumns === undefined) {
			return false;
		}

		if (queryOrder === null) {
			return false;
		}

		// check that the columns are valid
		// TODO
		let validColumns = this.checkQueryColumns(queryColumns);
		let validOrder = true;

		if (queryOrder !== undefined) {
			validOrder = this.checkQueryOrder(queryOrder);
		}

		return validColumns && validOrder;
	}

	// returns true if all elements in the array are valid keys
	private checkQueryColumns(column: Key[]): boolean {
		let result = true;
		column.forEach((key) => {
			result = result && this.checkValidKey(key);
		});

		return result;
	}

	// returns true if the order element is a valid key
	private checkQueryOrder(order: Key): boolean {
		return this.checkValidKey(order);
	}

	// check the validity of a key
	private checkValidKey(key: object): boolean {
		let mkey = (key as Key).mKey;
		let skey = (key as Key).sKey;

		if (mkey === null || mkey === undefined) {
			return false;
		}

		if (skey === null || skey === undefined) {
			return false;
		}

		return this.checkMKey(mkey) && this.checkSKey(skey);
	}

	// TODO checkMKey
	private checkMKey(mkey: MKey): boolean {
		let mKeyParts = mkey.mkey.split("_");
		let validMField = ["avg", "pass", "fail", "audit","year"];

		if (!validMField.includes(mKeyParts[1])) {
			return false;
		}

		// TODO check if mKeyParts[0] is a valid id in our values

		return true;
	}

	// TODO checkSKey
	private checkSKey(skey: SKey): boolean {
		let sKeyParts = skey.skey.split("_");
		let validSField = ["dept", "id", "instructor", "title", "uuid"];

		if (!validSField.includes(sKeyParts[1])) {
			return false;
		}

		// TODO check if sKeyParts[0] is a valid id in our values

		return true;
	}
}

interface Query {
	WHERE: Filter
	OPTIONS: Options
}

interface Filter {
	LCOMPARISON?: LComparison
	MCOMPARISON?: MComparison
	SCOMPARISON?: SComparison
	NEGATION?: Negation
}

interface LComparison {
	AND?: Filter[]
	OR?: Filter[]
}

interface MComparison {
	LT?: MKeyPair
	GT?: MKeyPair
	EQ?: MKeyPair
}

interface MKeyPair {
	mkey: MKey
	number: number
}

interface SComparison {
	IS: SKey
}

interface Key {
	mKey?: MKey
	sKey?: SKey
}

interface SKey {
	skey: string
}

interface MKey {
	mkey: string
}

interface Negation {
	NOT: Filter
}

interface Options {
	COLUMNS: Key[]
	ORDER?: Key
}


