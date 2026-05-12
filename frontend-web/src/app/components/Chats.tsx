import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import {
	Send,
	Loader2,
	MessageSquare,
	CheckCheck,
	Plus,
	ChevronUp,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { getChats, createDirectChat } from '../../api/chats';
import {
	getClientsForPsychologist,
	getPsychologistsForClient,
} from '../../api/psychologist';
import { useUser } from '../context/UserContext';

interface Author {
	id: number;
	name: string;
	role: string;
	avatar: string | null;
}

interface Message {
	id: string;
	chat_id: string;
	author: Author;
	text: string | null;
	media_url: string | null;
	created_at: string;
	read_at: string | null;
	reply_to: string | null;
	_localId?: string;
	_pending?: boolean;
}

interface Chat {
	id: string;
	type: string;
	name: string;
	description: string | null;
	image: string | null;
	last_messages: Message[];
}

const fixUrl = (url: string | null) =>
	url ? url.replace('http://0.0.0.0:', 'http://localhost:') : null;

function decodeToken(token: string): { sub: string; type: string } | null {
	try {
		const base64 = token
			.split('.')[1]
			.replace(/-/g, '+')
			.replace(/_/g, '/');
		return JSON.parse(atob(base64));
	} catch {
		return null;
	}
}

const formatTime = (iso: string) =>
	new Date(iso).toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	});

const formatDateLabel = (iso: string) => {
	const d = new Date(iso);
	const now = new Date();
	if (d.toDateString() === now.toDateString()) return 'Сегодня';
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
	return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};

const getInitials = (name: string) =>
	(name ?? '')
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase() || '?';

function sortAsc(msgs: Message[]) {
	return [...msgs].sort(
		(a, b) =>
			new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
	);
}

