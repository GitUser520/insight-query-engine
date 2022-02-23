// This interface approach would be neat to use if I ever figure out how to get it to work.

interface Query {
	WHERE: Filter
	OPTIONS: Options
}

interface Filter {
	LCOMPARISON?: LComparison
	MCOMPARISON?: MComparison
	SCOMPARISON?: SComparison
	NEGATION?: Negation
}

interface LComparison {
	AND?: Filter[]
	OR?: Filter[]
}

interface MComparison {
	LT?: MKeyPair
	GT?: MKeyPair
	EQ?: MKeyPair
}

interface MKeyPair {
	mkey: string
	number: number
}

interface SComparison {
	IS: SKeyPair
}

interface SKeyPair {
	skey: string
}

interface Negation {
	NOT: Filter
}

interface Options {
	COLUMNS: string[]
	ORDER: string
}
