import { BASE_URL } from '@env';

export const getVerifyCode = async (email: string) => {
	const url = `${BASE_URL}/auth/login/`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
			}),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return true;
	} catch (error: any) {
		console.log('Ошибка во время получения кода подтверждения: ', error);
		throw error;
	}
};

export const checkVerifyCode = async (email: string, code: string) => {
	const url = `${BASE_URL}/auth/verify/`;

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				code: code,
			}),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время проверки кода подтверждения: ', error);
		throw error;
	}
};
