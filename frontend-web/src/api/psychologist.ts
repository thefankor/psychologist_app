export const getPsyshologistProfile = async (token: string) => {
	const url = '/psychologists/profile/';
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
		console.log('Ошибка во время получения профиля психолога: ', error);
		throw error;
	}
};

export const updatePsyshologistProfile = async (token: string, form: any) => {
	const url = '/psychologists/profile/';
	try {
		const res = await fetch(url, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(form),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}
		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время обновления профиля психолога: ', error);
		throw error;
	}
};

export const updatePsychologistPhoto = async (token: string, image: any) => {
	const url = '/psychologists/profile/upload_photo/';

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
		console.log('Ошибка во время обновления аватара психолога: ', error);
		throw error;
	}
};
