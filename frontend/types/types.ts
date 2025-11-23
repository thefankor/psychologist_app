export enum FormSteps {
	INIT = 0,
	STEP_ONE = 1,
	STEP_TWO = 2,
	STEP_THREE = 3,
	PRICING = 4,
	STEP_FOUR = 5,
	STEP_FIVE = 6,
	STEP_SIX = 7,
}

export enum DefaultLabel {
	EMOTIONS = 'emotions',
	RELATIONS = 'relations',
	WORK = 'work',
	LIFE = 'life',
	PERSONAL = 'personal',
}

export enum SessionFormat {
	PERSONAL = 'personal',
	FAMILY = 'family',
	GROUP = 'group',
}

export enum TimeFormat {
	FIRST = 'first',
	SOME = 'some',
	LONG = 'long',
}
export enum PricingFormat {
	SMALL = 'small',
	MEDIUM = 'medium',
	LARGE = 'large',
}
export enum GenderFormat {
	NOT_STATED = 'not_stated',
	MALE = 'male',
	FEMALE = 'female',
}
export enum time {
	MORNING = 0,
	DAY = 1,
	EVENING = 2,
	WEEKEND_MORNING = 3,
	WEEKEND_DAY = 4,
	WEEKEND_EVENING = 5,
}
export enum MethodFormat {
	GESTALT = 'gestalt',
	PSYHODRAM = 'psyhodram',
	PSYHOANALIZE = 'psyhoanalize',
	EXISTENTAL = 'existential',
	SYSTEM = 'system',
}

export type DateFormat = 'any' | 'closest' | number[];

export interface FormData {
	emotions: string[];
	relations: string[];
	work: string[];
	life: string[];
	personal: string[];
	format: SessionFormat[] | null;
	long: TimeFormat | null;
	pricing: PricingFormat[] | null;
	gender: GenderFormat | null;
	time: DateFormat | null;
	method: MethodFormat[] | null;
}

export enum PhoneCodes {
	RU = '+7',
}

export enum Gender {
	NOT_CHOOSEN = 0,
	NOT_STATED = 1,
	MALE = 2,
	FEMALE = 3,
}

export interface Option {
	label: any;
	value: string;
}

export const genderOptions: Option[] = [
	{ label: Gender.NOT_STATED, value: 'Неважно' },
	{ label: Gender.MALE, value: 'Мужской' },
	{ label: Gender.FEMALE, value: 'Женский' },
];

export interface FavoriteTypes {
	id: number;
	avatar: string;
	full_name: string;
	methods: string[];
}

export interface MessageType {
	message: string;
	images: string[] | null;
	time: string;
	from_id: number;
	viewed?: boolean;
	from?: string;
	avatar?: string;
}

export interface Group {
	messages: MessageType[];
	members: number;
	image: string;
	name: string;
	description: string;
	rules: string;
}

export interface AuthData {
	id: number;
	name: string;
	email: string;
	notifications: boolean;
	subscribe: boolean;
	phone: string;
	timezone: any;
	code: PhoneCodes;
	gender: GenderFormat;
	avatar: string;
	birth_date: string | Date;
}

export interface GroupType {
	id: number;
	name: string;
	description: string;
	rules: string;
	members: number;
	image: string;
	messages: number;
	lastMessage: string;
	from: string;
	time: string;
}
