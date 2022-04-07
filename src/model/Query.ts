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
import {QueryTransform} from "./QueryTransform";

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
		let queryTransforms = queryObject.TRANSFORMATIONS;
		// options
		let queryColumns = queryOptions.COLUMNS;
		let queryOrder = queryOptions.ORDER;

		let jsonFieldTracker: any = {};

		queryColumns.forEach((key) => {
			if (EBNFHelper.isInstanceOfApplyKey(key)) {
				jsonFieldTracker[key] = {field: key};
			} else {
				let keyValues = Utils.parseKey(key);
				let stringID = keyValues.id + "_" + keyValues.field;

				jsonFieldTracker[stringID] = keyValues;
			}
		});

		// results
		let querySectionResults = QueryBody.getQueryByFilter(this.datasets, queryWhere, false);
		let applyTransformationResults = querySectionResults;
		if (queryTransforms !== undefined) {
			applyTransformationResults = QueryTransform.applyTransform(queryTransforms, querySectionResults);
		}
		let queryResults = Utils.filterByOptions(applyTransformationResults, jsonFieldTracker);
		if (queryOrder !== null && queryOrder !== undefined) {
			if (EBNFHelper.isInstanceOfOrderValue(queryOrder)) {
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


