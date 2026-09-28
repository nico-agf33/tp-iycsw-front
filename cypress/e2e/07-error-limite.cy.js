describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { cy.visit('/') })

  it('US_ADM_013: Rechaza guardar límite de reservas igual a cero (Data Error)', () => {
    /// arrange -> ingresar un valor inválido (cero) en el límite diario
    cy.get('[data-cy="daily-limit-input"]').clear().type('0')
    
    /// act -> intentar guardar las preferencias
    cy.get('[data-cy="save-preferences-button"]').click()

    /// assert -> verificar que el sistema impide la acción y alerta del error
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Ingrese un valor numérico entero mayor a cero')
  })
})