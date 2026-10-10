import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServerChat, UIMessage } from '@/types/types';

interface ChatsState {
	chats: ServerChat[];
	messages: Record<string, UIMessage[]>;
	currentChatId: string | null;
}

const initialState: ChatsState = {
	chats: [],
	messages: {},
	currentChatId: null,
};

const chatsSlice = createSlice({
	name: 'chats',
	initialState,
	reducers: {
		setChats(state, action: PayloadAction<ServerChat[]>) {
			const chats = action.payload;
			state.chats = chats;

			chats.forEach((chat) => {
				const uiMessages: UIMessage[] = (chat.last_messages || []).map(
					(msg) => ({
						id: msg.id,
						chatId: chat.id,
						author: msg.author,
						text: msg.text,
						mediaUrl: msg.media_url || null,
						replyTo: msg.reply_to || null,
						createdAt: msg.created_at,
						readAt: msg.read_at || null,
						isMine: false,
						isDelivered: true,
					})
				);

				state.messages[chat.id] = uiMessages;
			});
		},

		addMessage(state, action: PayloadAction<UIMessage>) {
			const msg = action.payload;
			const list = state.messages[msg.chatId] || [];

			const filtered = list.filter(
				(m) => m.id !== msg.id && m.localId !== msg.localId
			);

			state.messages[msg.chatId] = [msg, ...filtered];
		},

		setCurrentChat(state, action: PayloadAction<string>) {
			state.currentChatId = action.payload;
		},
	},
});

export const { setChats, addMessage, setCurrentChat } = chatsSlice.actions;
export default chatsSlice.reducer;
