import {AnyKey, Key, MKey, Options, OrderValue, SKey} from "./QueryInterfaces";
import Dataset from "./Dataset";
import {EBNF} from "./EBNF";
import {EBNFHelper} from "./EBNFHelper";

export class EBNFOptions {
	public static checkQueryOptions(options: object, datasets: Dataset[], additionalColumns: AnyKey[]): boolean {
		let queryColumns = (options as Options).COLUMNS;
		let queryOrder = (options as Options).ORDER;

		if (queryColumns === null || queryColumns === undefined) {
			return false;
		}
		// queryColumns = queryColumns.concat(additionalColumns);
		// check that the columns are valid
		let validColumns = EBNFOptions.checkQueryColumns(queryColumns, datasets, additionalColumns);
		let validOrder = true;

		if (queryOrder !== undefined) {
			validOrder = EBNFOptions.checkQueryOrder(queryOrder, queryColumns, datasets);
		}

		return validColumns && validOrder;
	}

	// returns true if all elements in the array are valid keys
	public static checkQueryColumns(column: AnyKey[], datasets: Dataset[], additionalColumns: AnyKey[]): boolean {
		if (!Array.isArray(column) || column.length === 0) {
			return false;
		}
		let result = true;
		column.forEach((key) => {
			result = result && (additionalColumns.includes(key) || EBNFHelper.checkValidKey(key, datasets));
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
		let validApplyKey = EBNFHelper.checkValidApplyKey(orderKey);
		return inColumns && validApplyKey;
	}

	public static checkValidKeyInColumns(key: Key, columns: AnyKey[], datasets: Dataset[]) {
		let isValidKey = EBNFHelper.checkValidKey(key, datasets);
		let inColumns = columns.includes(key);
		return isValidKey && inColumns;
	}
}
