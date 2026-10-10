import {
	View,
	Text,
	Image,
	Pressable,
	ActionSheetIOS,
	Platform,
} from 'react-native';
import { styles } from './styles';
import MessageImages from '../message-images/MessageImages';
import { UIMessage } from '@/types/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import * as Clipboard from 'expo-clipboard';

interface MessageProps {
	msg: UIMessage;
}

const Message = ({ msg }: MessageProps) => {
	const myId = useSelector((state: RootState) => state.user.id);
	const myAvatar = useSelector((state: RootState) => state.user.avatar);
	const myName = useSelector((state: RootState) => state.user.name);

	const isMine = msg.author.id === myId || (!msg.id && msg.localId);

	const time = new Date(msg.createdAt).toLocaleTimeString('ru', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const images = msg.mediaUrl ? [msg.mediaUrl] : null;
	const name = isMine ? myName : msg.author.name;

	const avatarSource = isMine
		? myAvatar
			? { uri: myAvatar }
			: require('@/assets/images/avatar.png')
		: msg.author.avatar
		? { uri: msg.author.avatar }
		: require('@/assets/images/avatar.png');

	const handleLongPress = () => {
		if (!msg.text) return;

		if (Platform.OS === 'ios') {
			ActionSheetIOS.showActionSheetWithOptions(
				{
					options: ['Отмена', 'Копировать'],
					cancelButtonIndex: 0,
				},
				(btnIndex) =>
					btnIndex === 1 && Clipboard.setStringAsync(msg.text)
			);
		} else {
			Clipboard.setStringAsync(msg.text);
		}
	};

	return (
		<View style={[styles.container, isMine ? styles.right : styles.left]}>
			{!isMine && (
				<Image source={avatarSource} style={styles.container__avatar} />
			)}

			<View style={styles.container__message}>
				<View
					style={[
						styles.nameTimeRow,
						isMine ? styles.rightAlign : styles.leftAlign,
					]}
				>
					<Text style={styles.message__from}>{name}</Text>
					<Text style={styles.container__time}>{time}</Text>
				</View>

				<Pressable onLongPress={handleLongPress}>
					<View
						style={[
							styles.container__text,
							isMine
								? styles.my__message
								: styles.support__message,
							isMine ? styles.rightBubble : styles.leftBubble,
						]}
					>
						{images && <MessageImages images={images} />}
						<Text
							style={[
								styles.message,
								isMine ? styles.my__text : styles.not_user,
							]}
						>
							{msg.text}
						</Text>
					</View>
				</Pressable>
			</View>

			{isMine && (
				<Image source={avatarSource} style={styles.container__avatar} />
			)}
		</View>
	);
};

export default Message;
