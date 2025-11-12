import * as SecureStore from 'expo-secure-store';

export const hidePart = (text: string, n: number, format?: string) => {
	const replaced = text.substring(n);
	return format ? format : '***' + replaced;
};

export const formatTime = (timeInSeconds: number): string => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = timeInSeconds % 60;

	const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
	const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

	return `${formattedMinutes}:${formattedSeconds}`;
};

export const dataHandler = (
	key: string,
	value: string,
	setData: (item: any) => void
) => {
	return setData((prev: any) => ({ ...prev, [key]: value }));
};

export async function saveToken(token: string) {
	await SecureStore.setItemAsync('auth_token', token);
}

export async function getToken() {
	return await SecureStore.getItemAsync('auth_token');
}

export async function deleteToken() {
	return await SecureStore.deleteItemAsync('auth_token');
}
export const formatDate = (dateString: string | Date | undefined): string => {
	if (!dateString) return '';

	try {
		const date =
			typeof dateString === 'string' ? new Date(dateString) : dateString;

		if (isNaN(date.getTime())) return '';

		const day = date.getDate();
		const month = date.getMonth();

		const months = [
			'января',
			'февраля',
			'марта',
			'апреля',
			'мая',
			'июня',
			'июля',
			'августа',
			'сентября',
			'октября',
			'ноября',
			'декабря',
		];

		return `${day} ${months[month]}`;
	} catch (e) {
		console.error('Error formatting date:', e);
		return '';
	}
};
