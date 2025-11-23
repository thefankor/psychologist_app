import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		backgroundColor: '#000',
		zIndex: 999,
		paddingLeft: 16,
		paddingRight: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	container__header: {
		width: '100%',
		display: 'flex',
		position: 'absolute',
		top: 60,
		zIndex: 2,
	},
	back__btn: {
		left: 16,
		height: 44,
		width: 44,
		borderRadius: 100,
		borderWidth: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: '#fff',
	},
	image: {
		width: '100%',
		flex: 1,
		resizeMode: 'contain',
		marginTop: 32,
		borderRadius: 42,
	},
});
