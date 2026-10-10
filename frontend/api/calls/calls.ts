const BASE_URL = 'https://simul.cutecalls.pw';

export const createCall = async (token: string, appointment_id: string) => {
	const url = `${BASE_URL}/calls/`;

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				appointment_id: appointment_id,
			}),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время создания звонка: ', error);
		throw error;
	}
};
