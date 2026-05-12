export async function apiFetch(
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	const res = await fetch(url, options);
	if (res.status === 401) {
		localStorage.removeItem('token');
		window.location.replace('/auth');
		throw new Error('Unauthorized');
	}
	return res;
}
