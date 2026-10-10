import { apiFetch } from './client';

export const getPsyshologistProfile = async (token: string) => {
	const url = '/psychologists/profile/';
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
		console.log('Ошибка во время получения профиля психолога: ', error);
		throw error;
	}
};

export const updatePsyshologistProfile = async (token: string, form: any) => {
	const url = '/psychologists/profile/';
	try {
		const res = await apiFetch(url, {
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

export const updatePsychologistPhoto = async (token: string, file: File) => {
	const url = '/psychologists/profile/upload_photo/';

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
		console.log('Ошибка во время обновления аватара психолога: ', error);
		throw error;
	}
};

export const createAppointment = async (
	token: string,
	psychologist_id: number,
	start_at: string,
) => {
	const url = '/user/appointments/';
	try {
		const res = await apiFetch(url, {
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

export const getPsyshologistAppointments = async (
	token: string,
	isUpcoming?: boolean,
) => {
	const params = new URLSearchParams({ limit: '100', offset: '0' });
	if (isUpcoming !== undefined) params.set('is_upcoming', String(isUpcoming));
	const url = `/psychologists/appointments/?${params}`;
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
		console.log('Ошибка во время получения записей психолога: ', error);
		throw error;
	}
};

export const getPsychologistsForClient = async (token: string) => {
	const url = '/user/psychologists/';
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
		console.log('Ошибка во время получения психологов: ', error);
		throw error;
	}
};

export const getAllAppointments = async (token: string) => {
	const url = '/user/appointments/';
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
		console.log('Ошибка во время получения всех записей: ', error);
		throw error;
	}
};

export const addToFavorite = async (token: string, id: number) => {
	const url = '/user/psychologists/favorites/';
	try {
		const res = await apiFetch(url, {
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
			error,
		);
		throw error;
	}
};

export const getAllFavorites = async (token: string) => {
	const url = '/user/psychologists/favorites/';
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
		console.log('Ошибка во время получения избранных психологов: ', error);
		throw error;
	}
};

export const deleteFavoritePsychologist = async (token: string, id: number) => {
	const url = `/user/psychologists/favorites/${id}/`;
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
		console.log(
			'Ошибка во время получения удаления психолога из избранного: ',
			error,
		);
		throw error;
	}
};

export const getWorkingHours = async (token: string) => {
	const res = await apiFetch('/psychologists/template/', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});
	if (!res.ok) throw new Error((await res.json())?.detail || 'API error');
	return res.json();
};

export const updateWorkingHours = async (token: string, ranges: any[]) => {
	const res = await apiFetch('/psychologists/template/', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ ranges }),
	});
	if (!res.ok) throw new Error((await res.json())?.detail || 'API error');
	return res.json();
};

export const getClientsForPsychologist = async (token: string) => {
	const url = '/psychologists/clients/';
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
		console.log('Ошибка во время получения клиентов: ', error);
		throw error;
	}
};

export const getPsychologistAppointmentsForClient = async (
	token: string,
	client_id: number,
	isUpcoming?: boolean,
) => {
	const params = new URLSearchParams({
		client_id: String(client_id),
		limit: '100',
		offset: '0',
	});
	if (isUpcoming !== undefined) params.set('is_upcoming', String(isUpcoming));
	const url = `/psychologists/appointments/?${params}`;
	try {
		const res = await apiFetch(url, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.detail || error?.message || 'API error');
		}
		return res.json();
	} catch (error: any) {
		console.log('Ошибка при получении сессий клиента:', error);
		throw error;
	}
};

export const getClientForPsychologistByID = async (
	token: string,
	user_id: number,
) => {
	const url = `/psychologists/clients/${user_id}`;
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
		console.log('Ошибка во время получения клиента по ID: ', error);
		throw error;
	}
};

export const getMySlots = async (
	token: string,
	fromDt: string,
	toDt: string,
	status?: string,
) => {
	const params = new URLSearchParams({ from_dt: fromDt, to_dt: toDt });
	if (status) params.set('status', status);
	const res = await apiFetch(`/psychologists/slots/?${params}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error((await res.json())?.detail || 'API error');
	return res.json();
};

export const generateSlots = async (
	token: string,
	fromDate: string,
	toDate: string,
) => {
	const params = new URLSearchParams({
		from_date: fromDate,
		to_date: toDate,
	});
	const res = await apiFetch(`/psychologists/slots/generate?${params}`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error((await res.json())?.detail || 'API error');
	return res.json();
};

export const createManualSlot = async (token: string, startsAt: string) => {
	const res = await apiFetch('/psychologists/slots/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ starts_at: startsAt }),
	});
	if (!res.ok) throw new Error((await res.json())?.detail || 'API error');
	return res.json();
};

export const deleteSlot = async (token: string, slotId: string) => {
	const res = await apiFetch(`/psychologists/slots/${slotId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok && res.status !== 204)
		throw new Error((await res.json())?.detail || 'API error');
};

export const cancelSlot = async (
	token: string,
	slotId: string,
	reason?: string,
) => {
	const res = await apiFetch(`/psychologists/slots/${slotId}/cancel`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ reason: reason ?? null }),
	});
	if (!res.ok && res.status !== 204)
		throw new Error((await res.json())?.detail || 'API error');
};

export const getFreeSlots = async (
	token: string,
	psychologistId: number,
	fromDt: string,
	toDt: string,
) => {
	const params = new URLSearchParams({ from_dt: fromDt, to_dt: toDt });
	const res = await apiFetch(
		`/psychologists/${psychologistId}/free-slots/?${params}`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!res.ok) throw new Error((await res.json())?.detail || 'API error');
	return res.json();
};

export const bookSlot = async (token: string, slotId: string) => {
	const res = await apiFetch('/user/appointments/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ slot_id: slotId }),
	});
	if (!res.ok) throw new Error((await res.json())?.detail || 'API error');
	return res.json();
};

export const cancelAppointment = async (
	token: string,
	appointmentId: string,
) => {
	const res = await apiFetch(`/user/appointments/${appointmentId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok && res.status !== 204)
		throw new Error((await res.json())?.detail || 'API error');
};

export const getClientNotes = async (token: string, client_id: number) => {
	const url = `/psychologists/clients/${client_id}/notes`;
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
		console.log('Ошибка во время получения записей о клиенте: ', error);
		throw error;
	}
};

export const createClientNote = async (
	token: string,
	client_id: number,
	text: string,
) => {
	const url = `/psychologists/clients/${client_id}/notes`;
	try {
		const res = await apiFetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ text }),
		});
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error?.message || 'API error');
		}
		return res.json();
	} catch (error: any) {
		console.log('Ошибка во время получения записей о клиенте: ', error);
		throw error;
	}
};

export const deleteClientNote = async (
	token: string,
	client_id: number,
	note_id: number,
) => {
	const url = `/psychologists/clients/${client_id}/notes/${note_id}`;
	try {
		const res = await apiFetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});
		if (!res.ok && res.status !== 204) {
			const error = await res.json();
			throw new Error(error?.detail || error?.message || 'API error');
		}
	} catch (error: any) {
		console.log('Ошибка при удалении заметки:', error);
		throw error;
	}
};
