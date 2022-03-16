import Section from "../model/Section";
import {InsightError} from "../controller/IInsightFacade";

import JSZip from "jszip";
import Room from "../model/Room";


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

const parse5 = require("parse5");

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
	let year = (sectionData.Section === "overall") ? 1900 : parseInt(sectionData.Year, 10);
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

export function zipCoursesProcessor(content: string): Promise<any[]> {
	const newZip = new JSZip();
	let promises = Array<Promise<string>>();
	return newZip.loadAsync(content, {base64: true})
		.then((zip) => {
			if(zip.folder(/courses/).length === 0) {
				return Promise.reject(new InsightError("no folder named courses in the zip file"));
			}
			zip.folder("courses")?.forEach(((relativePath, file) => {
				promises.push(file.async("string"));
			}));
			return Promise.all(promises).then((promise: string[]) => {
				let allSections: Section[] = [];
				for (const courseData of promise) {
					const json = JSON.parse(courseData);
					const result = parseCourse(json);
					allSections = [...allSections, ...result];
				}
				if (allSections.length === 0) {
					return Promise.reject(new InsightError("no valid section in this dataset"));
				}
				// console.log(allSections);
				return allSections;
			});
		})
		.catch(() => {
			return Promise.reject(new InsightError("error in loading zip file"));
		});
}

export function zipRoomsProcessor(content: string): Promise<any[]> {
	const newZip = new JSZip();
	let promises = Array<Promise<string>>();
	return newZip.loadAsync(content, {base64: true})
		.then((zip) => {
			const roomsFolderObj: any = zip.folder("rooms");
			if(!roomsFolderObj) {
				return Promise.reject(new InsightError("no folder named rooms in the zip file"));
			}
			const indexFile = roomsFolderObj.file("index.htm");
			if(!indexFile) {
				return Promise.reject(new InsightError("no file named index.htm"));
			}
			promises.push(indexFile.async("string"));
			return Promise.all(promises).then((files: string[]) => {
				return processIndex(files, roomsFolderObj);
			}).then((rooms: any[]) => {
				if (rooms.length === 0) {
					return Promise.reject(new InsightError("no valid room found"));
				}
				return Promise.resolve(rooms);
			}).catch((err) => {
				return Promise.reject(new InsightError("error in getting rooms " + err));
			});
		})
		.catch((err) => {
			return Promise.reject(new InsightError(err));
		});
}

function processIndex(files: any[], roomsFolderObj: JSZip): Promise<any[]> {
	return new Promise((resolve, reject) => {
		let roomPromises = Array<Promise<any>>();
		const document = parse5.parse(files[0]);
		const tbody = getNodeHelper(document, "tbody");
		let allRooms: Room[] = [];
		for (let rowNode of tbody.childNodes) {
			if (rowNode.nodeName === "tr") {
				let address: any = null, href: any = null, code: any = null, fullname: any = null;
				for (let cellNode of rowNode.childNodes) {
					if (cellNode.nodeName === "td") {
						const value = cellNode.attrs[0].value;
						if (value === "views-field views-field-field-building-address") {
							address = cellNode.childNodes[0].value.trim();
						} else if (value === "views-field views-field-title") {
							const a = getNodeHelper(cellNode, "a");
							href = a.attrs[0].value.trim();
							if (a.attrs.length > 1 && a.childNodes[0].nodeName === "#text") {
								fullname = a.childNodes[0].value.trim();
							}
						} else if (value === "views-field views-field-field-building-code") {
							code = cellNode.childNodes[0].value.trim();
						}
					}
				}
				if (address != null && href != null && code != null && fullname != null) {
					roomPromises.push(parseBuilding(address, href, code, fullname, roomsFolderObj));
				}
			}
		}
		Promise.all(roomPromises).then((results: any[]) => {
			if (results.length > 0) {
				for (let result of results) {
					allRooms = [...allRooms, ...result];
				}
			}
			return resolve(allRooms);
		});

	});

}

function getNodeHelper(document: any, nodeName: any): any {
	if (document == null || document.childNodes === undefined) {
		return null;
	}
	if (document.nodeName === nodeName) {
		return document;
	}
	for (let childNode of document.childNodes) {
		let node = getNodeHelper(childNode, nodeName);
		if (node !== null) {
			return node;
		}
	}
	return null;
}

function parseBuilding(address: string, href: string, code: string, fullname: string, roomsFolder: JSZip):
	Promise<any> {
	let rooms: Room[] = [];
	return new Promise((resolve, reject) => {
		const geoLocation = getGeoLocation(address);
		let roomsData = roomsFolder?.file(href.slice(2))?.async("text").then((str: string) => {
			return parse5.parse(str);
		}).then((tree: any) => {
			return getNodeHelper(tree, "tbody");
		});
		Promise.all([geoLocation, roomsData]).then(([resultGeoLocation, resultRoomsData]) => {
			if (resultGeoLocation && resultRoomsData !== null) {
				for (let roomNode of resultRoomsData.childNodes) {
					if (roomNode.nodeName === "tr") {
						const fullHref = "http://students.ubc.ca/" + href.slice(2);
						let room: Room = parseRoom(roomNode, code, fullname, address, fullHref, resultGeoLocation);
						rooms.push(room);
					}
				}
			}
		}).then(() => {
			resolve(rooms);
		}).catch((err) => {
			reject(new InsightError(err));
		});

	});


}

function parseRoom(node: any, code: string, fullname: string, address: string, href: string, geoLocation: any): any {
	let number: any = null, capacity: any = null, furniture: any = null, type: any = null;
	for (let fieldNode of node.childNodes) {
		if (fieldNode.nodeName === "td") {
			const value = fieldNode.attrs[0].value;
			if (value === "views-field views-field-field-room-number") {
				const a = getNodeHelper(fieldNode, "a");
				number = a.childNodes[0].value;
			} else if (value === "views-field views-field-field-room-capacity") {
				capacity = fieldNode.childNodes[0].value.trim();
			} else if (value === "views-field views-field-field-room-furniture") {
				furniture = fieldNode.childNodes[0].value.trim();
			} else if (value === "views-field views-field-field-room-type") {
				type = fieldNode.childNodes[0].value.trim();
			}
		}
	}
	let name = code + "_" + number;
	return new Room(fullname, code, number, name, address,
		geoLocation.lat, geoLocation.lon, capacity, type, furniture, href);
}

function getGeoLocation(address: string): Promise<any> {
	return new Promise((resolve, reject) => {
		let http = require("http");
		const url = encodeURL(address);
		// citation: https://nodejs.org/api/http.html#httpgeturl-options-callback
		http.get(url, (res: any) => {
			res.setEncoding("utf8");
			let rawData = "";
			res.on("data", (chunk: any) => {
				rawData += chunk;
			});
			res.on("end", () => {
				try {
					const parsedData = JSON.parse(rawData);
					resolve(parsedData);
				} catch (e: any) {
					reject(new InsightError(e));
				}
			});
		}).on("error", (e: any) => {
			reject(new InsightError(e));
		});
	});
}

function encodeURL(address: string): string {
	const encodedAddress =  address.trim().split(" ").join("%20");
	const url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team617/" + encodedAddress;
	return url;
}
