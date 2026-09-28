describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    cy.intercept('POST', '**/api/disponibilidad/intervalos').as('creacionVacia')
    cy.intercept('PATCH', '**/api/disponibilidad/*/intervalos/*').as('configuracionHorario') 
    cy.visit('/') 
  })

  it('US_ADM_007: Rechaza crear intervalo con inicio mayor al fin (Data Error)', () => {
    cy.get('[data-cy="calendar-day-11"]').click()
    
    // Crear vacío y abrir edición
    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia')
    cy.get('button[data-cy^="edit-interval-"]').last().click()
    
    // Ingresar horario inválido
    cy.get('[data-cy="interval-start-input"]').clear().type('1500').should('have.value', '15:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1000').should('have.value', '10:00')
    cy.get('[data-cy="save-interval-button"]').click()

    cy.wait('@configuracionHorario')

    cy.get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain.text', 'La hora de inicio debe ser menor que la hora de fin')

    // Teardown
    cy.get('.modal-actions .ghost-button').click() 
    cy.get('button[data-cy^="delete-interval-"]').last().click()
    cy.get('.danger-button').contains('Eliminar').click()
  })
})