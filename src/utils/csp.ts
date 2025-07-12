/**
 * Content Security Policy utilities for PrepperTrack
 * Provides CSP configuration and nonce management
 */

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  // Default source - only allow same origin
  'default-src': ["'self'"],
  
  // Script sources - only allow same origin and specific nonces
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    // In production, replace with nonce-based approach
  ],
  
  // Style sources - allow same origin and inline styles (for Tailwind)
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
  ],
  
  // Image sources - allow same origin and data URLs for icons
  'img-src': [
    "'self'",
    "data:",
    "https:", // Allow HTTPS images (for Pexels stock photos)
  ],
  
  // Font sources - allow same origin and data URLs
  'font-src': [
    "'self'",
    "data:",
  ],
  
  // Connect sources - allow same origin for API calls
  'connect-src': [
    "'self'",
  ],
  
  // Media sources - only same origin
  'media-src': ["'self'"],
  
  // Object sources - none allowed
  'object-src': ["'none'"],
  
  // Frame sources - none allowed
  'frame-src': ["'none'"],
  
  // Worker sources - only same origin
  'worker-src': ["'self'"],
  
  // Child sources - none allowed
  'child-src': ["'none'"],
  
  // Form action - only same origin
  'form-action': ["'self'"],
  
  // Frame ancestors - none allowed (prevents clickjacking)
  'frame-ancestors': ["'none'"],
  
  // Base URI - only same origin
  'base-uri': ["'self'"],
  
  // Upgrade insecure requests in production
  'upgrade-insecure-requests': true,
  
  // Block mixed content
  'block-all-mixed-content': true,
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(nonce?: string): string {
  const directives: string[] = [];
  
  Object.entries(CSP_CONFIG).forEach(([directive, values]) => {
    if (directive === 'upgrade-insecure-requests' || directive === 'block-all-mixed-content') {
      if (values === true) {
        directives.push(directive);
      }
      return;
    }
    
    if (Array.isArray(values)) {
      let directiveValues = [...values];
      
      // Add nonce to script-src if provided
      if (directive === 'script-src' && nonce) {
        directiveValues = directiveValues.filter(v => v !== "'unsafe-inline'");
        directiveValues.push(`'nonce-${nonce}'`);
      }
      
      directives.push(`${directive} ${directiveValues.join(' ')}`);
    }
  });
  
  return directives.join('; ');
}

/**
 * Apply CSP to the current document
 */
export function applyCSP(nonce?: string): void {
  // Create or update CSP meta tag
  let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
  
  if (!cspMeta) {
    cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    document.head.appendChild(cspMeta);
  }
  
  cspMeta.content = generateCSPHeader(nonce);
}

/**
 * Security headers configuration for server-side implementation
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

/**
 * Validate script execution context
 */
export function validateScriptContext(): boolean {
  // Check if we're in a trusted context
  if (typeof window === 'undefined') {
    return false; // Server-side context
  }
  
  // Check for common XSS indicators
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /on\w+\s*=/i,
  ];
  
  const currentUrl = window.location.href;
  return !suspiciousPatterns.some(pattern => pattern.test(currentUrl));
}

/**
 * Secure script loader with nonce validation
 */
export function loadSecureScript(src: string, nonce?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!validateScriptContext()) {
      reject(new Error('Unsafe script execution context'));
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    if (nonce) {
      script.nonce = nonce;
    }
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    // Validate script source before loading
    try {
      const url = new URL(src, window.location.origin);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        reject(new Error('Invalid script protocol'));
        return;
      }
    } catch {
      reject(new Error('Invalid script URL'));
      return;
    }
    
    document.head.appendChild(script);
  });
}

/**
 * Initialize CSP and security measures
 */
export function initializeSecurity(): void {
  // Apply CSP
  applyCSP();
  
  // Validate current context
  if (!validateScriptContext()) {
    console.error('PrepperTrack: Unsafe execution context detected');
    return;
  }
  
  // Add security event listeners
  window.addEventListener('error', (event) => {
    // Log potential security issues
    if (event.error && event.error.message) {
      const message = event.error.message.toLowerCase();
      if (message.includes('script') || message.includes('eval') || message.includes('unsafe')) {
        console.warn('PrepperTrack: Potential security issue detected:', event.error.message);
      }
    }
  });
  
  // Monitor for DOM manipulation attempts
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script tags
              if (element.tagName === 'SCRIPT') {
                const script = element as HTMLScriptElement;
                if (!script.nonce && script.src && !script.src.startsWith(window.location.origin)) {
                  console.warn('PrepperTrack: Suspicious script detected:', script.src);
                  script.remove();
                }
              }
              
              // Check for inline event handlers
              Array.from(element.attributes || []).forEach((attr) => {
                if (attr.name.startsWith('on')) {
                  console.warn('PrepperTrack: Inline event handler detected:', attr.name);
                  element.removeAttribute(attr.name);
                }
              });
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover'],
    });
  }
  
  console.log('PrepperTrack: Security measures initialized');
}