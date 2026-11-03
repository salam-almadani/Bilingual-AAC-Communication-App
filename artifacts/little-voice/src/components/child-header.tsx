import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { BrandMark } from './brand-mark';
import { LanguageSwitch } from './language-switch';
import { LockButton } from './lock-button';

export function ChildHeader() {
  const { t } = useI18n();
  return (
    <header className="flex items-center justify-between gap-3">
      <Link to="/" className="flex min-h-[56px] items-center gap-3 rounded-full pe-3" data-testid="link-home">
        <BrandMark className="size-12" />
        <span className="flex flex-col leading-tight">
          <span className="text-lg font-extrabold">{t('appName')}</span>
          <span className="text-base font-bold text-muted-foreground" lang="ar">
            {t('appNameAr')}
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <LanguageSwitch />
        <LockButton />
      </div>
    </header>
  );
}
