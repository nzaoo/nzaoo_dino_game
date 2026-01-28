/**
 * DINO RUNNER - Custom Property Utilities
 * Helper functions for CSS custom property manipulation
 */

/**
 * Get the numeric value of a CSS custom property
 * @param {HTMLElement} elem - The element to get the property from
 * @param {string} prop - The property name (e.g., "--left")
 * @returns {number} The numeric value or 0 if invalid
 */
export function getCustomProperty(elem, prop) {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0
}

/**
 * Set a CSS custom property on an element
 * @param {HTMLElement} elem - The element to set the property on
 * @param {string} prop - The property name (e.g., "--left")
 * @param {number|string} value - The value to set
 */
export function setCustomProperty(elem, prop, value) {
  elem.style.setProperty(prop, value)
}

/**
 * Increment a CSS custom property by a given amount
 * @param {HTMLElement} elem - The element to modify
 * @param {string} prop - The property name (e.g., "--left")
 * @param {number} inc - The amount to increment by
 */
export function incrementCustomProperty(elem, prop, inc) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc)
}
