import { useState } from 'react';
import { Dimensions, Pressable, View, Image } from 'react-native';
import { styles } from './styles';
import ImageFullscreen from '../image-fullscreen/ImageFullscreen';

interface Props {
	images: string[];
}

export const { width } = Dimensions.get('window');
const GAP = 2;

const MessageImages = ({ images }: Props) => {
	const [fullscreen, setFullScreen] = useState<string | undefined>();

	const getImageStyle = (index: number, totalImages: number) => {
		if (totalImages === 1) {
			return [styles.image, styles.singleImage];
		}

		if (totalImages === 2) {
			return [styles.image, styles.twoImages];
		}

		if (totalImages === 3) {
			return [
				styles.image,
				styles.multipleImages,
				{ width: (width - GAP * 2) / 3 + 11 },
			];
		}

		if (totalImages === 4) {
			return [
				styles.image,
				styles.multipleImages,
				{ width: (width - GAP) / 2 },
			];
		}

		return [
			styles.image,
			styles.multipleImages,
			{ width: (width - GAP * 2) / 3 },
		];
	};

	const findImage = (i: number) => {
		const image = images.find((item, index) => (index === i ? item : null));
		return image;
	};

	const renderImageGrid = () => {
		if (images.length === 1) {
			return (
				<Pressable onPress={() => setFullScreen(findImage(0))}>
					<Image
						source={{ uri: images[0] }}
						style={getImageStyle(0, 1)}
					/>
				</Pressable>
			);
		}

		if (images.length === 2) {
			return (
				<View style={{ flexDirection: 'row', gap: GAP }}>
					{images.map((item, index) => (
						<Pressable
							key={index}
							onPress={() => setFullScreen(findImage(index))}
							style={{ flex: 1 }}
						>
							<Image
								source={{ uri: item }}
								style={[
									getImageStyle(index, 2),
									index === 0 && { borderTopLeftRadius: 22 },
									index === 1 && { borderTopRightRadius: 22 },
								]}
							/>
						</Pressable>
					))}
				</View>
			);
		}

		if (images.length === 3) {
			return (
				<View style={{ flexDirection: 'row', gap: GAP }}>
					<View style={{ gap: GAP }}>
						<Pressable onPress={() => setFullScreen(findImage(0))}>
							<Image
								source={{ uri: images[0] }}
								style={[
									getImageStyle(0, 3),
									{ height: 202, borderTopLeftRadius: 22 },
								]}
							/>
						</Pressable>
					</View>
					<View style={{ gap: GAP }}>
						{images.slice(1, 3).map((item, index) => (
							<Pressable
								key={index + 1}
								onPress={() =>
									setFullScreen(findImage(index + 1))
								}
							>
								<Image
									source={{ uri: item }}
									style={[
										getImageStyle(index + 1, 3),
										index === 0 && {
											borderTopRightRadius: 22,
										},
									]}
								/>
							</Pressable>
						))}
					</View>
				</View>
			);
		}

		if (images.length === 4) {
			const imageSize = 137.5;
			return (
				<View style={{ flexDirection: 'row', gap: GAP }}>
					<View style={{ gap: GAP }}>
						{images.slice(0, 2).map((item, index) => (
							<Pressable
								key={index}
								onPress={() => setFullScreen(findImage(index))}
							>
								<Image
									source={{ uri: item }}
									style={[
										styles.image,
										{
											width: imageSize,
											height: imageSize,
										},
										index === 0 && {
											borderTopLeftRadius: 22,
										},
									]}
								/>
							</Pressable>
						))}
					</View>
					<View style={{ gap: GAP }}>
						{images.slice(2, 4).map((item, index) => (
							<Pressable
								key={index + 2}
								onPress={() =>
									setFullScreen(findImage(index + 2))
								}
							>
								<Image
									source={{ uri: item }}
									style={[
										styles.image,
										{ width: imageSize, height: imageSize },
										index === 0 && {
											borderTopRightRadius: 22,
										},
									]}
								/>
							</Pressable>
						))}
					</View>
				</View>
			);
		}
	};
	return (
		<View style={styles.container}>
			{fullscreen && (
				<ImageFullscreen
					image={fullscreen}
					setFullscreen={setFullScreen}
				/>
			)}
			<View style={styles.container__image}>{renderImageGrid()}</View>
		</View>
	);
};

export default MessageImages;
