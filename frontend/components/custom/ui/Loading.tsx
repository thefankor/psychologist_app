import { ActivityIndicator, View } from 'react-native';

export const Loading = () => {
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(248, 249, 253, 0.8)',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 10,
			}}
		>
			<ActivityIndicator size='large' color='#0043E9' />
		</View>
	);
};
