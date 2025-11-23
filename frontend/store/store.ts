import { configureStore } from '@reduxjs/toolkit';
import popupSlice from '@/store/slices/popupSlice';
import chatSlice from './slices/chatSlice';
import groupSlice from './slices/groupSlice';
import sessionSlice from './slices/sessionSlice';

const store = configureStore({
	reducer: {
		popup: popupSlice,
		chat: chatSlice,
		group: groupSlice,
		session: sessionSlice,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
