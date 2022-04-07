import {SectionRoom} from "./QueryBody";
import {AnyKey, ApplyKey, ApplyRule, ApplyRuleApplyKey, Key, Transformation} from "./QueryInterfaces";
import {InsightError} from "../controller/IInsightFacade";

export class QueryTransform {
	public static applyTransform(transform: Transformation, sectionRooms: SectionRoom): SectionRoom {
		let group = transform.GROUP;
		let applyRules = transform.APPLY;
		let applyRuleOne = applyRules[0];
		sectionRooms = QueryTransform.applyApplyRule(applyRuleOne, sectionRooms, group);

		for (let i = 1; i < applyRules.length; i++) {
			let tempSectionRooms = QueryTransform.applyApplyRule(applyRules[i], sectionRooms, group);
			sectionRooms = tempSectionRooms;
		}

		return sectionRooms;
	}

	public static applyApplyRule(applyRule: ApplyRule, sectionRooms: SectionRoom, group: Key[]): SectionRoom {
		let keys = Object.keys(applyRule);
		if (keys.length !== 1) {
			throw new InsightError("ApplyRule has more or less than 1 key.");
		}
		let key = keys[0];
		let applyObject = applyRule[key] as ApplyRuleApplyKey;
		let applyObjectKeys = Object.keys(applyObject);
		if (applyObjectKeys.length !== 1) {
			throw new InsightError("ApplyRuleApplyKey has more or less than 1 key.");
		}
		let applyToken = applyObjectKeys[0];
		let referencingKey = (applyToken as any)[applyToken];
		let newSectionRoom: SectionRoom;

		if (applyToken === "MAX") {
			newSectionRoom = QueryTransform.applyMax(key, referencingKey, sectionRooms, group);
		} else if (applyToken === "MIN") {
			newSectionRoom = QueryTransform.applyMin(key, referencingKey, sectionRooms, group);
		} else if (applyToken === "AVG") {
			newSectionRoom = QueryTransform.applyAvg(key, referencingKey, sectionRooms, group);
		} else if (applyToken === "COUNT") {
			newSectionRoom = QueryTransform.applyCount(key, referencingKey, sectionRooms, group);
		} else if (applyToken === "SUM") {
			newSectionRoom = QueryTransform.applySum(key, referencingKey, sectionRooms, group);
		} else {
			throw new InsightError("ApplyToken did not have a valid value.");
		}
		return newSectionRoom;
	}

	public static isNewSection(sections: any[], section: any, group: Key[]): boolean {
		sections.forEach((currentSection) => {
			let valid = true;
			for (const keyVal of group) {
				valid = valid && section[keyVal] === currentSection[keyVal];
			}
			if (valid) {
				return true;
			}
		});
		return false;
	}

	public static getEquivalentSection(sections: any[], section: any, group: Key[]): any {
		sections.forEach((currentSection) => {
			let valid = true;
			for (const keyVal of group) {
				valid = valid && section[keyVal] === currentSection[keyVal];
			}
			if (valid) {
				return currentSection;
			}
		});
		return null;
	}

