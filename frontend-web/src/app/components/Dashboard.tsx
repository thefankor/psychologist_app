import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { dashboardCards, mockClients, mockSessions } from '../data/mockData';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { InfoCard } from './ui/info-card';

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
				<h5 className='text-gray-500  mt-1 dark:text-white'>
					Обзор вашей практики
				</h5>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				{dashboardCards.map((card) => (
					<InfoCard
						key={card.title}
						title={card.title}
						value={card.value}
						icon={card.icon}
						footer={card.footer}
					/>
				))}
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader>
						<CardTitle className='dark:text-white'>
							Сессии сегодня
						</CardTitle>
						<CardDescription className='dark:text-gray-200'>
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
												<div className='text-xs text-gray-500 dark:text-gray-200'>
													{session.duration} мин
												</div>
											</div>
											<div>
												<p className='font-medium text-gray-900 dark:text-white'>
													{session.clientName}
												</p>
												<p className='text-sm text-gray-500 dark:text-gray-200'>
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
								<p className='text-gray-500 dark:text-gray-200 text-center py-8'>
									Нет запланированных сессий
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader>
						<CardTitle className='dark:text-white'>
							Недавние клиенты
						</CardTitle>
						<CardDescription className='dark:text-gray-200'>
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
												<p className='text-sm text-gray-500 dark:text-gray-200'>
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
