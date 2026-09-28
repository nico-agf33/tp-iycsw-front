describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    cy.intercept('POST', '**/api/disponibilidad/intervalos').as('creacionVacia')
    cy.intercept('PATCH', '**/api/disponibilidad/*/intervalos/*').as('configuracionHorario')
    
    cy.visit('/') 
  })

  it('US_ADM_007: Crea un intervalo laboral válido (Happy Path)', () => {
    /// arrange -> seleccionar día 10 del calendario actual
    cy.get('[data-cy="calendar-day-10"]').click()
    
    // CORRECCIÓN: Como los días vacíos no llaman a la API, esperamos a que el panel cambie al día 10
    cy.get('.detail-header h2').should('contain.text', '10')
    
    /// act -> 1. Crear el intervalo vacío
    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia') 
    
    // Esperamos la confirmación visual de que React ya procesó la respuesta
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo añadido')
    
    /// act -> 2. Abrir el modal de edición y completar
    cy.get('button[data-cy^="edit-interval-"]').last().should('be.visible').click()
    
    cy.get('[data-cy="interval-start-input"]').clear().type('0800').should('have.value', '08:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1200').should('have.value', '12:00')
    cy.get('[data-cy="laboral-type-radio"]').check()
    cy.get('[data-cy="save-interval-button"]').click()

    cy.wait('@configuracionHorario') 

    /// assert -> verificar Toast y aparición en pantalla
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo configurado correctamente')
    
    /// teardown: eliminar para mantener base de datos limpia 
    cy.get('button[data-cy^="delete-interval-"]').last().click()
    cy.get('.danger-button').contains('Eliminar').click()
  })
})