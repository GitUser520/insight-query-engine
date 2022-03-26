import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError
} from "./IInsightFacade";
import {
	zipCoursesProcessor,
	zipRoomsProcessor
} from "../services/DatasetProcessor";

import JSZip = require("jszip");
import Dataset from "../model/Dataset";
import Section from "../model/Section";
import {
	QueryStructure, Filter, Options,
	LComparison, MComparison, SComparison, Negation,
	MKeyPair, Key, SKey, MKey, SKeyPair
} from "../model/QueryInterfaces";
import {Utils} from "../model/Utils";
import {EBNF} from "../model/EBNF";
import {Query} from "../model/Query";
import {loadFromDisk, persistToDisk} from "../services/DiskManager";


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
		return new Promise((resolve, reject) => {
			let zipProcessor: any;
			if (id == null || id.includes("_") || id.trim().length === 0) {
				return reject(new InsightError("invalid id"));
			}
			if (this.getAddedDatasetIds().includes(id)) {
				return reject(new InsightError("dataset already added"));
			}
			if (kind === InsightDatasetKind.Courses) {
				zipProcessor = zipCoursesProcessor;
			} else if (kind === InsightDatasetKind.Rooms) {
				zipProcessor = zipRoomsProcessor;
			} else {
				reject(new InsightError("unknown dataset kind"));
			}
			let dataset: Dataset = new Dataset(id, kind);
			zipProcessor(content).then((result: any[]) => {
				dataset.data = result;
				dataset.size = result.length;
				this.addedDatasets.push(dataset);
				persistToDisk(this.addedDatasets);
				return resolve(this.getAddedDatasetIds());

			}).catch((err: any) => {
				// console.log(err);
				return reject(new InsightError(err));
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
			try {
				persistToDisk(this.addedDatasets);
			} catch (err: any) {
				return reject(new InsightError("cannot persist to disk"));
			}
			return resolve(id);
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
		// data should be valid upon checking valid EBNF, because mkey and skey check if item id exists
		// verify query is in valid EBNF form
		// if this executes, then that means that we already know query is a valid JSON object
		let EBNFChecker = new EBNF(this.addedDatasets);
		let validEBNF = EBNFChecker.checkQueryValidEBNF(query);
		if (!validEBNF) {
			return Promise.reject(new InsightError("Invalid query."));
		}
		let queryObject = new Query(this.addedDatasets);
		let insightResultArray = queryObject.getQuery(query as QueryStructure);

		if (insightResultArray.length >= 5000) {
			return Promise.reject(new ResultTooLargeError("Too Large."));
		}

		return Promise.resolve(insightResultArray);
	}


}

