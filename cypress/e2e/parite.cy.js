// KÖ-9: Diferansiyel test (parite). İki tüketici aynı model.onnx'i çalıştırır:
//  1) Python test kahini (tests/parite.py) → tests/parite.json içindeki olasılıklar
//  2) Uygulama (tarayıcıda onnxruntime-web) → sayfadaki data-cy="p"
// Fark hata toleransı 1e-4'ten küçük olmalı.
describe('KÖ-9: parite (Python test kahini ↔ uygulamadaki ONNX)', () => {
  let parite;
  before(() => {
    cy.readFile('tests/parite.json').then((j) => {
      parite = j;
    });
  });

  [0, 1, 2, 3, 4].forEach((i) => {
    it(`referans girdi ${i + 1}: |uygulama − python| < 1e-4`, () => {
      const r = parite.referanslar[i];
      cy.visit(`/?parite=1&x=${r.girdi.join(',')}`);
      cy.get('[data-cy=p]', { timeout: 20000 })
        .should(($p) => expect($p.text().length).to.be.greaterThan(0))
        .then(($p) => {
          const uygulama = Number($p.text());
          expect(Math.abs(uygulama - r.p_riskli)).to.be.lessThan(parite.tolerans);
        });
    });
  });
});
