import { useEffect, useState } from 'react';
import api from '../services/apiClient';

export default function PrivacyConsent({ onSaved }) {
  const [policy, setPolicy] = useState(null);
  const [choices, setChoices] = useState({ consent: false, analytics: false, marketing: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/privacy/policy').then(r => setPolicy(r.data)).catch(()=>{});
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await api.post('/privacy/consent', choices);
      onSaved?.();
    } finally {
      setLoading(false);
    }
  };

  if (!policy) return null;
  return (
    <div style={{padding:'12px', border:'1px solid #ddd', borderRadius:8, margin:'12px 0', background:'#fffef6'}}>
      <p><b>Privacidad v{policy.version}:</b> {policy.summary}{' '}
        {policy.url && <a href={policy.url} target="_blank" rel="noreferrer">Leer más</a>}
      </p>
      <label style={{display:'block', margin:'6px 0'}}>
        <input
          type="checkbox"
          checked={choices.consent}
          onChange={e => setChoices({ ...choices, consent: e.target.checked })}
        /> Acepto el tratamiento esencial
      </label>
      <label style={{display:'block', margin:'6px 0'}}>
        <input
          type="checkbox"
          checked={choices.analytics}
          onChange={e => setChoices({ ...choices, analytics: e.target.checked })}
        /> Acepto analítica
      </label>
      <label style={{display:'block', margin:'6px 0'}}>
        <input
          type="checkbox"
          checked={choices.marketing}
          onChange={e => setChoices({ ...choices, marketing: e.target.checked })}
        /> Acepto marketing
     </label>
      <button disabled={!choices.consent || loading} onClick={save}>
       {loading ? 'Guardando...' : 'Guardar preferencias'}
    </button>
</div>
);
}