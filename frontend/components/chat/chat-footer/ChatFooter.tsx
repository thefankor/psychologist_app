import {
	Pressable,
	Image,
	TextInput,
	View,
	Platform,
	Keyboard,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { styles } from './styles';
import { useSelector, useDispatch } from 'react-redux';
import { messageHandler, requestPermissionsMedia } from '@/helpers/helper';
import { setPopupData } from '@/store/slices/popupSlice';
import * as NavigationBar from 'expo-navigation-bar';
import * as MediaLibrary from 'expo-media-library';
import { RootState } from '@/store/store';

interface Props {
	inPopup?: boolean;
}

const ChatFooter = ({ inPopup }: Props) => {
	const dispatch = useDispatch();
	const { message } = useSelector((state: RootState) => state.chat);
	const { searchMode } = useSelector((state: RootState) => state.group);
	const textInputRef = useRef<TextInput>(null);
	const [_, requestPermission] = MediaLibrary.usePermissions();
	const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);

	useEffect(() => {
		if (inPopup) {
			return;
		}
		requestPermissionsMedia(setPhotos, requestPermission, inPopup);
	}, []);

	const pickImage = async () => {
		textInputRef.current?.blur();
		Keyboard.dismiss();

		try {
			if (Platform.OS === 'android') {
				await NavigationBar.setVisibilityAsync('hidden');
			}

			await new Promise((resolve) => setTimeout(resolve, 100));

			dispatch(
				setPopupData({
					generalInfo: {
						isOpen: true,
						type: 'photo',
					},

					otherInfo: {
						query: {
							message: message,
							photos: photos,
						},
					},
				})
			);
		} catch (err) {
			alert('Произошла ошибка при доступе к галерее');
		}
	};

	return (
		<>
			{!searchMode && (
				<View style={[styles.container]}>
					<TextInput
						ref={textInputRef as React.RefObject<TextInput>}
						style={[
							styles.container__input,
							inPopup && { paddingLeft: 16 },
						]}
						placeholder='Введите сообщение'
						cursorColor='#3E75FF'
						value={message}
						onChangeText={(text) => {
							messageHandler(text, dispatch);
						}}
						placeholderTextColor={'rgba(1, 20, 67, 0.3)'}
					/>
					{inPopup ? (
						<></>
					) : (
						<Pressable
							style={styles.container__image}
							onPressIn={() => pickImage()}
							onPress={(e) => e.stopPropagation()}
							hitSlop={{
								top: 28,
								bottom: 28,
								left: 28,
								right: 28,
							}}
						>
							<Image
								source={require('@/assets/images/clip.png')}
								style={{ height: 28, width: 28 }}
							/>
						</Pressable>
					)}

					{message !== '' && (
						<Pressable style={styles.send__btn}>
							<Image
								source={require('@/assets/images/send.png')}
								style={styles.send__img}
							/>
						</Pressable>
					)}
				</View>
			)}
		</>
	);
};

export default ChatFooter;
