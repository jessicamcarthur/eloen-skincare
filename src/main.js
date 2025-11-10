gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

// ========== MAIN PRODUCT SCENE ==========
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.5, 3);

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-3, 0, -3);
scene.add(fillLight);

const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
topLight.position.set(0, 10, 0);
scene.add(topLight);

const loader = new THREE.GLTFLoader();

// Load main jar model
loader.load('public/branded-jar.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(0, 0.4, 0);
  model.rotation.set(-2 * (Math.PI / 180), Math.PI + (90 * Math.PI / 180), 0);
  model.scale.set(2.4, 2.4, 2.4);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.needsUpdate = true;

        if (child.material.transparent) {
          child.material.depthWrite = false;
        }

        if (child.material.metalness !== undefined) {
          child.material.metalness = Math.min(child.material.metalness, 0.5);
        }
        if (child.material.roughness !== undefined) {
          child.material.roughness = Math.max(child.material.roughness, 0.3);
        }
      }
    }
  });

  scene.add(model);

  const initialY = model.rotation.y;
  const initialPosY = model.position.y;

  // Create main timeline for better performance
  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: '+=500vh',
      scrub: 1.5, // Slightly higher scrub value for smoother feel
      invalidateOnRefresh: true
    }
  });

  // Scroll hint fade out
  gsap.to('.scroll-hint', {
    opacity: 0,
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'top -100',
      scrub: 1
    }
  });

  // Background fade out with improved easing
  gsap.to('.hero img', {
    scale: 1.5,
    opacity: 0,
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: '+=150vh',
      scrub: 1.5
    }
  });

  // Combined model animations in single timeline
  mainTimeline
    .to(model.rotation, {
      y: initialY + Math.PI * 2,
      ease: 'none'
    }, 0)
    .to(model.position, {
      y: initialPosY - 0.3,
      ease: 'none'
    }, 0);

  // Concern text animations with improved timing
  const concerns = document.querySelectorAll('.concern-text');
  concerns.forEach((concern, index) => {
    const parent = concern.parentElement;
    
    // Fade in with smooth easing
    gsap.fromTo(concern,
      { 
        opacity: 0, 
        visibility: 'hidden', 
        y: 50,
        willChange: 'transform, opacity' // Hint browser for optimization
      },
      {
        opacity: 1,
        visibility: 'visible',
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: parent,
          start: 'top 75%',
          end: 'top 45%',
          scrub: 1.2
        }
      }
    );

    // Fade out with smooth easing
    gsap.to(concern, {
      opacity: 0,
      y: -50,
      ease: 'power2.in',
      scrollTrigger: {
        trigger: parent,
        start: 'bottom 65%',
        end: 'bottom 25%',
        scrub: 1.2,
        onLeave: () => {
          concern.style.willChange = 'auto'; // Remove optimization hint
        }
      }
    });
  });

  // Canvas fade out
  gsap.to(canvas, {
    opacity: 0,
    scrollTrigger: {
      trigger: '#concern-3',
      start: 'bottom 70%',
      end: 'bottom 30%',
      scrub: 1.5
    }
  });
});

// ========== INGREDIENTS SECTION ==========
const ingredientCanvas = document.getElementById('ingredient-canvas');

const ingredientScene = new THREE.Scene();
ingredientScene.background = null;

const ingredientCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
ingredientCamera.position.set(0, 0, 8);

const ingredientRenderer = new THREE.WebGLRenderer({ 
  canvas: ingredientCanvas, 
  antialias: true, 
  alpha: true 
});
ingredientRenderer.setSize(window.innerWidth, window.innerHeight);
ingredientRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
ingredientRenderer.outputEncoding = THREE.sRGBEncoding;
ingredientRenderer.shadowMap.enabled = true;
ingredientRenderer.setClearColor(0x000000, 0);

const ingredientAmbient = new THREE.AmbientLight(0xffffff, 1.5);
ingredientScene.add(ingredientAmbient);

const ingredientDirectional = new THREE.DirectionalLight(0xffffff, 2.5);
ingredientDirectional.position.set(5, 10, 5);
ingredientDirectional.castShadow = true;
ingredientScene.add(ingredientDirectional);

const ingredientFill = new THREE.DirectionalLight(0xfff5e6, 1.5);
ingredientFill.position.set(-5, 5, -5);
ingredientScene.add(ingredientFill);

const ingredientBackLight = new THREE.DirectionalLight(0xffffff, 1.0);
ingredientBackLight.position.set(0, 5, -5);
ingredientScene.add(ingredientBackLight);

let mandarinTree;
let mandarinFruit;

