import { Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

// La pantalla de ingreso: si cambia, solo se ajusta este archivo y no cada prueba.
export class PaginaLogin extends PaginaBase {
  readonly ruta = '/';

  constructor(page: Page) {
    super(page); // llama al constructor de la clase padre
  }

  async ingresar(usuario: string, clave: string) {
    await this.page.getByLabel('Usuario').fill(usuario);
    await this.page.getByLabel('Clave').fill(clave);
    await this.page.getByRole('button', { name: 'Ingresar' }).click();
  }
}
