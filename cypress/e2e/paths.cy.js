// 8 yolun tamamı: son rozeti ve saat spec.md'deki tabloyla aynı olmalı.
// Kural: SON A ancak K3=A ve (K1=A veya K2=A) ise.
const YOLLAR = [
  ['a', 'a', 'a', '08:15', 'A'],
  ['a', 'a', 'b', '08:05', 'B'],
  ['a', 'b', 'a', '08:00', 'A'],
  ['a', 'b', 'b', '07:50', 'B'],
  ['b', 'a', 'a', '08:10', 'A'],
  ['b', 'a', 'b', '08:00', 'B'],
  ['b', 'b', 'a', '07:55', 'B'],
  ['b', 'b', 'b', '07:45', 'B'],
];
const BASLIK = { A: 'KONTROL ALTINDA', B: 'GİZLİ BOMBA' };

describe('8 yol', () => {
  YOLLAR.forEach(([k1, k2, k3, saat, son]) => {
    it(`${k1.toUpperCase()}-${k2.toUpperCase()}-${k3.toUpperCase()} → SON ${son}, ${saat}`, () => {
      cy.basla('yeni');
      cy.karar(k1);
      cy.karar(k2);
      cy.karar(k3);
      cy.get('[data-testid=ending-badge]').should('contain', `SON ${son}`).and('contain', BASLIK[son]);
      cy.get('[data-testid=ending-clock]').should('contain', saat);
    });
  });
});
