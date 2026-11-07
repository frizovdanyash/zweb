/**
 * zWeb: заглушка необязательного пакета `@ton/wallet-engine`.
 *
 * Кошелёк в zWeb выключен: без нативного модуля (он поставляется отдельным
 * ~3 МБ tarball'ом) криптография TON не работает, а приложение должно
 * собираться и работать без него. Любое обращение к движку отклоняется,
 * поэтому экраны кошелька просто не открываются — см. `@lib/wallet/release`.
 */

const unavailable = () => Promise.reject(new Error('zWeb: wallet engine is not bundled'));

export default new Proxy({}, {
  get(_target, property) {
    if(property === 'initializeWalletEngine') return unavailable;
    return undefined;
  }
});
