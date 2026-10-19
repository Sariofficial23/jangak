type NativeWindow = {
  Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
  androidBridge?: unknown;
};

export function isNativeApp(win: NativeWindow): boolean {
  return !!win.androidBridge || win.Capacitor?.isNativePlatform?.() === true ||
    ["android", "ios"].includes(win.Capacitor?.getPlatform?.() ?? "");
}

// The APK injects androidBridge before page scripts. Detect it before paint;
// do not confuse an ordinary Android browser with the installed application.
export const nativeAppDetectionScript = `(()=>{function detect(){const w=window,c=w.Capacitor;if(w.androidBridge||c?.isNativePlatform?.()===true||['android','ios'].includes(c?.getPlatform?.()||'')){document.documentElement.dataset.nativeApp='true'}}detect();document.addEventListener('DOMContentLoaded',detect,{once:true});window.addEventListener('load',detect,{once:true})})();`;
