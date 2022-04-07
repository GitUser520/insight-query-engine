import {InsightResult} from "../controller/IInsightFacade";


export class QuerySort {
	public static querySort(queryResults: InsightResult[], sortByString: string) {
		queryResults.sort((a: any,b: any) => {
			if (typeof a[sortByString] === "string") {
				return a[sortByString].localeCompare(b[sortByString]);
			} else {
				if (a[sortByString] < b[sortByString]) {
					return -1;
				} else if (a[sortByString] > b[sortByString]) {
					return 1;
				} else {
					return 0;
				}
			}
		});
	}

	public static querySortArray(queryResults: InsightResult[], sortByStringArray: string[], dir: string): void {
		if (dir === "UP") {
			this.sortUp(queryResults, sortByStringArray);
		} else {
			this.sortDown(queryResults, sortByStringArray);
		}
	}

	public static sortUp(queryResults: InsightResult[], sortByStringArray: string[]) {
		queryResults.sort((a: any, b: any) => {
			let sortByString = sortByStringArray[0];
			if (typeof a[sortByString] === "string") {
				let nextIndex = 1;
				let sortVal = a[sortByString].localeCompare(b[sortByString]);
				while (sortVal === 0 && nextIndex < sortByStringArray.length) {
					let keyString = sortByStringArray[nextIndex];
					if (typeof a[keyString] === "string") {
						sortVal = a[keyString].localeCompare(b[keyString]);
					} else {
						if (a[sortByString] < b[sortByString]) {
							sortVal = -1;
						} else if (a[sortByString] > b[sortByString]) {
							sortVal = 1;
						} else {
							sortVal = 0;
						}
					}
					nextIndex++;
				}
				return sortVal;
			} else {
				if (a[sortByString] < b[sortByString]) {
					return -1;
				} else if (a[sortByString] > b[sortByString]) {
					return 1;
				} else {
					let nextIndex = 1;
					let sortVal = 0;
					while (sortVal === 0 && nextIndex < sortByStringArray.length) {
						let keyString = sortByStringArray[nextIndex];
						if (typeof a[keyString] === "string") {
							sortVal = a[keyString].localeCompare(b[keyString]);
						} else {
							if (a[sortByString] < b[sortByString]) {
								sortVal = -1;
							} else if (a[sortByString] > b[sortByString]) {
								sortVal = 1;
							} else {
								sortVal = 0;
							}
						}
						nextIndex++;
					}
					return sortVal;
				}
			}
		});
	}

	public static sortDown(queryResults: InsightResult[], sortByStringArray: string[]) {
		queryResults.sort((a: any, b: any) => {
			let sortByString = sortByStringArray[0];
			if (typeof a[sortByString] === "string") {
				let nextIndex = 1;
				let sortVal = a[sortByString].localeCompare(b[sortByString]);
				while (sortVal === 0 && nextIndex < sortByStringArray.length) {
					let keyString = sortByStringArray[nextIndex];
					if (typeof a[keyString] === "string") {
						sortVal = a[keyString].localeCompare(b[keyString]);
					} else {
						if (a[sortByString] < b[sortByString]) {
							sortVal = 1;
						} else if (a[sortByString] > b[sortByString]) {
							sortVal = -1;
						} else {
							sortVal = 0;
						}
					}
					nextIndex++;
				}
				return -sortVal;
			} else {
				if (a[sortByString] < b[sortByString]) {
					return 1;
				} else if (a[sortByString] > b[sortByString]) {
					return -1;
				} else {
					let nextIndex = 1;
					let sortVal = 0;
					while (sortVal === 0 && nextIndex < sortByStringArray.length) {
						let keyString = sortByStringArray[nextIndex];
						if (typeof a[keyString] === "string") {
							sortVal = a[keyString].localeCompare(b[keyString]);
						} else {
							if (a[sortByString] < b[sortByString]) {
								sortVal = 1;
							} else if (a[sortByString] > b[sortByString]) {
								sortVal = -1;
							} else {
								sortVal = 0;
							}
						}
						nextIndex++;
					}
					return -sortVal;
				}
			}
		});
	}
}
