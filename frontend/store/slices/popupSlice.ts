import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';

interface PopupTypes {
	generalInfo: {
		isOpen: boolean;
		type:
			| 'skip'
			| 'subscribe'
			| 'connect'
			| 'photo'
			| 'notification'
			| 'enable'
			| null;
	};
	otherInfo?: {
		query: any;
	};
}

const popupState: PopupTypes = {
	generalInfo: {
		isOpen: false,
		type: null,
	},
	otherInfo: {
		query: null,
	},
};

const popupSlice = createSlice({
	name: 'popup',
	initialState: popupState,
	reducers: {
		setPopupData: (state, action: PayloadAction<PopupTypes>) => {
			const { generalInfo, otherInfo } = action.payload;
			state.generalInfo.isOpen = generalInfo.isOpen;
			state.generalInfo.type = generalInfo.type;
			if (otherInfo?.query) {
				const query = otherInfo.query;
				state.otherInfo = {
					...state.otherInfo,
					query,
				};
			}
		},
		closePopup: (state) => {
			state.generalInfo.isOpen = false;
			state.generalInfo.type = null;
		},
	},
});

export const { setPopupData, closePopup } = popupSlice.actions;

export default popupSlice.reducer;
