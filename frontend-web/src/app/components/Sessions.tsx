import { useEffect, useState } from 'react';
import {
	Calendar as CalendarIcon,
	Clock,
	Plus,
	User,
	Loader2,
	Video,
} from 'lucide-react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { useUser } from '../context/UserContext';
import {
	getPsyshologistAppointments,
	getAllAppointments,
	createAppointment,
	getPsychologistsForClient,
} from '../../api/psychologist';

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

const formatTime = (iso: string) =>
	new Date(iso).toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	});

const getDurationMin = (startAt: string, endsAt: string) =>
	Math.round(
		(new Date(endsAt).getTime() - new Date(startAt).getTime()) / 60000,
	);

const getInitials = (name: string | null) =>
	name
		? name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
		: '?';

const isUpcoming = (startAt: string, now: Date) =>
	now < new Date(new Date(startAt).getTime() + 15 * 60 * 1000);

const isInActiveWindow = (startAt: string, now: Date) => {
	const start = new Date(startAt).getTime();
	const t = now.getTime();
	return t >= start - 15 * 60 * 1000 && t < start + 15 * 60 * 1000;
};

function NewSessionDialog({ onCreated }: { onCreated: () => void }) {
	const token = localStorage.getItem('token') ?? '';
	const [open, setOpen] = useState(false);
	const [psychologists, setPsychologists] = useState<any[]>([]);
	const [loadingPsych, setLoadingPsych] = useState(false);
	const [psychId, setPsychId] = useState('');
	const [date, setDate] = useState('');
	const [time, setTime] = useState('');
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState('');

	const handleOpen = async (o: boolean) => {
		setOpen(o);
		if (o && psychologists.length === 0) {
			setLoadingPsych(true);
			try {
				const data = await getPsychologistsForClient(token);
				setPsychologists(data);
			} catch {
			} finally {
				setLoadingPsych(false);
			}
		}
	};

	const handleCreate = async () => {
		if (!psychId || !date || !time) {
			setError('Заполните все поля');
			return;
		}
		setCreating(true);
		setError('');
		try {
			const d = new Date(`${date}T${time}:00`);
			const tzOffset = -d.getTimezoneOffset();
			const sign = tzOffset >= 0 ? '+' : '-';
			const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
			const startAt = `${date}T${time}:00${sign}${pad(Math.floor(Math.abs(tzOffset) / 60))}:${pad(Math.abs(tzOffset) % 60)}`;
			await createAppointment(token, parseInt(psychId), startAt);
			setOpen(false);
			setPsychId('');
			setDate('');
			setTime('');
			onCreated();
		} catch (e: any) {
			setError(e.message || 'Ошибка при записи');
		} finally {
			setCreating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpen}>
			<DialogTrigger asChild>
				<Button className='bg-blue-600 hover:bg-blue-700 dark:text-white'>
					<Plus className='w-4 h-4 mr-2' />
					Записаться к психологу
				</Button>
			</DialogTrigger>
			<DialogContent className='dark:bg-gray-800 dark:border-gray-700'>
				<DialogHeader>
					<DialogTitle className='dark:text-white'>
						Запись к психологу
					</DialogTitle>
				</DialogHeader>
				<div className='space-y-4 mt-2'>
					<div className='space-y-2'>
						<Label className='dark:text-gray-200'>Психолог</Label>
						{loadingPsych ? (
							<div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
								<Loader2 className='w-4 h-4 animate-spin' />
								Загрузка...
							</div>
						) : (
							<select
								value={psychId}
								onChange={(e) => setPsychId(e.target.value)}
								className='w-full rounded-md border border-input px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
							>
								<option value=''>Выберите психолога</option>
								{psychologists.map((p) => (
									<option key={p.id} value={p.id}>
										{p.first_name} {p.last_name}
										{p.price ? ` — ${p.price} ₽` : ''}
									</option>
								))}
							</select>
						)}
					</div>

					<div className='space-y-2'>
						<Label className='dark:text-gray-200'>Дата</Label>
						<input
							type='date'
							value={date}
							min={new Date().toISOString().slice(0, 10)}
							onChange={(e) => setDate(e.target.value)}
							className='w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
						/>
					</div>

					<div className='space-y-2'>
						<Label className='dark:text-gray-200'>Время</Label>
						<input
							type='time'
							value={time}
							onChange={(e) => setTime(e.target.value)}
							className='w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
						/>
					</div>

					{error && <p className='text-sm text-red-500'>{error}</p>}

					<Button
						onClick={handleCreate}
						disabled={creating}
						className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
					>
						{creating && (
							<Loader2 className='w-4 h-4 mr-2 animate-spin' />
						)}
						Записаться
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function SessionCard({
	appointment,
	isPsychologist,
	now,
}: {
	appointment: any;
	isPsychologist: boolean;
	now: Date;
}) {
	const myRole = isPsychologist ? 'PSYCHOLOGIST' : 'CLIENT';
	const otherParty =
		appointment.attendees?.find((a: any) => a.role !== myRole) ??
		appointment.attendees?.[0];

	const active = isInActiveWindow(appointment.start_at, now);
	const upcoming = isUpcoming(appointment.start_at, now);
	const duration = getDurationMin(appointment.start_at, appointment.ends_at);
	const initials = getInitials(otherParty?.name ?? null);

	const avatarColor = isPsychologist
		? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
		: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400';

	return (
		<Card className='hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700'>
			<CardContent className='p-6'>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex items-center gap-3'>
						<div
							className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${avatarColor}`}
						>
							{initials}
						</div>
						<div>
							<h3 className='font-semibold text-gray-900 dark:text-white'>
								{otherParty?.name || '—'}
							</h3>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								{isPsychologist ? 'Клиент' : 'Психолог'}
							</p>
						</div>
					</div>
					<Badge
						className={`p-1 ${
							upcoming
								? active
									? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
									: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
								: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
						}`}
					>
						{upcoming
							? active
								? 'Идёт сейчас'
								: 'Запланировано'
							: 'Завершено'}
					</Badge>
				</div>

				<div className='space-y-1 mb-4'>
					<div className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
						<CalendarIcon className='w-4 h-4 mr-2 flex-shrink-0' />
						{formatDate(appointment.start_at)}
					</div>
					<div className='flex items-center text-sm text-gray-600 dark:text-gray-300'>
						<Clock className='w-4 h-4 mr-2 flex-shrink-0' />
						{formatTime(appointment.start_at)} ({duration} мин)
					</div>
				</div>

				<div className='flex gap-2'>
					{isPsychologist && otherParty?.user_id && (
						<Link
							to={`/clients/${otherParty.user_id}`}
							className='flex-1'
						>
							<Button
								variant='outline'
								className='w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
							>
								<User className='w-4 h-4 mr-2' />
								Профиль клиента
							</Button>
						</Link>
					)}
					{!isPsychologist && otherParty && (
						<div className='flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'>
							<User className='w-4 h-4 text-gray-400 flex-shrink-0' />
							<span className='text-sm text-gray-700 dark:text-gray-200 truncate ml-3'>
								{otherParty.name || 'Психолог'}
							</span>
						</div>
					)}
					{upcoming && (
						<Button
							disabled={!active}
							onClick={() => {
								if (active) {
									window.open(
										`https://meet.jit.si/psyconsult-${appointment.id}`,
										'_blank',
										'noopener,noreferrer',
									);
								}
							}}
							className={`flex-1 ${
								active
									? 'bg-green-600 hover:bg-green-700 dark:text-white cursor-pointer'
									: 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
							}`}
						>
							<Video className='w-4 h-4 mr-2' />
							{active ? 'Начать сессию' : 'Недоступно'}
						</Button>
					)}
				</div>

				{upcoming && !active && (
					<p className='text-xs text-gray-400 dark:text-gray-500 mt-2 text-center'>
						Кнопка активируется за 15 мин до начала
					</p>
				)}
			</CardContent>
		</Card>
	);
}

