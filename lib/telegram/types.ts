// Telegram Bot API types (subset needed for MegaHome bot)

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  contact?: TelegramContact;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface ReplyKeyboardButton {
  text: string;
  request_contact?: boolean;
}

export interface ReplyKeyboardMarkup {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
}

export interface ReplyKeyboardRemove {
  remove_keyboard: true;
}

export interface SendMessageParams {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove;
  disable_web_page_preview?: boolean;
}

export interface SendPhotoParams {
  chat_id: number | string;
  photo: string;
  caption?: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: InlineKeyboardMarkup;
}

// Firestore document for linked Telegram users
export interface TelegramUserDoc {
  chatId: number;
  userUid?: string;
  phone?: string;
  userName?: string;
  isAdmin: boolean;
  linkedAt?: FirebaseFirestore.Timestamp;
  lastActivity?: FirebaseFirestore.Timestamp;
  settings: {
    orderNotifications: boolean;
    nasiyaReminders: boolean;
    promotions: boolean;
  };
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}
