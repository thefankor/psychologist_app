import { Image, View, Modal, Pressable } from 'react-native';
import { styles } from './styles';
import { StatusBar } from 'expo-status-bar';

interface Props {
	image: string;
	setFullscreen: (item: string | undefined) => void;
}

const ImageFullscreen = ({ image, setFullscreen }: Props) => {
	return (
		<>
			<StatusBar hidden />
			<Modal visible={true} transparent={false}>
				<View style={styles.container}>
					<View style={styles.container__header}>
						<Pressable
							style={styles.back__btn}
							onPress={() => setFullscreen(undefined)}
						>
							<Image
								source={require('@/assets/images/back.png')}
								style={{ height: 24, width: 24 }}
							/>
						</Pressable>
					</View>
					<Image source={{ uri: image }} style={styles.image} />
				</View>
			</Modal>
		</>
	);
};
export default ImageFullscreen;
