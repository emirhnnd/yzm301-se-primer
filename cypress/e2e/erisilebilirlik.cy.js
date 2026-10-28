describe('Erişilebilirlik ve mobil', () => {
  it('viewport yakınlaştırmayı engellemiyor', () => {
    cy.visit('/?tutor=mock');
    cy.document().then((d) => {
      const c = d.querySelector('meta[name=viewport]').getAttribute('content');
      expect(c).to.include('width=device-width');
      expect(c).not.to.include('user-scalable=no');
      expect(c).not.to.match(/maximum-scale=1(\.0)?\b/);
    });
  });

  it('360 px genişlikte yatay kaydırma yok (giriş ve sahne)', () => {
    cy.viewport(360, 740);
    cy.basla('yeni');
    cy.document().then((d) => {
      expect(d.documentElement.scrollWidth).to.be.lte(360);
    });
  });

  it('seçenekler radiogroup içinde', () => {
    cy.basla('yeni');
    cy.get('[role=radiogroup]').should('exist');
  });
});
