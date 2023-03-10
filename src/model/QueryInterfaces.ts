export interface QueryStructure {
	WHERE: Filter
	OPTIONS: Options
	TRANSFORMATIONS?: Transformation
}

export type Filter = LComparison | MComparison | SComparison | Negation;

export interface Options {
	COLUMNS: Column
	ORDER?: OrderValue | AnyKey
}

export interface LComparison {
	AND?: Filter[]
	OR?: Filter[]
}

export interface MComparison {
	LT?: MKeyPair
	GT?: MKeyPair
	EQ?: MKeyPair
}

export interface SComparison {
	IS: SKeyPair;
}

export interface Negation {
	NOT: Filter
}

export interface SKeyPair {
	[key: string]: string
}

export interface MKeyPair {
	[key: string]: number  // "courses_avg" : 93
}

export type Key = MKey | SKey;

export type MKey = string;

export type SKey = string;

export type Column = AnyKey[];

export type AnyKey = Key | ApplyKey

export interface OrderValue {
	dir: Direction,
	keys: AnyKey[],
}

export type Direction = string;

export interface Transformation {
	GROUP: Group,
	APPLY: ApplyRule[]
}

export type Group = Key[];

export type ApplyKey = string;	// format: [^_]+

export interface ApplyRule {
	[applyKey: ApplyKey]: ApplyRuleApplyKey
}

// APPLYTOKEN = 'MAX' | 'MIN' | 'AVG' | 'COUNT' | 'SUM'
export interface ApplyRuleApplyKey {
	MAX?: Key,
	MIN?: Key,
	AVG?: Key,
	COUNT?: Key,
	SUM?: Key,
}
