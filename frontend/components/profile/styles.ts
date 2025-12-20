import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		paddingTop: 20,
		paddingLeft: 16,
		paddingRight: 16,
		backgroundColor: '#F8F9FD',
	},
	container__avatar: {
		height: 100,
		width: 100,
		backgroundColor: '#d1d1d1',
		borderRadius: 100,
	},
	container__name: {
		fontFamily: 'Hezaedrus500',
		fontSize: 22,
		marginTop: 12,
		marginBottom: 24,
	},
	container__menu: {
		width: '100%',
	},
	container__section: {
		width: '100%',
		marginTop: 20,
		borderRadius: 12,
		backgroundColor: '#FCFCFC',
		paddingLeft: 18,
		paddingRight: 18,
		shadowColor: '#E2E2E2',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 4,
	},
	first: {
		marginTop: 0,
		height: 180,
	},
	second: {
		height: 95,
	},
});
