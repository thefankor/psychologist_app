import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},

	header: {
		height: 60,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		backgroundColor: '#FFFFFF',
	},

	backButton: {
		position: 'absolute',
		left: 16,
		width: 44,
		height: 44,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: '#E0E0E8',
		justifyContent: 'center',
		alignItems: 'center',
	},

	backIcon: {
		width: 24,
		height: 24,
	},

	headerTitle: {
		fontFamily: 'Hezaedrus500',
		fontSize: 18,
		color: '#011443',
	},

	mainContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 22,
		transform: [{ translateY: -100 }],
	},

	title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 22,
		color: '#011443',
		marginBottom: 50,
	},

	buttonsContainer: {
		width: '100%',
		maxWidth: 360,
		gap: 20,
	},

	roleButton: {
		width: '100%',
		height: 58,
		backgroundColor: '#3871FF',
		borderRadius: 32,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#3871FF',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.28,
		shadowRadius: 12,
		elevation: 8,
	},

	roleButtonActive: {
		backgroundColor: '#2A5BDD',
	},

	buttonText: {
		color: '#FFFFFF',
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
	},

	disabled: {
		opacity: 0.65,
	},
});
