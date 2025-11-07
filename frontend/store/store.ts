import { configureStore } from '@reduxjs/toolkit';
import popupSlice from '@/store/slices/popupSlice';

const store = configureStore({
	reducer: {
		popup: popupSlice,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
