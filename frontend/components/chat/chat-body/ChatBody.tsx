import { ScrollView } from 'react-native';
import { styles } from './styles';
import { useEffect, useState } from 'react';
import { MessageType } from '@/types/types';
import Message from './message/Message';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const ChatBody = () => {
	const [messages, setMessages] = useState<MessageType[]>();
	const { id } = useSelector((state: RootState) => state.session);

	const checkMessage = (from_id: number) => {
		if (from_id === id) {
			return true;
		} else {
			return false;
		}
	};
	useEffect(() => {
		(async () => {
			try {
				setMessages([
					{
						avatar: require('@/assets/images/arsen.png'),
						message: 'У меня есть проблема',
						images: [
							'https://cdn1.ozone.ru/s3/multimedia-2/6460786034.jpg',
							'https://i.pinimg.com/736x/a7/6e/6e/a76e6edc8bce2d8ab0daaa3171c99fd4.jpg',
							'https://img.freepik.com/premium-photo/stock-photo-sitting-cat-waving-with-paw_190963-135.jpg',
						],
						time: '15:20',
						from_id: 5,
						viewed: true,
						from: 'Арсен Маркарян',
					},
					{
						avatar: require('@/assets/images/ad.png'),
						message: 'Здравствуйте, чем могу вам помочь?',
						images: [
							'https://i.pinimg.com/originals/61/23/6f/61236f0f8390656374f1c6ead2049dc9.jpg',
							'https://cdn1.ozone.ru/s3/multimedia-2/6460786034.jpg',
							'https://i.pinimg.com/736x/a7/6e/6e/a76e6edc8bce2d8ab0daaa3171c99fd4.jpg',
							'https://img.freepik.com/premium-photo/stock-photo-sitting-cat-waving-with-paw_190963-135.jpg',
						],
						time: '15:20',
						from_id: 2,
						from: 'Анастасия Зорина',
					},
				]);
			} catch (err) {
				throw err;
			}
		})();
	}, []);

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
			showsVerticalScrollIndicator={false}
			showsHorizontalScrollIndicator={false}
		>
			{messages?.map((item, index) => (
				<Message
					key={index}
					{...item}
					is_user={checkMessage(item.from_id)}
				/>
			))}
		</ScrollView>
	);
};
export default ChatBody;
