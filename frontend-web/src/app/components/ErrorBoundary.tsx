import { Component, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-4'>
					<p className='text-gray-600 dark:text-gray-300 text-lg'>
						Что-то пошло не так
					</p>
					<button
						onClick={() => this.setState({ hasError: false })}
						className='px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors'
					>
						Попробовать снова
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
