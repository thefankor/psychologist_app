import { BASE_URL } from '@env';

export const sendUserData = async (token: string, data: any) => {
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
