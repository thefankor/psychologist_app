import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
	id: number | null;
	name: string | null;
	avatar: string | null;
}

const initialState: UserState = {
	id: null,
	name: null,
	avatar: null,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser(
			state,
			action: PayloadAction<{
				id: number;
				name: string;
				avatar: string | null;
			}>
		) {
			state.id = action.payload.id;
			state.name = action.payload.name;
			state.avatar = action.payload.avatar;
		},
		clearUser(state) {
			state.id = null;
			state.name = null;
			state.avatar = null;
		},
	},
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
