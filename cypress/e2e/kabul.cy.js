// spec.md kabul örnekleri (KÖ-1 ... KÖ-5) ve ek davranışlar.
describe('KÖ-0: giriş ve seçenek kilidi', () => {
  it('üç soru seçilmeden başla butonu kapalı, seçimde açılır', () => {
    cy.visit('/?tutor=mock');
    cy.get('[data-testid=start-btn]').should('be.disabled');
    cy.get('[data-testid=level-yeni]').click();
    cy.get('[data-testid=start-btn]').should('be.disabled');
    cy.get('[data-testid=role-test]').click();
    cy.get('[data-testid=start-btn]').should('be.disabled');
    cy.get('[data-testid=goal-kvkk]').click();
    cy.get('[data-testid=start-btn]').should('be.enabled');
  });

  it('seçim yapılmadan devam kapalı; seçince iki seçenek kilitlenir', () => {
    cy.basla('yeni');
    cy.get('[data-testid=continue-btn]').should('be.disabled');
    cy.get('[data-testid=option-a]').click();
    cy.get('[data-testid=result-panel]').should('be.visible');
    cy.get('[data-testid=option-a]').should('be.disabled');
    cy.get('[data-testid=option-b]').should('be.disabled');
  });
});

describe('KÖ-1: Yeni başladım', () => {
  it('ipucu butonu var, süre çubuğu yok', () => {
    cy.basla('yeni');
    cy.get('[data-testid=hint-btn]').should('be.visible');
    cy.get('[data-testid=timer-bar]').should('not.exist');
  });

  it('ipucu sınırsız ve her seferinde tutor balonu ekler', () => {
    cy.basla('yeni');
    cy.get('[data-testid=tutor-msg]').then(($m) => {
      const n0 = $m.length;
      cy.get('[data-testid=hint-btn]').click();
      cy.get('[data-testid=tutor-msg]').should('have.length', n0 + 1);
    });
  });
});

describe('KÖ-2: Deneyimliyim', () => {
  it('60 sn geri sayım var, ipucu yok; süre dolunca B uygulanır', () => {
    cy.clock();
    cy.basla('deneyimli');
    cy.get('[data-testid=timer-bar]').should('exist');
    cy.get('[data-testid=timer-text]').should('contain', '60');
    cy.get('[data-testid=hint-btn]').should('not.exist');
    cy.tick(61000);
    cy.get('[data-testid=timeout-note]').should('be.visible').and('contain', 'Süre doldu');
    cy.get('[data-testid=result-panel]').should('be.visible');
    // K1=B: saat 07:40 + 5 dk = 07:45
    cy.get('[data-testid=clock]').should('contain', '07:45');
  });
});

describe('Biraz deneyimliyim: 120 sn ve karar başına tek ipucu', () => {
  it('120 sn gösterir, ipucu bir kez kullanılabilir', () => {
    cy.basla('biraz');
    cy.get('[data-testid=timer-text]').should('contain', '120');
    cy.get('[data-testid=hint-btn]').click();
    cy.get('[data-testid=hint-btn]').should('be.disabled');
  });
});

describe('KÖ-3 / KÖ-4: ayırt edici yollar', () => {
  it('A-B-A → SON A, 08:00', () => {
    cy.basla('yeni');
    cy.karar('a'); cy.karar('b'); cy.karar('a');
    cy.get('[data-testid=ending-badge]').should('contain', 'SON A').and('contain', 'KONTROL ALTINDA');
    cy.get('[data-testid=ending-clock]').should('contain', '08:00');
  });

  it('B-B-A → SON B, 07:55 (K3=A tek başına yetmez)', () => {
    cy.basla('yeni');
    cy.karar('b'); cy.karar('b'); cy.karar('a');
    cy.get('[data-testid=ending-badge]').should('contain', 'SON B').and('contain', 'GİZLİ BOMBA');
    cy.get('[data-testid=ending-clock]').should('contain', '07:55');
  });
});

describe('Hedef kişiselleştirmesi', () => {
  it('Mimari hedefi K1 sonucunda Derinleşme gösterir, K2 sonucunda göstermez', () => {
    cy.basla('yeni', 'gelistirici', 'mimari');
    cy.get('[data-testid=option-a]').click();
    cy.get('[data-testid=result-deepdive]').should('exist');
    cy.get('[data-testid=continue-btn]').click();
    cy.get('[data-testid=option-a]').click();
    cy.get('[data-testid=result-deepdive]').should('not.exist');
  });

  it('Son ekranda Sonraki ders kartı vardır', () => {
    cy.basla('yeni', 'test', 'test');
    cy.karar('a'); cy.karar('a'); cy.karar('a');
    cy.get('[data-testid=next-lesson]').should('be.visible');
  });
});

describe('KÖ-5: tutor cevabı vermez (mock modu)', () => {
  it('"Doğru cevap hangisi?" → yanıt ? içerir, hüküm içermez', () => {
    cy.basla('yeni');
    cy.get('[data-testid=tutor-input]').type('Doğru cevap hangisi, A mı B mi?');
    cy.get('[data-testid=tutor-send]').click();
    cy.get('[data-testid=tutor-msg]').last().invoke('text').then((t) => {
      expect(t).to.include('?');
      expect(t).not.to.match(/\b[AB]\b\s*(doğru|yanlış)/i);
      expect(t).not.to.match(/(doğru|yanlış)\s*(cevap|seçenek)?\s*[:=]?\s*\b[AB]\b/i);
    });
  });
});

describe('Tekrar oyna', () => {
  it('replay-btn girişe döner, seçimler sıfırlanır', () => {
    cy.basla('yeni');
    cy.karar('a'); cy.karar('a'); cy.karar('a');
    cy.get('[data-testid=replay-btn]').click();
    cy.get('[data-testid=start-btn]').should('be.disabled');
  });
});
