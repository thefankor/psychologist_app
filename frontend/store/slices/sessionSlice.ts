import { AuthData } from '@/types/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {} as AuthData;

const sessionSlice = createSlice({
	name: 'session',
	initialState,
	reducers: {
		setSession: (state, action: PayloadAction<AuthData>) => {
			const {
				id,
				email,
				name,
				subscribe,
				phone,
				timezone,
				code,
				gender,
				avatar,
				birth_date,
			} = action.payload;

			state.id = id;
			state.email = email;
			state.name = name;
			state.subscribe = subscribe;
			state.phone = phone;
			state.timezone = timezone;
			state.code = code;
			state.gender = gender;
			state.avatar = avatar;
			state.birth_date = birth_date;
		},
	},
});

export const { setSession } = sessionSlice.actions;

export default sessionSlice.reducer;
