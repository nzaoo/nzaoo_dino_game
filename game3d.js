/**
 * 🦖 DINO RUNNER 3D - Ultimate Edition
 * A 3D endless runner game using Three.js
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  // World
  worldWidth: 20,
  groundLength: 200,
  laneWidth: 3,
  
  // Dino
  dinoSize: 1,
  jumpHeight: 3.5,
  jumpDuration: 600,
  gravity: 0.015,
  
  // Game
  baseSpeed: 0.15,
  maxSpeed: 0.5,
  speedIncrement: 0.00005,
  obstacleInterval: { min: 1500, max: 3000 },
  powerupInterval: { min: 5000, max: 15000 },
  
  // Visual
  fogNear: 30,
  fogFar: 80,
  cameraHeight: 3,
  cameraDistance: 8,
};

// ==================== GAME STATE ====================
const state = {
  isRunning: false,
  isPaused: false,
  isGameOver: false,
  score: 0,
  highScore: parseInt(localStorage.getItem('highScore3D')) || 0,
  speed: CONFIG.baseSpeed,
  combo: 0,
  maxCombo: 0,
  
  // Dino state
  isJumping: false,
  isHoldingJump: false,
  jumpVelocity: 0,
  jumpStartTime: 0,
  dinoY: 0,
  isInvincible: false,
  
  // Settings
  selectedColor: 0x4ade80,
  selectedMode: 'classic',
  soundEnabled: true,
  effectsEnabled: true,
  quality: 'medium',
  
  // Timers
  lastObstacleTime: 0,
  lastPowerupTime: 0,
  obstacleInterval: 2000,
  
  reset() {
    this.score = 0;
    this.speed = CONFIG.baseSpeed;
    this.combo = 0;
    this.maxCombo = 0;
    this.isJumping = false;
    this.isHoldingJump = false;
    this.jumpVelocity = 0;
    this.dinoY = 0;
    this.isInvincible = false;
    this.lastObstacleTime = 0;
    this.lastPowerupTime = 0;
    this.isGameOver = false;
    this.isPaused = false;
    
    // Mode settings
    switch (this.selectedMode) {
      case 'turbo':
        this.speed = CONFIG.baseSpeed * 1.5;
        break;
      case 'nightmare':
        this.speed = CONFIG.baseSpeed * 2;
        this.obstacleInterval = 1200;
        break;
      default:
        this.speed = CONFIG.baseSpeed;
    }
  }
};

// ==================== THREE.JS SETUP ====================
let scene, camera, renderer;
let dino, ground, obstacles = [], powerups = [], particles = [];
let clock, mixer;

function initThreeJS() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, CONFIG.fogNear, CONFIG.fogFar);
  
  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, CONFIG.cameraHeight, CONFIG.cameraDistance);
  camera.lookAt(0, 1, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('game-container').appendChild(renderer.domElement);
  
  // Clock
  clock = new THREE.Clock();
  
  // Lights
  setupLights();
  
  // Create world
  createGround();
  createDino();
  createSkybox();
  
  // Handle resize
  window.addEventListener('resize', onWindowResize);
  
  // Start render loop
  animate();
}

function setupLights() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
  scene.add(ambientLight);
  
  // Main directional light (sun)
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(5, 10, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  scene.add(sunLight);
  
  // Colored accent lights
  const greenLight = new THREE.PointLight(0x4ade80, 0.5, 20);
  greenLight.position.set(-5, 3, 0);
  scene.add(greenLight);
  
  const blueLight = new THREE.PointLight(0x3b82f6, 0.5, 20);
  blueLight.position.set(5, 3, 0);
  scene.add(blueLight);
}

function createGround() {
  // Main ground
  const groundGeometry = new THREE.PlaneGeometry(CONFIG.worldWidth, CONFIG.groundLength, 50, 200);
  
  // Create procedural texture with lines
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#2a2a40';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grid lines
  ctx.strokeStyle = '#3a3a50';
  ctx.lineWidth = 2;
  
  // Horizontal lines
  for (let y = 0; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Vertical lines
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // Center line (glowing)
  const gradient = ctx.createLinearGradient(canvas.width/2 - 10, 0, canvas.width/2 + 10, 0);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, '#4ade80');
  gradient.addColorStop(1, 'transparent');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.stroke();
  
  const groundTexture = new THREE.CanvasTexture(canvas);
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(1, 10);
  
  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.2,
  });
  
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -CONFIG.groundLength / 2 + 10;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Side barriers (neon effect)
  const barrierGeometry = new THREE.BoxGeometry(0.2, 0.5, CONFIG.groundLength);
  const barrierMaterial = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    emissive: 0x4ade80,
    emissiveIntensity: 0.5,
  });
  
  const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
  leftBarrier.position.set(-CONFIG.worldWidth/2, 0.25, -CONFIG.groundLength/2 + 10);
  scene.add(leftBarrier);
  
  const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial.clone());
  rightBarrier.material.color.setHex(0x3b82f6);
  rightBarrier.material.emissive.setHex(0x3b82f6);
  rightBarrier.position.set(CONFIG.worldWidth/2, 0.25, -CONFIG.groundLength/2 + 10);
  scene.add(rightBarrier);
}

function createDino() {
  // Create a stylized low-poly dino
  const dinoGroup = new THREE.Group();
  
  // Body
  const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 1.2);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: state.selectedColor,
    roughness: 0.5,
    metalness: 0.3,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  body.castShadow = true;
  dinoGroup.add(body);
  
  // Head
  const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.8);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0, 1.1, 0.5);
  head.castShadow = true;
  dinoGroup.add(head);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.5,
  });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.2, 1.2, 0.85);
  dinoGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.2, 1.2, 0.85);
  dinoGroup.add(rightEye);
  
  // Pupils
  const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  leftPupil.position.set(-0.2, 1.2, 0.92);
  dinoGroup.add(leftPupil);
  
  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  rightPupil.position.set(0.2, 1.2, 0.92);
  dinoGroup.add(rightPupil);
  
  // Tail
  const tailGeometry = new THREE.ConeGeometry(0.2, 1, 4);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(0, 0.5, -0.8);
  tail.rotation.x = Math.PI / 2;
  tail.castShadow = true;
  dinoGroup.add(tail);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.25, 0.5, 0.25);
  
  const frontLeftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  frontLeftLeg.position.set(-0.25, 0.25, 0.3);
  frontLeftLeg.castShadow = true;
  dinoGroup.add(frontLeftLeg);
  
  const frontRightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  frontRightLeg.position.set(0.25, 0.25, 0.3);
  frontRightLeg.castShadow = true;
  dinoGroup.add(frontRightLeg);
  
  const backLeftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  backLeftLeg.position.set(-0.25, 0.25, -0.3);
  backLeftLeg.castShadow = true;
  dinoGroup.add(backLeftLeg);
  
  const backRightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  backRightLeg.position.set(0.25, 0.25, -0.3);
  backRightLeg.castShadow = true;
  dinoGroup.add(backRightLeg);
  
  // Glow effect
  const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: state.selectedColor,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.y = 0.7;
  glow.name = 'glow';
  dinoGroup.add(glow);
  
  dino = dinoGroup;
  dino.position.set(0, 0, 5);
  scene.add(dino);
}

function createSkybox() {
  // Create distant decorative elements
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 500;
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 200;
    starPositions[i + 1] = Math.random() * 50 + 10;
    starPositions[i + 2] = (Math.random() - 0.5) * 200;
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.3,
    transparent: true,
    opacity: 0.8,
  });
  
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  
  // Add floating cubes in background
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 2 + 0.5;
    const cubeGeometry = new THREE.BoxGeometry(size, size, size);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? 0x4ade80 : 0x3b82f6,
      transparent: true,
      opacity: 0.3,
      emissive: Math.random() > 0.5 ? 0x4ade80 : 0x3b82f6,
      emissiveIntensity: 0.2,
    });
    
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(
      (Math.random() - 0.5) * 60,
      Math.random() * 15 + 5,
      (Math.random() - 0.5) * 100 - 30
    );
    cube.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    cube.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02,
    };
    scene.add(cube);
    particles.push(cube);
  }
}

function createObstacle() {
  const types = ['cactus', 'rock', 'crystal'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let obstacle;
  
  switch (type) {
    case 'cactus':
      obstacle = createCactusObstacle();
      break;
    case 'rock':
      obstacle = createRockObstacle();
      break;
    case 'crystal':
      obstacle = createCrystalObstacle();
      break;
  }
  
  obstacle.position.set(0, 0, -CONFIG.groundLength / 2);
  obstacle.userData.type = 'obstacle';
  scene.add(obstacle);
  obstacles.push(obstacle);
}

function createCactusObstacle() {
  const group = new THREE.Group();
  
  // Main stem
  const stemGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.7,
  });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 1;
  stem.castShadow = true;
  group.add(stem);
  
  // Arms
  const armGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 6);
  
  const leftArm = new THREE.Mesh(armGeometry, stemMaterial);
  leftArm.position.set(-0.5, 1.2, 0);
  leftArm.rotation.z = Math.PI / 4;
  leftArm.castShadow = true;
  group.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, stemMaterial);
  rightArm.position.set(0.5, 1.5, 0);
  rightArm.rotation.z = -Math.PI / 4;
  rightArm.castShadow = true;
  group.add(rightArm);
  
  // Spikes (particles effect)
  const spikeGeometry = new THREE.ConeGeometry(0.05, 0.2, 4);
  const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0x166534 });
  
  for (let i = 0; i < 10; i++) {
    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
    const angle = (i / 10) * Math.PI * 2;
    spike.position.set(
      Math.cos(angle) * 0.35,
      0.5 + Math.random() * 1.5,
      Math.sin(angle) * 0.35
    );
    spike.lookAt(spike.position.clone().multiplyScalar(2));
    group.add(spike);
  }
  
  return group;
}

function createRockObstacle() {
  const group = new THREE.Group();
  
  // Main rock (icosahedron for rough look)
  const rockGeometry = new THREE.IcosahedronGeometry(0.8, 0);
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    roughness: 0.9,
    flatShading: true,
  });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  rock.position.y = 0.6;
  rock.scale.y = 0.8;
  rock.castShadow = true;
  group.add(rock);
  
  // Smaller rocks
  for (let i = 0; i < 3; i++) {
    const smallRock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.3, 0),
      rockMaterial
    );
    smallRock.position.set(
      (Math.random() - 0.5) * 1.5,
      0.2,
      (Math.random() - 0.5) * 1
    );
    smallRock.castShadow = true;
    group.add(smallRock);
  }
  
  return group;
}

function createCrystalObstacle() {
  const group = new THREE.Group();
  
  // Crystal (octahedron)
  const crystalGeometry = new THREE.OctahedronGeometry(0.6, 0);
  const crystalMaterial = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.9,
  });
  
  const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
  crystal.position.y = 1;
  crystal.scale.set(1, 2, 1);
  crystal.castShadow = true;
  crystal.userData.rotate = true;
  group.add(crystal);
  
  // Glow ring
  const ringGeometry = new THREE.TorusGeometry(0.8, 0.05, 8, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.5,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.y = 0.5;
  ring.rotation.x = Math.PI / 2;
  ring.userData.rotate = true;
  group.add(ring);
  
  return group;
}

function createPowerup() {
  const types = ['shield', 'speed', 'points'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let color, emissive;
  switch (type) {
    case 'shield':
      color = 0x3b82f6;
      emissive = 0x3b82f6;
      break;
    case 'speed':
      color = 0xf59e0b;
      emissive = 0xf59e0b;
      break;
    case 'points':
      color = 0x22c55e;
      emissive = 0x22c55e;
      break;
  }
  
  const group = new THREE.Group();
  
  // Main sphere
  const sphereGeometry = new THREE.OctahedronGeometry(0.4, 2);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: emissive,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.7,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = true;
  group.add(sphere);
  
  // Outer ring
  const ringGeometry = new THREE.TorusGeometry(0.6, 0.05, 8, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  
  // Glow
  const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.2,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);
  
  group.position.set(0, 1.5, -CONFIG.groundLength / 2);
  group.userData.type = 'powerup';
  group.userData.powerupType = type;
  
  scene.add(group);
  powerups.push(group);
}

// ==================== GAME LOOP ====================
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  if (state.isRunning && !state.isPaused && !state.isGameOver) {
    updateGame(delta);
  }
  
  // Always update visual effects
  updateVisuals(delta);
  
  renderer.render(scene, camera);
}

function updateGame(delta) {
  const now = Date.now();
  
  // Update speed
  if (state.selectedMode !== 'endless') {
    state.speed = Math.min(state.speed + CONFIG.speedIncrement, CONFIG.maxSpeed);
  }
  
  // Update score
  state.score += delta * 100 * (state.speed / CONFIG.baseSpeed);
  updateScoreDisplay();
  
  // Update ground texture scrolling
  if (ground.material.map) {
    ground.material.map.offset.y -= state.speed * delta * 10;
  }
  
  // Update dino
  updateDino(delta);
  
  // Update obstacles
  updateObstacles(delta);
  
  // Update powerups
  updatePowerups(delta);
  
  // Spawn obstacles
  if (now - state.lastObstacleTime > state.obstacleInterval) {
    createObstacle();
    state.lastObstacleTime = now;
    state.obstacleInterval = randomBetween(
      CONFIG.obstacleInterval.min,
      CONFIG.obstacleInterval.max
    ) / (state.speed / CONFIG.baseSpeed);
  }
  
  // Spawn powerups
  if (now - state.lastPowerupTime > randomBetween(CONFIG.powerupInterval.min, CONFIG.powerupInterval.max)) {
    createPowerup();
    state.lastPowerupTime = now;
  }
  
  // Check collisions
  checkCollisions();
  
  // Update speed indicator
  const speedPercent = ((state.speed - CONFIG.baseSpeed) / (CONFIG.maxSpeed - CONFIG.baseSpeed)) * 100;
  document.getElementById('speed-fill').style.width = `${Math.min(speedPercent + 20, 100)}%`;
}

function updateDino(delta) {
  if (state.isJumping) {
    state.dinoY += state.jumpVelocity;
    state.jumpVelocity -= CONFIG.gravity;
    
    // Extended jump when holding
    if (state.isHoldingJump && state.jumpVelocity > 0) {
      state.jumpVelocity -= CONFIG.gravity * 0.3;
    }
    
    if (state.dinoY <= 0) {
      state.dinoY = 0;
      state.isJumping = false;
      state.isHoldingJump = false;
      state.jumpVelocity = 0;
    }
    
    dino.position.y = state.dinoY;
  }
  
  // Running animation (bob up and down)
  if (!state.isJumping) {
    dino.position.y = Math.sin(Date.now() * 0.01) * 0.05;
  }
  
  // Leg animation
  const legs = dino.children.filter((_, i) => i >= 6 && i <= 9);
  legs.forEach((leg, i) => {
    const offset = i < 2 ? 0 : Math.PI;
    leg.position.y = 0.25 + Math.sin(Date.now() * 0.015 + offset) * 0.1;
  });
}

function updateObstacles(delta) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.position.z += state.speed;
    
    // Rotate crystals
    obstacle.children.forEach(child => {
      if (child.userData.rotate) {
        child.rotation.y += 0.02;
      }
    });
    
    // Remove if past camera
    if (obstacle.position.z > 10) {
      scene.remove(obstacle);
      obstacles.splice(i, 1);
      
      // Combo system
      state.combo++;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      
      if (state.combo >= 3) {
        state.score += state.combo * 10;
        showCombo(state.combo);
      }
    }
  }
}

function updatePowerups(delta) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const powerup = powerups[i];
    powerup.position.z += state.speed;
    
    // Rotate and float
    powerup.rotation.y += 0.03;
    powerup.position.y = 1.5 + Math.sin(Date.now() * 0.005) * 0.3;
    
    // Remove if past camera
    if (powerup.position.z > 10) {
      scene.remove(powerup);
      powerups.splice(i, 1);
    }
  }
}

function updateVisuals(delta) {
  // Rotate background particles
  particles.forEach(particle => {
    if (particle.userData.rotationSpeed) {
      particle.rotation.x += particle.userData.rotationSpeed.x;
      particle.rotation.y += particle.userData.rotationSpeed.y;
      particle.rotation.z += particle.userData.rotationSpeed.z;
    }
  });
  
  // Dino glow pulse
  if (dino) {
    const glow = dino.getObjectByName('glow');
    if (glow) {
      glow.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
      
      if (state.isInvincible) {
        glow.material.opacity = 0.4;
        glow.material.color.setHex(0x3b82f6);
      } else {
        glow.material.opacity = 0.15;
        glow.material.color.setHex(state.selectedColor);
      }
    }
  }
}

function checkCollisions() {
  if (state.isInvincible) return;
  
  const dinoBox = new THREE.Box3().setFromObject(dino);
  dinoBox.min.add(new THREE.Vector3(0.2, 0.2, 0.2));
  dinoBox.max.sub(new THREE.Vector3(0.2, 0.2, 0.2));
  
  // Check obstacles
  for (const obstacle of obstacles) {
    const obstacleBox = new THREE.Box3().setFromObject(obstacle);
    
    if (dinoBox.intersectsBox(obstacleBox)) {
      gameOver();
      return;
    }
  }
  
  // Check powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const powerup = powerups[i];
    const powerupBox = new THREE.Box3().setFromObject(powerup);
    
    if (dinoBox.intersectsBox(powerupBox)) {
      collectPowerup(powerup.userData.powerupType);
      scene.remove(powerup);
      powerups.splice(i, 1);
    }
  }
}

function collectPowerup(type) {
  showToast(`✨ ${type.toUpperCase()} POWER!`, 'success');
  
  switch (type) {
    case 'shield':
      state.isInvincible = true;
      setTimeout(() => { state.isInvincible = false; }, 5000);
      break;
    case 'speed':
      state.score += 200;
      break;
    case 'points':
      state.score += 500;
      break;
  }
  
  // Create particle burst effect
  createParticleBurst(dino.position);
}

function createParticleBurst(position) {
  const particleCount = 20;
  const burstParticles = [];
  
  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: state.selectedColor,
      transparent: true,
      opacity: 1,
    });
    const particle = new THREE.Mesh(geometry, material);
    
    particle.position.copy(position);
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.3,
      (Math.random() - 0.5) * 0.3
    );
    
    scene.add(particle);
    burstParticles.push(particle);
  }
  
  // Animate and remove
  let frame = 0;
  const animateBurst = () => {
    frame++;
    burstParticles.forEach(p => {
      p.position.add(p.userData.velocity);
      p.userData.velocity.y -= 0.01;
      p.material.opacity -= 0.02;
      p.scale.multiplyScalar(0.98);
    });
    
    if (frame < 50) {
      requestAnimationFrame(animateBurst);
    } else {
      burstParticles.forEach(p => scene.remove(p));
    }
  };
  animateBurst();
}

// ==================== GAME CONTROLS ====================
function startGame() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('start-overlay').classList.add('visible');
  document.getElementById('hud').classList.add('visible');
  
  state.reset();
  clearObstacles();
  updateDinoColor();
  updateHighScoreDisplay();
  
  state.isRunning = true;
}

function beginGame() {
  document.getElementById('start-overlay').classList.remove('visible');
  state.lastObstacleTime = Date.now();
  state.lastPowerupTime = Date.now();
}

function gameOver() {
  state.isGameOver = true;
  state.isRunning = false;
  state.combo = 0;
  
  const finalScore = Math.floor(state.score);
  const isNewRecord = finalScore > state.highScore;
  
  if (isNewRecord) {
    state.highScore = finalScore;
    localStorage.setItem('highScore3D', state.highScore);
  }
  
  // Update UI
  document.getElementById('final-score').textContent = finalScore;
  document.getElementById('final-high').textContent = state.highScore;
  document.getElementById('final-combo').textContent = state.maxCombo;
  document.getElementById('new-record').classList.toggle('visible', isNewRecord);
  document.getElementById('gameover-message').textContent = getGameOverMessage(finalScore);
  document.getElementById('game-over').classList.add('visible');
  
  // Add to leaderboard
  addToLeaderboard(finalScore);
  
  // Play sound
  playSound('hit');
}

function restartGame() {
  document.getElementById('game-over').classList.remove('visible');
  startGame();
  setTimeout(beginGame, 100);
}

function showMainMenu() {
  document.getElementById('game-over').classList.remove('visible');
  document.getElementById('pause-menu').classList.remove('visible');
  document.getElementById('start-overlay').classList.remove('visible');
  document.getElementById('hud').classList.remove('visible');
  document.getElementById('main-menu').classList.remove('hidden');
  
  state.isRunning = false;
  state.isGameOver = false;
  state.isPaused = false;
  
  clearObstacles();
}

function togglePause() {
  if (!state.isRunning || state.isGameOver) return;
  
  state.isPaused = !state.isPaused;
  document.getElementById('pause-menu').classList.toggle('visible', state.isPaused);
}

function clearObstacles() {
  obstacles.forEach(o => scene.remove(o));
  obstacles = [];
  powerups.forEach(p => scene.remove(p));
  powerups = [];
}

function jump() {
  if (!state.isRunning || state.isPaused || state.isGameOver) return;
  
  // Start game on first jump
  if (document.getElementById('start-overlay').classList.contains('visible')) {
    beginGame();
  }
  
  if (!state.isJumping) {
    state.isJumping = true;
    state.isHoldingJump = true;
    state.jumpVelocity = 0.3;
    playSound('jump');
  }
}

function releaseJump() {
  state.isHoldingJump = false;
}

// ==================== UI FUNCTIONS ====================
function updateScoreDisplay() {
  document.getElementById('score').textContent = Math.floor(state.score);
}

function updateHighScoreDisplay() {
  document.getElementById('high-score').textContent = state.highScore;
}

function showCombo(count) {
  const combo = document.getElementById('combo');
  combo.textContent = `🔥 COMBO x${count}!`;
  combo.classList.add('visible');
  
  setTimeout(() => combo.classList.remove('visible'), 1500);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

function getGameOverMessage(score) {
  if (score >= 5000) return '🏆 Huyền thoại! Bạn quá xuất sắc!';
  if (score >= 2000) return '⭐ Tuyệt vời! Bạn là cao thủ!';
  if (score >= 1000) return '👍 Rất tốt! Tiếp tục phát huy!';
  if (score >= 500) return '💪 Khá lắm! Cố lên nào!';
  return '🎮 Đừng bỏ cuộc! Thử lại nhé!';
}

function updateDinoColor() {
  if (!dino) return;
  
  dino.children.forEach(child => {
    if (child.material && child.material.color && child.name !== 'glow') {
      if (child.geometry.type === 'BoxGeometry' || 
          child.geometry.type === 'ConeGeometry') {
        child.material.color.setHex(state.selectedColor);
      }
    }
  });
}

// ==================== LEADERBOARD ====================
function loadLeaderboard() {
  const data = JSON.parse(localStorage.getItem('leaderboard3D') || '[]');
  const list = document.getElementById('leaderboard-list');
  
  if (data.length === 0) {
    list.innerHTML = '<div class="empty-leaderboard">🎮 Chưa có điểm số nào</div>';
    return;
  }
  
  list.innerHTML = data.map((entry, i) => `
    <div class="leaderboard-item ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">
      <span class="lb-rank">${i + 1}</span>
      <span class="lb-score">${entry.score}</span>
      <span class="lb-date">${new Date(entry.date).toLocaleDateString('vi-VN')}</span>
    </div>
  `).join('');
}

function addToLeaderboard(score) {
  const data = JSON.parse(localStorage.getItem('leaderboard3D') || '[]');
  data.push({ score, date: new Date().toISOString() });
  data.sort((a, b) => b.score - a.score);
  data.splice(10);
  localStorage.setItem('leaderboard3D', JSON.stringify(data));
}

function clearLeaderboard() {
  if (confirm('Xóa toàn bộ bảng xếp hạng?')) {
    localStorage.removeItem('leaderboard3D');
    loadLeaderboard();
    showToast('🗑️ Đã xóa bảng xếp hạng', 'warning');
  }
}

// ==================== AUDIO ====================
function playSound(name) {
  if (!state.soundEnabled) return;
  
  // Create and play sound (simple beep for now)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (name) {
      case 'jump':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.1;
        break;
      case 'hit':
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.2;
        break;
      case 'powerup':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported
  }
}

// ==================== UTILITIES ====================
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    } else if (e.code === 'Escape') {
      togglePause();
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      releaseJump();
    }
  });
  
  // Touch/Click for jump
  document.getElementById('game-container').addEventListener('click', jump);
  document.getElementById('game-container').addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
  });
  document.getElementById('game-container').addEventListener('touchend', releaseJump);
  
  // Menu buttons
  document.getElementById('play-btn').addEventListener('click', startGame);
  document.getElementById('retry-btn').addEventListener('click', restartGame);
  document.getElementById('menu-btn').addEventListener('click', showMainMenu);
  document.getElementById('resume-btn').addEventListener('click', togglePause);
  document.getElementById('quit-btn').addEventListener('click', showMainMenu);
  document.getElementById('pause-btn').addEventListener('click', togglePause);
  
  // Character select
  document.querySelectorAll('.char-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedColor = parseInt(btn.dataset.color);
      updateDinoColor();
    });
  });
  
  // Mode select
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedMode = btn.dataset.mode;
    });
  });
  
  // Modals
  document.getElementById('leaderboard-btn').addEventListener('click', () => {
    loadLeaderboard();
    document.getElementById('leaderboard-modal').classList.add('visible');
  });
  
  document.getElementById('close-leaderboard').addEventListener('click', () => {
    document.getElementById('leaderboard-modal').classList.remove('visible');
  });
  
  document.getElementById('clear-leaderboard').addEventListener('click', clearLeaderboard);
  
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('visible');
  });
  
  document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('visible');
  });
  
  // Settings
  document.getElementById('sound-toggle').addEventListener('change', (e) => {
    state.soundEnabled = e.target.checked;
  });
  
  document.getElementById('sound-btn').addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    document.getElementById('sound-btn').textContent = state.soundEnabled ? '🔊' : '🔇';
  });
}

// ==================== INITIALIZATION ====================
function init() {
  initThreeJS();
  setupEventListeners();
  updateHighScoreDisplay();
  
  console.log('🦖 Dino Runner 3D initialized!');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
