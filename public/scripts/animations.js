/* global gsap, ScrollTrigger */

function sporeCanvas(
  targetElementClassName,
  particleCount = 400,
  particleMinSize = 1,
  particleMaxSize = 3.5,
  particleMinSpeed = 0.1,
  particleMaxSpeed = 1.5,
  particleWobbleSpeed = 0.1,
  particleWobble = 0,
  canvasSize = 2000,
) {
  const particleColors = ["#FFFFFF"];
  if (window.innerWidth < 768) {
    particleCount = particleCount > 40 ? 20 : particleCount;
    canvasSize = canvasSize > 1000 ? 1000 : canvasSize;
  }

  const canvasElements = document.querySelectorAll(targetElementClassName);

  canvasElements.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size =
          Math.random() * (particleMaxSize - particleMinSize) + particleMinSize;
        this.speedY =
          Math.random() * (particleMaxSpeed - particleMinSpeed) -
          particleMaxSpeed;
        this.wobble = Math.random() * particleWobble;
        this.wobbleSpeed = Math.random() * particleWobbleSpeed;
        this.color =
          particleColors[Math.floor(Math.random() * particleColors.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * this.wobbleSpeed) * this.wobble;

        if (this.y < -20) {
          this.y = canvas.height + Math.random() * 20;
          this.x = Math.random() * canvas.width;
          this.color =
            particleColors[Math.floor(Math.random() * particleColors.length)];
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  });

  window.addEventListener("resize", () => {
    canvasElements.forEach((canvas) => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    });
  });
}

(function () {
  "use strict";

  // Hero Video Showcase: GSAP 3D scroll tilt
  // On XL: starts scaled 0.8, rotationX 10, top -250 → scrolls to normal
  // On < XL: starts scaled 0.8, rotationX 15 → scrolls to normal
  function heroVideo() {
    const mm = gsap.matchMedia();
    const gsapVideoShowcase = document.querySelectorAll(
      "[data-gsap-video-showcase]",
    );
    if (!gsapVideoShowcase.length) return;

    gsapVideoShowcase.forEach((el) => {
      mm.add("(min-width: 1280px)", () => {
        gsap.set(el, { scale: 0.8, rotationX: 10, top: -250 });
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "20% 95%",
            end: "0% 30%",
            scrub: true,
            markers: false,
          },
          scale: 1,
          rotationX: 0,
          top: 0,
          ease: "none",
        });
      });

      mm.add("(max-width: 1279px)", () => {
        gsap.set(el, { scale: 0.8, rotationX: 15 });
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "20% 95%",
            end: "0% 40%",
            scrub: true,
          },
          scale: 1,
          rotationX: 0,
          ease: "none",
        });
      });
    });
  }

  // Trusted Partners: animated cycling brand logos
  function updateTrustedPartners() {
    const partners = document.querySelector("[data-trusted-brands-images]");
    if (!partners) return;

    const images = JSON.parse(partners.dataset.trustedBrandsImages);
    const MAX = 7;

    function getRandomImages(list) {
      return [...list].sort(() => 0.5 - Math.random()).slice(0, MAX);
    }

    function render(list) {
      partners.textContent = "";
      const frag = document.createDocumentFragment();
      list.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Trusted Brand";
        img.draggable = false;
        frag.appendChild(img);
      });
      partners.appendChild(frag);
    }

    function animate() {
      const selected = getRandomImages(images);
      render(selected);
      const imgs = partners.children;

      gsap.fromTo(
        imgs,
        { opacity: 0, filter: "blur(10px)", y: -30 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.9, stagger: 0.15 },
      );

      gsap.to(imgs, {
        opacity: 0,
        filter: "blur(10px)",
        y: 20,
        duration: 0.9,
        delay: 3,
        stagger: 0.15,
        onComplete: animate,
      });
    }

    animate();
  }

  // Particle spore canvas effect
  function sporesEffect() {
    const targetElementClassName = ".heroSporeCanvas";
    sporeCanvas(
      targetElementClassName,
      140, // particle count
      0.2, // min size
      1.6, // max size
      0.0, // min speed
      0.1, // max speed
      800, // canvas size
    );
  }

  // Pricing toggle: Monthly ↔ Yearly with animated transitions
  // Uses a hidden checkbox input with data-pricing-toggle
  // Labels with .price-toggler-btn get .active class
  // Price spans with data-price-tag-monthly / data-price-tag-yearly get .active / .inactive
  function pricingToggle() {
    const toggle = document.querySelector("[data-pricing-toggle]");
    const labels = document.querySelectorAll(".price-toggler-btn");
    if (!toggle) return;

    toggle.addEventListener("change", (e) => {
      const isYearly = e.target.checked;

      // Toggle label active states
      if (isYearly) {
        labels[0]?.classList.remove("active");
        labels[1]?.classList.add("active");
      } else {
        labels[0]?.classList.add("active");
        labels[1]?.classList.remove("active");
      }

      const monthlyElements = document.querySelectorAll(
        "[data-price-tag-monthly]",
      );
      const yearlyElements = document.querySelectorAll(
        "[data-price-tag-yearly]",
      );
      const elementsToHide = isYearly ? monthlyElements : yearlyElements;
      const elementsToShow = isYearly ? yearlyElements : monthlyElements;

      elementsToHide.forEach((el, index) => {
        setTimeout(() => {
          el.classList.remove("active");
          el.classList.add("inactive");
        }, index * 150);
      });

      elementsToShow.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("active");
          el.classList.remove("inactive");
        }, index * 150);
      });
    });
  }

  function init() {
    gsap.registerPlugin(ScrollTrigger);

    heroVideo();
    updateTrustedPartners();
    sporesEffect();
    pricingToggle();
  }

  // Classic defer scripts run after the document is parsed.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Refresh ScrollTrigger on resize (debounced)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 250);
  });
})();
