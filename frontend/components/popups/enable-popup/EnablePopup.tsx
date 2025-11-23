import { Modal, Pressable, View, Text, Image } from 'react-native';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { styles } from './styles';
import { closePopup } from '@/store/slices/popupSlice';
import { UI } from '@/types/ui';

interface Props {
	bottom: number;
}

const EnablePopup = ({ bottom }: Props) => {
	const dispatch = useDispatch();
	const [timeNotifications, setTimeNotifications] = useState(false);

	const handleClose = () => {
		dispatch(closePopup());
	};

	return (
		<Modal
			style={styles.container}
			transparent
			animationType='fade'
			onRequestClose={handleClose}
		>
			<Pressable style={{ flex: 1 }} onPress={handleClose}>
				<Pressable
					style={[styles.container__modal, { top: bottom }]}
					onPress={(e) => e.stopPropagation()}
				>
					{!timeNotifications ? (
						<View style={{ width: '100%' }}>
							<Pressable
								style={[
									styles.container__press,
									{
										borderBottomWidth: 8,
										borderBottomColor: 'rgb(0,0,0,0.08)',
										height: 51,
									},
								]}
								onPress={() => setTimeNotifications(true)}
							>
								<Text style={styles.container__text}>
									Выкл. на время
								</Text>
								<Image
									source={require('@/assets/images/off-sound-time.png')}
									style={styles.container__image}
								/>
							</Pressable>
							<Pressable
								style={[
									styles.container__press,
									{
										borderBottomWidth: 0.5,
										borderBottomColor: UI.colors.lightBlue,
									},
								]}
							>
								<Text style={styles.container__text}>
									Выкл. звук
								</Text>
								<Image
									source={require('@/assets/images/off-sound.png')}
									style={styles.container__image}
								/>
							</Pressable>
							<Pressable style={styles.container__press}>
								<Text
									style={[
										styles.container__text,
										{ color: 'red' },
									]}
								>
									Выкл. уведомления
								</Text>
								<Image
									source={require('@/assets/images/off-notifications.png')}
									style={styles.container__image}
								/>
							</Pressable>
						</View>
					) : (
						<View
							style={[styles.container__time, { width: '100%' }]}
						>
							<Pressable
								onPress={() => setTimeNotifications(false)}
								style={[
									styles.container__press,
									{
										borderBottomWidth: 8,
										borderBottomColor: 'rgb(0,0,0,0.08)',
										height: 51,
										justifyContent: 'flex-start',
									},
								]}
							>
								<Image
									source={require('@/assets/images/back.png')}
									style={styles.container__image}
								/>
								<Text
									style={[
										styles.container__text,
										{ marginLeft: 12 },
									]}
								>
									Назад
								</Text>
							</Pressable>
							{[1, 8, 24, 168].map((item, index) => (
								<Pressable
									style={[
										styles.container__press,
										index !== 3 && {
											borderBottomWidth: 0.5,
											borderBottomColor:
												UI.colors.lightBlue,
										},
									]}
									key={index}
								>
									<Text style={styles.container__text}>
										{'Не беспокоить ' +
											(index === 0
												? item + ' час'
												: index === 1
												? item + ' часов'
												: index === 2
												? item / 24 + ' день'
												: index === 3
												? item / 24 + ' дней'
												: '')}
									</Text>
									<Image
										source={require('@/assets/images/off-sound.png')}
										style={styles.container__image}
									/>
								</Pressable>
							))}
						</View>
					)}
				</Pressable>
			</Pressable>
		</Modal>
	);
};
export default EnablePopup;
