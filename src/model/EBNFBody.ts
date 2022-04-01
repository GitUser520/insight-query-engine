import Dataset from "./Dataset";
import {Filter, LComparison, MComparison, Negation, SComparison} from "./QueryInterfaces";
import {EBNFHelper} from "./EBNFHelper";
import {Utils} from "./Utils";
import {EBNF} from "./EBNF";

export class EBNFBody {
	// checks the filters
	public static checkQueryBody(body: object, datasets: Dataset[], ebnf: EBNF): boolean {
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
			validLComparison = this.checkLogicComparison(filter, datasets, ebnf);
		} else if (EBNFHelper.isInstanceOfMComparison(filter)) {
			validMComparison = this.checkMComparison(filter, datasets, ebnf);
		} else if (EBNFHelper.isInstanceOfSComparison(filter)) {
			validSComparison = this.checkSComparison(filter, datasets, ebnf);
		} else if (EBNFHelper.isInstanceOfNegation(filter)) {
			validNegation = this.checkNegation(filter, datasets, ebnf);
		}
		return validLComparison || validMComparison || validSComparison || validNegation;
	}

	private static checkLogicComparison(lComparator: object, datasets: Dataset[], ebnf: EBNF): boolean {
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
				validANDFilter = validANDFilter && this.checkQueryBody(filter, datasets, ebnf);
			});
		}

		if (filterORArray !== undefined) {
			if (filterORArray.length === 0) {
				return false;
			}

			filterORArray.forEach((filter) => {
				validORFilter = validORFilter && this.checkQueryBody(filter, datasets, ebnf);
			});
		}

		return validANDFilter && validORFilter;
	}

	private static checkMComparison(mComparator: object, datasets: Dataset[], ebnf: EBNF): boolean {
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
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validID = EBNFBody.checkID(mKeyPair.id, ebnf);
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && typeof mKeyPair.number === "number"
				&& EBNFHelper.checkMKey(mKey, datasets);
		}
		// check that at most one of them is defined
		if (LTComparator !== undefined) {
			if (GTComparator !== undefined || EQComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(LTComparator);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validID = EBNFBody.checkID(mKeyPair.id, ebnf);
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && typeof mKeyPair.number === "number"
				&& EBNFHelper.checkMKey(mKey, datasets);
		}
		// check that at most one of them is defined
		if (EQComparator !== undefined) {
			if (GTComparator !== undefined || LTComparator !== undefined) {
				return false;
			}
			let mKeyPair = Utils.parseMKeyPair(EQComparator);
			let mKey = mKeyPair.id + "_" + mKeyPair.field;
			validID = EBNFBody.checkID(mKeyPair.id, ebnf);
			validGT = mKeyPair.id !== undefined && mKeyPair.field !== undefined
				&& mKeyPair.number !== undefined && typeof mKeyPair.number === "number"
				&& EBNFHelper.checkMKey(mKey, datasets);
		}

		return validID && validGT && validLT && validEQ;
	}

	private static checkSComparison(sComparator: object, datasets: Dataset[], ebnf: EBNF): boolean {
		let ISObject = (sComparator as SComparison).IS;

		if (ISObject === null || ISObject === undefined) {
			return false;
		}

		let sKeyPair = Utils.parseSKeyPair(ISObject);
		let sKey = sKeyPair.id + "_" + sKeyPair.field;
		let validID = EBNFBody.checkID(sKeyPair.id, ebnf);
		let isValidSKeyPair = sKeyPair.id !== undefined && sKeyPair.field !== undefined
			&& sKeyPair.inputString !== undefined
			&& EBNFHelper.checkSKey(sKey, datasets)
			&& EBNFHelper.checkIsValidAsteriskString(sKeyPair.inputString);

		return validID && isValidSKeyPair;
	}

	private static checkNegation(negation: object, datasets: Dataset[], ebnf: EBNF): boolean {
		let queryNegation = (negation as Negation).NOT;

		if (queryNegation === null || queryNegation === undefined) {
			return false;
		}

		return this.checkQueryBody(queryNegation, datasets, ebnf);
	}

	private static checkID(id: string, ebnf: EBNF): boolean {
		if (!ebnf.idChanged) {
			ebnf.datasetID = id;
			ebnf.idChanged = true;
		} else if (ebnf.idChanged && ebnf.datasetID !== id) {
			return false;
		}
		return true;
	}
}
