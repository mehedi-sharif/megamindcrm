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
  const canvasElements = document.querySelectorAll(targetElementClassName);
  if (!canvasElements.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const boot = () => {
    // Read viewport before writing canvas dimensions.
    const narrow = window.innerWidth < 768;
    let count = particleCount;
    let size = canvasSize;
    if (narrow) {
      count = count > 40 ? 20 : count;
      size = size > 1000 ? 1000 : size;
    }

    canvasElements.forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      canvas.width = size;
      canvas.height = size;
      const particles = [];

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size =
            Math.random() * (particleMaxSize - particleMinSize) +
            particleMinSize;
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

      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }

      let running = false;
      let frame = 0;
      function animate() {
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle) => {
          particle.update();
          particle.draw();
        });
        frame = requestAnimationFrame(animate);
      }

      function start() {
        if (running) return;
        running = true;
        frame = requestAnimationFrame(animate);
      }

      function stop() {
        running = false;
        cancelAnimationFrame(frame);
      }

      // Run only while the canvas is on screen.
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
          else stop();
        });
      });
      observer.observe(canvas);
    });

    window.addEventListener("resize", () => {
      canvasElements.forEach((canvas) => {
        canvas.width = size;
        canvas.height = size;
      });
    });
  };

  const afterLoad = () => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(boot, { timeout: 2000 });
    } else {
      setTimeout(boot, 1);
    }
  };

  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
}

(function () {
  "use strict";

  const BRAND_SIZE = {
    "/images/brands/dropbox-logo-svg-150px.svg": [126, 24],
    "/images/brands/hubspot-logo-svg-150.svg": [82, 24],
    "/images/brands/livechat-logo-svg-150px.svg": [107, 24],
    "/images/brands/pingdom-logo-svg-150px.svg": [116, 24],
    "/images/brands/scapic-logo-svg-150px.svg": [96, 24],
  };

  // Same scrub as the old ScrollTrigger tween, without the library's layout pass.
  function heroVideo() {
    const els = [...document.querySelectorAll("[data-gsap-video-showcase]")];
    if (!els.length) return;

    const wideQuery = window.matchMedia("(min-width: 1280px)");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let items = [];

    // CSS already holds the start pose, so this read does not follow a JS write.
    function measure() {
      const scroll = window.scrollY;
      const vh = window.innerHeight;
      const wide = wideQuery.matches;
      const endPct = wide ? 0.3 : 0.4;
      items = els.map((el) => {
        const bounds = el.getBoundingClientRect();
        return {
          el,
          wide,
          start: Math.round(
            bounds.top + scroll + bounds.height * 0.2 - vh * 0.95,
          ),
          end: Math.round(bounds.top + scroll - vh * endPct),
        };
      });
    }

    function apply() {
      const y = window.scrollY;
      for (const item of items) {
        const span = item.end - item.start;
        let progress = span ? (y - item.start) / span : 1;
        if (progress < 0) progress = 0;
        else if (progress > 1) progress = 1;
        const scale = 0.8 + 0.2 * progress;
        const rotation = (item.wide ? 10 : 15) * (1 - progress);
        item.el.style.transform = `rotateX(${rotation}deg) scale(${scale})`;
        item.el.style.top = item.wide ? `${-250 * (1 - progress)}px` : "0px";
      }
    }

    if (reduceMotion) {
      els.forEach((el) => {
        el.style.transform = "none";
        el.style.top = "0px";
      });
    } else {
      measure();
      apply();
      window.addEventListener("scroll", apply, { passive: true });

      let resizeFrame = 0;
      const remeasure = () => {
        cancelAnimationFrame(resizeFrame);
        els.forEach((el) => {
          el.style.transform = "";
          el.style.top = "";
        });
        resizeFrame = requestAnimationFrame(() => {
          resizeFrame = requestAnimationFrame(() => {
            measure();
            apply();
          });
        });
      };
      window.addEventListener("resize", remeasure);
      wideQuery.addEventListener("change", remeasure);
    }

    els.forEach((el) => {
      const video = el.querySelector("video");
      if (!video) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      });
      observer.observe(el);
    });
  }

  function updateTrustedPartners() {
    const partners = document.querySelector("[data-trusted-brands-images]");
    if (!partners) return;

    const images = JSON.parse(partners.dataset.trustedBrandsImages);
    const MAX = 7;
    const ease = "cubic-bezier(0.25, 0.1, 0.25, 1)";

    function getRandomImages(list) {
      return [...list].sort(() => 0.5 - Math.random()).slice(0, MAX);
    }

    function render(list) {
      partners.replaceChildren();
      const frag = document.createDocumentFragment();
      list.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Trusted Brand";
        img.draggable = false;
        const size = BRAND_SIZE[src];
        if (size) {
          img.width = size[0];
          img.height = size[1];
        }
        frag.appendChild(img);
      });
      partners.appendChild(frag);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(getRandomImages(images));
      return;
    }

    function animate() {
      render(getRandomImages(images));
      const imgs = [...partners.children];
      let pending = imgs.length;
      imgs.forEach((img, index) => {
        img.animate(
          [
            { opacity: 0, filter: "blur(10px)", transform: "translateY(-30px)" },
            { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
          ],
          { duration: 900, delay: index * 150, easing: ease, fill: "both" },
        );
        const outro = img.animate(
          [
            { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
            { opacity: 0, filter: "blur(10px)", transform: "translateY(20px)" },
          ],
          {
            duration: 900,
            delay: 3000 + index * 150,
            easing: ease,
            fill: "forwards",
          },
        );
        outro.onfinish = () => {
          pending -= 1;
          if (pending === 0) animate();
        };
      });
    }

    animate();
  }

  function sporesEffect() {
    sporeCanvas(
      ".heroSporeCanvas",
      140,
      0.2,
      1.6,
      0.0,
      0.1,
      800,
    );
  }

  function pricingToggle() {
    const toggle = document.querySelector("[data-pricing-toggle]");
    const labels = document.querySelectorAll(".price-toggler-btn");
    if (!toggle) return;

    toggle.addEventListener("change", (e) => {
      const isYearly = e.target.checked;

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
    heroVideo();
    // Brand DOM writes land on the next frame, after the hero measurement.
    requestAnimationFrame(updateTrustedPartners);
    sporesEffect();
    pricingToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
