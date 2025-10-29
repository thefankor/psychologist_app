import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	keyboardAvoidingView: {
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: '#f8f9fd',
		paddingHorizontal: 16,
		justifyContent: 'center',
	},
	content: {
		width: '100%',
	},
	email__input: {
		width: '100%',
		height: 50,
		borderWidth: 1,
		borderColor: '#0114431A',
		borderRadius: 15,
		fontFamily: 'Hezaedrus',
		paddingHorizontal: 12,
		fontSize: 16,
		color: '#011443',
	},
	email__input_with_text: {
		paddingTop: 20,
	},
	input__wrap: {
		position: 'relative',
		width: '100%',
	},
	input__text: {
		position: 'absolute',
		top: 6,
		left: 12,
		fontFamily: 'Hezaedrus',
		fontSize: 12,
		color: UI.colors.mediumBlue,
	},
	error__text: {
		color: 'red',
		marginTop: 4,
		width: '100%',
		textAlign: 'left',
		fontFamily: 'Hezaedrus',
	},
	input__title: {
		fontFamily: 'Hezaedrus500',
		marginBottom: 20,
		color: '#011443',
		fontSize: 20,
	},
	button__text: {
		color: '#fff',
		fontFamily: 'Hezaedrus500',
		fontSize: 14,
		textAlign: 'center',
	},
});
