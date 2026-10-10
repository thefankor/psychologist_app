import { useEffect, useState } from 'react';
import {
	Calendar as CalendarIcon,
	Clock,
	Plus,
	User,
	Loader2,
	Video,
	X,
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
	getPsychologistsForClient,
	getFreeSlots,
	bookSlot,
	cancelAppointment,
} from '../../api/psychologist';

const fixUrl = (url: string | null) =>
	url ? url.replace('http://0.0.0.0:', 'http://localhost:') : null;

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

interface FreeSlot {
	id: string;
	starts_at: string;
	ends_at: string;
}

function NewSessionDialog({ onCreated }: { onCreated: () => void }) {
	const token = localStorage.getItem('token') ?? '';
	const [open, setOpen] = useState(false);
	const [psychologists, setPsychologists] = useState<any[]>([]);
	const [loadingPsych, setLoadingPsych] = useState(false);
	const [psychId, setPsychId] = useState('');
	const today = new Date().toISOString().slice(0, 10);
	const weekLater = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
	const [fromDate, setFromDate] = useState(today);
	const [toDate, setToDate] = useState(weekLater);
	const [slots, setSlots] = useState<FreeSlot[]>([]);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [slotsError, setSlotsError] = useState('');
	const [selectedSlot, setSelectedSlot] = useState('');
	const [booking, setBooking] = useState(false);
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
		if (!o) {
			setPsychId('');
			setSlots([]);
			setSlotsError('');
			setSelectedSlot('');
			setError('');
		}
	};

	const fetchSlots = async (id: string) => {
		if (!id) return;
		setLoadingSlots(true);
		setSlotsError('');
		setSelectedSlot('');
		try {
			const fromDt = `${fromDate}T00:00:00Z`;
			const toDt = `${toDate}T23:59:59Z`;
			const data: FreeSlot[] = await getFreeSlots(token, parseInt(id), fromDt, toDt);
			setSlots(data);
			if (data.length === 0) setSlotsError('Нет доступных слотов в этом периоде');
		} catch (e: any) {
			setSlotsError(e.message || 'Ошибка при загрузке слотов');
		} finally {
			setLoadingSlots(false);
		}
	};

	const handlePsychChange = (id: string) => {
		setPsychId(id);
		setSlots([]);
		setSlotsError('');
		setSelectedSlot('');
		if (id) fetchSlots(id);
	};

	const handleBook = async () => {
		if (!selectedSlot) {
			setError('Выберите время');
			return;
		}
		setBooking(true);
		setError('');
		try {
			await bookSlot(token, selectedSlot);
			setOpen(false);
			onCreated();
		} catch (e: any) {
			setError(e.message || 'Ошибка при записи');
		} finally {
			setBooking(false);
		}
	};

	const formatSlot = (s: FreeSlot) =>
		new Date(s.starts_at).toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

	return (
		<Dialog open={open} onOpenChange={handleOpen}>
			<DialogTrigger asChild>
				<Button className='bg-blue-600 hover:bg-blue-700 dark:text-white'>
					<Plus className='w-4 h-4 mr-2' />
					Записаться к психологу
				</Button>
			</DialogTrigger>
			<DialogContent className='dark:bg-gray-800 dark:border-gray-700 max-w-md'>
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
								onChange={(e) => handlePsychChange(e.target.value)}
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

					{psychId && (
						<>
							<div className='flex gap-2 items-end'>
								<div className='flex-1 space-y-1'>
									<Label className='dark:text-gray-200 text-xs'>С</Label>
									<input
										type='date'
										value={fromDate}
										min={today}
										onChange={(e) => setFromDate(e.target.value)}
										className='w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
									/>
								</div>
								<div className='flex-1 space-y-1'>
									<Label className='dark:text-gray-200 text-xs'>По</Label>
									<input
										type='date'
										value={toDate}
										min={fromDate}
										onChange={(e) => setToDate(e.target.value)}
										className='w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
									/>
								</div>
								<Button
									variant='outline'
									size='sm'
									onClick={() => fetchSlots(psychId)}
									disabled={loadingSlots}
									className='dark:border-gray-600 dark:text-gray-300 self-end'
								>
									{loadingSlots ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Найти'}
								</Button>
							</div>

							{slotsError && !loadingSlots && (
								<p className='text-sm text-gray-500 dark:text-gray-400'>{slotsError}</p>
							)}

							{loadingSlots && (
								<div className='flex justify-center py-4'>
									<Loader2 className='w-6 h-6 animate-spin text-blue-500' />
								</div>
							)}

							{!loadingSlots && slots.length > 0 && (
								<div className='space-y-1 max-h-52 overflow-y-auto pr-1'>
									{slots.map((s) => (
										<button
											key={s.id}
											onClick={() => setSelectedSlot(s.id)}
											className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-colors ${
												selectedSlot === s.id
													? 'bg-blue-600 text-white border-blue-600'
													: 'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500'
											}`}
										>
											{formatSlot(s)}
										</button>
									))}
								</div>
							)}
						</>
					)}

					{error && <p className='text-sm text-red-500'>{error}</p>}

					<Button
						onClick={handleBook}
						disabled={booking || !selectedSlot}
						className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
					>
						{booking && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
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
	onCancelled,
}: {
	appointment: any;
	isPsychologist: boolean;
	now: Date;
	onCancelled?: () => void;
}) {
	const token = localStorage.getItem('token') ?? '';
	const [cancelling, setCancelling] = useState(false);
	const myRole = isPsychologist ? 'PSYCHOLOGIST' : 'CLIENT';
	const otherParty =
		appointment.attendees?.find((a: any) => a.role !== myRole) ??
		appointment.attendees?.[0];

	const handleCancel = async () => {
		setCancelling(true);
		try {
			await cancelAppointment(token, String(appointment.id));
			onCancelled?.();
		} catch {
		} finally {
			setCancelling(false);
		}
	};

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
							className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold overflow-hidden ${avatarColor}`}
						>
							{fixUrl(otherParty?.avatar ?? null) ? (
								<img
									src={fixUrl(otherParty.avatar)!}
									alt=''
									className='w-full h-full object-cover'
								/>
							) : (
								initials
							)}
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
					{upcoming && !isPsychologist && (
						<Button
							variant='outline'
							size='icon'
							disabled={cancelling}
							onClick={handleCancel}
							title='Отменить запись'
							className='dark:border-gray-600 dark:text-gray-300 dark:hover:bg-red-900/30 hover:border-red-400 hover:text-red-500'
						>
							{cancelling ? (
								<Loader2 className='w-4 h-4 animate-spin' />
							) : (
								<X className='w-4 h-4' />
							)}
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
											onCancelled={fetchAppointments}
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
