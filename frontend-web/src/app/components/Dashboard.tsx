import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { mockClients, mockSessions } from '../data/mockData';
import { Link } from 'react-router';
import { Button } from './ui/button';

export default function Dashboard() {
	const activeClients = mockClients.filter(
		(c) => c.status === 'active',
	).length;
	const todaySessions = mockSessions.filter(
		(s) => s.date === '2026-04-02' && s.status === 'scheduled',
	);
	const upcomingSessions = mockSessions.filter(
		(s) =>
			s.status === 'scheduled' &&
			new Date(s.date) >= new Date('2026-04-01'),
	);

	const totalSessionsThisMonth = mockClients.reduce(
		(sum, client) => sum + client.totalSessions,
		0,
	);

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
					Дашборд
				</h1>
				<p className='text-gray-500 dark:text-gray-400 mt-1'>
					Обзор вашей практики
				</p>
			</div>

			{/* Stats Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Активные клиенты
						</CardTitle>
						<Users className='w-4 h-4 text-gray-400 dark:text-gray-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900 dark:text-white'>
							{activeClients}
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
							из {mockClients.length} всего
						</p>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Сессии сегодня
						</CardTitle>
						<Calendar className='w-4 h-4 text-gray-400 dark:text-gray-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900 dark:text-white'>
							{todaySessions.length}
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
							запланировано
						</p>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Предстоящие
						</CardTitle>
						<Clock className='w-4 h-4 text-gray-400 dark:text-gray-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900 dark:text-white'>
							{upcomingSessions.length}
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
							в этом месяце
						</p>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Всего сессий
						</CardTitle>
						<TrendingUp className='w-4 h-4 text-gray-400 dark:text-gray-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900 dark:text-white'>
							{totalSessionsThisMonth}
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
							за все время
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Today's Sessions */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader>
						<CardTitle className='dark:text-white'>
							Сессии сегодня
						</CardTitle>
						<CardDescription className='dark:text-gray-400'>
							Среда, 2 апреля 2026
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{todaySessions.length > 0 ? (
								todaySessions.map((session) => (
									<div
										key={session.id}
										className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
									>
										<div className='flex items-center gap-4'>
											<div className='text-center'>
												<div className='text-lg font-semibold text-gray-900 dark:text-white'>
													{session.time}
												</div>
												<div className='text-xs text-gray-500 dark:text-gray-400'>
													{session.duration} мин
												</div>
											</div>
											<div>
												<p className='font-medium text-gray-900 dark:text-white'>
													{session.clientName}
												</p>
												<p className='text-sm text-gray-500 dark:text-gray-400'>
													{session.type ===
														'initial' &&
														'Первичная консультация'}
													{session.type ===
														'regular' &&
														'Регулярная сессия'}
													{session.type === 'final' &&
														'Заключительная сессия'}
												</p>
											</div>
										</div>
										<Link
											to={`/clients/${session.clientId}`}
										>
											<Button
												variant='outline'
												size='sm'
												className='dark:border-gray-600 dark:text-gray-300'
											>
												Открыть
											</Button>
										</Link>
									</div>
								))
							) : (
								<p className='text-gray-500 dark:text-gray-400 text-center py-8'>
									Нет запланированных сессий
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Recent Clients */}
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader>
						<CardTitle className='dark:text-white'>
							Недавние клиенты
						</CardTitle>
						<CardDescription className='dark:text-gray-400'>
							Последние активные клиенты
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{mockClients
								.filter((c) => c.status === 'active')
								.slice(0, 4)
								.map((client) => (
									<div
										key={client.id}
										className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
									>
										<div className='flex items-center gap-4'>
											<div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold'>
												{client.name
													.split(' ')
													.map((n) => n[0])
													.join('')}
											</div>
											<div>
												<p className='font-medium text-gray-900 dark:text-white'>
													{client.name}
												</p>
												<p className='text-sm text-gray-500 dark:text-gray-400'>
													{client.totalSessions}{' '}
													сессий
												</p>
											</div>
										</div>
										<Link to={`/clients/${client.id}`}>
											<Button
												variant='outline'
												size='sm'
												className='dark:border-gray-600 dark:text-gray-300'
											>
												Профиль
											</Button>
										</Link>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
