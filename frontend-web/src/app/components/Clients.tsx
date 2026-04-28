import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search, Loader2, Calendar, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { getClientsForPsychologist } from '../../api/psychologist';

const getInitials = (name: string | null) =>
	name
		? name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
		: '?';

export default function Clients() {
	const token = localStorage.getItem('token') ?? '';
	const [clients, setClients] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');

	const fetchClients = async () => {
		setLoading(true);
		setError('');
		try {
			const data = await getClientsForPsychologist(token);
			setClients(data);
		} catch (e: any) {
			setError(e.message || 'Ошибка при загрузке клиентов');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClients();
	}, []);

	const filtered = clients.filter((c) =>
		(c.name ?? '').toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
					Клиенты
				</h1>
				<p className='text-gray-500 dark:text-gray-400 mt-1'>
					Управление клиентской базой
				</p>
			</div>

			<div className='mb-6'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
					<Input
						placeholder='Поиск по имени...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='pl-10 dark:bg-gray-800 dark:border-gray-700'
					/>
				</div>
			</div>

			{loading ? (
				<div className='flex items-center justify-center py-24'>
					<Loader2 className='w-8 h-8 animate-spin text-blue-500' />
				</div>
			) : error ? (
				<div className='text-center py-24'>
					<p className='text-red-500'>{error}</p>
					<Button
						variant='outline'
						className='mt-4 dark:border-gray-600 dark:text-gray-300'
						onClick={fetchClients}
					>
						Повторить
					</Button>
				</div>
			) : filtered.length === 0 ? (
				<div className='text-center py-24'>
					<p className='text-gray-500 dark:text-gray-400'>
						{search ? 'Клиенты не найдены' : 'Нет клиентов'}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filtered.map((c) => (
						<Card
							key={c.client_id}
							className='hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700'
						>
							<CardContent className='p-6'>
								<div className='flex items-center gap-3 mb-4'>
									<div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-lg flex-shrink-0'>
										{getInitials(c.name)}
									</div>
									<div>
										<h3 className='font-semibold text-gray-900 dark:text-white'>
											{c.name || '—'}
										</h3>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Клиент
										</p>
									</div>
								</div>

								<div className='space-y-2 mb-4 border-t border-gray-100 dark:border-gray-700 pt-4'>
									<div className='flex justify-between text-sm'>
										<span className='flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
											<Calendar className='w-4 h-4' />
											Первая сессия
										</span>
										<span className='font-medium text-gray-900 dark:text-gray-200'>
											{c.first_session
												? new Date(
														c.first_session,
													).toLocaleDateString(
														'ru-RU',
													)
												: '—'}
										</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span className='flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
											<Video className='w-4 h-4' />
											Всего сессий
										</span>
										<span className='font-medium text-gray-900 dark:text-gray-200'>
											{c.total_sessions}
										</span>
									</div>
								</div>

								<Link to={`/clients/${c.client_id}`}>
									<Button
										variant='outline'
										className='w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
									>
										Открыть профиль
									</Button>
								</Link>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
