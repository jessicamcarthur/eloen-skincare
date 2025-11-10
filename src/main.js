gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

// ========== SCROLL TEXT ANIMATION ==========
const textElement = document.getElementById('concernText');
if (textElement) {
  const text = textElement.textContent;
  textElement.innerHTML = '';

  // Split text into individual characters
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    textElement.appendChild(span);
  });

  const spans = textElement.querySelectorAll('span');
  const scrollTextSection = document.querySelector('.scroll-text-section');

  function updateTextColors() {
    const sectionTop = scrollTextSection.offsetTop;
    const sectionHeight = scrollTextSection.offsetHeight;
    const scrollPos = window.scrollY;

    const rawProgress = (scrollPos - sectionTop) / sectionHeight;

    const delayThreshold = 0.2;

    if (rawProgress < delayThreshold) {
      spans.forEach(span => span.classList.remove('active'));
      return;
    }

    const adjustedProgress = (rawProgress - delayThreshold) / (1 - delayThreshold);
    const clampedProgress = Math.max(0, Math.min(1, adjustedProgress));

    const totalSpans = spans.length;
    const activeCount = Math.floor(clampedProgress * totalSpans * 2.0);

    spans.forEach((span, index) => {
      if (index < activeCount) {
        span.classList.add('active');
      } else {
        span.classList.remove('active');
      }
    });
  }

  updateTextColors();

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTextColors();
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ========== MAIN PRODUCT SCENE ==========
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5.5, 0.8, 7);
camera.lookAt(-4, -0.6, 0);

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.4);
directionalLight.position.set(4.5, 5.5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
fillLight.position.set(-3.5, 1, -3);
scene.add(fillLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1.6);
topLight.position.set(0.5, 9, 2.5);
scene.add(topLight);

const loader = new THREE.GLTFLoader();

// Load main jar model
loader.load('/cream-jar.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(-4, -1, 0);
  model.rotation.set(
    -1.3,
    Math.PI * 1.37,
    Math.PI * -0.2
  );
  model.scale.set(2.5, 2.5, 2.5);

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

  loader.load('public/wedge.glb', (wedgeGltf) => {
    const wedge = wedgeGltf.scene;
    wedge.position.set(-0.36, 0.72, -0.42);
    wedge.rotation.set(-0.65, Math.PI * 1.20, 0.34);
    wedge.scale.setScalar(0.8);

    wedge.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.material.transparent) {
            child.material.depthWrite = false;
          }
          if (child.material.metalness !== undefined) {
            child.material.metalness = Math.min(child.material.metalness, 0.4);
          }
          if (child.material.roughness !== undefined) {
            child.material.roughness = Math.max(child.material.roughness, 0.35);
          }
        }
      }
    });

    model.add(wedge);
    model.userData.wedge = wedge;
  });

  loader.load('public/leaves.glb', (leavesGltf) => {
    const leaves = leavesGltf.scene;
    leaves.position.set(-1.03, -0.24, 0.8);
    leaves.rotation.set(-0.12, Math.PI * 2.11, 0.10);
    leaves.scale.setScalar(0.73);

    leaves.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.material.transparent) {
            child.material.depthWrite = false;
          }
          if (child.material.metalness !== undefined) {
            child.material.metalness = Math.min(child.material.metalness, 0.35);
          }
          if (child.material.roughness !== undefined) {
            child.material.roughness = Math.max(child.material.roughness, 0.4);
          }
        }
      }
    });

    model.add(leaves);
    leaves.position.z -= 0.15;
    model.userData.leaves = leaves;
  });

  const initialY = model.rotation.y;
  const initialPosY = model.position.y;

  // Create main timeline for better performance
  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: '+=400vh',
      scrub: 1.5,
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
  gsap.fromTo('.hero img',
    { opacity: 0.6 },
    {
      scale: 1.5,
      opacity: 0,
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: '+=250vh',
        scrub: 1.5
      }
    }
  );

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

  const updateAccentVisibility = () => {
    const shouldShow = mainTimeline.progress() <= 0.05;
    const wedge = model.userData.wedge;
    const leaves = model.userData.leaves;
    if (wedge) {
      wedge.visible = shouldShow;
    }
    if (leaves) {
      leaves.visible = shouldShow;
    }
  };

  mainTimeline.eventCallback('onUpdate', updateAccentVisibility);
  mainTimeline.eventCallback('onReverseComplete', updateAccentVisibility);
  updateAccentVisibility();

  // Canvas fade out
  gsap.to(canvas, {
    opacity: 0,
    scrollTrigger: {
      trigger: '.scroll-text-section',
      start: 'bottom 80%',
      end: 'bottom 50%',
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
ingredientRenderer.toneMapping = THREE.ACESFilmicToneMapping;
ingredientRenderer.toneMappingExposure = 1
ingredientRenderer.shadowMap.enabled = true;
ingredientRenderer.setClearColor(0x000000, 0);

const ingredientAmbient = new THREE.AmbientLight(0xffffff, 0.7);
ingredientScene.add(ingredientAmbient);

const ingredientDirectional = new THREE.DirectionalLight(0xffffff, 1);
ingredientDirectional.position.set(5, 10, 5);
ingredientDirectional.castShadow = true;
ingredientScene.add(ingredientDirectional);

const ingredientFill = new THREE.DirectionalLight(0xfff5e6, 0.4);
ingredientFill.position.set(-5, 5, -5);
ingredientScene.add(ingredientFill);

const ingredientBackLight = new THREE.DirectionalLight(0xffffff, 0.4);
ingredientBackLight.position.set(0, 5, -5);
ingredientScene.add(ingredientBackLight);

let mandarinTree;
let mandarinFruit;
let splitMandarin;
const mandarinFruitMaterials = [];
const splitMandarinMaterials = [];
const mandarinFruitOpacity = { value: 0 };
const splitMandarinOpacity = { value: 0 };

const updateMandarinFruitOpacity = () => {
  mandarinFruitMaterials.forEach((material) => {
    material.opacity = mandarinFruitOpacity.value;
    material.needsUpdate = true;
  });
  if (mandarinFruit) {
    mandarinFruit.visible = mandarinFruitOpacity.value > 0.02;
  }
};

const updateSplitMandarinOpacity = () => {
  splitMandarinMaterials.forEach((material) => {
    material.opacity = splitMandarinOpacity.value;
    material.needsUpdate = true;
  });
  if (splitMandarin) {
    splitMandarin.visible = splitMandarinOpacity.value > 0.02;
  }
};

const showMandarinFruit = () => {
  if (!mandarinFruit) {
    return;
  }
  gsap.killTweensOf(mandarinFruitOpacity);
  mandarinFruit.visible = true;
  gsap.to(mandarinFruitOpacity, {
    value: 1,
    duration: 0.5,
    ease: 'power2.out',
    onUpdate: updateMandarinFruitOpacity
  });
};

const hideMandarinFruit = () => {
  if (!mandarinFruit) {
    return;
  }
  gsap.killTweensOf(mandarinFruitOpacity);
  gsap.to(mandarinFruitOpacity, {
    value: 0,
    duration: 0.4,
    ease: 'power2.in',
    onUpdate: updateMandarinFruitOpacity,
    onComplete: () => {
      if (mandarinFruitOpacity.value <= 0.02 && mandarinFruit) {
        mandarinFruit.visible = false;
      }
    }
  });
};

const showSplitMandarin = () => {
  if (!splitMandarin) {
    return;
  }
  gsap.killTweensOf(splitMandarinOpacity);
  splitMandarin.visible = true;
  gsap.to(splitMandarinOpacity, {
    value: 1,
    duration: 0.55,
    ease: 'power2.out',
    onUpdate: updateSplitMandarinOpacity
  });
};

const hideSplitMandarin = () => {
  if (!splitMandarin) {
    return;
  }
  gsap.killTweensOf(splitMandarinOpacity);
  gsap.to(splitMandarinOpacity, {
    value: 0,
    duration: 0.45,
    ease: 'power2.in',
    onUpdate: updateSplitMandarinOpacity,
    onComplete: () => {
      if (splitMandarinOpacity.value <= 0.02 && splitMandarin) {
        splitMandarin.visible = false;
      }
    }
  });
};

// Load mandarin tree PNG as a texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/mandarin-tree2.png', (texture) => {
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  const aspectRatio = texture.image.width / texture.image.height;
  const height = 6; // Set your desired height
  const width = height * aspectRatio;
  // Create a plane geometry for the tree
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.0,
    premultipliedAlpha: false,
    side: THREE.DoubleSide
  });

  mandarinTree = new THREE.Mesh(geometry, material);
  mandarinTree.position.set(0.5, -2.15, 0);
  mandarinTree.scale.set(1.7, 1.7, 1.7);

  ingredientScene.add(mandarinTree);

  // Load mandarin fruit
  loader.load('public/mandarin.glb', (gltf) => {
    mandarinFruit = gltf.scene;
    mandarinFruit.position.set(0, 4, 0);
    mandarinFruit.scale.set(0.5, 0.5, 0.5);

    // Hide it immediately
    mandarinFruit.visible = false;
    mandarinFruitMaterials.length = 0;

    mandarinFruit.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.needsUpdate = true;
          child.material.transparent = true;
          child.material.opacity = mandarinFruitOpacity.value;
          mandarinFruitMaterials.push(child.material);
        }
      }
    });

    updateMandarinFruitOpacity();
    ingredientScene.add(mandarinFruit);

    // Load split mandarin
    loader.load('public/split-mandarin.glb', (gltf) => {
      splitMandarin = gltf.scene;
      splitMandarin.position.set(0.16, -5.1, 1);
      splitMandarin.scale.set(0.9, 0.9, 0.9);
      splitMandarin.rotation.set(Math.PI * 1.6, Math.PI * 1.4, 0);
      splitMandarin.visible = false;
      splitMandarinMaterials.length = 0;

      splitMandarin.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            child.material.needsUpdate = true;
            child.material.transparent = true;
            child.material.opacity = splitMandarinOpacity.value;
            splitMandarinMaterials.push(child.material);
          }
        }
      });

      updateSplitMandarinOpacity();
      ingredientScene.add(splitMandarin);

      setupTreeAnimation();
    });
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
        start: 'top 80%',
        end: 'top 40%',
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
      stagger: 0,
      scrollTrigger: {
        trigger: '#mandarin-tree',
        start: 'top 60%',
        end: 'top 90%',
        scrub: 1.5
      }
    }
  );

  // Scale up the tree ONCE
  gsap.to(mandarinTree.scale, {
    x: 4,
    y: 4,
    z: 4,
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: '#mandarin-tree',
      start: 'top 60%',
      end: 'bottom 60%',
      scrub: 1.5
    }
  });

  // Fade out tree text at end of section
  gsap.to(['#tree-left', '#tree-right'], {
    opacity: 0,
    scrollTrigger: {
      trigger: '#mandarin-tree',
      start: 'bottom 70%',
      end: 'bottom 50%',
      scrub: 1.5,
      onLeave: () => {
        document.querySelectorAll('#tree-left, #tree-right').forEach(el => {
          el.style.willChange = 'auto';
        });
      }
    }
  });

  // ========== MANDARIN FALL SECTION ==========

  // Fade in fall text - as tree starts moving up
  gsap.fromTo(['#fall-left', '#fall-right'],
    {
      opacity: 0,
      visibility: 'hidden',
      willChange: 'transform, opacity'
    },
    {
      opacity: 1,
      visibility: 'visible',
      stagger: 0,
      scrollTrigger: {
        trigger: '#mandarin-fall',
        start: 'top 70%',
        end: 'top 50%',
        scrub: 1.5
      }
    }
  );

  // Move tree UP as mandarin falls (following the mandarin)
  gsap.to(mandarinTree.position, {
    y: 3.7,
    ease: 'none',
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'top 80%',
      end: 'top 60%',
      scrub: 1.5
    }
  });

  // Hide mandarin initially
  mandarinFruit.position.set(0, 7, 2);
  mandarinFruit.visible = false;
  mandarinFruitOpacity.value = 0;
  updateMandarinFruitOpacity();

  ScrollTrigger.create({
    trigger: '#mandarin-fall',
    start: 'top 90%',
    end: 'top 30%',
    onEnter: showMandarinFruit,
    onEnterBack: showMandarinFruit,
    onLeave: hideMandarinFruit,
    onLeaveBack: hideMandarinFruit
  });

  // Animate mandarin falling ONLY after it appears
  gsap.to(mandarinFruit.position, {
    y: -5,
    ease: 'none',
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1.5
    }
  });

  gsap.to(mandarinFruit.rotation, {
    z: Math.PI * 2,
    ease: 'none',
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1.5
    }
  });

  // Fade out fall text and hide mandarin when done falling
  gsap.to(['#fall-left', '#fall-right'], {
    opacity: 0,
    scrollTrigger: {
      trigger: '#mandarin-fall',
      start: 'bottom 95%',
      end: 'bottom 90%',
      scrub: 1.5,
      onLeave: () => {
        document.querySelectorAll('#fall-left, #fall-right').forEach(el => {
          el.style.willChange = 'auto';
        });
        hideMandarinFruit();
      }
    }
  });

  // ========== MANDARIN SPLIT SECTION ==========

  splitMandarinOpacity.value = 0;
  updateSplitMandarinOpacity();

  const splitFadeTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#mandarin-split',
      start: 'top 100%',
      end: 'bottom 40%',
      scrub: 1.5,
      onEnter: () => {
        showSplitMandarin();
        hideMandarinFruit();
      },
      onEnterBack: showSplitMandarin,
      onLeave: hideSplitMandarin,
      onLeaveBack: () => {
        hideSplitMandarin();
        showMandarinFruit();
      }
    }
  });

  splitFadeTimeline.to(splitMandarinOpacity, {
    value: 1,
    duration: 0.6,
    ease: 'power2.out',
    onUpdate: updateSplitMandarinOpacity
  });

  // Fade in split text
  gsap.fromTo(['#split-left', '#split-right'],
    {
      opacity: 0,
      visibility: 'hidden',
      willChange: 'transform, opacity'
    },
    {
      opacity: 1,
      visibility: 'visible',
      stagger: 0,
      scrollTrigger: {
        trigger: '#mandarin-split',
        start: 'top 90%',
        end: 'top 85%',
        scrub: 1.5
      }
    }
  );

  // Fade out split text at end
  gsap.to(['#split-left', '#split-right'], {
    opacity: 0,
    scrollTrigger: {
      trigger: '#mandarin-split',
      start: 'bottom 85%',
      end: 'bottom 75%',
      scrub: 1.5,
      onLeave: () => {
        document.querySelectorAll('#split-left, #split-right').forEach(el => {
          el.style.willChange = 'auto';
        });
      }
    }
  });

  // Fade out ingredient canvas at the very end
  gsap.to(ingredientCanvas, {
    opacity: 0,
    visibility: 'hidden',
    scrollTrigger: {
      trigger: '#mandarin-end',
      start: 'top 60%',
      end: 'top 40%',
      scrub: 1.5
    }
  });
}


