import { configureStore } from '@reduxjs/toolkit';
import popupSlice from '@/store/slices/popupSlice';
import chatSlice from './slices/chatsSlice';
import groupSlice from './slices/groupsSlice';
import sessionSlice from './slices/sessionSlice';
import userSlice from './slices/userSlice';

const store = configureStore({
	reducer: {
		popup: popupSlice,
		chats: chatSlice,
		group: groupSlice,
		session: sessionSlice,
		user: userSlice,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
