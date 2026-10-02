describe('Hotfix - Creación de Intervalo Vacío', () => {
  it('Debe disparar un POST creando un intervalo vacío al hacer clic en Añadir', () => {
    cy.intercept('POST', '**/api/disponibilidad/intervalos').as('creacionVacia')
    cy.visit('/')
    cy.get('[data-cy="calendar-day-15"]').click()
    
    /// act
    cy.get('[data-cy="add-interval-button"]').click()
    
    /// assert: como el botón actual solo abre el modal y no hace POST, esto fallará por timeout
    cy.wait('@creacionVacia', { timeout: 4000 })
  })
})