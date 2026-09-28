describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    cy.intercept('POST', '**/api/disponibilidad/intervalos').as('creacionVacia')
    cy.intercept('PATCH', '**/api/disponibilidad/*/intervalos/*').as('configuracionHorario')
    cy.visit('/') 
  })

  it('US_ADM_007: Rechaza solapamiento en la BD (System State Error)', () => {
    /// arrange -> crear un intervalo base en el día 12
    cy.get('[data-cy="calendar-day-12"]').click()
    cy.get('.detail-header h2').should('contain.text', '12') 

    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia')
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo añadido') 

    cy.get('button[data-cy^="edit-interval-"]').should('have.length', 1).last().click()
    
    cy.get('[data-cy="interval-start-input"]').clear().type('0900').should('have.value', '09:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1300').should('have.value', '13:00')
    cy.get('[data-cy="laboral-type-radio"]').check()
    cy.get('[data-cy="save-interval-button"]').click()
    
    cy.wait('@configuracionHorario')
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo configurado correctamente') 

    /// act -> intentar crear un segundo intervalo
    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia')
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo añadido') 

    cy.get('button[data-cy^="edit-interval-"]').should('have.length', 2).last().click()
    
    cy.get('[data-cy="interval-start-input"]').clear().type('1100').should('have.value', '11:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1500').should('have.value', '15:00')
    cy.get('[data-cy="save-interval-button"]').click()

    cy.wait('@configuracionHorario')

    /// assert -> verificar el mensaje de error 409
    cy.get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain.text', 'Existe superposición de horarios')

    /// teardown: limpiar la base de datos
    cy.get('.modal-actions .ghost-button').click() // Cierra el modal de edición
    cy.get('button[data-cy^="delete-interval-"]').last().click()
    cy.get('.danger-button').contains('Eliminar').click()
    cy.wait(500) // Pausa para que el DOM se acomode al borrar
    cy.get('button[data-cy^="delete-interval-"]').first().click()
    cy.get('.danger-button').contains('Eliminar').click()
  })
})