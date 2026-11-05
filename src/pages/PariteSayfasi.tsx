import React, { useEffect, useState } from 'react';
import { olasiliklar } from '../model/predictor';

/**
 * Diferansiyel test sayfası (?parite=1&x=v1,v2,...): verilen özellik vektörü için uygulamadaki ONNX
 * çıkarımının riskli sınıf olasılığını yazar. Cypress bunu tests/parite.json (Python test kahini)
 * ile 1e-4 toleransla karşılaştırır.
 */
export default function PariteSayfasi() {
  const [p, setP] = useState<string>('');
  const [hata, setHata] = useState<string>('');

  useEffect(() => {
    const x = (new URLSearchParams(window.location.search).get('x') || '')
      .split(',')
      .map(Number);
    olasiliklar(x)
      .then((o) => setP(String(o[1])))
      .catch((e) => setHata(String(e?.message || e)));
  }, []);

  return (
    <main style={{ fontFamily: 'monospace', padding: 16 }}>
      <h1>Parite sayfası</h1>
      <p>
        p_riskli: <span data-cy="p">{p}</span>
      </p>
      {hata && <p data-cy="hata">{hata}</p>}
    </main>
  );
}
