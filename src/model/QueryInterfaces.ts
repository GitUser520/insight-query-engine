
export interface QueryStructure {
	WHERE: Filter
	OPTIONS: Options
}

export type Filter = LComparison | MComparison | SComparison | Negation;

export interface Options {
	COLUMNS: Key[]
	ORDER?: Key
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


