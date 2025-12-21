import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

	backButton: {
		position: 'absolute',
		top: 50,
		left: 20,
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1.5,
		borderRadius: 100,
		borderColor: 'rgba(1, 20, 67, 0.1)',
		backgroundColor: 'rgba(255,255,255,0.8)',
	},

	backImage: {
		width: 24,
		height: 24,
		maxWidth: 24,
		maxHeight: 24,
	},

	content: {
		alignItems: 'center',
		padding: 30,
		backgroundColor: 'rgba(255,255,255,0.6)',
		borderRadius: 32,
		width: '90%',
	},

	title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 28,
		color: '#011443',
		marginBottom: 12,
		textAlign: 'center',
	},

	time: {
		fontFamily: 'Hezaedrus500',
		fontSize: 32,
		color: '#011443',
		marginBottom: 32,
	},

	controls: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},

	controlButton: {
		width: 56,
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
	},

	playButton: {
		width: 72,
		height: 72,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
