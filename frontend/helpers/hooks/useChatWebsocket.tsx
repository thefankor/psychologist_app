import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { getToken } from '../helper';
import { UIMessage } from '@/types/types';
import { useDispatch } from 'react-redux';
import { addMessage } from '@/store/slices/chatsSlice';

let ws: WebSocket | null = null;
let currentToken: string | null = null;

const connectWebSocket = (token: string) => {
	if (
		ws?.readyState === WebSocket.OPEN ||
		ws?.readyState === WebSocket.CONNECTING
	)
		return;
	if (ws) ws.close();

	currentToken = token;
	ws = new WebSocket(`wss://simul.cutecalls.pw/ws/chats?token=${token}`);

	ws.onopen = () => console.log('WebSocket подключён');
	ws.onerror = (e) => console.log('WS ошибка:', e);
	ws.onclose = () => {
		console.log('WebSocket закрыт, переподключаемся...');
		setTimeout(() => currentToken && connectWebSocket(currentToken), 3000);
	};
};

export const useChatWebSocket = () => {
	const [token, setToken] = useState<string | null>(null);
	const dispatch = useDispatch();
	const isConnecting = useRef(false);

	useEffect(() => {
		if (isConnecting.current) return;
		isConnecting.current = true;

		(async () => {
			const savedToken = await getToken();
			if (savedToken) {
				setToken(savedToken);
				connectWebSocket(savedToken);
			}
		})();
	}, []);

	useEffect(() => {
		if (!ws || !token) return;

		const handleMessage = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);

				if (
					data.event === 'message_new' ||
					data.event === 'message_delivered'
				) {
					const msg: UIMessage = {
						id: data.message_id,
						localId: data.local_message_id,
						chatId: data.chat_id,
						author: data.author,
						text: data.text,
						mediaUrl: data.media_url || null,
						replyTo: data.reply_to || null,
						createdAt: data.created_at,
						readAt: data.read_at || null,
						isMine: !!data.local_message_id,
						isDelivered: data.event === 'message_delivered',
					};
					dispatch(addMessage(msg));
				}
			} catch (err) {
				console.error('Ошибка парсинга WS сообщения:', err);
			}
		};

		ws.onmessage = handleMessage;

		return () => {
			if (ws) ws.onmessage = null;
		};
	}, [token, dispatch]);

	const sendMessage = (
		chatId: string,
		text: string,
		replyTo?: string,
		mediaId?: number,
	) => {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			Alert.alert('Ошибка', 'Нет соединения с сервером');
			return;
		}

		const localId = randomUUID();
		const payload = {
			chat_id: chatId,
			event: 'message_send',
			text,
			local_message_id: localId,
			...(replyTo && { reply_to: replyTo }),
			...(mediaId && { media_id: mediaId }),
		};

		ws.send(JSON.stringify(payload));

		const optimistic: UIMessage = {
			id: localId,
			localId,
			chatId,
			author: { id: -1, name: 'Я', role: 'CLIENT', avatar: null },
			text,
			mediaUrl: null,
			replyTo: null,
			createdAt: new Date().toISOString(),
			readAt: null,
			isMine: true,
			isDelivered: false,
		};

		dispatch(addMessage(optimistic));
	};

	const sendTyping = (chatId: string) => {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ chat_id: chatId, event: 'typing' }));
		}
	};

	const markAsRead = (chatId: string, beforeMessageId: string) => {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({
					chat_id: chatId,
					event: 'read',
					before_message_id: beforeMessageId,
				}),
			);
		}
	};

	return {
		sendMessage,
		sendTyping,
		markAsRead,
	};
};
