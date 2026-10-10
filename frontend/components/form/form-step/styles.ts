import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		paddingTop: 34,
		paddingLeft: 16,
		paddingBottom: 30,
		paddingRight: 16,
		position: 'relative',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	container__title: {
		fontSize: 20,
		color: '#011443',
		fontFamily: 'Hezaedrus500',
		textAlign: 'left',
		width: '100%',
	},
	container__description: {
		color: 'rgba(1, 20, 67, 0.6)',
		fontFamily: 'Hezaedrus',
		marginTop: 20,
		lineHeight: 20,
	},
	container__questions: {
		width: '100%',
		marginTop: 20,
		height: 'auto',
		gap: 12,
		paddingBottom: 50,
	},
});
