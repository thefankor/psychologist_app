import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	overlay: {
		flex: 1,
	},
	modalContent: {
		backgroundColor: 'white',
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingBottom: 12,
		paddingTop: 8,
	},
	swipeIndicator: {
		width: 40,
		height: 5,
		backgroundColor: '#ccc',
		borderRadius: 3,
		alignSelf: 'center',
		marginBottom: 15,
	},
	title: {
		fontSize: 18,
		marginBottom: 20,

		textAlign: 'center',
	},
	closeButton: {
		backgroundColor: '#f0f0f0',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
	},
	closeButtonText: {
		fontSize: 16,
		color: '#333',
	},
	popup__container: {
		width: '100%',
		gap: 20,
	},
	popup__title: {
		fontFamily: 'Hezaedrus500',
		textAlign: 'center',
		color: '#011443',
		fontWeight: 500,
		fontSize: 18,
	},
	popup__blocks: {
		gap: 12,
	},
	next__button: {
		backgroundColor: '#3871FF',
		height: 50,
		width: '100%',
		borderRadius: 50,
		marginTop: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	button__text: {
		color: '#fff',
		fontFamily: 'Involve',
		fontSize: 14,
	},
	reset__btn: {
		width: '100%',
		height: 50,
	},
	swipeArea: {
		width: '100%',
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	reset__text: {
		fontFamily: 'Hezaedrus',
		color: '#3871FF',
		textAlign: 'center',
		fontSize: 16,
		zIndex: 5,
	},
});