// ========== BENEFITS SECTION ==========
const benefitsCanvas = document.getElementById('benefits-canvas');
let benefitsScene;
let benefitsCamera;
let benefitsRenderer;
const benefitJars = [];

if (benefitsCanvas) {
  benefitsScene = new THREE.Scene();
  benefitsScene.background = null;

  benefitsCamera = new THREE.PerspectiveCamera(
    32,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  benefitsCamera.position.set(0, 0, 18);

  benefitsRenderer = new THREE.WebGLRenderer({
    canvas: benefitsCanvas,
    antialias: true,
    alpha: true
  });
  benefitsRenderer.setSize(window.innerWidth, window.innerHeight);
  benefitsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  benefitsRenderer.outputEncoding = THREE.sRGBEncoding;
  benefitsRenderer.setClearColor(0x000000, 0);
  benefitsRenderer.toneMapping = THREE.ReinhardToneMapping;
  benefitsRenderer.toneMappingExposure = 1.3;

  const benefitsAmbient = new THREE.AmbientLight(0xffffff, 1.0);
  benefitsScene.add(benefitsAmbient);

  const benefitsKeyLight = new THREE.DirectionalLight(0xffffff, 1.45);
  benefitsKeyLight.position.set(4, 6, 6);
  benefitsScene.add(benefitsKeyLight);

  const benefitsFillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  benefitsFillLight.position.set(-6.5, -3.5, 3.5);
  benefitsScene.add(benefitsFillLight);

  const benefitsTopLight = new THREE.DirectionalLight(0xffffff, 1.2);
  benefitsTopLight.position.set(0.5, 10, 4.5);
  benefitsScene.add(benefitsTopLight);

  const prepJarModel = (model) => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const originalMaterial = child.material;
          const materials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial];

          const clonedMaterials = materials.map((mat) => {
            const cloned = mat.clone();
            cloned.needsUpdate = true;

            if (cloned.transparent) {
              cloned.depthWrite = false;
            }

            if (cloned.metalness !== undefined) {
              cloned.metalness = Math.min(cloned.metalness, 0.4);
            }
            if (cloned.roughness !== undefined) {
              cloned.roughness = Math.max(cloned.roughness, 0.35);
            }

            return cloned;
          });

          child.material = Array.isArray(originalMaterial) ? clonedMaterials : clonedMaterials[0];
        }
      }
    });
  };

  const setupBenefitsAnimations = () => {
    const benefitsSections = document.querySelectorAll('.benefits-section');
    if (!benefitsSections.length || !benefitJars.length) {
      return;
    }

    const firstSection = benefitsSections[0];
    const lastSection = benefitsSections[benefitsSections.length - 1];

    gsap.fromTo(benefitsCanvas,
      { opacity: 0, visibility: 'hidden' },
      {
        opacity: 1,
        visibility: 'visible',
        scrollTrigger: {
          trigger: firstSection,
          start: 'top 90%',
          end: 'top 60%',
          scrub: 1.5
        }
      }
    );

    gsap.to(benefitsCanvas, {
      opacity: 0,
      visibility: 'hidden',
      scrollTrigger: {
        trigger: lastSection,
        start: 'bottom 60%',
        end: 'bottom 40%',
        scrub: 1.5
      }
    });

    const benefitsTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: firstSection,
        endTrigger: lastSection,
        start: 'top 80%',
        end: 'bottom top',
        scrub: 1.5,
        invalidateOnRefresh: true
      }
    });

    benefitJars.forEach((jarEntry, index) => {
      const jar = jarEntry.mesh ?? jarEntry;
      const rotationDirection = index % 2 === 0 ? 1 : -1;
      const verticalDirection = index === 1 ? 1 : -1;
      const deltaX = index === 0 ? 0.8 : index === 1 ? -0.6 : 0.3;
      const deltaY = 0.9 * verticalDirection;

      benefitsTimeline.to(jar.rotation, {
        x: jar.rotation.x + 0.4 * rotationDirection,
        y: jar.rotation.y + Math.PI * 0.9 * rotationDirection,
        z: jar.rotation.z + 0.25 * (index - 1),
        ease: 'none'
      }, 0);

      benefitsTimeline.to(jar.position, {
        x: jar.position.x + deltaX,
        y: jar.position.y + deltaY,
        ease: 'sine.inOut'
      }, 0);

      if (jarEntry.shadow) {
        benefitsTimeline.to(jarEntry.shadow.position, {
          x: jarEntry.shadow.position.x + deltaX,
          y: jarEntry.shadow.position.y + deltaY,
          ease: 'sine.inOut'
        }, 0);
      }
    });

    ScrollTrigger.refresh();
  };

  loader.load('public/cream-jar.glb', (gltf) => {
    const baseModel = gltf.scene;

    const jarConfigs = [
      {
        position: new THREE.Vector3(-4.5, 1.9, 0.4),
        rotation: new THREE.Euler(-0.12, Math.PI * 0.68, -0.52),
        scale: 1.5
      },
      {
        position: new THREE.Vector3(3.6, -1.0, 1.3),
        rotation: new THREE.Euler(0.18, -Math.PI * 0.6, 0.52),
        scale: 2.1
      },
      {
        position: new THREE.Vector3(-1.6, -3.8, -1.5),
        rotation: new THREE.Euler(0.36, Math.PI * 0.18, 0.48),
        scale: 1.1
      }
    ];

    jarConfigs.forEach((config) => {
      const jar = baseModel.clone(true);
      prepJarModel(jar);
      jar.scale.setScalar(config.scale);
      jar.position.copy(config.position);
      jar.rotation.copy(config.rotation);
      benefitsScene.add(jar);

      benefitJars.push({
        mesh: jar,
        config,
        basePosition: jar.position.clone()
      });
    });

    setupBenefitsAnimations();
  });
}

