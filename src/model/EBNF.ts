import Dataset from "./Dataset";
import {
	AnyKey, Column, Filter, Key, LComparison, MComparison, MKey, MKeyPair,
	Negation, Options, OrderValue, QueryStructure, SComparison, SKey,
	SKeyPair, ApplyRule, ApplyRuleApplyKey, Transformation, Direction, Group
} from "./QueryInterfaces";
import {EBNFHelper} from "./EBNFHelper";
import {Utils} from "./Utils";

export class EBNF {

	public datasets: Dataset[];
	public static mField = ["avg", "pass", "fail", "audit","year"];
	public static sField = ["dept", "id", "instructor", "title", "uuid"];
	public static validDir = ["UP", "DOWN"];

	constructor(datasets: Dataset[]) {
		this.datasets = datasets;
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
		// check that at most one of them is defined
		if (GTComparator !== undefined) {
			if (LTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(GTComparator);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && EBNFHelper.checkMKey(mKey, this.datasets);
		}
		// check that at most one of them is defined
		if (LTComparator !== undefined) {
			if (GTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(LTComparator);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && EBNFHelper.checkMKey(mKey, this.datasets);
		}
		// check that at most one of them is defined
		if (EQComparator !== undefined) {
			if (GTComparator !== undefined || LTComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(EQComparator);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && EBNFHelper.checkMKey(mKey, this.datasets);
		}

		return validGT && validLT && validEQ;
	}

	private checkSComparison(sComparator: object): boolean {
		let ISObject = (sComparator as SComparison).IS;

		if (ISObject === null || ISObject === undefined) {
			return false;
		}

		let sKeyPair = Utils.parseSKeyPair(ISObject);
		let sKey = sKeyPair.id + "_" + sKeyPair.field;
		let isValidSKeyPair = sKeyPair.id !== undefined && sKeyPair.field !== undefined
			&& sKeyPair.inputString !== undefined
			&& EBNFHelper.checkSKey(sKey, this.datasets)
			&& EBNFHelper.checkIsValidAsteriskString(sKeyPair.inputString);

		return isValidSKeyPair;
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
			result = result && EBNFHelper.checkValidKey(key, this.datasets);
		});

		return result;
	}

	// returns true if the order element is a valid key
	private checkQueryOrder(orderOrKey: OrderValue | AnyKey, columns: Key[]): boolean {
		let isValid = false;
		if (EBNFHelper.isInstanceOfOrderValue(orderOrKey)) {
			isValid = this.checkValidOrderValue(orderOrKey, columns);
		} else {
			isValid = this.checkValidAnyKey(orderOrKey, columns);
		}
		return isValid;
	}

	private checkValidOrderValue(orderValue: OrderValue, columns: AnyKey[]): boolean {
		let dir = orderValue.dir;
		let keys = orderValue.keys;

		if (dir === null || dir === undefined) {
			return false;
		}
		if (keys === null || keys === undefined || !Array.isArray(keys)) {
			return false;
		}

		return this.checkValidDir(dir) && this.checkValidKeysField(keys, columns);
	}

	private checkValidDir(dir: string): boolean {
		return EBNF.validDir.includes(dir);
	}

	private checkValidKeysField(keys: AnyKey[], columns: AnyKey[]): boolean {
		if (keys.length === 0) {
			return false;
		}
		let valid = true;
		keys.forEach((anykey) => {
			valid = valid && this.checkValidAnyKey(anykey, columns);
		});
		return valid;
	}

	private checkValidAnyKey(orderKey: AnyKey, columns: AnyKey[]): boolean {
		let isKey = this.checkValidKeyInColumns(orderKey, columns);
		if (isKey) {
			return true;
		}
		let inColumns = columns.includes(orderKey);
		return inColumns;
	}

	private checkValidKeyInColumns(key: Key, columns: AnyKey[]) {
		let isValidKey = EBNFHelper.checkValidKey(key, this.datasets);
		let inColumns = columns.includes(key);
		return isValidKey && inColumns;
	}
}
