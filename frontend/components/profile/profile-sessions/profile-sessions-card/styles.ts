import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		borderRadius: 20,
		padding: 20,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 6,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		marginRight: 16,
	},
	info: {
		flex: 1,
	},
	name: {
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
		color: '#011443',
		marginBottom: 4,
	},
	dateTime: {
		fontSize: 14,
		color: '#01144399',
		marginBottom: 4,
	},
	type: {
		fontSize: 14,
		color: '#3871FF',
		fontFamily: 'Hezaedrus500',
	},
	activeButton: {
		backgroundColor: '#3871FF',
		paddingVertical: 16,
		borderRadius: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	activeButtonText: {
		color: '#fff',
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
	},
	pastActions: {
		flexDirection: 'row',
		backgroundColor: '#F5F8FF',
		borderRadius: 32,
		overflow: 'hidden',
		marginTop: 20,
	},
	cancelButton: {
		flex: 1,
		paddingVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cancelText: {
		color: '#011443',
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
	},
	separator: {
		width: 1,
		backgroundColor: '#E0E7FF',
	},
	rescheduleButton: {
		flex: 1,
		paddingVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	rescheduleText: {
		color: '#3871FF',
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
	},
});
