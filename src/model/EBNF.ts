import Dataset from "./Dataset";
import {
	AnyKey, Column, Filter, Key, LComparison, MComparison, MKey, MKeyPair,
	Negation, Options, OrderValue, QueryStructure, SComparison, SKey,
	SKeyPair, ApplyRule, ApplyRuleApplyKey, Transformation, Direction, Group
} from "./QueryInterfaces";
import {EBNFHelper} from "./EBNFHelper";
import {Utils} from "./Utils";
import {fdatasync} from "fs";
import {EBNFOptions} from "./EBNFOptions";
import {EBNFBody} from "./EBNFBody";
import {EBNFTransforms} from "./EBNFTransforms";

export class EBNF {

	public datasets: Dataset[];
	public static allMField = [
		"avg", "pass", "fail", "audit","year", "lat", "lon", "seats"
	];

	public static allSField = [
		"dept", "id", "instructor", "title", "uuid", "fullname", "shortname",
		"number", "name", "address", "type", "furniture", "href"
	];

	public static coursesMField = ["avg", "pass", "fail", "audit","year"];
	public static coursesSField = ["dept", "id", "instructor", "title", "uuid"];
	public static roomsMField = ["lat", "lon", "seats"];
	public static roomsSField = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
	public static validDir = ["UP", "DOWN"];
	public datasetID: string;
	public idChanged: boolean;

	constructor(datasets: Dataset[]) {
		this.datasets = datasets;
		this.datasetID = "";
		this.idChanged = false;
	}

	public checkQueryValidEBNF(queryObject: unknown): boolean {
		// check if null, check if undefined
		if (queryObject === null || queryObject === undefined) {
			return false;
		}
		// check if query is not of type object
		if (typeof queryObject !== "object") {
			return false;
		}
		// split the query into two parts
		// one part is based on the body, forms a json object
		// other part is based on the options, forms a json object
		let queryBody = (queryObject as QueryStructure).WHERE;
		let queryOptions = (queryObject as QueryStructure).OPTIONS;
		let queryTransformations = (queryObject as QueryStructure).TRANSFORMATIONS;

		if (queryBody === null || queryBody === undefined) {
			return false;
		}
		if (queryOptions === null || queryOptions === undefined) {
			return false;
		}
		// can be undefined
		if (queryTransformations === null) {
			return false;
		}
		// check the body
		let validBody = EBNFBody.checkQueryBody(queryBody, this.datasets, this);
		// check optional field TRANSFORMATIONS
		let validTransformation = true;
		let additionalColumns: AnyKey[] = [];
		if (queryTransformations !== undefined) {
			validTransformation = EBNFTransforms.checkQueryTransformations(queryTransformations,
				this.datasets, additionalColumns);
		}
		// check the options
		let validOptions = EBNFOptions.checkQueryOptions(queryOptions, this.datasets, additionalColumns);


		return validBody && validOptions && validTransformation;
	}

}
