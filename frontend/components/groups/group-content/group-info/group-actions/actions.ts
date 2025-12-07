import { setSearchMode } from '@/store/slices/groupsSlice';
import { router } from 'expo-router';
import { ImageProps } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useDispatch } from 'react-redux';
import { setPopupData } from '@/store/slices/popupSlice';

export interface ChatAction {
	name: string;
	image: ImageProps;
	action: () => void;
	disabled?: boolean;
}

export const useActions = (id: number) => {
	const dispatch = useDispatch();

	const handleAction = (type: 'search' | 'notifications') => {
		if (type === 'search') {
			dispatch(
				setSearchMode({
					searchMode: true,
				})
			);
			router.push(`/groups/${id}`);
		} else {
			NavigationBar.setVisibilityAsync('hidden');
			dispatch(
				setPopupData({
					generalInfo: {
						isOpen: true,
						type: 'enable',
					},
				})
			);
		}
	};

	const actions: ChatAction[] = [
		{
			name: 'Поиск',
			image: require('@/assets/images/search_chat.png'),
			action: () => handleAction('search'),
		},
		{
			name: 'Звук',
			image: require('@/assets/images/notif.png'),
			action: () => handleAction('notifications'),
		},
	];

	return { actions };
};
