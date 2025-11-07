import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		paddingTop: 30,
		paddingLeft: 16,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		paddingRight: 16,
	},
	form__scroll: {
		flex: 1,
		width: '100%',
	},
	form__scrollContainer: {
		paddingBottom: 20,
	},
	form__title: {
		fontSize: 20,
		color: '#011443',
		width: '100%',
		textAlign: 'left',
		fontFamily: 'Hezaedrus500',
	},
	form__subtitle: {
		fontFamily: 'Hezaedrus',
		marginTop: 8,
		width: '100%',
		textAlign: 'left',
		color: '#01144399',
	},
	form__wrap: {
		width: '100%',
		height: 'auto',
		marginTop: 24,
	},
	form__block: {
		marginTop: 12,
	},
});
