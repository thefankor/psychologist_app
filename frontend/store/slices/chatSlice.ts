import { MessageType } from '@/types/types';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {} as MessageType;

const chatSlice = createSlice({
	name: 'chat',
	initialState,
	reducers: {
		setMessage: (state, action) => {
			const { message, images } = action.payload;
			state.message = message;
			state.images = images;
		},
	},
});

export const { setMessage } = chatSlice.actions;
export default chatSlice.reducer;
