import { Editorial, Section, editorialStyles as s } from '@/components/pages/Editorial';
import { briefing } from '@/data/development';
import { requestBriefing } from './actions';

export const metadata = { title: briefing.title };

export default async function BriefingPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <Editorial
      eyebrow="Private briefing"
      title={briefing.title}
      intro={briefing.intro}
      aside={
        <>
          <p className="label label--faint">Formats</p>
          <ul className={s.list} style={{ gridTemplateColumns: '1fr' }}>
            {briefing.formats.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      }
    >
      {sent ? (
        <div className={s.notice}>
          <p className="display display--s">Thank you.</p>
          <p className="prose">Your request has been received. {briefing.note}</p>
        </div>
      ) : (
        <Section title="Request a briefing">
          <form action={requestBriefing} className={s.form}>
            <div className={s.formRow}>
              <label className={s.field}>
                <span className="label label--faint">Name</span>
                <input className={s.input} name="name" required autoComplete="name" />
              </label>
              <label className={s.field}>
                <span className="label label--faint">Organisation</span>
                <input className={s.input} name="organisation" required autoComplete="organization" />
              </label>
            </div>
            <div className={s.formRow}>
              <label className={s.field}>
                <span className="label label--faint">Role</span>
                <input className={s.input} name="role" autoComplete="organization-title" />
              </label>
              <label className={s.field}>
                <span className="label label--faint">Email</span>
                <input className={s.input} name="email" type="email" required autoComplete="email" />
              </label>
            </div>
            <label className={s.field}>
              <span className="label label--faint">Nature of interest</span>
              <select className={s.select} name="interest" required defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                {briefing.interestOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              <span className="label label--faint">A note, if useful</span>
              <textarea className={s.textarea} name="message" />
            </label>
            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
            {error && <p style={{ color: 'var(--gold)' }}>Something went wrong. Please try again, or write to us directly.</p>}
            <div>
              <button type="submit" className="label" style={{ display: 'inline-grid', gridAutoFlow: 'column', gap: '0.75rem', alignItems: 'center', minHeight: '3rem', padding: '0 1.5rem', border: '1px solid var(--stone)', color: 'var(--fg)' }}>
                Send request <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="label label--faint">{briefing.note}</p>
          </form>
        </Section>
      )}
    </Editorial>
  );
}
