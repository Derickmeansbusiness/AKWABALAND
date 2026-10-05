import { Editorial, Section, editorialStyles as s } from '@/components/pages/Editorial';
import { Button } from '@/components/ui/Button';
import { downloads } from '@/data/development';

export const metadata = { title: downloads.title };

export default function DownloadsPage() {
  return (
    <Editorial eyebrow="Documents" title={downloads.title} intro={downloads.intro} aside={<p className="label label--faint">{downloads.note}</p>}>
      <Section title="Available on request">
        <ul>
          {downloads.items.map((item) => (
            <li key={item.id} className={s.download}>
              <div>
                <h3 className={s.stageTitle}>{item.label}</h3>
                <p className="prose">{item.description}</p>
              </div>
              <Button href="/briefing" variant="ghost">
                Request
              </Button>
            </li>
          ))}
        </ul>
      </Section>
    </Editorial>
  );
}
