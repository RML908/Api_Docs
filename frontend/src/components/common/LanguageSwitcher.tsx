import { useLanguage } from '@/contexts/LanguageContext';
import { LANGS } from '@/i18n';
import { cn } from '@/utils/cn';

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div role="group" aria-label={t('language')} className="flex overflow-hidden rounded-md border border-gray-300 text-xs font-medium">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={cn('px-2.5 py-1.5 transition-colors', lang === l.code ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
