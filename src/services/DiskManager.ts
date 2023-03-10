import Dataset from "../model/Dataset";
import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";


const folder: string = "./data";
const fs = require("fs");

export function loadFromDisk(): Dataset[] {
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
	let datasets: Dataset[] = [];
	try {
		const filenames = fs.readdirSync(folder);
		filenames.forEach((file: any) => {
			const path = folder + "/" + file;
			const result: any[] = JSON.parse(fs.readFileSync(path, "utf8"));
			if (result.length > 0) {
				let dataset: any;
				// if (result[0].hasOwn("dept")) {
				if (Object.prototype.hasOwnProperty.call(result[0],"dept")) {
					dataset = new Dataset(file, InsightDatasetKind.Courses);
				} else {
					dataset = new Dataset(file, InsightDatasetKind.Rooms);
				}
				dataset.data = result;
				dataset.size = result.length;
			}
		});
	} catch(err) {
		console.error(err);
	}
	return datasets;
}

export function persistToDisk(datasets: Dataset[]) {
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
	try {
		for (let d of datasets) {
			fs.writeFileSync(folder + "/" + d.id, JSON.stringify(d));
			// console.log(JSON.stringify(d));
			// console.log(fs.existsSync(folder + "/" + d.id));
		}
	} catch(err) {
		// console.error(err);
		throw new InsightError("error");
	}

}
