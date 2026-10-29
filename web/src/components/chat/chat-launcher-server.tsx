import { getAiSettings, getSettings } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { ChatLauncherClient } from "./chat-launcher";

/** Server wrapper: reads AI settings, renders nothing when the assistant is disabled. */
export async function ChatLauncher({ locale }: { locale: Locale }) {
  const [ai, settings] = await Promise.all([getAiSettings(), getSettings()]);
  if (!ai.enabled) return null;
  const tok = (s: string) =>
    s
      .replaceAll("{city}", settings.address.city[locale])
      .replaceAll("{doctor}", settings.doctorName)
      .replaceAll("{phone}", settings.phoneDisplay);
  return (
    <ChatLauncherClient
      locale={locale}
      assistantName={tok(ai.assistantName)}
      greeting={tok(ai.greeting[locale])}
      suggestions={ai.suggestions[locale].map(tok)}
      phone={settings.phone}
      phoneDisplay={settings.phoneDisplay}
    />
  );
}
