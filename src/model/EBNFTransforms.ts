import {ApplyRule, Group, Transformation} from "./QueryInterfaces";
import Dataset from "./Dataset";
import {EBNFHelper} from "./EBNFHelper";

export class EBNFTransforms {
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
		let valid = true;
		for (const applyKey of objectKeys) {
			valid = valid && EBNFHelper.checkValidApplyKey(applyKey);
		}
		return valid;
	}
}
