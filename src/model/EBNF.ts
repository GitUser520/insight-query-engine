import Dataset from "./Dataset";
import {
	Filter, Key,
	LComparison,
	MComparison, MKey,
	MKeyPair,
	Negation,
	Options,
	QueryStructure,
	SComparison, SKey,
	SKeyPair
} from "./QueryInterfaces";
import {EBNFHelper} from "./EBNFHelper";
import {Utils} from "./Utils";

export class EBNF {

	public datasets: Dataset[];
	public static mField = ["avg", "pass", "fail", "audit","year"];
	public static sField = ["dept", "id", "instructor", "title", "uuid"];
	private datasetID: string;
	private idChanged: boolean;

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

		if (queryBody === null || queryBody === undefined) {
			return false;
		}
		if (queryOptions === null || queryOptions === undefined) {
			return false;
		}

		// check the body
		let validBody = this.checkQueryBody(queryBody);
		// check the options
		let validOptions = this.checkQueryOptions(queryOptions);

		return validBody && validOptions;
	}

	// checks the filters
	private checkQueryBody(body: object): boolean {
		// split query into four parts
		let filter = body as Filter;

		// check for empty object
		if (Object.keys(filter).length === 0) {
			return true;
		}

		// check not null or undefined
		if (filter === null || filter === undefined) {
			return false;
		}

		let validLComparison = false;
		let validMComparison = false;
		let validSComparison = false;
		let validNegation = false;

		if (EBNFHelper.isInstanceOfLComparison(filter)) {
			validLComparison = this.checkLogicComparison(filter);
		} else if (EBNFHelper.isInstanceOfMComparison(filter)) {
			validMComparison = this.checkMComparison(filter);
		} else if (EBNFHelper.isInstanceOfSComparison(filter)) {
			validSComparison = this.checkSComparison(filter);
		} else if (EBNFHelper.isInstanceOfNegation(filter)) {
			validNegation = this.checkNegation(filter);
		}

		return validLComparison || validMComparison || validSComparison || validNegation;
	}

	private checkLogicComparison(lComparator: object): boolean {
		let filterANDArray = (lComparator as LComparison).AND;
		let filterORArray = (lComparator as LComparison).OR;

		if (filterANDArray === null || filterORArray === null) {
			return false;
		}
		if (filterANDArray === undefined && filterORArray === undefined) {
			return false;
		}
		if (filterANDArray === undefined && !Array.isArray(filterORArray)) {
			return false;
		}
		if (filterORArray === undefined && !Array.isArray(filterANDArray)) {
			return false;
		}

		let validANDFilter = true;
		let validORFilter = true;

		if (filterANDArray !== undefined) {
			if (filterANDArray.length === 0) {
				return false;
			}

			filterANDArray.forEach((filter) => {
				validANDFilter = validANDFilter && this.checkQueryBody(filter);
			});
		}

		if (filterORArray !== undefined) {
			if (filterORArray.length === 0) {
				return false;
			}

			filterORArray.forEach((filter) => {
				validORFilter = validORFilter && this.checkQueryBody(filter);
			});
		}

		return validANDFilter && validORFilter;
	}

	private checkMComparison(mComparator: object): boolean {
		let GTComparator = (mComparator as MComparison).GT;
		let LTComparator = (mComparator as MComparison).LT;
		let EQComparator = (mComparator as MComparison).EQ;
		// check that none of them are null
		if (GTComparator === null || LTComparator === null || EQComparator === null) {
			return false;
		}
		// check that at least one of them is defined
		if (GTComparator === undefined && LTComparator === undefined && EQComparator === undefined) {
			return false;
		}
		let validGT = true;
		let validLT = true;
		let validEQ = true;
		let validID = true;
		// check that at most one of them is defined
		if (GTComparator !== undefined) {
			if (LTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(GTComparator);
			validID = this.checkID(mKeyPair.id);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && (typeof mKeyPair.number === "number")
				&& EBNFHelper.checkMKey(mKey, this.datasets);
		}
		// check that at most one of them is defined
		if (LTComparator !== undefined) {
			if (GTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(LTComparator);
			validID = this.checkID(mKeyPair.id);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && (typeof mKeyPair.number === "number")
				&& EBNFHelper.checkMKey(mKey, this.datasets);
		}
		// check that at most one of them is defined
		if (EQComparator !== undefined) {
			if (GTComparator !== undefined || LTComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(EQComparator);
			validID = this.checkID(mKeyPair.id);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && (typeof mKeyPair.number === "number")
				&& EBNFHelper.checkMKey(mKey, this.datasets);
		}
		return validID && validGT && validLT && validEQ;
	}

	private checkSComparison(sComparator: object): boolean {
		let ISObject = (sComparator as SComparison).IS;

		if (ISObject === null || ISObject === undefined) {
			return false;
		}

		let sKeyPair = Utils.parseSKeyPair(ISObject);
		let validID = this.checkID(sKeyPair.id);
		let sKey = sKeyPair.id + "_" + sKeyPair.field;
		let isValidSKeyPair = sKeyPair.id !== undefined && sKeyPair.field !== undefined
			&& sKeyPair.inputString !== undefined
			&& EBNFHelper.checkSKey(sKey, this.datasets)
			&& EBNFHelper.checkIsValidAsteriskString(sKeyPair.inputString);

		return validID && isValidSKeyPair;
	}

	private checkNegation(negation: object): boolean {
		let queryNegation = (negation as Negation).NOT;

		if (queryNegation === null || queryNegation === undefined) {
			return false;
		}

		return this.checkQueryBody(queryNegation);
	}

	private checkQueryOptions(options: object): boolean {
		let queryColumns = (options as Options).COLUMNS;
		let queryOrder = (options as Options).ORDER;

		if (queryColumns === null || queryColumns === undefined) {
			return false;
		}

		// check that the columns are valid
		let validColumns = this.checkQueryColumns(queryColumns);
		let validOrder = true;

		if (queryOrder !== undefined) {
			validOrder = this.checkQueryOrder(queryOrder, queryColumns);
		}

		return validColumns && validOrder;
	}

	// returns true if all elements in the array are valid keys
	private checkQueryColumns(column: Key[]): boolean {
		if (!Array.isArray(column) || column.length === 0) {
			return false;
		}
		let result = true;
		column.forEach((key) => {
			result = result && this.checkValidKey(key);
		});

		return result;
	}

	// returns true if the order element is a valid key
	private checkQueryOrder(order: Key, columns: Key[]): boolean {
		let orderInColumns = false;
		columns.forEach((key) => {
			orderInColumns = orderInColumns || (key === order);
		});

		return orderInColumns && this.checkValidKey(order);
	}

	// check the validity of a key
	private checkValidKey(key: Key): boolean {
		if (key === null || key === undefined) {
			return false;
		}

		let keyString = key as Key;

		let mkey = keyString as MKey;
		let skey = keyString as SKey;

		return EBNFHelper.checkMKey(mkey, this.datasets) || EBNFHelper.checkSKey(skey, this.datasets);
	}

	private checkID(id: string): boolean {
		if (!this.idChanged) {
			this.datasetID = id;
			this.idChanged = true;
		} else if (this.idChanged && this.datasetID !== id) {
			return false;
		}
		return true;
	}
}

