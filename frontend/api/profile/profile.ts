import { BASE_URL } from '@env';

export const sendUserData = async (token: string, data: any) => {
	console.log(token);
	const url = `${BASE_URL}/user/survey/`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время отправки данных профиля: ', error);
		throw error;
	}
};

export const getUser = async (token: string) => {
	console.log(token);
	const url = `${BASE_URL}/user/`;
	try {
		const res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время получения данных пользователя: ', error);
		throw error;
	}
};

export const updateUser = async (token: string, data: any) => {
	const url = `${BASE_URL}/user/`;

	try {
		const res = await fetch(url, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return true;
	} catch (error: any) {
		console.log('Ошибка во время обновления данных профиля: ', error);
		throw error;
	}
};
