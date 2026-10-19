type NativeWindow = {
  Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
  androidBridge?: unknown;
};

export function isNativeApp(win: NativeWindow): boolean {
  return !!win.androidBridge || win.Capacitor?.isNativePlatform?.() === true ||
    ["android", "ios"].includes(win.Capacitor?.getPlatform?.() ?? "");
}

export const nativeSplashStorageKey = "jangak:splash:v1";

// The APK injects androidBridge before page scripts. Detect it before paint;
// do not confuse an ordinary Android browser with the installed application.
export const nativeAppDetectionScript = `(()=>{function detect(){const w=window,c=w.Capacitor,h=document.documentElement;if(w.androidBridge||c?.isNativePlatform?.()===true||['android','ios'].includes(c?.getPlatform?.()||'')){h.dataset.nativeApp='true';let shown=!!w.__jangakSplashShown;try{shown=shown||sessionStorage.getItem('${nativeSplashStorageKey}')==='1'}catch(e){}if(!shown&&!w.matchMedia('(prefers-reduced-motion: reduce)').matches){h.dataset.nativeSplash=h.dataset.nativeSplash||'pending';setTimeout(()=>{if(h.dataset.nativeSplash==='pending')delete h.dataset.nativeSplash},8000)}}}detect();document.addEventListener('DOMContentLoaded',detect,{once:true});window.addEventListener('load',detect,{once:true})})();`;
