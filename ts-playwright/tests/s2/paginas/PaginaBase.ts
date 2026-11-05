import { Locator, Page } from '@playwright/test';

/**
 * CLASE PADRE: lo que todas las pantallas del banco tienen en común.
 * Herencia: las demás pantallas la "extienden" y reciben esto sin volver a escribirlo.
 */
export abstract class PaginaBase {
  readonly mensajeDeError: Locator;

  // CONSTRUCTOR: lo que la clase necesita para existir. Aquí, la pestaña del navegador.
  constructor(protected readonly page: Page) {
    this.mensajeDeError = page.getByRole('alert');
  }

  // Cada pantalla define su propia dirección.
  abstract readonly ruta: string;

  // POLIMORFISMO: el mismo método abre una pantalla distinta según la clase hija.
  async abrir() {
    await this.page.goto(this.ruta);
  }
}
