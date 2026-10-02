describe('AgendaYA - Módulo Gestión de Disponibilidad', () => {
  beforeEach(() => { 
    cy.intercept('GET', '**/api/preferencias/reuniones/limite-reservas-diarias*').as('getLimite')
    cy.visit('/') 
  })

  it('US_ADM_013: Rechaza guardar límite de reservas igual a cero (Data Error)', () => {
    /// esperar la 1ra llamada a la API
    cy.wait('@getLimite')

    /// SINCRONIZACIÓN REACT STRICT MODE: 
    /// dar tiempo a que Next.js termine su doble-hidratación y el DOM se estabilice
    cy.wait(500)

    /// arrange -> ingresar un valor inválido (cero) en el límite diario
    cy.get('[data-cy="daily-limit-input"]').clear().type('0').should('have.value', '0')
    
    /// act -> intentar guardar las preferencias
    cy.get('[data-cy="save-preferences-button"]').click()

    /// assert -> verificar que el frontend impide la acción y alerta del error
    cy.get('[data-cy="notification"]')
      .should('be.visible')
      .and('contain.text', 'Ingrese un valor numérico entero mayor a cero')
  })
})