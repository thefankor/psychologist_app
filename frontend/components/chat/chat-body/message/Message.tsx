import { View, Text, Image } from 'react-native';

import { MessageType } from '@/types/types';
import { styles } from './styles';
import MessageImages from '../message-images/MessageImages';

interface MessageProps extends MessageType {
	is_user: boolean;
}
const Message = ({
	message,
	time,
	is_user,
	from,
	images,
	viewed,
	avatar,
}: MessageProps) => {
	return (
		<View
			style={[
				styles.container,
				!is_user
					? { justifyContent: 'flex-start' }
					: { justifyContent: 'flex-end' },
			]}
		>
			{!is_user && (
				<Image source={avatar} style={styles.container__avatar} />
			)}
			<View style={styles.container__message}>
				<View
					style={[
						styles.container__text,
						!is_user && styles.support__message,
					]}
				>
					{images ? (
						images.length > 0 && <MessageImages images={images} />
					) : (
						<></>
					)}
					<Text style={[styles.message, !is_user && styles.not_user]}>
						{message}
					</Text>
				</View>
				<View
					style={[
						styles.container__footer,
						!is_user && { justifyContent: 'space-between' },
					]}
				>
					{!is_user ? (
						<View style={styles.from__wrap}>
							<Text style={styles.message__from}>{from}</Text>
							<Image
								source={require('@/assets/images/support.png')}
								style={styles.from__image}
							/>
						</View>
					) : viewed ? (
						<Image
							source={require('@/assets/images/viewed.png')}
							style={styles.viewed__image}
						/>
					) : (
						<></>
					)}
					<Text style={styles.container__time}>{time}</Text>
				</View>
			</View>
		</View>
	);
};
export default Message;
