import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, LayoutGrid, PersonStanding, Settings2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import type { TKey } from '@/i18n/en';
import { BrandMark } from '@/components/brand-mark';
import { LanguageSwitch } from '@/components/language-switch';
import { LockButton } from '@/components/lock-button';
import { CardsPanel } from '@/components/caregiver/cards-panel';
import { SettingsPanel } from '@/components/caregiver/settings-panel';
import { BodySetup } from '@/components/body/body-setup';
import { stopAll } from '@/lib/speech';
import { cn } from '@/lib/utils';

type Panel = 'cards' | 'body' | 'settings';
const PANELS: { id: Panel; key: TKey; icon: LucideIcon }[] = [
  { id: 'cards', key: 'cg.tab.cards', icon: LayoutGrid },
  { id: 'body', key: 'cg.tab.body', icon: PersonStanding },
  { id: 'settings', key: 'cg.tab.settings', icon: Settings2 },
];

export default function CaregiverPage() {
  const { unlocked } = useAppStore();
  return unlocked ? <CaregiverArea /> : <CaregiverGate />;
}

/** Shown when /caregiver is opened directly without an unlocked session. */
function CaregiverGate() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-[100dvh] flex-col p-5">
      <div className="flex justify-end">
        <LanguageSwitch />
      </div>
      <div className="grid flex-1 place-items-center">
        <div className="max-w-md rounded-[2.5rem] border border-card-border bg-card p-10 text-center shadow-lg lv-rise" data-testid="caregiver-gate">
          <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-secondary">
            <LockButton className="size-16 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold">{t('gate.title')}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('gate.sub')}</p>
          <Link
            to="/board"
            data-testid="link-back-board"
            className="mt-8 inline-flex min-h-[72px] items-center gap-3 rounded-full bg-primary px-8 text-xl font-bold text-primary-foreground"
          >
            <ArrowLeft className="size-6 rtl:-scale-x-100" aria-hidden /> {t('cg.backToBoard')}
          </Link>
        </div>
      </div>
    </main>
  );
}

function CaregiverArea() {
  const { lock } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel>('cards');

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 pb-16 pt-5 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandMark className="size-14" />
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{t('cg.title')}</h1>
            <p className="text-muted-foreground">{t('cg.sub')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitch />
          <Link to="/board" className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-card px-5 font-bold shadow-sm" data-testid="link-board">
            <ArrowLeft className="size-5 rtl:-scale-x-100" aria-hidden /> {t('cg.backToBoard')}
          </Link>
          <button
            type="button"
            onClick={() => {
              stopAll();
              lock();
              navigate('/board');
            }}
            className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-foreground px-5 font-bold text-background"
            data-testid="button-lock-exit"
          >
            <Lock className="size-5" aria-hidden /> {t('cg.lockExit')}
          </button>
        </div>
      </header>

      <nav role="tablist" className="mt-8 flex gap-2 overflow-x-auto rounded-[1.75rem] bg-muted/80 p-1.5">
        {PANELS.map(({ id, key, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={panel === id}
            onClick={() => setPanel(id)}
            data-testid={`tab-cg-${id}`}
            className={cn(
              'flex min-h-[60px] flex-1 shrink-0 items-center justify-center gap-2 rounded-[1.4rem] px-5 text-lg font-extrabold transition-colors',
              panel === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden /> {t(key)}
          </button>
        ))}
      </nav>

      <section role="tabpanel" className="mt-6 lv-rise" key={panel}>
        {panel === 'cards' && <CardsPanel />}
        {panel === 'body' && <BodySetup />}
        {panel === 'settings' && <SettingsPanel />}
      </section>
    </main>
  );
}
