import DOMPurify from 'dompurify';

/**
 * Comprehensive input sanitization utilities for PrepperTrack
 * Prevents XSS attacks and ensures data integrity
 */

// Configure DOMPurify with strict settings
const purifyConfig = {
  ALLOWED_TAGS: [], // No HTML tags allowed by default
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true, // Keep text content, remove tags
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
  FORBID_CONTENTS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
};

// Strict configuration for rich text (if needed in future)
const richTextConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  SANITIZE_DOM: true,
  FORBID_CONTENTS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'href', 'src'],
};

/**
 * Sanitize plain text input - removes all HTML and dangerous characters
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // First pass: DOMPurify to remove HTML
  const purified = DOMPurify.sanitize(input, purifyConfig);
  
  // Second pass: Additional character filtering
  return purified
    .replace(/[<>'"&]/g, '') // Remove remaining dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
}

/**
 * Sanitize numeric input - ensures only valid numbers
 */
export function sanitizeNumber(input: string | number | undefined | null): number {
  if (typeof input === 'number' && !isNaN(input) && isFinite(input)) {
    return input;
  }
  
  if (typeof input === 'string') {
    const sanitized = sanitizeText(input);
    const parsed = parseFloat(sanitized);
    return !isNaN(parsed) && isFinite(parsed) ? parsed : 0;
  }
  
  return 0;
}

/**
 * Sanitize email input - validates email format and removes dangerous characters
 */
export function sanitizeEmail(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeText(input);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL input - validates URL format and removes dangerous protocols
 */
export function sanitizeUrl(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeText(input);
  
  // Only allow http and https protocols
  try {
    const url = new URL(sanitized);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    // Invalid URL format
  }
  
  return '';
}

/**
 * Sanitize date input - ensures valid date format
 */
export function sanitizeDate(input: string | Date | undefined | null): string {
  if (!input) {
    return '';
  }
  
  if (input instanceof Date) {
    return input.toISOString().split('T')[0];
  }
  
  if (typeof input === 'string') {
    const sanitized = sanitizeText(input);
    const date = new Date(sanitized);
    
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  return '';
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(input: string[] | undefined | null): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  
  return input
    .map(item => sanitizeText(item))
    .filter(item => item.length > 0);
}

/**
 * Sanitize rich text content (for future use with notes/descriptions)
 */
export function sanitizeRichText(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(input, richTextConfig);
}

/**
 * Sanitize file name - removes dangerous characters and ensures safe file names
 */
export function sanitizeFileName(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return sanitizeText(input)
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

/**
 * Sanitize search query - allows basic search characters but removes dangerous content
 */
export function sanitizeSearchQuery(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return sanitizeText(input)
    .replace(/[^\w\s.-]/g, '') // Only allow word characters, spaces, dots, and hyphens
    .trim()
    .substring(0, 100); // Limit search query length
}

/**
 * Sanitize JSON data - recursively sanitizes all string values in an object
 */
export function sanitizeJsonData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (typeof data === 'number') {
    return sanitizeNumber(data);
  }
  
  if (typeof data === 'boolean') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeJsonData(item));
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeText(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJsonData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Validate and sanitize inventory item data
 */
export function sanitizeInventoryItem(item: any): any {
  if (!item || typeof item !== 'object') {
    return null;
  }
  
  return {
    id: sanitizeText(item.id),
    name: sanitizeText(item.name),
    category: sanitizeText(item.category),
    quantity: sanitizeNumber(item.quantity),
    unit: sanitizeText(item.unit),
    expirationDate: sanitizeDate(item.expirationDate),
    storageLocation: sanitizeText(item.storageLocation),
    caloriesPerUnit: item.caloriesPerUnit ? sanitizeNumber(item.caloriesPerUnit) : undefined,
    usageRatePerPersonPerDay: sanitizeNumber(item.usageRatePerPersonPerDay),
    cost: item.cost ? sanitizeNumber(item.cost) : undefined,
    notes: item.notes ? sanitizeText(item.notes) : undefined,
    dateAdded: sanitizeDate(item.dateAdded),
    lastUpdated: sanitizeDate(item.lastUpdated),
  };
}

/**
 * Validate and sanitize household member data
 */
export function sanitizeHouseholdMember(member: any): any {
  if (!member || typeof member !== 'object') {
    return null;
  }
  
  return {
    id: sanitizeText(member.id),
    name: sanitizeText(member.name),
    age: sanitizeNumber(member.age),
    activityLevel: sanitizeText(member.activityLevel),
    dailyCalories: sanitizeNumber(member.dailyCalories),
    dailyWaterLiters: sanitizeNumber(member.dailyWaterLiters),
    groupId: member.groupId ? sanitizeText(member.groupId) : undefined,
    emergencyContact: member.emergencyContact ? sanitizeText(member.emergencyContact) : undefined,
    medicalConditions: sanitizeStringArray(member.medicalConditions),
    dietaryRestrictions: sanitizeStringArray(member.dietaryRestrictions),
    skills: sanitizeStringArray(member.skills),
    responsibilities: sanitizeStringArray(member.responsibilities),
    specialNeeds: sanitizeStringArray(member.specialNeeds),
  };
}

/**
 * Content Security Policy nonce generator
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }
  
  // Check file type - only allow JSON for imports
  const allowedTypes = ['application/json', 'text/json'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JSON files are allowed' };
  }
  
  // Check file extension
  const allowedExtensions = ['.json'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Invalid file extension' };
  }
  
  // Sanitize file name
  const sanitizedName = sanitizeFileName(file.name);
  if (!sanitizedName || sanitizedName.length === 0) {
    return { isValid: false, error: 'Invalid file name' };
  }
  
  return { isValid: true };
}