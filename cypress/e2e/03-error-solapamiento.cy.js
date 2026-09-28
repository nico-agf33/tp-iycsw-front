describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    cy.intercept('POST', '**/api/disponibilidad/intervalos').as('creacionVacia')
    cy.intercept('PATCH', '**/api/disponibilidad/*/intervalos/*').as('configuracionHorario')
    cy.visit('/') 
  })

  it('US_ADM_007: Rechaza solapamiento en la BD (System State Error)', () => {
    /// arrange -> crear un intervalo base de 09:00 a 13:00 en el día 12
    cy.get('[data-cy="calendar-day-12"]').click()
    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia')
    cy.get('button[data-cy^="edit-interval-"]').last().click()
    cy.get('[data-cy="interval-start-input"]').clear().type('0900').should('have.value', '09:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1300').should('have.value', '13:00')
    cy.get('[data-cy="save-interval-button"]').click()
    
    cy.wait('@configuracionHorario')
    cy.contains('09:00 – 13:00').should('be.visible')

    /// act -> intentar crear un segundo intervalo que pise el horario del primero
    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia')
    cy.get('button[data-cy^="edit-interval-"]').last().click()
    
    cy.get('[data-cy="interval-start-input"]').clear().type('1100').should('have.value', '11:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1500').should('have.value', '15:00')
    cy.get('[data-cy="save-interval-button"]').click()

    cy.wait('@configuracionHorario')

    /// assert -> verificar el mensaje de error devuelto por la API
    cy.get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain.text', 'Existe superposición de horarios')

    /// teardown: limpiar la base de datos (eliminamos los dos intervalos creados)
    cy.get('.modal-actions .ghost-button').click() // Cierra el modal de edición
    cy.get('button[data-cy^="delete-interval-"]').last().click()
    cy.get('[data-cy="confirm-delete-button"]').click()
    cy.get('button[data-cy^="delete-interval-"]').first().click()
    cy.get('[data-cy="confirm-delete-button"]').click()
  })
})