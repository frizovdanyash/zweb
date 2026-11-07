//# allFunctionsCalledOnLoad
var e=()=>Promise.reject(Error(`zWeb: wallet engine is not bundled`)),t=new Proxy({},{get(t,n){if(n===`initializeWalletEngine`)return e}});export{t as default};
//# sourceMappingURL=walletEngineStub-p8b0j9l_.js.map