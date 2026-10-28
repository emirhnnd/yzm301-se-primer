// Ortak yardımcılar: giriş ekranını doldur, karar ver, devam et.
const SEVIYE = { yeni: 'level-yeni', biraz: 'level-biraz', deneyimli: 'level-deneyimli' };

Cypress.Commands.add('basla', (seviye = 'yeni', rol = 'gelistirici', hedef = 'mimari', opts = {}) => {
  cy.visit('/?tutor=mock', opts);
  cy.get('[data-testid=start-btn]').should('be.disabled');
  cy.get(`[data-testid=${SEVIYE[seviye]}]`).click();
  cy.get(`[data-testid=role-${rol}]`).click();
  cy.get(`[data-testid=goal-${hedef}]`).click();
  cy.get('[data-testid=start-btn]').should('be.enabled').click();
});

// Bir kararı ver (harf: 'a' | 'b'), sonuç panelini gör, devam et.
Cypress.Commands.add('karar', (harf) => {
  cy.get('[data-testid=continue-btn]').should('be.disabled');
  cy.get(`[data-testid=option-${harf}]`).click();
  cy.get('[data-testid=result-panel]').should('be.visible');
  cy.get('[data-testid=continue-btn]').should('be.enabled').click();
});
