describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    cy.intercept('POST', '**/api/disponibilidad/intervalos').as('creacionVacia')
    cy.intercept('PATCH', '**/api/disponibilidad/*/intervalos/*').as('configuracionHorario') 
    cy.visit('/') 
  })

  it('US_ADM_007: Rechaza crear intervalo con inicio mayor al fin (Data Error)', () => {
    /// arrange -> seleccionar día 11
    cy.get('[data-cy="calendar-day-11"]').click()
    
    cy.get('.detail-header h2').should('contain.text', '11')
    
    /// act -> crear intervalo vacío
    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia')
    
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo añadido')

    // click en editar y llenado del formulario
    cy.get('button[data-cy^="edit-interval-"]').last().should('be.visible').click()
    
    cy.get('[data-cy="interval-start-input"]').clear().type('1500').should('have.value', '15:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1000').should('have.value', '10:00')
    cy.get('[data-cy="save-interval-button"]').click()

    cy.wait('@configuracionHorario')

    /// assert -> verificar que la UI atrapa el error exacto que manda el Backend
    cy.get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain.text', 'La hora de inicio debe ser menor que la hora de fin')

    /// teardown: cancelar edición y eliminar intervalo vacío
    cy.get('.modal-actions .ghost-button').click() // Cierra el modal 
    cy.get('button[data-cy^="delete-interval-"]').last().click()
    cy.get('.danger-button').contains('Eliminar').click()
  })
})