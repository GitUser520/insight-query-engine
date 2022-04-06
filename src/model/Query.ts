import Dataset from "./Dataset";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import {Utils} from "./Utils";
import {
	QueryStructure, Filter, LComparison, MComparison, MKeyPair, Negation, SComparison
} from "./QueryInterfaces";
import Section from "./Section";
import {EBNFHelper} from "./EBNFHelper";
import {EBNF} from "./EBNF";
import {QueryBody} from "./QueryBody";
import {QuerySort} from "./QuerySort";
import {query} from "express";

export class Query {
	public datasets: Dataset[];

	constructor(datasets: Dataset[]) {
		this.datasets = datasets;
	}

	// gets the elements from the dataset using the query
	public getQuery(queryObject: QueryStructure): InsightResult[] {
		// query
		let queryWhere = queryObject.WHERE;
		let queryOptions = queryObject.OPTIONS;
		// options
		let queryColumns = queryOptions.COLUMNS;
		let queryOrder = queryOptions.ORDER;

		let jsonFieldTracker: any = {};

		queryColumns.forEach((key) => {
			let keyValues = Utils.parseKey(key);
			let stringID = keyValues.id + "_" + keyValues.field;

			jsonFieldTracker[stringID] = keyValues;
		});

		// results
		let querySectionResults = QueryBody.getQueryByFilter(this.datasets, queryWhere, false);
		// TODO apply transformations here
		// let applyTransformationResults = QueryTransform.applyTransform(querySectionResults);
		// TODO filter by options on top of the new transformations
		let queryResults = Utils.filterByOptions(querySectionResults, jsonFieldTracker);
		if (queryOrder !== null && queryOrder !== undefined) {
			if (EBNFHelper.isInstanceOfOrderValue(queryOrder)) {
				console.log("should not be here");
				let dir = queryOrder.dir;
				let keys = queryOrder.keys;
				QuerySort.querySortArray(queryResults, keys, dir);
			} else {
				QuerySort.querySort(queryResults, queryOrder);
			}
		}

		return queryResults;
	}


}


