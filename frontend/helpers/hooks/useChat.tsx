import { GroupType } from '@/types/types';
import { useState, useEffect } from 'react';

const useChat = () => {
	const [groups, setGroups] = useState<GroupType[] | null>([
		{
			name: 'Тестовая группа',
			description: 'Описание этой группы',
			id: 1,
			image: require('@/assets/images/arsen.png'),
			lastMessage: 'Здравствуйте, чем могу помочь?',
			from: 'Анастасия Зорина',
			members: 1021,
			messages: 112,
			time: '18:32',
			rules: 'Правила канала',
		},
	]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		(async () => {
			try {
			} catch (err) {
				throw err;
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return { groups, loading };
};
export default useChat;
