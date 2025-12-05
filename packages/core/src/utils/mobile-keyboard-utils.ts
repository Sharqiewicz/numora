/**
 * Mobile keyboard detection and utility functions.
 * Helps identify mobile devices and handle mobile-specific keyboard behaviors.
 */

/**
 * Detects if the current device is a mobile device.
 * Uses user agent and screen size heuristics.
 *
 * @returns True if running on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for mobile user agents
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  if (mobileRegex.test(userAgent)) {
    return true;
  }

  // Check screen size as fallback (mobile typically < 768px width)
  if (window.innerWidth && window.innerWidth < 768) {
    return true;
  }

  return false;
}

/**
 * Detects if the current device is iOS (iPhone, iPad, iPod).
 *
 * @returns True if running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  return /iPad|iPhone/.test(userAgent) && !(window as any).MSStream;
}

/**
 * Detects if the current device is Android.
 *
 * @returns True if running on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  return /android/i.test(userAgent);
}

