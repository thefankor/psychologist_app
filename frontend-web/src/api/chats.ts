export const getChats = async (token: string) => {
	const res = await fetch('/chats/', {
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
