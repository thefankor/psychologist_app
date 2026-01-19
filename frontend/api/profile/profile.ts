const BASE_URL = 'https://simul.cutecalls.pw';

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

export const updateUserPhoto = async (token: string, image: any) => {
	const url = `${BASE_URL}/user/upload_photo/`;

	try {
		const formData = new FormData();
		formData.append('image', {
			uri: image.uri,
			name: image.fileName || `photo.${image.uri.split('.').pop()}`,
			type: image.type || 'image/jpeg',
		} as any);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}

		const data = await res.json();
		return data;
	} catch (error: any) {
		console.log('Ошибка во время обновления аватара: ', error);
		throw error;
	}
};

export const deleteUser = async (token: string) => {
	const url = `${BASE_URL}/user/`;
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
		console.log('Ошибка во время получения удаления пользователя: ', error);
		throw error;
	}
};
