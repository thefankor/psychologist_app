import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServerChat } from '@/types/types';

interface GroupState {
	current: ServerChat | null;
}

const initialState: GroupState = {
	current: null,
};

const groupSlice = createSlice({
	name: 'group',
	initialState,
	reducers: {
		setCurrentGroup(state, action: PayloadAction<ServerChat | null>) {
			state.current = action.payload;
		},
		clearCurrentGroup(state) {
			state.current = null;
		},
	},
});

export const { setCurrentGroup, clearCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;
