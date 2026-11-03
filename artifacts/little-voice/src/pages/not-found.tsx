import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useI18n } from '@/i18n';
import { BrandMark } from '@/components/brand-mark';
import { LanguageSwitch } from '@/components/language-switch';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="min-h-[100dvh] flex flex-col p-5">
      <div className="flex justify-end">
        <LanguageSwitch />
      </div>
      <div className="flex-1 grid place-items-center">
        <div className="text-center max-w-md lv-rise">
          <BrandMark className="size-24 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold mb-2" data-testid="text-not-found">{t('notFound.title')}</h1>
          <p className="text-muted-foreground text-lg mb-8">{t('notFound.sub')}</p>
          <Link
            to="/"
            data-testid="link-home"
            className="inline-flex min-h-[72px] items-center gap-3 rounded-full bg-primary px-10 text-xl font-bold text-primary-foreground shadow-md"
          >
            <Home className="size-6" aria-hidden /> {t('notFound.back')}
          </Link>
        </div>
      </div>
    </main>
  );
}
