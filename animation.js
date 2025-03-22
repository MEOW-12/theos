// Prevent console warnings with proper error handling
(function() {
    // Disable Intercom if it's not properly configured
    // This prevents the "[Intercom] The App ID in your code snippet has not been set" warning
    window.intercomSettings = window.intercomSettings || {};
    
    // Safe console wrapper to prevent Self-XSS warnings
    const originalConsole = window.console;
    window.console = {
      log: function() { originalConsole.log.apply(originalConsole, arguments); },
      warn: function() { 
        // Filter out specific warnings we can't control
        const warnText = Array.from(arguments).join(' ');
        if (!warnText.includes('Intercom') && !warnText.includes('_tp:424')) {
          originalConsole.warn.apply(originalConsole, arguments);
        }
      },
      error: function() { originalConsole.error.apply(originalConsole, arguments); },
      info: function() { originalConsole.info.apply(originalConsole, arguments); },
      debug: function() { originalConsole.debug.apply(originalConsole, arguments); }
    };
  })();
  
  // Main 3D animation for the banner section
  class PortfolioAnimation {
    constructor() {
      this.container = document.getElementById('banner');
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      
      this.shapes = [];
      this.particles = [];
      this.raycaster = null;
      this.mouse = null;
      
      this.isInitialized = false;
      
      // Only initialize if Three.js is available
      if (typeof THREE !== 'undefined') {
        this.initThree();
      } else {
        console.warn("Three.js library is not loaded. Using fallback animation.");
        this.initFallback();
      }
    }
    
    initThree() {
      if (!this.container) return;
      
      try {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Setup renderer
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Setup camera
        this.camera.position.z = 5;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
        
        // Create 3D objects
        this.createObjects();
        
        // Setup event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Start animation loop
        this.animate();
        this.isInitialized = true;
      } catch (error) {
        console.warn("Error initializing Three.js animation:", error);
        this.initFallback();
      }
    }
    
    initFallback() {
      // Simple fallback animation using CSS if Three.js fails
      if (!this.container) return;
      
      const fallbackEl = document.createElement('div');
      fallbackEl.className = 'fallback-animation';
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positions and animation delays
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${5 + Math.random() * 10}s`;
        particle.style.backgroundColor = `rgba(${Math.floor(Math.random() * 100)}, 
                                              ${Math.floor(Math.random() * 150)}, 
                                              ${Math.floor(150 + Math.random() * 100)}, 
                                              ${0.3 + Math.random() * 0.4})`;
        
        fallbackEl.appendChild(particle);
      }
      
      this.container.appendChild(fallbackEl);
      
      // Add fallback CSS
      const style = document.createElement('style');
      style.textContent = `
        .fallback-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
        }
        .particle {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          filter: blur(5px);
          animation: float linear infinite;
        }
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          33% {
            transform: translate(50px, 50px) rotate(120deg) scale(1.2);
          }
          66% {
            transform: translate(-30px, 20px) rotate(240deg) scale(0.8);
          }
          100% {
            transform: translate(0, 0) rotate(360deg) scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    createObjects() {
      try {
        // Create floating geometric shapes
        const materials = [
          new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8, roughness: 0.2 }),
          new THREE.MeshStandardMaterial({ color: 0x3498db, metalness: 0.8, roughness: 0.2 }),
          new THREE.MeshStandardMaterial({ color: 0x9b59b6, metalness: 0.8, roughness: 0.2 })
        ];
        
        // Add various geometric shapes
        for (let i = 0; i < 15; i++) {
          let geometry;
          const random = Math.random();
          
          if (random < 0.33) {
            geometry = new THREE.IcosahedronGeometry(0.3 * (Math.random() * 0.5 + 0.5), 0);
          } else if (random < 0.66) {
            geometry = new THREE.OctahedronGeometry(0.4 * (Math.random() * 0.5 + 0.5), 0);
          } else {
            geometry = new THREE.TorusKnotGeometry(0.2 * (Math.random() * 0.5 + 0.5), 0.05, 64, 8);
          }
          
          const material = materials[Math.floor(Math.random() * materials.length)];
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position randomly in 3D space
          mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
          );
          
          // Add rotation properties for animation
          mesh.rotation.x = Math.random() * Math.PI;
          mesh.rotation.y = Math.random() * Math.PI;
          
          mesh.userData = {
            rotationSpeed: {
              x: (Math.random() - 0.5) * 0.01,
              y: (Math.random() - 0.5) * 0.01,
              z: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: 0.005 + Math.random() * 0.005,
            floatDistance: 0.2 + Math.random() * 0.3,
            initialY: mesh.position.y,
            floatOffset: Math.random() * Math.PI * 2
          };
          
          this.shapes.push(mesh);
          this.scene.add(mesh);
        }
        
        // Add particle system
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 200;
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3] = (Math.random() - 0.5) * 15;
          positions[i3 + 1] = (Math.random() - 0.5) * 8;
          positions[i3 + 2] = (Math.random() - 0.5) * 8;
          
          // Create gradient colors from blue to purple
          const ratio = Math.random();
          colors[i3] = 0.2 + ratio * 0.4;       // R: 0.2-0.6
          colors[i3 + 1] = 0.4 + ratio * 0.2;   // G: 0.4-0.6
          colors[i3 + 2] = 0.7 + ratio * 0.3;   // B: 0.7-1.0
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
          size: 0.05,
          vertexColors: true,
          transparent: true,
          opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.particles.push(particleSystem);
        this.scene.add(particleSystem);
      } catch (error) {
        console.warn("Error creating 3D objects:", error);
      }
    }
    
    animate() {
      if (!this.isInitialized) return;
      
      try {
        requestAnimationFrame(this.animate.bind(this));
        
        // Animate shapes
        const time = Date.now() * 0.001;
        
        this.shapes.forEach(shape => {
          const userData = shape.userData;
          
          // Rotate shapes
          shape.rotation.x += userData.rotationSpeed.x;
          shape.rotation.y += userData.rotationSpeed.y;
          shape.rotation.z += userData.rotationSpeed.z;
          
          // Float shapes up and down
          shape.position.y = userData.initialY + 
            Math.sin(time + userData.floatOffset) * userData.floatDistance;
        });
        
        // Animate particles
        this.particles.forEach(particles => {
          particles.rotation.y = time * 0.05;
        });
        
        this.renderer.render(this.scene, this.camera);
      } catch (error) {
        console.warn("Animation loop error:", error);
        this.isInitialized = false;
      }
    }
    
    onWindowResize() {
      if (!this.isInitialized || !this.container) return;
      
      try {
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
      } catch (error) {
        console.warn("Error resizing renderer:", error);
      }
    }
    
    onMouseMove(event) {
      if (!this.isInitialized) return;
      
      try {
        // Calculate mouse position in normalized coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Move camera slightly based on mouse position for parallax effect
        this.camera.position.x = this.mouse.x * 0.5;
        this.camera.position.y = this.mouse.y * 0.5;
        this.camera.lookAt(0, 0, 0);
        
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.shapes);
        
        // Reset all shapes scale
        this.shapes.forEach(shape => {
          if (!shape.userData.isHovered && typeof gsap !== 'undefined') {
            gsap.to(shape.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
          }
        });
        
        // Scale up hovered shapes
        if (typeof gsap !== 'undefined') {
          for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            object.userData.isHovered = true;
            
            gsap.to(object.scale, { 
              x: 1.3, 
              y: 1.3, 
              z: 1.3, 
              duration: 0.3,
              onComplete: () => {
                object.userData.isHovered = false;
              }
            });
            
            // Only handle the first intersection
            break;
          }
        }
      } catch (error) {
        console.warn("Mouse move handler error:", error);
      }
    }
  }
  
  // Section transitions animation
  class SectionTransitions {
    constructor() {
      this.init();
    }
    
    init() {
      try {
        // Add smooth scroll for navigation links
        const navLinks = document.querySelectorAll('nav a, a[href^="#"]');
        
        navLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if not an anchor link
            if (!href || !href.startsWith('#')) return;
            
            e.preventDefault();
            
            const targetId = href === '#' ? 'page-wrapper' : href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
              // Animate scroll
              window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
              });
              
              // Add URL hash without scrolling
              history.pushState(null, null, href);
            }
          });
        });
        
        // Add section transitions
        if (typeof IntersectionObserver !== 'undefined') {
          this.setupSectionObservers();
        } else {
          // Fallback for browsers without IntersectionObserver
          this.setupScrollHandler();
        }
      } catch (error) {
        console.warn("Error initializing section transitions:", error);
      }
    }
    
    setupSectionObservers() {
      const sections = document.querySelectorAll('section');
      
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add 'active' class to visible section
            entry.target.classList.add('active');
            
            // Animate section content if GSAP is available
            if (typeof gsap !== 'undefined') {
              const content = entry.target.querySelector('.container');
              if (content) {
                gsap.fromTo(content,
                  { opacity: 0, y: 30 },
                  { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8, 
                    ease: "power2.out" 
                  }
                );
              }
            }
          } else {
            // Remove 'active' class from invisible section
            entry.target.classList.remove('active');
          }
        });
      }, { threshold: 0.1 });
      
      // Observe each section
      sections.forEach(section => {
        sectionObserver.observe(section);
      });
      
      // Setup portfolio item animations
      this.setupPortfolioItemAnimations();
    }
    
    setupScrollHandler() {
      // Fallback scroll handler for older browsers
      const sections = document.querySelectorAll('section');
      
      window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (scrollPosition >= sectionTop - window.innerHeight / 2 && 
              scrollPosition < sectionTop + sectionHeight - window.innerHeight / 2) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        });
      });
    }
    
    setupPortfolioItemAnimations() {
      if (typeof IntersectionObserver === 'undefined' || typeof gsap === 'undefined') return;
      
      const portfolioItems = document.querySelectorAll('.gallery img, .gallery video, .gallery model-viewer');
      
      // Use Intersection Observer to detect when elements enter viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.fromTo(entry.target, 
              { opacity: 0, y: 50 }, 
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                ease: "power2.out",
                stagger: 0.1
              }
            );
            // Stop observing after animation
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      // Observe each portfolio item
      portfolioItems.forEach(item => {
        observer.observe(item);
      });
      
      // Add scroll animations for section headings
      const sectionHeadings = document.querySelectorAll('.major h2');
      
      const headingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.fromTo(entry.target,
              { opacity: 0, y: -30 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                ease: "back.out(1.7)" 
              }
            );
            // Stop observing after animation
            headingObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      // Observe each section heading
      sectionHeadings.forEach(heading => {
        headingObserver.observe(heading);
      });
    }
  }
  
  // Initialize animations when DOM content is loaded
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Add a loader animation before starting
      const body = document.querySelector('body');
      const loader = document.createElement('div');
      loader.className = 'loader';
      loader.innerHTML = '<div class="spinner"></div>';
      body.appendChild(loader);
      
      // Add loader styles
      const style = document.createElement('style');
      style.textContent = `
        .loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        section {
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }
        section.active {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
      
      // Initialize animations after resources are loaded
      window.addEventListener('load', () => {
        // Create portfolio animation
        const portfolioAnimation = new PortfolioAnimation();
        
        // Create section transitions
        const sectionTransitions = new SectionTransitions();
        
        // Remove loader after a slight delay
        setTimeout(() => {
          if (typeof gsap !== 'undefined') {
            gsap.to(loader, {
              opacity: 0,
              duration: 0.8,
              onComplete: () => {
                loader.remove();
              }
            });
            
            // Animate initial section only if it exists
            const bannerContent = document.querySelector('#banner .content');
            if (bannerContent) {
              gsap.fromTo(bannerContent,
                { opacity: 0, y: 30 },
                { 
                  opacity: 1, 
                  y: 0, 
                  duration: 1, 
                  ease: "power2.out",
                  delay: 0.5
                }
              );
            }
          } else {
            // Fallback without GSAP
            loader.style.opacity = 0;
            setTimeout(() => {
              loader.remove();
              
              const bannerContent = document.querySelector('#banner .content');
              if (bannerContent) {
                bannerContent.style.opacity = 1;
              }
            }, 800);
          }
        }, 1500);
      });
    } catch (error) {
      console.warn("Error in animation initialization:", error);
      // Make sure loader is removed even if there's an error
      const loader = document.querySelector('.loader');
      if (loader) loader.remove();
    }
  });
  
  // Add custom CSS for 3D model viewer transitions
  const modelViewerStyle = document.createElement('style');
  modelViewerStyle.textContent = `
    model-viewer {
      width: 100%;
      height: 300px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      overflow: hidden;
      --poster-color: transparent;
      transition: transform 0.3s ease;
    }
    
    model-viewer:hover {
      transform: scale(1.02);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .gallery {
      perspective: 1000px;
    }
    
    .gallery img:hover, .gallery video:hover {
      transform: scale(1.05);
      transition: transform 0.3s ease;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(modelViewerStyle);