export default function Sessions() {
	const { profile } = useUser();
	const isPsychologist = profile?.role === 'PSYCHOLOGIST';
	const token = localStorage.getItem('token') ?? '';

	const [upcoming, setUpcoming] = useState<any[]>([]);
	const [completed, setCompleted] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(id);
	}, []);

	const fetchAppointments = async () => {
		if (!profile) return;
		setLoading(true);
		setError('');
		try {
			if (isPsychologist) {
				const [upcomingData, completedData] = await Promise.all([
					getPsyshologistAppointments(token, true),
					getPsyshologistAppointments(token, false),
				]);
				setUpcoming(
					(upcomingData ?? []).sort(
						(a: any, b: any) =>
							new Date(a.start_at).getTime() -
							new Date(b.start_at).getTime(),
					),
				);
				setCompleted(
					(completedData ?? []).sort(
						(a: any, b: any) =>
							new Date(b.start_at).getTime() -
							new Date(a.start_at).getTime(),
					),
				);
			} else {
				const data = await getAllAppointments(token);
				const all = data ?? [];
				setUpcoming(
					all
						.filter((a: any) => isUpcoming(a.start_at, new Date()))
						.sort(
							(a: any, b: any) =>
								new Date(a.start_at).getTime() -
								new Date(b.start_at).getTime(),
						),
				);
				setCompleted(
					all
						.filter((a: any) => !isUpcoming(a.start_at, new Date()))
						.sort(
							(a: any, b: any) =>
								new Date(b.start_at).getTime() -
								new Date(a.start_at).getTime(),
						),
				);
			}
		} catch (e: any) {
			setError(e.message || 'Ошибка при загрузке записей');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAppointments();
	}, [profile]);

	const empty = (text: string) => (
		<div className='col-span-full text-center py-16'>
			<CalendarIcon className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
			<p className='text-gray-500 dark:text-gray-400'>{text}</p>
		</div>
	);

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<div className='mb-8 flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
						Расписание
					</h1>
					<p className='text-gray-500 dark:text-gray-400 mt-1'>
						{isPsychologist
							? 'Ваши консультации'
							: 'Ваши записи к психологам'}
					</p>
				</div>
				{!isPsychologist && (
					<NewSessionDialog onCreated={fetchAppointments} />
				)}
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
						onClick={fetchAppointments}
					>
						Повторить
					</Button>
				</div>
			) : (
				<Tabs defaultValue='upcoming' className='w-full'>
					<TabsList className='dark:bg-gray-800 dark:border-gray-700'>
						<TabsTrigger value='upcoming'>
							Предстоящие ({upcoming.length})
						</TabsTrigger>
						<TabsTrigger value='completed'>
							Завершённые ({completed.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value='upcoming' className='mt-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{upcoming.length > 0
								? upcoming.map((a) => (
										<SessionCard
											key={a.id}
											appointment={a}
											isPsychologist={isPsychologist}
											now={now}
										/>
									))
								: empty('Нет запланированных сессий')}
						</div>
					</TabsContent>

					<TabsContent value='completed' className='mt-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{completed.length > 0
								? completed.map((a) => (
										<SessionCard
											key={a.id}
											appointment={a}
											isPsychologist={isPsychologist}
											now={now}
										/>
									))
								: empty('Нет завершённых сессий')}
						</div>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
