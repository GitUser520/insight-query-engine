export interface Query {
	WHERE: Filter
	OPTIONS: Options
}

export interface Filter {
	LCOMPARISON?: LComparison
	MCOMPARISON?: MComparison
	SCOMPARISON?: SComparison
	NEGATION?: Negation
}

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
	IS: SKey
}

export interface Negation {
	NOT: Filter
}

export interface MKeyPair {
	mkey: MKey
	number: number
}

export interface Key {
	mKey?: MKey
	sKey?: SKey
}

export interface SKey {
	skey: string
}

export interface MKey {
	mkey: string
}


