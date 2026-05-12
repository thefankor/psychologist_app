import { useRouteError, useNavigate } from 'react-router';

export default function RouteError() {
	const error = useRouteError();
	const navigate = useNavigate();

	const isDomError =
		error instanceof Error && error.message.includes('insertBefore');

	if (isDomError) {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-4'>
				<p className='text-gray-600 dark:text-gray-300'>
					Произошла ошибка отображения
				</p>
				<button
					onClick={() => navigate(0)}
					className='cursor-pointer px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors'
				>
					Обновить страницу
				</button>
			</div>
		);
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-4'>
			<p className='text-gray-600 dark:text-gray-300'>
				Что-то пошло не так
			</p>
			<button
				onClick={() => navigate(-1)}
				className='px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors'
			>
				Назад
			</button>
		</div>
	);
}
