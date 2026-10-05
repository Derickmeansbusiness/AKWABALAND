import { Editorial, Section, editorialStyles as s } from '@/components/pages/Editorial';
import { Button } from '@/components/ui/Button';
import { development } from '@/data/development';

export const metadata = { title: development.title };

export default function DevelopmentPage() {
  return (
    <Editorial
      eyebrow="Development"
      title={development.title}
      intro={development.intro}
      aside={
        <>
          <Button href="/briefing" variant="primary">
            Request private briefing
          </Button>
          <p className="label label--faint">{development.disclaimer}</p>
        </>
      }
    >
      <Section title="From concept to delivery">
        <ol className={s.stages}>
          {development.stages.map((stage, i) => (
            <li key={stage.id} className={s.stage}>
              <span className={s.stageIndex} data-status={stage.status}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={s.stageTitle}>
                  {stage.label}
                  {stage.status === 'current' && <span className={s.stageStatus}>Current</span>}
                </h3>
                <p className="prose">{stage.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Envisioned components">
        <ul className={s.list}>
          {development.components.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Section>

      <Section title="Principles">
        {development.principles.map((p) => (
          <div key={p.label} className={s.principle}>
            <h3 className={s.principleTitle}>{p.label}</h3>
            <p className="prose">{p.body}</p>
          </div>
        ))}
      </Section>
    </Editorial>
  );
}
