
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
	[key: string]: number
}

export type Key = MKey | SKey;

export type MKey = string;

export type SKey = string;

export type Column = Key[];

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

export type ApplyKey = string;

export interface ApplyRule {
	[applyKey: string]: ApplyToken
}

export interface ApplyToken {
	MAX?: Key,
	MIN?: Key,
	AVG?: Key,
	COUNT?: Key,
	SUM?: Key,
}