function NewChatDialog({ onCreated }: { onCreated: (chat: Chat) => void }) {
	const { profile } = useUser();
	const token = localStorage.getItem('token') ?? '';
	const isPsychologist = profile?.role === 'PSYCHOLOGIST';

	const [open, setOpen] = useState(false);
	const [users, setUsers] = useState<any[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [creatingId, setCreatingId] = useState<number | null>(null);
	const [search, setSearch] = useState('');

	const fetchUsers = async () => {
		setLoadingUsers(true);
		try {
			const data = isPsychologist
				? await getClientsForPsychologist(token)
				: await getPsychologistsForClient(token);
			setUsers(data ?? []);
		} catch {
		} finally {
			setLoadingUsers(false);
		}
	};

	const handleOpenChange = (v: boolean) => {
		setOpen(v);
		if (v && users.length === 0) fetchUsers();
		if (!v) setSearch('');
	};

	const handleSelect = async (userId: number) => {
		setCreatingId(userId);
		try {
			const chat = await createDirectChat(token, userId);
			onCreated(chat);
			setOpen(false);
		} catch {
		} finally {
			setCreatingId(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<button
					className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer'
					title='Новый чат'
				>
					<Plus className='w-5 h-5 text-gray-500 dark:text-gray-400' />
				</button>
			</DialogTrigger>
			<DialogContent className='dark:bg-gray-800 dark:border-gray-700'>
				<DialogHeader>
					<DialogTitle className='dark:text-white'>
						Новый чат
					</DialogTitle>
				</DialogHeader>
				<div className='mt-2'>
					{loadingUsers ? (
						<div className='flex justify-center py-8'>
							<Loader2 className='w-6 h-6 animate-spin text-blue-500' />
						</div>
					) : users.length === 0 ? (
						<p className='text-sm text-gray-500 dark:text-gray-400 text-center py-8'>
							Нет доступных пользователей
						</p>
					) : (
						<>
							<div className='relative mb-3'>
								<svg
									className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									strokeWidth={2}
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'
									/>
								</svg>
								<input
									type='text'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder='Поиск по имени...'
									className='w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
									autoFocus
								/>
							</div>
							<div className='space-y-1 max-h-72 overflow-y-auto'>
								{(() => {
									const filtered = users.filter((u) => {
										const name = isPsychologist
											? (u.name ?? '')
											: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
										return name
											.toLowerCase()
											.includes(search.toLowerCase());
									});
									if (filtered.length === 0)
										return (
											<p className='text-sm text-gray-500 dark:text-gray-400 text-center py-6'>
												Ничего не найдено
											</p>
										);
									return filtered.map((u) => {
										const userId = isPsychologist
											? u.client_id
											: u.id;
										const name = isPsychologist
											? u.name
											: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
										const avatar = fixUrl(u.avatar ?? null);
										const isCreating =
											creatingId === userId;
										return (
											<button
												key={userId}
												onClick={() =>
													handleSelect(userId)
												}
												disabled={isCreating}
												className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50 cursor-pointer'
											>
												<div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold flex-shrink-0 overflow-hidden'>
													{avatar ? (
														<img
															src={avatar}
															alt=''
															className='w-full h-full object-cover'
														/>
													) : (
														getInitials(name)
													)}
												</div>
												<span className='flex-1 font-medium text-gray-900 dark:text-white'>
													{name}
												</span>
												{isCreating && (
													<Loader2 className='w-4 h-4 animate-spin text-blue-500' />
												)}
											</button>
										);
									});
								})()}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default function Chats() {
	const token = localStorage.getItem('token') ?? '';
	const decoded = decodeToken(token);
	const myUserId = decoded ? parseInt(decoded.sub) : -1;
	const location = useLocation();
	const openChatId: string | undefined = (location.state as any)?.openChatId;

	const [chats, setChats] = useState<Chat[]>([]);
	const [messages, setMessages] = useState<Record<string, Message[]>>({});
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(true);
	const [wsReady, setWsReady] = useState(false);
	const [typingMap, setTypingMap] = useState<Record<string, string>>({});
	const [loadingHistory, setLoadingHistory] = useState(false);
	const [hasMore, setHasMore] = useState<Record<string, boolean>>({});

	const wsRef = useRef<WebSocket | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const messagesAreaRef = useRef<HTMLDivElement>(null);
	const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
		{},
	);
	const typingSentAt = useRef<number>(0);
	const readSentRef = useRef<Record<string, string>>({});
	const fetchedHistoryRef = useRef<Set<string>>(new Set());
	const isLoadMoreRef = useRef(false);

	const scrollToBottom = useCallback(
		(behavior: ScrollBehavior = 'smooth') => {
			bottomRef.current?.scrollIntoView({ behavior });
		},
		[],
	);

	useEffect(() => {
		getChats(token)
			.then((data: Chat[]) => {
				setChats(data);
				const initial: Record<string, Message[]> = {};
				data.forEach((chat) => {
					initial[chat.id] = sortAsc(chat.last_messages ?? []);
				});
				setMessages(initial);
				if (openChatId && data.some((c) => c.id === openChatId)) {
					setSelectedId(openChatId);
				} else if (data.length > 0) {
					setSelectedId(data[0].id);
				}
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		let destroyed = false;
		let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

		const connect = () => {
			const wsProtocol =
				window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const ws = new WebSocket(
				`${wsProtocol}//${window.location.host}/ws/chats?token=${encodeURIComponent(token)}`,
			);
			wsRef.current = ws;

			ws.onopen = () => setWsReady(true);
			ws.onerror = () => console.error('[WS] connection error');
			ws.onclose = () => {
				setWsReady(false);
				fetchedHistoryRef.current.clear();
				if (!destroyed) {
					reconnectTimer = setTimeout(connect, 3000);
				}
			};

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log('[WS] received:', data.event, data);

				if (data.event === 'messages_history') {
					const chatId: string = data.chat_id;
					const incoming: Message[] = sortAsc(data.messages ?? []);
					setLoadingHistory(false);

					setMessages((prev) => {
						if (isLoadMoreRef.current) {
							isLoadMoreRef.current = false;
							const existing = prev[chatId] ?? [];
							return {
								...prev,
								[chatId]: [...incoming, ...existing],
							};
						}
						fetchedHistoryRef.current.add(chatId);
						return { ...prev, [chatId]: incoming };
					});

					setHasMore((prev) => ({
						...prev,
						[chatId]: incoming.length >= 50,
					}));

					if (!isLoadMoreRef.current) {
						setTimeout(() => scrollToBottom('instant'), 0);
					}
				}

				if (data.event === 'message_new') {
					setMessages((prev) => {
						const chatMsgs = prev[data.chat_id] ?? [];
						if (chatMsgs.some((m) => m.id === data.message_id))
							return prev;
						const msg: Message = {
							id: data.message_id,
							chat_id: data.chat_id,
							author: data.author,
							text: data.text,
							media_url: data.media_url,
							created_at: data.created_at,
							read_at: data.read_at ?? null,
							reply_to: data.reply_to ?? null,
						};
						return {
							...prev,
							[data.chat_id]: [...chatMsgs, msg],
						};
					});
					scrollToBottom();
				}

				if (data.event === 'message_delivered') {
					setMessages((prev) => {
						const chatMsgs = prev[data.chat_id] ?? [];
						const withoutLocal = chatMsgs.filter(
							(m) => m._localId !== data.local_message_id,
						);
						if (withoutLocal.some((m) => m.id === data.message_id))
							return { ...prev, [data.chat_id]: withoutLocal };
						const msg: Message = {
							id: data.message_id,
							chat_id: data.chat_id,
							author: data.author,
							text: data.text,
							media_url: data.media_url,
							created_at: data.created_at,
							read_at: data.read_at ?? null,
							reply_to: data.reply_to ?? null,
						};
						return {
							...prev,
							[data.chat_id]: [...withoutLocal, msg],
						};
					});
					scrollToBottom();
				}

				if (data.event === 'typing_indicator') {
					const chatId = data.chat_id;
					clearTimeout(typingTimers.current[chatId]);
					setTypingMap((prev) => ({
						...prev,
						[chatId]: data.author.name,
					}));
					typingTimers.current[chatId] = setTimeout(() => {
						setTypingMap((prev) => {
							const next = { ...prev };
							delete next[chatId];
							return next;
						});
					}, 3000);
				}

				if (data.event === 'message_read') {
					setMessages((prev) => {
						const chatMsgs = prev[data.chat_id];
						if (!chatMsgs) return prev;
						const pivot = chatMsgs.find(
							(m) => m.id === data.before_message_id,
						);
						if (!pivot) return prev;
						const pivotTime = new Date(pivot.created_at).getTime();
						const updated = chatMsgs.map((m) =>
							new Date(m.created_at).getTime() <= pivotTime
								? { ...m, read_at: new Date().toISOString() }
								: m,
						);
						return { ...prev, [data.chat_id]: updated };
					});
				}
			};
		};

		connect();

		return () => {
			destroyed = true;
			if (reconnectTimer) clearTimeout(reconnectTimer);
			wsRef.current?.close();
		};
	}, [token, scrollToBottom]);

	useEffect(() => {
		if (!selectedId || !wsReady) return;
		if (fetchedHistoryRef.current.has(selectedId)) {
			scrollToBottom('instant');
			return;
		}
		setLoadingHistory(true);
		wsRef.current?.send(
			JSON.stringify({
				event: 'messages_fetch',
				chat_id: selectedId,
				limit: 50,
			}),
		);
	}, [selectedId, wsReady, scrollToBottom]);

	useEffect(() => {
		if (!selectedId || !wsReady) return;
		const msgs = messages[selectedId];
		if (!msgs || msgs.length === 0) return;
		const last = msgs[msgs.length - 1];
		if (
			last.author.id !== myUserId &&
			!last.read_at &&
			readSentRef.current[selectedId] !== last.id
		) {
			readSentRef.current[selectedId] = last.id;
			wsRef.current?.send(
				JSON.stringify({
					event: 'read',
					chat_id: selectedId,
					before_message_id: last.id,
				}),
			);
		}
	}, [selectedId, messages, wsReady, myUserId]);

	const loadMore = useCallback(() => {
		if (!selectedId || !wsReady) return;
		const msgs = messages[selectedId] ?? [];
		if (msgs.length === 0) return;
		const oldestId = msgs[0].id;
		isLoadMoreRef.current = true;
		setLoadingHistory(true);
		wsRef.current?.send(
			JSON.stringify({
				event: 'messages_fetch',
				chat_id: selectedId,
				before_message_id: oldestId,
				limit: 50,
			}),
		);
	}, [selectedId, wsReady, messages]);

	const sendMessage = useCallback(() => {
		const text = input.trim();
		if (
			!text ||
			!selectedId ||
			!wsRef.current ||
			wsRef.current.readyState !== WebSocket.OPEN
		)
			return;

		const localId = typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
				const r = Math.random() * 16 | 0;
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
		setInput('');

		const optimistic: Message = {
			id: localId,
			chat_id: selectedId,
			author: { id: myUserId, name: '', role: '', avatar: null },
			text,
			media_url: null,
			created_at: new Date().toISOString(),
			read_at: null,
			reply_to: null,
			_localId: localId,
			_pending: true,
		};
		setMessages((prev) => ({
			...prev,
			[selectedId]: [...(prev[selectedId] ?? []), optimistic],
		}));
		scrollToBottom();

		const payload = JSON.stringify({
			event: 'message_send',
			chat_id: selectedId,
			local_message_id: localId,
			text,
		});
		console.log('[WS] sending:', payload);
		wsRef.current.send(payload);
	}, [input, selectedId, myUserId, scrollToBottom]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		const now = Date.now();
		if (
			selectedId &&
			wsRef.current?.readyState === WebSocket.OPEN &&
			now - typingSentAt.current > 2000
		) {
			typingSentAt.current = now;
			wsRef.current.send(
				JSON.stringify({ event: 'typing', chat_id: selectedId }),
			);
		}
	};

	const handleChatCreated = useCallback((newChat: any) => {
		setChats((prev) => {
			const exists = prev.find((c) => c.id === newChat.id);
			if (exists) return prev;
			return [{ ...newChat, last_messages: [] }, ...prev];
		});
		setSelectedId(newChat.id);
	}, []);

	const selectedChat = chats.find((c) => c.id === selectedId);
	const selectedMessages = messages[selectedId ?? ''] ?? [];

	const groupedMessages = selectedMessages.reduce<
		{ date: string; msgs: Message[] }[]
	>((acc, msg) => {
		const date = formatDateLabel(msg.created_at);
		const last = acc[acc.length - 1];
		if (last && last.date === date) last.msgs.push(msg);
		else acc.push({ date, msgs: [msg] });
		return acc;
	}, []);

	const lastMessagePreview = (chatId: string) => {
		const msgs = messages[chatId];
		return msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900'>
				<Loader2 className='w-8 h-8 animate-spin text-blue-500' />
			</div>
		);
	}

	return (
		<div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0'>
				<div className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
					<h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Сообщения
					</h2>
					<NewChatDialog onCreated={handleChatCreated} />
				</div>

				{chats.length === 0 ? (
					<div className='flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center'>
						<MessageSquare className='w-10 h-10 text-gray-300 dark:text-gray-600' />
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Нажмите <strong>+</strong> чтобы начать переписку
						</p>
					</div>
				) : (
					<div className='flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700'>
						{chats.map((chat) => {
							const last = lastMessagePreview(chat.id);
							const isSelected = chat.id === selectedId;
							const isTyping = !!typingMap[chat.id];
							const avatarUrl = fixUrl(chat.image);

							return (
								<button
									key={chat.id}
									onClick={() => setSelectedId(chat.id)}
									className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${
										isSelected
											? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
											: 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
									}`}
								>
									<div className='w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold flex-shrink-0 overflow-hidden'>
										{avatarUrl ? (
											<img
												src={avatarUrl}
												alt=''
												className='w-full h-full object-cover'
											/>
										) : (
											getInitials(chat.name)
										)}
									</div>
									<div className='flex-1 min-w-0'>
										<p className='font-medium text-gray-900 dark:text-white truncate text-sm'>
											{chat.name}
										</p>
										<p className='text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5'>
											{isTyping ? (
												<span className='text-blue-500 italic'>
													печатает...
												</span>
											) : last?.text ? (
												last.text
											) : (
												'Нет сообщений'
											)}
										</p>
									</div>
									{last && (
										<span className='text-xs text-gray-400 dark:text-gray-500 flex-shrink-0'>
											{formatTime(last.created_at)}
										</span>
									)}
								</button>
							);
						})}
					</div>
				)}
			</div>

			<div className='flex-1 flex flex-col overflow-hidden'>
				{selectedChat ? (
					<>
						<div className='p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-shrink-0'>
							<div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold overflow-hidden flex-shrink-0'>
								{fixUrl(selectedChat.image) ? (
									<img
										src={fixUrl(selectedChat.image)!}
										alt=''
										className='w-full h-full object-cover'
									/>
								) : (
									getInitials(selectedChat.name)
								)}
							</div>
							<div>
								<p className='font-semibold text-gray-900 dark:text-white text-sm'>
									{selectedChat.name}
								</p>
								{selectedId && typingMap[selectedId] ? (
									<p className='text-xs text-blue-500 italic'>
										печатает...
									</p>
								) : (
									<p className='text-xs text-gray-400 dark:text-gray-500'>
										{wsReady ? 'Онлайн' : 'Подключение...'}
									</p>
								)}
							</div>
						</div>

						<div
							ref={messagesAreaRef}
							className='flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900'
						>
							<div className='max-w-3xl mx-auto'>
								{hasMore[selectedId!] && (
									<div className='flex justify-center mb-4'>
										<button
											onClick={loadMore}
											disabled={loadingHistory}
											className='flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50 cursor-pointer'
										>
											{loadingHistory ? (
												<Loader2 className='w-3.5 h-3.5 animate-spin' />
											) : (
												<ChevronUp className='w-3.5 h-3.5' />
											)}
											Загрузить ещё
										</button>
									</div>
								)}

								{loadingHistory && !hasMore[selectedId!] && (
									<div className='flex justify-center py-8'>
										<Loader2 className='w-6 h-6 animate-spin text-blue-500' />
									</div>
								)}

								{!loadingHistory &&
									selectedMessages.length === 0 && (
										<p className='text-center text-gray-400 dark:text-gray-500 text-sm py-12'>
											Нет сообщений. Напишите первым!
										</p>
									)}

								<div className='space-y-1'>
									{groupedMessages.map(({ date, msgs }) => (
										<div key={date}>
											<div className='flex items-center gap-3 py-4'>
												<div className='flex-1 h-px bg-gray-200 dark:bg-gray-700' />
												<span className='text-xs text-gray-400 dark:text-gray-500 px-2 flex-shrink-0'>
													{date}
												</span>
												<div className='flex-1 h-px bg-gray-200 dark:bg-gray-700' />
											</div>

											<div className='space-y-1'>
												{msgs.map((msg) => {
													const isOwn =
														msg.author.id ===
														myUserId;
													return (
														<div
															key={
																msg._localId ??
																msg.id
															}
															className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
														>
															<div
																className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}
															>
																{!isOwn && (
																	<span className='text-xs text-gray-500 dark:text-gray-400 ml-2'>
																		{
																			msg
																				.author
																				.name
																		}
																	</span>
																)}
																<div
																	className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
																		isOwn
																			? 'bg-blue-600 text-white rounded-br-none'
																			: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
																	} ${msg._pending ? 'opacity-60' : ''}`}
																>
																	{msg.text}
																</div>
																<div
																	className={`flex items-center gap-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}
																>
																	<span className='text-xs text-gray-400 dark:text-gray-500'>
																		{formatTime(
																			msg.created_at,
																		)}
																	</span>
																	{isOwn &&
																		!msg._pending && (
																			<CheckCheck
																				className={`w-3.5 h-3.5 ${msg.read_at ? 'text-blue-500' : 'text-gray-400'}`}
																			/>
																		)}
																</div>
															</div>
														</div>
													);
												})}
											</div>
										</div>
									))}
								</div>

								<div ref={bottomRef} />
							</div>
						</div>

						<div className='p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0'>
							<div className='flex items-end gap-3 max-w-3xl mx-auto'>
								<textarea
									value={input}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
									placeholder='Сообщение... (Enter — отправить, Shift+Enter — перенос)'
									rows={1}
									className='flex-1 resize-none px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
									style={{
										maxHeight: '128px',
										overflowY: 'auto',
									}}
								/>
								<button
									onClick={sendMessage}
									disabled={!input.trim() || !wsReady}
									className='w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer disabled:cursor-not-allowed'
								>
									<Send className='w-5 h-5 text-white' />
								</button>
							</div>
						</div>
					</>
				) : (
					<div className='flex-1 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900'>
						<MessageSquare className='w-14 h-14 text-gray-300 dark:text-gray-600' />
						<p className='text-gray-500 dark:text-gray-400'>
							Выберите чат или начните новый
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
