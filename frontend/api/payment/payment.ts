const BASE_URL = 'https://simul.cutecalls.pw';

export const getPaymentMethods = async (token: string) => {
	const url = `${BASE_URL}/user/methods/`;
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
		console.log('Ошибка во время получения способов оплаты: ', error);
		throw error;
	}
};

export const addPaymentMethod = async (
	token: string,
	phone: string,
	bank: string,
) => {
	const url = `${BASE_URL}/user/methods/sbp/`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				phone: phone,
				bank: bank,
			}),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время добавления способа оплаты: ', error);
		throw error;
	}
};

export const verifyPaymentMethod = async (
	token: string,
	phone: string,
	code: string,
) => {
	const url = `${BASE_URL}/user/methods/sbp/verify/`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				phone: phone,
				code: code,
			}),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время проверки кода: ', error);
		throw error;
	}
};

export const deletePaymentMethod = async (token: string, id: number) => {
	const url = `${BASE_URL}/user/methods/${id}/`;
	try {
		const res = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}
		return true;
	} catch (error: any) {
		console.log('Ошибка во время удаления метода оплаты: ', error);
		throw error;
	}
};
