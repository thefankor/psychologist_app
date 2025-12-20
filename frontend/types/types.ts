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

export type UserRole = 'ADMIN' | 'CLIENT';

export interface ChatAuthor {
	id: number;
	name: string;
	role: UserRole;
	avatar: string | null;
}

export interface ServerMessage {
	id: string;
	chat_id: string;
	author: ChatAuthor;
	text: string;
	media_url: string | null;
	reply_to: string | null;
	created_at: string;
	read_at: string | null;
	updated_at?: string;
	local_message_id?: string;
}

export interface ServerChat {
	id: string;
	type: 'GROUP' | 'PRIVATE';
	name: string;
	image: string | null;
	description?: string;
	rules?: string;
	last_messages: ServerMessage[];
}

export interface UIMessage {
	id: string;
	localId?: string;
	chatId: string;
	author: ChatAuthor;
	text: string;
	mediaUrl: string | null;
	replyTo: string | null;
	createdAt: string;
	readAt: string | null;
	isMine: boolean;
	isDelivered?: boolean;
}

export interface GroupListItem {
	id: string;
	name: string;
	image: { uri: string } | any;
	description: string;
	rules: string;
	members: number;
	messages: number;
	lastMessage: string;
	from: string;
	time: string;
}

export type GroupType = GroupListItem;

export type Session = {
	id: number;
	psychologistName: string;
	date: string;
	time: string;
	type: string;
	isUpcoming: boolean;
	avatarUri: string;
};
