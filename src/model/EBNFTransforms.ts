import {ApplyRule, Group, Transformation} from "./QueryInterfaces";
import Dataset from "./Dataset";

export class EBNFTransforms {
	public static checkQueryTransformations(transform: Transformation, datasets: Dataset[]): boolean {
		let group = transform.GROUP;
		let apply = transform.APPLY;
		return this.checkValidGroup(group, datasets) && this.checkValidApply(apply, datasets);
	}

	// TODO
	private static checkValidGroup(group: Group, datasets: Dataset[]): boolean {
		return false;
	}

	// TODO
	private static checkValidApply(apply: ApplyRule[], datasets: Dataset[]): boolean {
		return false;
	}
}
