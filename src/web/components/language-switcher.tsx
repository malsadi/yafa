import { LANGUAGES, type Language } from '../../shared/core/languages';
import { useLanguage } from '../app/language/use-language';
import { useText } from '../app/language/use-text';

/** Brief section 8.5: each officer chooses their own language. */
export function LanguageSwitcher({ onChange }: { onChange: (language: Language) => void }) {
  const { language } = useLanguage();
  const text = useText();
  return (
    <label className="flex items-center gap-2">
      <span>{text.portalShell.language.label}</span>
      <select
        className="rounded border px-2 py-2"
        value={language}
        onChange={(event) => {
          onChange(event.target.value as Language);
        }}
      >
        {LANGUAGES.map((option) => (
          <option key={option} value={option} lang={option}>
            {text.portalShell.language[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
