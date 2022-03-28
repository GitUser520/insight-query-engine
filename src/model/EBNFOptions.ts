import {AnyKey, Key, MKey, Options, OrderValue, SKey} from "./QueryInterfaces";
import Dataset from "./Dataset";
import {EBNF} from "./EBNF";
import {EBNFHelper} from "./EBNFHelper";

export class EBNFOptions {
	public static checkQueryOptions(options: object, datasets: Dataset[]): boolean {
		let queryColumns = (options as Options).COLUMNS;
		let queryOrder = (options as Options).ORDER;

		if (queryColumns === null || queryColumns === undefined) {
			return false;
		}

		// check that the columns are valid
		let validColumns = EBNFOptions.checkQueryColumns(queryColumns, datasets);
		let validOrder = true;

		if (queryOrder !== undefined) {
			validOrder = EBNFOptions.checkQueryOrder(queryOrder, queryColumns, datasets);
		}

		return validColumns && validOrder;
	}

	// returns true if all elements in the array are valid keys
	public static checkQueryColumns(column: Key[], datasets: Dataset[]): boolean {
		if (!Array.isArray(column) || column.length === 0) {
			return false;
		}
		let result = true;
		column.forEach((key) => {
			result = result && EBNFOptions.checkValidKey(key, datasets);
		});

		return result;
	}

	// returns true if the order element is a valid key
	public static checkQueryOrder(orderOrKey: OrderValue | AnyKey, columns: Key[], datasets: Dataset[]): boolean {
		let isValid = false;
		if (EBNFHelper.isInstanceOfOrderValue(orderOrKey)) {
			isValid = this.checkValidOrderValue(orderOrKey, columns, datasets);
		} else {
			isValid = this.checkValidAnyKey(orderOrKey, columns, datasets);
		}
		return isValid;
	}

	public static checkValidOrderValue(orderValue: OrderValue, columns: AnyKey[], datasets: Dataset[]): boolean {
		let dir = orderValue.dir;
		let keys = orderValue.keys;

		if (dir === null || dir === undefined) {
			return false;
		}
		if (keys === null || keys === undefined || !Array.isArray(keys)) {
			return false;
		}

		return this.checkValidDir(dir) && this.checkValidKeysField(keys, columns, datasets);
	}

	public static checkValidDir(dir: string): boolean {
		return EBNF.validDir.includes(dir);
	}

	public static checkValidKeysField(keys: AnyKey[], columns: AnyKey[], datasets: Dataset[]): boolean {
		if (keys.length === 0) {
			return false;
		}
		let valid = true;
		keys.forEach((anykey) => {
			valid = valid && this.checkValidAnyKey(anykey, columns, datasets);
		});
		return valid;
	}

	public static checkValidAnyKey(orderKey: AnyKey, columns: AnyKey[], datasets: Dataset[]): boolean {
		let isKey = this.checkValidKeyInColumns(orderKey, columns, datasets);
		if (isKey) {
			return true;
		}
		let inColumns = columns.includes(orderKey);
		return inColumns;
	}

	public static checkValidKeyInColumns(key: Key, columns: AnyKey[], datasets: Dataset[]) {
		let isValidKey = EBNFOptions.checkValidKey(key, datasets);
		let inColumns = columns.includes(key);
		return isValidKey && inColumns;
	}

	// check the validity of a key
	public static checkValidKey(key: Key, datasets: Dataset[]): boolean {
		if (key === null || key === undefined) {
			return false;
		}
		let keyString = key as Key;
		let mkey = keyString as MKey;
		let skey = keyString as SKey;
		return EBNFHelper.checkMKey(mkey, datasets) || EBNFHelper.checkSKey(skey, datasets);
	}
}
