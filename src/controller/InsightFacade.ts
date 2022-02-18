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

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
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

}

