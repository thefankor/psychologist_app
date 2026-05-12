import { apiFetch } from './client';

export const createDirectChat = async (token: string, otherUserId: number) => {
	const res = await apiFetch('/chats/direct/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ other_user_id: otherUserId }),
	});
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error?.message || 'API error');
	}
	return res.json();
};

export const getChats = async (token: string) => {
	const res = await apiFetch('/chats/', {
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
};
