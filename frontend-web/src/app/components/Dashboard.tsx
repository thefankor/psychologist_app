import { useEffect, useState } from 'react';
import { Users, Calendar, Clock, TrendingUp, Loader2 } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Link } from 'react-router';
import { Button } from './ui/button';
import {
	getPsyshologistAppointments,
	getClientsForPsychologist,
} from '../../api/psychologist';

const isToday = (iso: string) => {
	const d = new Date(iso);
	const now = new Date();
	return (
		d.getFullYear() === now.getFullYear() &&
		d.getMonth() === now.getMonth() &&
		d.getDate() === now.getDate()
	);
};

const isThisMonth = (iso: string) => {
	const d = new Date(iso);
	const now = new Date();
	return (
		d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
	);
};

const formatTime = (iso: string) =>
	new Date(iso).toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	});

const getDurationMin = (startAt: string, endsAt: string) =>
	Math.round(
		(new Date(endsAt).getTime() - new Date(startAt).getTime()) / 60000,
	);

const todayLabel = () =>
	new Date().toLocaleDateString('ru-RU', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

const getClientParty = (attendees: any[]) =>
	attendees?.find((a) => a.role === 'CLIENT') ?? attendees?.[0];

const getInitials = (name: string | null) =>
	name
		? name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
		: '?';

export default function Dashboard() {
	const token = localStorage.getItem('token') ?? '';

	const [appointments, setAppointments] = useState<any[]>([]);
	const [clients, setClients] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const [upcomingAppts, completedAppts, cls] = await Promise.all([
					getPsyshologistAppointments(token, true),
					getPsyshologistAppointments(token, false),
					getClientsForPsychologist(token),
				]);
				setAppointments([
					...(upcomingAppts ?? []),
					...(completedAppts ?? []),
				]);
				setClients(cls ?? []);
			} catch {
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const todaySessions = appointments
		.filter((a) => isToday(a.start_at))
		.sort(
			(a, b) =>
				new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
		);

	const monthCount = appointments.filter((a) =>
		isThisMonth(a.start_at),
	).length;
	const totalCount = appointments.length;
	const clientCount = clients.length;

	const statCards = [
		{
			title: 'Сессий сегодня',
			value: String(todaySessions.length),
			icon: Clock,
			footer: 'в расписании на сегодня',
			color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
		},
		{
			title: 'В этом месяце',
			value: String(monthCount),
			icon: Calendar,
			footer: 'сессий в текущем месяце',
			color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
		},
		{
			title: 'Всего сессий',
			value: String(totalCount),
			icon: TrendingUp,
			footer: 'за всё время',
			color: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
		},
		{
			title: 'Клиентов',
			value: String(clientCount),
			icon: Users,
			footer: 'всего в базе',
			color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
		},
	];

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900'>
				<Loader2 className='w-8 h-8 animate-spin text-blue-500' />
			</div>
		);
	}

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

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				{statCards.map((card) => {
					const Icon = card.icon;
					return (
						<Card
							key={card.title}
							className='dark:bg-gray-800 dark:border-gray-700'
						>
							<CardContent className='p-6 pt-4'>
								<div className='flex items-center justify-between mb-4'>
									<p className='text-sm text-gray-500 dark:text-gray-400'>
										{card.title}
									</p>
									<div
										className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}
									>
										<Icon className='w-5 h-5' />
									</div>
								</div>
								<p className='text-3xl font-bold text-gray-900 dark:text-white'>
									{card.value}
								</p>
								<p className='text-xs text-gray-400 dark:text-gray-400 mt-1'>
									{card.footer}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader>
						<CardTitle className='dark:text-white'>
							Сессии сегодня
						</CardTitle>
						<CardDescription className='dark:text-gray-400 capitalize'>
							{todayLabel()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							{todaySessions.length > 0 ? (
								todaySessions.map((a) => {
									const client = getClientParty(
										a.attendees ?? [],
									);
									const duration = a.ends_at
										? getDurationMin(a.start_at, a.ends_at)
										: null;
									return (
										<div
											key={a.id}
											className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
										>
											<div className='flex items-center gap-4'>
												<div className='text-center min-w-[52px]'>
													<div className='text-base font-semibold text-gray-900 dark:text-white'>
														{formatTime(a.start_at)}
													</div>
													{duration != null && (
														<div className='text-xs text-gray-400 dark:text-gray-400'>
															{duration} мин
														</div>
													)}
												</div>
												<div>
													<p className='font-medium text-gray-900 dark:text-white'>
														{client?.name || '—'}
													</p>
													<p className='text-sm text-gray-500 dark:text-gray-400'>
														Клиент
													</p>
												</div>
											</div>
											{client?.user_id && (
												<Link
													to={`/clients/${client.user_id}`}
												>
													<Button
														variant='outline'
														size='sm'
														className='dark:border-gray-600 dark:text-gray-300'
													>
														Профиль
													</Button>
												</Link>
											)}
										</div>
									);
								})
							) : (
								<p className='text-gray-500 dark:text-gray-400 text-center py-8'>
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
						<CardDescription className='dark:text-gray-400'>
							Последние активные клиенты
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							{clients.length > 0 ? (
								clients.slice(0, 5).map((c) => (
									<div
										key={c.client_id}
										className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
									>
										<div className='flex items-center gap-3'>
											<div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold flex-shrink-0'>
												{getInitials(c.name)}
											</div>
											<div>
												<p className='font-medium text-gray-900 dark:text-white'>
													{c.name || '—'}
												</p>
												<p className='text-sm text-gray-500 dark:text-gray-400'>
													{c.total_sessions}{' '}
													{c.total_sessions === 1
														? 'сессия'
														: c.total_sessions >=
																	2 &&
															  c.total_sessions <=
																	4
															? 'сессии'
															: 'сессий'}
												</p>
											</div>
										</div>
										<Link to={`/clients/${c.client_id}`}>
											<Button
												variant='outline'
												size='sm'
												className='dark:border-gray-600 dark:text-gray-300'
											>
												Профиль
											</Button>
										</Link>
									</div>
								))
							) : (
								<p className='text-gray-500 dark:text-gray-400 text-center py-8'>
									Нет клиентов
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
