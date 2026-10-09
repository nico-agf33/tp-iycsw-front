describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    /// escuchar a la API para asegurar cuándo terminan de cargar las preferencias iniciales
    cy.intercept('GET', '**/api/preferencias/reuniones/limite-reservas-diarias*').as('getLimite')
    cy.visit('/') 
  })

  it('US_ADM_012 y US_ADM_013: Guarda preferencias válidas (Happy Path)', () => {
    /// SINCRONIZACIÓN: esperar que el backend traiga el valor inicial
    cy.wait('@getLimite')

    /// arrange -> ingresar datos válidos en los campos de preferencias
    cy.get('[data-cy="lead-time-input"]').clear().type('48').should('have.value', '48')
    cy.get('[data-cy="lead-time-unit"]').select('DIAS')
    cy.get('[data-cy="daily-limit-input"]').clear().type('10').should('have.value', '10')
    
    /// act -> enviar el formulario de preferencias
    cy.get('[data-cy="save-preferences-button"]').click()

    /// assert -> verificar el mensaje de éxito en la UI
    cy.get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain.text', 'Configuración y preferencias guardadas correctamente.')
  })
})