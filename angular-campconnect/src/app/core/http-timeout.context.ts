import { HttpContextToken } from '@angular/common/http';

/**
 * Délai HTTP personnalisé (ms) pour certaines requêtes lourdes (ex. création de post + modération).
 * 0 = utiliser le délai par défaut de l'intercepteur.
 */
export const extendedHttpTimeoutMs = new HttpContextToken<number>(() => 0);
