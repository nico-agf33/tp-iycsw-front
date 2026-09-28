describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { cy.visit('/') })

  it('US_ADM_010: Elimina lógicamente un intervalo (Happy Path)', () => {
    /// arrange -> crear un intervalo en el día 14 y asegurar que aparezca en pantalla
    cy.get('[data-cy="calendar-day-14"]').click()
    cy.get('[data-cy="add-interval-button"]').click()
    
    // CORRECCIÓN
    cy.get('[data-cy="interval-start-input"]').type('1000').should('have.value', '10:00')
    cy.get('[data-cy="interval-end-input"]').type('1100').should('have.value', '11:00')
    cy.get('[data-cy="save-interval-button"]').click()
    
    cy.contains('10:00 – 11:00').should('be.visible')

    /// act -> abrir el modal de eliminación y confirmar la baja
    cy.get('button[data-cy^="delete-interval-"]').first().click()
    cy.get('[data-cy="confirm-delete-button"]').click()

    /// assert -> verificar notificación de éxito y que la lista muestre estado vacío
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'El intervalo fue eliminado')
    cy.contains('Sin intervalos configurados').should('be.visible')
  })
})