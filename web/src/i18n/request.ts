import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// UI strings are split per bounded context so agents never edit the same file:
// messages/<locale>/{site,chat,admin}.json  ->  namespaces Site.*, Chat.*, Admin.*
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const [site, chat, admin] = await Promise.all([
    import(`../../messages/${locale}/site.json`).then((m) => m.default),
    import(`../../messages/${locale}/chat.json`).then((m) => m.default),
    import(`../../messages/${locale}/admin.json`).then((m) => m.default),
  ]);
  return { locale, messages: { Site: site, Chat: chat, Admin: admin } };
});
