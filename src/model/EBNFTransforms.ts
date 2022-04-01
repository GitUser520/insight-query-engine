import {ApplyRule, Group, Transformation, Key} from "./QueryInterfaces";
import Dataset from "./Dataset";
import {EBNFHelper} from "./EBNFHelper";
import {EBNF} from "./EBNF";

export class EBNFTransforms {
	/*
	TODO:
	In addition to the semantic checking from Checkpoint 1, you must perform the following semantic check:
	- The applykey in an APPLYRULE should be unique (no two APPLYRULEs should share an applykey with the same name).
	- If a GROUP is present, all COLUMNS terms must correspond to either GROUP keys or to applykeys defined in the APPLY block.
	- SORT - Any keys provided must be in the COLUMNS.
	- MAX/MIN/AVG/SUM should only be requested for numeric keys. COUNT can be requested for all keys.
	 */

	public static checkQueryTransformations(transform: Transformation, datasets: Dataset[]): boolean {
		let group = transform.GROUP;
		let apply = transform.APPLY;
		return this.checkValidGroup(group, datasets) && this.checkValidApply(apply, datasets);
	}

	private static checkValidGroup(group: Group, datasets: Dataset[]): boolean {
		if (!Array.isArray(group) || group.length === 0) {
			return false;
		}
		let valid = true;
		group.forEach((key) => {
			valid = valid && EBNFHelper.checkValidKey(key, datasets);
		});
		return valid;
	}

	private static checkValidApply(apply: ApplyRule[], datasets: Dataset[]): boolean {
		if (!Array.isArray(apply) || apply.length === 0) {
			return false;
		}
		let valid = true;
		apply.forEach((applyRule) => {
			valid = valid && this.checkValidApplyRule(applyRule, datasets);
		});
		return valid;
	}

	private static checkValidApplyRule(applyRule: ApplyRule, datasets: Dataset[]): boolean {
		let objectKeys = Object.keys(applyRule);
		// should only be one key
		if (objectKeys.length !== 1) {
			return false;
		}
		let applyKey = objectKeys[0];
		let validApplyKey = EBNFHelper.checkValidApplyKey(applyKey);

		let applyRuleApplyKey = applyRule[applyKey];
		let applyRuleKeys = Object.keys(applyRuleApplyKey);
		if (applyRuleKeys.length !== 1) {
			return false;
		}
		let keyField = applyRuleKeys[0];
		let isValidKeyValue = false;
		if (keyField === "COUNT") {
			// check Key can be any
			let keyValue = applyRuleApplyKey[keyField];
			if (keyValue === null || keyValue === undefined) {
				return false;
			}
			// set isValidKeyValue with a check
			isValidKeyValue = EBNFHelper.checkValidKey(keyValue, datasets);
		} else if (keyField === "MAX" || keyField === "MIN" || keyField === "AVG" || keyField === "SUM") {
			// check Key is numeric (i.e. mkey)
			let keyValue = applyRuleApplyKey[keyField];
			// set isValidKeyValue with a check
			if (keyValue === null || keyValue === undefined) {
				return false;
			}
			isValidKeyValue = EBNFHelper.checkMKey(keyValue, datasets);
		} else {
			return false;
		}

		return validApplyKey && isValidKeyValue;
	}
}
