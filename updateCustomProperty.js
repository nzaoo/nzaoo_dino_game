export function getCustomProperty(elem, prop) {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0
}

export function setCustomProperty(elem, prop, value) {
  elem.style.setProperty(prop, value)
}

export function incrementCustomProperty(elem, prop, inc) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc)
}

/**
 * Kiểm tra có vật cản nào đã tồn tại quá gần vị trí spawn mới không
 * @param {number} newLeft - vị trí left (theo %) muốn spawn vật cản mới
 * @param {number} minDistance - khoảng cách tối thiểu (px)
 * @returns {boolean}
 */
export function isObstacleTooCloseByLeft(newLeft, minDistance) {
  const obstacles = [
    ...document.querySelectorAll('[data-cactus]'),
    ...document.querySelectorAll('[data-bird]'),
    ...document.querySelectorAll('[data-rock]')
  ]
  return obstacles.some(obs => {
    // Lấy vị trí left hiện tại của vật cản (theo %)
    const obsLeft = parseFloat(obs.style.left || obs.style.getPropertyValue('--left'))
    // Chuyển đổi % sang px nếu cần thiết (hoặc so sánh trực tiếp nếu cùng đơn vị)
    // Ở đây so sánh trực tiếp vì các vật cản đều spawn ở 100%
    // Nếu vật cản đã có nằm trong khoảng minDistance so với vị trí spawn mới
    const obsRect = obs.getBoundingClientRect()
    // Chỉ kiểm tra các vật cản phía bên phải (chưa đi qua dino)
    return Math.abs(obsRect.left - newLeft) < minDistance
  })
}
