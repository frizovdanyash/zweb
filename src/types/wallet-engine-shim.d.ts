/**
 * zWeb: пакет `@ton/wallet-engine` поставляется отдельным tarball'ом и в этой
 * сборке не установлен (см. `src/lib/zweb/walletEngineStub.ts`). Кошелёк в
 * zWeb выключен, поэтому модуль описан как `any`.
 */
declare module '@ton/wallet-engine' {
  type Named = any;
  export type SendPreview = Named;
  export type SendResult = Named;
  export type SendSnapshot = Named;
  export type SendIntent = Named;
  export type TonConnectRequest = Named;
  export type TonConnectSession = Named;
  export type WalletStatus = Named;
  export type WalletTonConnectPending = Named;
  export type PopupStoryContext = Named;
  export type defineStories = Named;
  export type HostFailure = Named;
  export type HttpRequest = Named;
  export type HttpRequestId = Named;
  export type StatuslessHostErrorKind = Named;
  export type WalletStatuslessHost = Named;
  export type WalletClientConfig = Named;
  export type WalletDescriptor = Named;
  export type BrowserPlatformHost = Named;
  export type NftTransferIntent = Named;
  export type ProtectedSecretRead = Named;
  export type SendExpiration = Named;
  export type SendMessageBody = Named;
  export type WalletLifecycle = Named;
  export type WalletClient = Named;

  const anyExport: any;
  export = anyExport;
}