const benefitsWords = document.querySelectorAll('.benefit-word');

benefitsWords.forEach((word, index) => {
  const isLastWord = index === benefitsWords.length - 1;

  // Set transform origin to center and hide initially
  word.style.transformOrigin = 'center center';
  gsap.set(word, { scale: 1, opacity: 0 });

  // Create timeline for the entire word animation
  const wordTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: word.parentElement,
      start: 'top 80%',
      end: 'bottom top',
      scrub: 1,
      ease: "none"
    }
  });

  if (isLastWord) {
    // Last word: scale up and stay visible
    wordTimeline
      .fromTo(word,
        { scale: 0.5, opacity: 0 },
        { scale: 0.75, opacity: 1, duration: 0.06 }
      )
      .to(word, { scale: 6, opacity: 1, duration: 0.22, ease: "power2.out" }, ">-0.02");
  } else {
    // Other words: scale up and fade out
    wordTimeline
      .fromTo(word,
        { scale: 0.5, opacity: 0 },
        { scale: 0.75, opacity: 1, duration: 0.06 }
      )
      .to(word, { scale: 138, opacity: 0, duration: 0.22, ease: "power2.in" }, ">-0.02");
  }
});


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

    if (benefitsCamera && benefitsRenderer) {
      benefitsCamera.aspect = window.innerWidth / window.innerHeight;
      benefitsCamera.updateProjectionMatrix();
      benefitsRenderer.setSize(window.innerWidth, window.innerHeight);
    }

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

    if (benefitsRenderer && benefitsScene && benefitsCamera) {
      benefitsRenderer.render(benefitsScene, benefitsCamera);
    }
  }
}
animate(0);