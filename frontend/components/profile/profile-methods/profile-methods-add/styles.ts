import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	keyboardAvoidingView: {
		flex: 1,
	},

	container: {
		marginTop: 20,
		padding: 20,
		borderRadius: 12,
		backgroundColor: '#fff',
	},

	label: {
		fontFamily: 'Hezaedrus',
		fontSize: 16,
		color: '#011443',
		marginBottom: 8,
	},

	input: {
		fontFamily: 'Hezaedrus',
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 12,
		padding: 12,
		fontSize: 16,
		marginBottom: 8,
	},

	inputError: {
		borderColor: 'red',
	},

	errorText: {
		fontFamily: 'Hezaedrus',
		color: 'red',
		fontSize: 14,
		marginBottom: 12,
	},

	bankErrorText: {
		fontFamily: 'Hezaedrus',
		color: 'red',
		fontSize: 14,
		marginTop: 10,
	},

	selectWrapper: {
		position: 'relative',
		marginBottom: 24,
	},

	dropdown: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 12,
		padding: 12,
	},

	dropdownText: {
		fontFamily: 'Hezaedrus',
		fontSize: 16,
		color: '#011443',
	},

	dropdownOverlay: {
		position: 'absolute',
		top: 56,
		left: 0,
		right: 0,
		zIndex: 1000,
	},

	dropdownList: {
		maxHeight: 200,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 12,
		backgroundColor: '#fff',
	},

	dropdownItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},

	bankIcon: {
		width: 24,
		height: 24,
		marginRight: 12,
	},

	bankText: {
		fontFamily: 'Hezaedrus',
		fontSize: 16,
		color: '#011443',
	},

	addButton: {
		backgroundColor: '#3E75FF',
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 8,
	},

	addButtonText: {
		fontFamily: 'Hezaedrus500',
		fontSize: 18,
		color: '#fff',
	},
});