	public static applyMax(applyKey: ApplyKey, referencingKey: Key, sectionRooms: SectionRoom,
		group: Key[]): SectionRoom {
		let newSectionRoom: SectionRoom = {sections: [], rooms: []};

		sectionRooms.sections.forEach((section) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.sections, section, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = section[keyVal];
				}
				object[applyKey] = section[referencingKey];
				newSectionRoom.sections.push(object);
			} else {
				if (section[referencingKey] >= equivSection[applyKey]) {
					equivSection[applyKey] = section[referencingKey];
				}
			}
		});

		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = room[keyVal];
				}
				object[applyKey] = room[referencingKey];
				newSectionRoom.rooms.push(object);
			} else {
				if (room[referencingKey] >= equivSection[applyKey]) {
					equivSection[applyKey] = room[referencingKey];
				}
			}
		});
		return newSectionRoom;
	}

	public static applyMin(applyKey: ApplyKey, referencingKey: Key, sectionRooms: SectionRoom,
		group: Key[]): SectionRoom {
		let newSectionRoom: SectionRoom = {sections: [], rooms: []};

		sectionRooms.sections.forEach((section) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.sections, section, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = section[keyVal];
				}
				object[applyKey] = section[referencingKey];
				newSectionRoom.sections.push(object);
			} else {
				if (section[referencingKey] <= equivSection[applyKey]) {
					equivSection[applyKey] = section[referencingKey];
				}
			}
		});

		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = room[keyVal];
				}
				object[applyKey] = room[referencingKey];
				newSectionRoom.rooms.push(object);
			} else {
				if (room[referencingKey] <= equivSection[applyKey]) {
					equivSection[applyKey] = room[referencingKey];
				}
			}
		});
		return newSectionRoom;
	}

	public static applyAvg(applyKey: ApplyKey, referencingKey: Key, sectionRooms: SectionRoom,
		group: Key[]): SectionRoom {
		let newSectionRoom: SectionRoom = {sections: [], rooms: []};
		sectionRooms.sections.forEach((section) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.sections, section, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = section[keyVal];
				}
				object["SUM_VALUE"] = section[referencingKey];
				object["COUNT_VALUE"] = 1;
				object[applyKey] = object["SUM_VALUE"] / object["COUNT_VALUE"];
				newSectionRoom.sections.push(object);
			} else {
				equivSection["SUM_VALUE"] += section[referencingKey];
				equivSection["COUNT_VALUE"] = equivSection["COUNT_VALUE"] + 1;
				equivSection[applyKey] = equivSection["SUM_VALUE"] / equivSection["COUNT_VALUE"];
			}
		});
		newSectionRoom.sections.forEach((section) => {
			delete section.SUM_VALUE;
			delete section.COUNT_VALUE;
		});
		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = room[keyVal];
				}
				object["SUM_VALUE"] = room[referencingKey];
				object["COUNT_VALUE"] = 1;
				object[applyKey] = object["SUM_VALUE"] / object["COUNT_VALUE"];
				newSectionRoom.rooms.push(object);
			} else {
				equivSection["SUM_VALUE"] += room[referencingKey];
				equivSection["COUNT_VALUE"] = equivSection["COUNT_VALUE"] + 1;
				equivSection[applyKey] = equivSection["SUM_VALUE"] / equivSection["COUNT_VALUE"];
			}
		});
		newSectionRoom.rooms.forEach((section) => {
			delete section.SUM_VALUE;
			delete section.COUNT_VALUE;
		});
		return newSectionRoom;
	}

	public static applyCount(applyKey: ApplyKey, referencingKey: Key, sectionRooms: SectionRoom,
		group: Key[]): SectionRoom {
		let newSectionRoom: SectionRoom = {sections: [], rooms: []};

		sectionRooms.sections.forEach((section) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.sections, section, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = section[keyVal];
				}
				object[applyKey] = 1;
				newSectionRoom.sections.push(object);
			} else {
				equivSection[applyKey] = equivSection[applyKey] + 1;
			}
		});

		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = room[keyVal];
				}
				object[applyKey] = 1;
				newSectionRoom.rooms.push(object);
			} else {
				equivSection[applyKey] = equivSection[applyKey] + 1;
			}
		});
		return newSectionRoom;
	}

	public static applySum(applyKey: ApplyKey, referencingKey: Key, sectionRooms: SectionRoom,
		group: Key[]): SectionRoom {
		let newSectionRoom: SectionRoom = {sections: [], rooms: []};

		sectionRooms.sections.forEach((section) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.sections, section, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = section[keyVal];
				}
				object[applyKey] = section[referencingKey];
				newSectionRoom.sections.push(object);
			} else {
				equivSection[applyKey] += section[referencingKey];
			}
		});

		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					object[keyVal] = room[keyVal];
				}
				object[applyKey] = room[referencingKey];
				newSectionRoom.rooms.push(object);
			} else {
				equivSection[applyKey] += room[referencingKey];
			}
		});
		return newSectionRoom;
	}
}
