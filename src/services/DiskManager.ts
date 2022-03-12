import Dataset from "../model/Dataset";
import {mkdirp, mkdirpSync} from "fs-extra";
import {InsightError} from "../controller/IInsightFacade";


const filename: string = "./data/datasets.json";
const folder: string = "./data";

export function loadFromDisk(): Dataset[] {
	const fs = require("fs");
	let getDirName = require("path").dirname;
	let result: Dataset[] = [];
	try {
		mkdirp(getDirName(filename), function () {
			result = JSON.parse(fs.readFileSync(filename, "utf8"));
		});
	} catch(err) {
		// console.error(err);
	}
	return result;
}

export async function persistToDisk(datasets: Dataset[]): Promise<void> {
	const fs = require("fs");
	let getDirName = require("path").dirname;
	const projectDir: string[] =  fs.readdirSync("./");
	if (!projectDir.includes(folder)) {
		mkdirpSync(folder);
	}
	return new Promise((resolve, reject) => {
		try {
			mkdirp(getDirName(filename), function () {
				fs.writeFileSync(filename, JSON.stringify(datasets));
			});
		} catch(err) {
			// console.error(err);
			return reject(new InsightError("error"));
		}
		return resolve();
	});

}
