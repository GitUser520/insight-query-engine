import {SectionRoom} from "./QueryBody";
import {AnyKey, ApplyKey, ApplyRule, ApplyRuleApplyKey, Key, Transformation} from "./QueryInterfaces";
import {InsightError} from "../controller/IInsightFacade";
import {Utils} from "./Utils";

export class QueryTransform {
	public static applyTransform(transform: Transformation, sectionRooms: SectionRoom): SectionRoom {
		let group = transform.GROUP;
		let applyRules = transform.APPLY;
		if (applyRules.length === 0) {
			return sectionRooms;
		}
		let applyRuleOne = applyRules[0];
		let newSectionRooms = QueryTransform.applyApplyRule(applyRuleOne, sectionRooms, group);

		for (let i = 1; i < applyRules.length; i++) {
			let tempSectionRooms = QueryTransform.applyApplyRule(applyRules[i], newSectionRooms, group);
			newSectionRooms = tempSectionRooms;
		}

		return newSectionRooms;
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
		let referencingKey = (applyObject as any)[applyToken];
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
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = section[parsedKey.field];
				}
				let parsedRefKey = Utils.parseKey(referencingKey);
				object[applyKey] = section[parsedRefKey.field];
				newSectionRoom.sections.push(object);
			} else {
				let parsedRefKey = Utils.parseKey(referencingKey);
				if (section[parsedRefKey.field] >= equivSection[applyKey]) {
					equivSection[applyKey] = section[parsedRefKey.field];
				}
			}
		});

		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = room[parsedKey.field];
				}
				let parsedRefKey = Utils.parseKey(referencingKey);
				object[applyKey] = room[parsedRefKey.field];
				newSectionRoom.rooms.push(object);
			} else {
				let parsedRefKey = Utils.parseKey(referencingKey);
				if (room[parsedRefKey.field] >= equivSection[applyKey]) {
					equivSection[applyKey] = room[parsedRefKey.field];
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
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = section[parsedKey.field];
				}
				let parsedRefKey = Utils.parseKey(referencingKey);
				object[applyKey] = section[parsedRefKey.field];
				newSectionRoom.sections.push(object);
			} else {
				let parsedRefKey = Utils.parseKey(referencingKey);
				if (section[parsedRefKey.field] <= equivSection[applyKey]) {
					equivSection[applyKey] = section[parsedRefKey.field];
				}
			}
		});

		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = room[parsedKey.field];
				}
				let parsedRefKey = Utils.parseKey(referencingKey);
				object[applyKey] = room[parsedRefKey.field];
				newSectionRoom.rooms.push(object);
			} else {
				let parsedRefKey = Utils.parseKey(referencingKey);
				if (room[parsedRefKey.field] <= equivSection[applyKey]) {
					equivSection[applyKey] = room[parsedRefKey.field];
				}
			}
		});
		return newSectionRoom;
	}

	public static applyAvg(applyKey: ApplyKey, referencingKey: Key, sectionRooms: SectionRoom,
		group: Key[]): SectionRoom {
		let newSectionRoom: SectionRoom = {sections: [], rooms: []};
		let parsedRefKey = Utils.parseKey(referencingKey);
		sectionRooms.sections.forEach((section) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.sections, section, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = section[parsedKey.field];
				}
				object["SUM_VALUE"] = section[parsedRefKey.field];
				object["COUNT_VALUE"] = 1;
				object[applyKey] = object["SUM_VALUE"] / object["COUNT_VALUE"];
				newSectionRoom.sections.push(object);
			} else {
				equivSection["SUM_VALUE"] += section[parsedRefKey.field];
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
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = room[parsedKey.field];
				}
				object["SUM_VALUE"] = room[parsedRefKey.field];
				object["COUNT_VALUE"] = 1;
				object[applyKey] = object["SUM_VALUE"] / object["COUNT_VALUE"];
				newSectionRoom.rooms.push(object);
			} else {
				equivSection["SUM_VALUE"] += room[parsedRefKey.field];
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
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = section[parsedKey.field];
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
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = room[parsedKey.field];
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
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = section[parsedKey.field];
				}
				let parsedRefKey = Utils.parseKey(referencingKey);
				object[applyKey] = section[parsedRefKey.field];
				newSectionRoom.sections.push(object);
			} else {
				let parsedRefKey = Utils.parseKey(referencingKey);
				equivSection[applyKey] += section[parsedRefKey.field];
			}
		});

		sectionRooms.rooms.forEach((room) => {
			let equivSection = QueryTransform.getEquivalentSection(newSectionRoom.rooms, room, group);
			if (equivSection === null) {
				let object: any = {};
				for (const keyVal of group) {
					let parsedKey = Utils.parseKey(keyVal);
					object[parsedKey.field] = room[parsedKey.field];
				}
				let parsedRefKey = Utils.parseKey(referencingKey);
				object[applyKey] = room[parsedRefKey.field];
				newSectionRoom.rooms.push(object);
			} else {
				let parsedRefKey = Utils.parseKey(referencingKey);
				equivSection[applyKey] += room[parsedRefKey.field];
			}
		});
		return newSectionRoom;
	}
}
