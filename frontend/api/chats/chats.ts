const BASE_URL = 'https://api.simal.live';

export const getChats = async (token: string) => {
	const url = `${BASE_URL}/chats/`;
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
		console.log('Ошибка во время получения чатов: ', error);
		throw error;
	}
};
