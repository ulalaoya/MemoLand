import { useState } from 'react';

export function EchoDiagnosticsPanel() {
  const [report, setReport] = useState('');
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function showReport() {
    if (!report) {
      try {
        const { collectDeviceDiagnostics } = await import('../../diagnostics/deviceDiagnostics');
        const diagnostics = await collectDeviceDiagnostics();
        setReport(JSON.stringify(diagnostics, null, 2));
      } catch (error) {
        setReport(JSON.stringify({
          reportVersion: 1,
          capturedAt: new Date().toISOString(),
          diagnosticError: error instanceof Error ? error.message : 'unknown',
        }, null, 2));
      }
    }
    setOpen((value) => !value);
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <div className="ml-echo-diagnostics">
      <button
        type="button"
        className="ml-echo-diagnostics__toggle"
        onClick={showReport}
        aria-expanded={open}
        aria-controls="ml-echo-diagnostics-report"
      >
        פרטי בדיקה להורה
      </button>

      {open ? (
        <div id="ml-echo-diagnostics-report" className="ml-echo-diagnostics__report">
          <p>הדוח כולל פרטי דפדפן, מסך, PWA ואודיו בלבד. אין בו שם שחקן או נתוני משחק.</p>
          <pre dir="ltr">{report || 'אוסף נתונים...'}</pre>
          <button type="button" className="ml-echo-diagnostics__copy" onClick={copyReport} disabled={!report}>
            {copyState === 'copied' ? 'הדוח הועתק' : 'העתקת הדוח'}
          </button>
          {copyState === 'failed' ? <small>לא ניתן להעתיק אוטומטית. אפשר לסמן ולהעתיק את הטקסט.</small> : null}
        </div>
      ) : null}
    </div>
  );
}
