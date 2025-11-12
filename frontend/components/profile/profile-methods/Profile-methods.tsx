import { View, Text, Pressable, Image } from 'react-native';
import { styles } from './styles';

const ProfileMethods = () => {
	return (
		<View style={styles.container}>
			<Text style={styles.container__title}>СБП оплата</Text>
			<View style={styles.container__method}>
				<Pressable style={styles.link__method}>
					<View style={styles.method__wrap}>
						<Image
							source={require('@/assets/images/sbp.png')}
							height={24}
							width={24}
							style={styles.method__image}
						/>
						<Text style={styles.method__text}>
							Добавить счет СБП
						</Text>
					</View>
					<Image
						source={require('@/assets/images/right.png')}
						height={24}
						width={24}
						style={styles.method__image}
					/>
				</Pressable>
			</View>
			<Text style={styles.container__title}>Оплата картой</Text>
			<View style={styles.container__method}>
				<Pressable style={styles.link__method}>
					<View style={styles.method__wrap}>
						<Image
							source={require('@/assets/images/card.png')}
							height={24}
							width={24}
							style={styles.method__image}
						/>
						<Text style={styles.method__text}>
							Добавить банковскую карту
						</Text>
					</View>
					<Image
						source={require('@/assets/images/right.png')}
						height={24}
						width={24}
						style={styles.method__image}
					/>
				</Pressable>
			</View>
		</View>
	);
};
export default ProfileMethods;
