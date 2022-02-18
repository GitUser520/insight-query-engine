import Section from "../model/Section";
import {InsightError} from "../controller/IInsightFacade";
import Dataset from "../model/Dataset";
import {mkdirp} from "fs-extra";


export const keyMapping: any = {
	Subject: "dept",
	Course: "id",
	Avg: "avg",
	Professor: "instructor",
	Title: "title",
	Pass: "pass",
	Fail: "fail",
	Audit: "audit",
	id: "uuid",
	Year: "year"
};

export const typeMapping: any = {
	Subject: "string",
	Course: "string",
	Avg: "number",
	Professor: "string",
	Title: "string",
	Pass: "number",
	Fail: "number",
	Audit: "number",
	id: "string",
	Year: "string"
};

const filename: string = "/data/datasets.json";

export function parseCourse(json: any): Section[] {
	const result = json["result"];
	let allSections: Section[] = [];

	let parsedSection: Section;
	if (result === null) {
		return allSections;
	}
	for (const sectionData of result) {
		if (isValidSection(sectionData)) {
			parsedSection = parseSection(sectionData);
			allSections.push(parsedSection);
		}
	}
	return allSections;
}

// parse a single section
export function parseSection(sectionData: any): any {
	let dept = sectionData.Subject;
	let id = sectionData.Course;
	let avg = sectionData.Avg;
	let instructor = sectionData.Professor;
	let title = sectionData.Title;
	let pass = sectionData.Pass;
	let fail = sectionData.Fail;
	let audit = sectionData.Audit;
	let uuid = sectionData.id.toString();
	let year = (sectionData.Session === "overall") ? 1900 : parseInt(sectionData.Year, 10);
	return new Section(dept, id, avg, instructor, title, pass, fail, audit, uuid, year);
}

export function isValidSection(json: any): boolean {
	const keys: string[] = Object.keys(json);
	const requiredKeys: string[] = Object.keys(keyMapping);
	// check if containing all keys required
	for (const requiredKey of requiredKeys) {
		// console.log(requiredKey);
		if (!keys.includes(requiredKey)) {
			return false;
		}
	}
	return true;
}

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