// Load mandarin tree
loader.load('public/tree.glb', (gltf) => {
  mandarinTree = gltf.scene;
  mandarinTree.position.set(0.4, -0.8, 0);
  mandarinTree.scale.set(2, 2, 2);
  
  mandarinTree.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.needsUpdate = true;
      }
    }
  });
  
  ingredientScene.add(mandarinTree);
  
  // Load mandarin fruit
  loader.load('public/mandarin.glb', (gltf) => {
    mandarinFruit = gltf.scene;
    mandarinFruit.position.set(0, 4, 0); // Start high on the tree
    mandarinFruit.scale.set(0.5, 0.5, 0.5);
    
    mandarinFruit.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
    
    ingredientScene.add(mandarinFruit);
    
    setupTreeAnimation();
  });
});

function setupTreeAnimation() {
  const ingredientTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#mandarin-tree',
      start: 'top 60%',
      end: 'bottom top',
      scrub: 1.5,
      invalidateOnRefresh: true
    }
  });
  
  // Fade in the canvas
  gsap.fromTo(ingredientCanvas,
    { opacity: 0, visibility: 'hidden' },
    {
      opacity: 1,
      visibility: 'visible',
      scrollTrigger: {
        trigger: '#mandarin-tree',
        start: 'top 50%',
        end: 'top 20%',
        scrub: 1.5
      }
    }
  );
  
  // Fade in the tree text with stagger
  gsap.fromTo(['#tree-left', '#tree-right'],
    { 
      opacity: 0, 
      visibility: 'hidden',
      willChange: 'transform, opacity'
    },
    {
      opacity: 1,
      visibility: 'visible',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '#mandarin-tree',
        start: 'top 40%',
        end: 'top 20%',
        scrub: 1.5
      }
    }
  );
  
  // Scale up the tree smoothly
  ingredientTimeline.to(mandarinTree.scale, {
    x: 9,
    y: 9,
    z: 9,
    ease: 'power1.inOut'
  }, 0);

  // Fade out tree text at end of section
  gsap.to(['#tree-left', '#tree-right'], {
    opacity: 0,
    scrollTrigger: {
      trigger: '#mandarin-tree',
      start: 'bottom 50%',
      end: 'bottom 20%',
      scrub: 1.5,
      onLeave: () => {
        document.querySelectorAll('#tree-left, #tree-right').forEach(el => {
          el.style.willChange = 'auto';
        });
      }
    }
  });
  
  // ========== MANDARIN FALL SECTION ==========
  
  // Fade in fall text - after tree text fades
  gsap.fromTo(['#fall-left', '#fall-right'],
    { 
      opacity: 0, 
      visibility: 'hidden',
      willChange: 'transform, opacity'
    },
    {
      opacity: 1,
      visibility: 'visible',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '#mandarin-fall',
        start: 'top 70%',
        end: 'top 50%',
        scrub: 1.5
      }
    }
  );
  
  // Camera moves down the tree
  gsap.to(ingredientCamera.position, {
    y: -6,
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.5
    }
  });
  
  // Mandarin falls with camera
  gsap.to(mandarinFruit.position, {
    y: -6,
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.5
    }
  });
  
  // Add slight rotation to falling mandarin for realism
  gsap.to(mandarinFruit.rotation, {
    z: Math.PI * 2,
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.5
    }
  });
  
  // Fade out fall text
  gsap.to(['#fall-left', '#fall-right'], {
    opacity: 0,
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'bottom 40%',
      end: 'bottom 10%',
      scrub: 1.5,
      onLeave: () => {
        document.querySelectorAll('#fall-left, #fall-right').forEach(el => {
          el.style.willChange = 'auto';
        });
      }
    }
  });
  
  // Fade out ingredient canvas at the end
  gsap.to(ingredientCanvas, {
    opacity: 0,
    visibility: 'hidden',
    scrollTrigger: {
      trigger: '#mandarin-split',
      start: 'top 50%',
      end: 'top 20%',
      scrub: 1.5
    }
  });
}

// ========== WINDOW RESIZE WITH DEBOUNCE ==========
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    ingredientCamera.aspect = window.innerWidth / window.innerHeight;
    ingredientCamera.updateProjectionMatrix();
    ingredientRenderer.setSize(window.innerWidth, window.innerHeight);
    
    ScrollTrigger.refresh();
  }, 250);
});

// ========== OPTIMIZED ANIMATION LOOP ==========
let lastRenderTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function animate(currentTime) {
  requestAnimationFrame(animate);
  
  const deltaTime = currentTime - lastRenderTime;
  
  if (deltaTime >= frameInterval) {
    lastRenderTime = currentTime - (deltaTime % frameInterval);
    
    renderer.render(scene, camera);
    ingredientRenderer.render(ingredientScene, ingredientCamera);
  }
}
animate(0);