describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { cy.visit('/') })

  it('US_ADM_012 y US_ADM_013: Guarda preferencias válidas (Happy Path)', () => {
    /// arrange -> ingresar datos válidos en los campos de preferencias
    cy.get('[data-cy="lead-time-input"]').clear().type('48')
    cy.get('[data-cy="lead-time-unit"]').select('DIAS')
    cy.get('[data-cy="daily-limit-input"]').clear().type('10')
    
    /// act -> enviar el formulario de preferencias
    cy.get('[data-cy="save-preferences-button"]').click()

    /// assert -> verificar el mensaje de éxito en la UI
    cy.get('[data-cy="notification"]').should('be.visible').and('contain.text', 'Preferencias guardadas correctamente')
  })
})