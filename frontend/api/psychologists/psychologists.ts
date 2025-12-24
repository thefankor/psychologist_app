const BASE_URL = 'https://api.simal.live';

export const getAllPsyshologists = async (token: string) => {
	const url = `${BASE_URL}/user/psychologists/`;
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
		console.log('Ошибка во время получения психологов: ', error);
		throw error;
	}
};

export const addToFavorite = async (token: string, id: number) => {
	const url = `${BASE_URL}/user/psychologists/favorites/`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ id }),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}
	} catch (error: any) {
		console.log(
			'Ошибка во время добавления психологов в избранное: ',
			error
		);
		throw error;
	}
};

export const getAllFavorites = async (token: string) => {
	const url = `${BASE_URL}/user/psychologists/favorites/`;
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
		console.log('Ошибка во время получения избранных психологов: ', error);
		throw error;
	}
};

export const deleteFavoritePsychologist = async (token: string, id: number) => {
	const url = `${BASE_URL}/user/psychologists/favorites/${id}/`;
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
	} catch (error: any) {
		console.log(
			'Ошибка во время получения удаления психолога из избранного: ',
			error
		);
		throw error;
	}
};

export const createAppointment = async (
	token: string,
	psychologist_id: number,
	start_at: string
) => {
	const url = `${BASE_URL}/user/appointments/`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ psychologist_id, start_at }),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}
	} catch (error: any) {
		console.log('Ошибка во время создания записей: ', error);
		throw error;
	}
};

export const getAllAppointments = async (token: string) => {
	const url = `${BASE_URL}/user/appointments/`;
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
		console.log('Ошибка во время получения всех записей: ', error);
		throw error;
	}
};
