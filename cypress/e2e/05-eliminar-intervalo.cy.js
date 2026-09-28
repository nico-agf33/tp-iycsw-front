describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    
    cy.intercept('POST', '**/api/disponibilidad/intervalos').as('creacionVacia')
    cy.intercept('PATCH', '**/api/disponibilidad/*/intervalos/*').as('configuracionHorario')
    cy.intercept('DELETE', '**/api/disponibilidad/*/intervalos/*').as('borradoIntervalo')
    cy.visit('/') 
  })

  it('US_ADM_010: Elimina lógicamente un intervalo (Happy Path)', () => {
    /// arrange -> crear un intervalo en el día 14 y asegurar que aparezca en pantalla
    cy.get('[data-cy="calendar-day-14"]').click()
    cy.get('.detail-header h2').should('contain.text', '14') 

    // 1. Crear vacío
    cy.get('[data-cy="add-interval-button"]').click()
    cy.wait('@creacionVacia')
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo añadido')

    // 2. Editar y configurar
    cy.get('button[data-cy^="edit-interval-"]').last().should('be.visible').click()
    cy.get('[data-cy="interval-start-input"]').clear().type('1000').should('have.value', '10:00')
    cy.get('[data-cy="interval-end-input"]').clear().type('1100').should('have.value', '11:00')
    cy.get('[data-cy="save-interval-button"]').click()
    
    cy.wait('@configuracionHorario')
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Intervalo configurado correctamente')
    cy.contains('10:00 – 11:00').should('be.visible')

    /// act -> abrir el modal de eliminación y confirmar la baja
    cy.get('button[data-cy^="delete-interval-"]').last().click()
    cy.get('[data-cy="confirm-delete-button"]').click()

    cy.wait('@borradoIntervalo') // Aseguramos que el backend procesó el DELETE

    /// assert -> verificar notificación de éxito y que la lista muestre estado vacío
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'El intervalo fue eliminado')
    cy.contains('Sin intervalos configurados').should('be.visible')
  })
})