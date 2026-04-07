import { telegram } from '../bot';
import { formatHelp } from '../formatter';
import { mainMenuKeyboard } from '../keyboards';

export async function handleHelp(chatId: number): Promise<void> {
  await telegram.sendMessage(chatId, formatHelp(), {
    replyMarkup: mainMenuKeyboard(),
  });
}
