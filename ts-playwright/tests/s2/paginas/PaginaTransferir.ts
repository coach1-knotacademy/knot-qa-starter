import { Page } from '@playwright/test';
import { PaginaBase } from './PaginaBase';

export class PaginaTransferir extends PaginaBase {
  readonly ruta = '/transferir';
  readonly comprobante;

  constructor(page: Page) {
    super(page);
    this.comprobante = page.getByRole('status');
  }

  async transferir(destino: string, monto: string, { aceptar = true } = {}) {
    await this.page.getByLabel('Cuenta destino').fill(destino);
    await this.page.getByLabel('Monto').fill(monto);
    if (aceptar) await this.page.getByLabel('Acepto el cobro del 4x1000').check();
    await this.page.getByRole('button', { name: 'Transferir' }).click();
  }
}
