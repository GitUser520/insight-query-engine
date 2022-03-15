import {InsightDatasetKind} from "../controller/IInsightFacade";
import Section from "./Section";


export default class Dataset {
	public id: string;
	public kind: InsightDatasetKind;
	public data: any[];
	public size: number;

	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
		this.data = [];
		this.size = 0;
	}
}
