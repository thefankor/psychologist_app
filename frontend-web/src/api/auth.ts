export const getVerifyCode = async (email: string) => {
	const url = '/auth/login/';
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(
			error?.detail || error?.message || 'Ошибка при отправке кода',
		);
	}

	return true;
};

export const checkVerifyCode = async (
	email: string,
	code: string,
	user_type: string = 'client',
) => {
	const url = `/auth/verify/?user_type=${user_type}`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, code }),
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(
			error?.detail || error?.message || 'Неверный код подтверждения',
		);
	}

	return res.json();
};
