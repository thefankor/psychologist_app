import { Group } from '@/types/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GroupState extends Group {
	searchMode: boolean;
}
const initialState = {} as GroupState;

export const GroupSlice = createSlice({
	name: 'group',
	initialState,
	reducers: {
		setGroup: (state, action: PayloadAction<Group>) => {
			const { name, description, members, messages, image, rules } =
				action.payload;

			state.name = name;
			state.description = description;
			state.members = members;
			state.messages = messages;
			state.image = image;
			state.rules = rules;
		},
		setSearchMode: (state, action) => {
			state.searchMode = action.payload.searchMode;
		},
	},
});

export const { setGroup, setSearchMode } = GroupSlice.actions;
export default GroupSlice.reducer;
