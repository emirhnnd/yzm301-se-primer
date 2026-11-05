// KÖ-7 ve KÖ-8: model çıktısına göre tutor'un kendiliğinden konuşması.
// ?p_test=<olasılık> model yerine sabit bir olasılık verir (testin deterministik olması için).
const HARF = /(^|[^A-Za-zÇĞİÖŞÜçğıöşü])[AB](?![A-Za-zÇĞİÖŞÜçğıöşü])/;

function basla(query) {
  cy.clock();
  cy.visit(`/${query}`);
  cy.get('[data-testid=level-yeni]').click();
  cy.get('[data-testid=role-test]').click();
  cy.get('[data-testid=goal-mimari]').click();
  cy.get('[data-testid=start-btn]').click();
}

describe('KÖ-7: p_riskli >= eşik → tutor kendiliğinden soru sorar', () => {
  it('8 sn seçim yapılmazsa tutor, oyuncu yazmadan, ? içeren ve harf içermeyen tek soru ekler', () => {
    basla('?p_test=0.9');
    cy.get('[data-testid=tutor-msg]').its('length').then((n0) => {
      cy.tick(9000);
      cy.get('[data-testid=tutor-msg]').should('have.length', n0 + 1);
      cy.get('[data-testid=tutor-msg]')
        .last()
        .invoke('text')
        .then((t) => {
          expect(t).to.contain('?');
          expect(t).not.to.match(HARF);
        });
    });
  });
});

describe('KÖ-8: p_riskli < eşik → tutor susar', () => {
  it('8 sn sonra tutor paneline kendiliğinden yeni mesaj eklenmez', () => {
    basla('?p_test=0.1');
    cy.get('[data-testid=tutor-msg]').its('length').then((n0) => {
      cy.tick(9000);
      cy.wait(500);
      cy.get('[data-testid=tutor-msg]').should('have.length', n0);
    });
  });
});

describe('KÖ-6: yeni karar ekranı en üstten açılır', () => {
  it('"Devam"dan sonra sayfa en üstte, karar sorusu görünür', () => {
    cy.visit('/?tutor=mock');
    cy.get('[data-testid=level-yeni]').click();
    cy.get('[data-testid=role-gelistirici]').click();
    cy.get('[data-testid=goal-mimari]').click();
    cy.get('[data-testid=start-btn]').click();
    cy.get('[data-testid=option-a]').click();
    cy.get('[data-testid=continue-btn]').should('be.enabled').click();
    cy.window().its('scrollY').should('eq', 0);
    cy.get('[data-testid=option-a]').should('be.visible');
  });
});
