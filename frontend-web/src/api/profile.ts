import { apiFetch } from './client';

export const sendUserData = async (token: string, data: any) => {
	const url = '/user/survey/';
	try {
		const res = await apiFetch(url, {
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
	const url = '/user/';
	try {
		const res = await apiFetch(url, {
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
	const url = '/user/';

	try {
		const res = await apiFetch(url, {
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

export const updateUserPhoto = async (token: string, file: File) => {
	const url = '/user/upload_photo/';

	try {
		const formData = new FormData();
		formData.append('image', file);

		const res = await apiFetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.detail || error?.message || 'API error');
		}

		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время обновления аватара: ', error);
		throw error;
	}
};

export const deleteUser = async (token: string) => {
	const url = '/user/';
	try {
		const res = await apiFetch(url, {
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
		console.log('Ошибка во время получения удаления пользователя: ', error);
		throw error;
	}
};
