import Dataset from "./Dataset";
import {
	Filter, Key,
	LComparison,
	MComparison, MKey,
	MKeyPair,
	Negation,
	Options,
	Query,
	SComparison, SKey,
	SKeyPair
} from "./QueryInterfaces";

export class EBNF {

	public datasets: Dataset[];

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
		let queryBody = (queryObject as Query).WHERE;
		let queryOptions = (queryObject as Query).OPTIONS;

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
		let queryLComparison = (body as Filter).LCOMPARISON;
		let queryMComparison = (body as Filter).MCOMPARISON;
		let querySComparison = (body as Filter).SCOMPARISON;
		let queryNegation = (body as Filter).NEGATION;

		// check if each part is valid
		// check that none of them are null
		if (
			queryLComparison === null ||
			queryMComparison === null ||
			querySComparison === null ||
			queryNegation === null
		) {
			return false;
		}

		// check that at least one of them is defined
		if (
			queryLComparison === undefined &&
			queryMComparison === undefined &&
			querySComparison === undefined &&
			queryNegation === undefined
		) {
			return false;
		}

		let validLComparison = true;
		let validMComparison = true;
		let validSComparison = true;
		let validNegation = true;

		if (queryLComparison !== undefined) {
			validLComparison = this.checkLogicComparison(queryLComparison);
		}
		if (queryMComparison !== undefined) {
			validMComparison = this.checkMComparison(queryMComparison);
		}
		if (querySComparison !== undefined) {
			validSComparison = this.checkSComparison(querySComparison);
		}
		if (queryNegation !== undefined) {
			validNegation = this.checkNegation(queryNegation);
		}

		return validLComparison && validMComparison && validSComparison && validNegation;
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

		let validANDFilter = true;
		let validORFilter = true;

		if (filterANDArray !== undefined) {
			filterANDArray.forEach((filter) => {
				validANDFilter = validANDFilter && this.checkQueryBody(filter);
			});
		}

		if (filterORArray !== undefined) {
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

			let key = (GTComparator as MKeyPair).mKey;
			let value = (GTComparator as MKeyPair).number;

			validGT = (key !== undefined) && (value !== undefined);
		}
		// check that at most one of them is defined
		if (LTComparator !== undefined) {
			if (GTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}

			let key = (LTComparator as MKeyPair).mKey;
			let value = (LTComparator as MKeyPair).number;

			validLT = (key !== undefined) && (value !== undefined);
		}
		// check that at most one of them is defined
		if (EQComparator !== undefined) {
			if (GTComparator !== undefined || LTComparator !== undefined) {
				return false;
			}

			let key = (EQComparator as MKeyPair).mKey;
			let value = (EQComparator as MKeyPair).number;

			validEQ = (key !== undefined) && (value !== undefined);
		}

		return validGT && validLT && validEQ;
	}

	private checkSComparison(sComparator: object): boolean {
		let ISObject = (sComparator as SComparison).IS;

		if (ISObject === null || ISObject === undefined) {
			return false;
		}

		let ISValue = (ISObject as SKeyPair).sKey;

		if (ISValue === null || ISValue === undefined) {
			return false;
		}

		return true;
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

		if (queryOrder === null) {
			return false;
		}

		// check that the columns are valid
		let validColumns = this.checkQueryColumns(queryColumns);
		let validOrder = true;

		if (queryOrder !== undefined) {
			validOrder = this.checkQueryOrder(queryOrder);
		}

		return validColumns && validOrder;
	}

	// returns true if all elements in the array are valid keys
	private checkQueryColumns(column: Key[]): boolean {
		let result = true;
		column.forEach((key) => {
			result = result && this.checkValidKey(key);
		});

		return result;
	}

	// returns true if the order element is a valid key
	private checkQueryOrder(order: Key): boolean {
		return this.checkValidKey(order);
	}

	// check the validity of a key
	private checkValidKey(key: object): boolean {
		let mkey = (key as Key).mKey;
		let skey = (key as Key).sKey;

		if (mkey === null || mkey === undefined) {
			return false;
		}

		if (skey === null || skey === undefined) {
			return false;
		}

		return this.checkMKey(mkey) && this.checkSKey(skey);
	}

	private checkMKey(mkey: MKey): boolean {
		let mKeyParts = mkey.mKey.split("_");
		let validMField = ["avg", "pass", "fail", "audit","year"];

		if (!validMField.includes(mKeyParts[1])) {
			return false;
		}

		let valid = false;
		this.datasets.forEach((dataset) => {
			valid = valid || (dataset.id === mKeyParts[0]);
		});

		return valid;
	}

	private checkSKey(skey: SKey): boolean {
		let sKeyParts = skey.sKey.split("_");
		let validSField = ["dept", "id", "instructor", "title", "uuid"];

		if (!validSField.includes(sKeyParts[1])) {
			return false;
		}

		let valid = false;
		this.datasets.forEach((dataset) => {
			valid = valid || (dataset.id === sKeyParts[0]);
		});

		return valid;
	}
}

