import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
	ArrowLeft,
	FileText,
	Plus,
	Trash2,
	Loader2,
	Calendar,
	Clock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
	getClientForPsychologistByID,
	getPsychologistAppointmentsForClient,
	getClientNotes,
	createClientNote,
	deleteClientNote,
} from '../../api/psychologist';

const GENDER_LABELS: Record<string, string> = {
	MALE: 'Мужской',
	FEMALE: 'Женский',
	NOT_STATED: 'Не указан',
};

const FORMAT_LABELS: Record<string, string> = {
	PERSONAL: 'Индивидуальный',
	FAMILY: 'Семейный',
	GROUP: 'Групповой',
};

const SURVEY_SECTIONS: { key: string; label: string }[] = [
	{ key: 'emotions', label: 'Эмоции' },
	{ key: 'relations', label: 'Отношения' },
	{ key: 'work', label: 'Работа' },
	{ key: 'life', label: 'Жизнь' },
	{ key: 'personal', label: 'Личное' },
];

const getInitials = (name: string | null) =>
	name
		? name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
		: '?';

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

export default function ClientDetails() {
	const { id } = useParams<{ id: string }>();
	const token = localStorage.getItem('token') ?? '';
	const clientId = parseInt(id ?? '0');

	const [client, setClient] = useState<any>(null);
	const [appointments, setAppointments] = useState<any[]>([]);
	const [notes, setNotes] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const [noteText, setNoteText] = useState('');
	const [addingNote, setAddingNote] = useState(false);
	const [noteDialogOpen, setNoteDialogOpen] = useState(false);
	const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

	useEffect(() => {
		if (!clientId) return;
		(async () => {
			try {
				const [clientData, upcomingData, completedData, notesData] =
					await Promise.all([
						getClientForPsychologistByID(token, clientId),
						getPsychologistAppointmentsForClient(
							token,
							clientId,
							true,
						),
						getPsychologistAppointmentsForClient(
							token,
							clientId,
							false,
						),
						getClientNotes(token, clientId),
					]);
				setClient(clientData);
				const allAppointments = [
					...(upcomingData ?? []),
					...(completedData ?? []),
				];
				setAppointments(
					allAppointments.sort(
						(a: any, b: any) =>
							new Date(b.start_at).getTime() -
							new Date(a.start_at).getTime(),
					),
				);
				setNotes(notesData ?? []);
			} catch (e: any) {
				setError(e.message || 'Ошибка при загрузке данных');
			} finally {
				setLoading(false);
			}
		})();
	}, [clientId]);

	const handleAddNote = async () => {
		if (!noteText.trim()) return;
		setAddingNote(true);
		try {
			const created = await createClientNote(
				token,
				clientId,
				noteText.trim(),
			);
			setNotes((prev) => [created, ...prev]);
			setNoteText('');
			setNoteDialogOpen(false);
		} catch {
		} finally {
			setAddingNote(false);
		}
	};

	const handleDeleteNote = async (noteId: number) => {
		setDeletingNoteId(noteId);
		try {
			await deleteClientNote(token, clientId, noteId);
			setNotes((prev) => prev.filter((n) => n.id !== noteId));
		} catch {
		} finally {
			setDeletingNoteId(null);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loader2 className='w-8 h-8 animate-spin text-blue-500' />
			</div>
		);
	}

	if (error || !client) {
		return (
			<div className='p-8 text-center'>
				<p className='text-red-500'>{error || 'Клиент не найден'}</p>
				<Link to='/clients'>
					<Button variant='outline' className='mt-4'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Назад к клиентам
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<Link to='/clients'>
				<Button
					variant='ghost'
					className='mb-6 dark:text-gray-300 dark:hover:bg-gray-800'
				>
					<ArrowLeft className='w-4 h-4 mr-2' />
					Назад к клиентам
				</Button>
			</Link>

			<div className='flex items-center gap-4 mb-8'>
				<div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-2xl flex-shrink-0 overflow-hidden'>
					{fixUrl(client.avatar) ? (
						<img
							src={fixUrl(client.avatar)!}
							alt=''
							className='w-full h-full object-cover'
						/>
					) : (
						getInitials(client.name)
					)}
				</div>
				<div>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
						{client.name || '—'}
					</h1>
					<div className='flex flex-wrap gap-2 mt-2'>
						{client.gender && client.gender !== 'NOT_STATED' && (
							<Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>
								{GENDER_LABELS[client.gender] ?? client.gender}
							</Badge>
						)}
						{client.age != null && (
							<Badge className='bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
								{client.age} лет
							</Badge>
						)}
						{client.birth_date && (
							<Badge className='bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
								{new Date(client.birth_date).toLocaleDateString(
									'ru-RU',
								)}
							</Badge>
						)}
					</div>
				</div>
			</div>

			{client.format && client.format.length > 0 && (
				<Card className='mb-6 dark:bg-gray-800 dark:border-gray-700'>
					<CardContent className='p-5'>
						<p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
							Форматы сессий
						</p>
						<div className='flex flex-wrap gap-2'>
							{client.format.map((f: string) => (
								<Badge
									key={f}
									className='bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
								>
									{FORMAT_LABELS[f] ?? f}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{SURVEY_SECTIONS.some(
				(s) => client[s.key] && client[s.key].length > 0,
			) && (
				<Card className='mb-6 dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader>
						<CardTitle className='text-base dark:text-white'>
							Запросы клиента
						</CardTitle>
					</CardHeader>
					<CardContent className='pt-0 space-y-3'>
						{SURVEY_SECTIONS.filter(
							(s) => client[s.key] && client[s.key].length > 0,
						).map((s) => (
							<div key={s.key}>
								<p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
									{s.label}
								</p>
								<div className='flex flex-wrap gap-1.5'>
									{client[s.key].map(
										(item: string, i: number) => (
											<Badge
												key={i}
												className='bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs'
											>
												{item}
											</Badge>
										),
									)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			<Tabs defaultValue='sessions' className='w-full'>
				<TabsList className='dark:bg-gray-800 dark:border-gray-700'>
					<TabsTrigger value='sessions'>
						Сессии ({appointments.length})
					</TabsTrigger>
					<TabsTrigger value='notes'>
						Заметки ({notes.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='sessions' className='mt-6'>
					<Card className='dark:bg-gray-800 dark:border-gray-700'>
						<CardHeader>
							<CardTitle className='dark:text-white'>
								История сессий
							</CardTitle>
						</CardHeader>
						<CardContent>
							{appointments.length === 0 ? (
								<p className='text-center text-gray-500 dark:text-gray-400 py-8'>
									Нет записей о сессиях
								</p>
							) : (
								<div className='space-y-3'>
									{appointments.map((a) => {
										const isUpcoming =
											new Date(a.start_at) > new Date();
										const duration = a.ends_at
											? getDurationMin(
													a.start_at,
													a.ends_at,
												)
											: null;
										return (
											<div
												key={a.id}
												className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg'
											>
												<div className='flex items-center justify-between'>
													<div className='flex items-center gap-4'>
														<div className='flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300'>
															<Calendar className='w-4 h-4 text-gray-400' />
															{formatDate(
																a.start_at,
															)}
														</div>
														<div className='flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300'>
															<Clock className='w-4 h-4 text-gray-400' />
															{formatTime(
																a.start_at,
															)}
															{duration !=
																null && (
																<span className='text-gray-400'>
																	({duration}{' '}
																	мин)
																</span>
															)}
														</div>
													</div>
													<Badge
														className={
															isUpcoming
																? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
																: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
														}
													>
														{isUpcoming
															? 'Предстоит'
															: 'Завершена'}
													</Badge>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='notes' className='mt-6'>
					<Card className='dark:bg-gray-800 dark:border-gray-700'>
						<CardHeader className='flex flex-row items-center justify-between'>
							<CardTitle className='dark:text-white'>
								Заметки и наблюдения
							</CardTitle>
							<Dialog
								open={noteDialogOpen}
								onOpenChange={setNoteDialogOpen}
							>
								<DialogTrigger asChild>
									<Button
										size='sm'
										className='bg-blue-600 hover:bg-blue-700 dark:text-white'
									>
										<Plus className='w-4 h-4 mr-2' />
										Добавить
									</Button>
								</DialogTrigger>
								<DialogContent className='dark:bg-gray-800 dark:border-gray-700'>
									<DialogHeader>
										<DialogTitle className='dark:text-white'>
											Новая заметка
										</DialogTitle>
									</DialogHeader>
									<div className='space-y-4 mt-2'>
										<div className='space-y-2'>
											<Label className='dark:text-gray-200'>
												Содержание
											</Label>
											<Textarea
												value={noteText}
												onChange={(e) =>
													setNoteText(e.target.value)
												}
												placeholder='Введите заметку...'
												rows={5}
												className='dark:bg-gray-700 dark:border-gray-600 dark:text-white'
											/>
										</div>
										<Button
											onClick={handleAddNote}
											disabled={
												addingNote || !noteText.trim()
											}
											className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
										>
											{addingNote && (
												<Loader2 className='w-4 h-4 mr-2 animate-spin' />
											)}
											Сохранить заметку
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent>
							{notes.length === 0 ? (
								<p className='text-center text-gray-500 dark:text-gray-400 py-8'>
									Нет заметок
								</p>
							) : (
								<div className='space-y-3'>
									{notes.map((note) => (
										<div
											key={note.id}
											className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-amber-50 dark:bg-gray-700'
										>
											<div className='flex items-start justify-between gap-3'>
												<div className='flex-1 min-w-0'>
													<div className='flex items-center gap-2 mb-2'>
														<FileText className='w-4 h-4 text-gray-400 flex-shrink-0' />
														<span className='text-xs text-gray-500 dark:text-gray-400'>
															{formatDate(
																note.created_at,
															)}
														</span>
													</div>
													<p className='text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap'>
														{note.text}
													</p>
												</div>
												<button
													onClick={() =>
														handleDeleteNote(
															note.id,
														)
													}
													disabled={
														deletingNoteId ===
														note.id
													}
													className='cursor-pointer p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0 disabled:opacity-50'
													title='Удалить заметку'
												>
													{deletingNoteId ===
													note.id ? (
														<Loader2 className='w-4 h-4 animate-spin' />
													) : (
														<Trash2 className='w-4 h-4' />
													)}
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
