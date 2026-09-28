describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { cy.visit('/') })

  it('US_ADM_006: Bloquea un día libre exitosamente (Happy Path)', () => {
    /// arrange -> seleccionar día 13 del calendario
    cy.get('[data-cy="calendar-day-13"]').click()
    
    /// act -> presionar el botón de bloquear día
    cy.get('[data-cy="block-day-button"]').click()

    /// assert -> verificar notificación, botón de desbloqueo y cambio en la píldora de estado
    cy.get('[data-cy="notification"]').should('contain.text', 'Día bloqueado correctamente')
    cy.get('.state-pill').should('contain.text', 'Bloqueado')
    cy.get('[data-cy="unblock-day-button"]').should('be.visible')
    
    /// teardown: desbloquear el día para mantener el estado inicial
    cy.get('[data-cy="unblock-day-button"]').click()
  })
})