(() => {
  const WRAP_SELECTOR = '[data-slideshow="wrap"]';
  const SLIDE_SELECTOR = '[data-slideshow="slide"]';
  const PARALLAX_SELECTOR = '[data-slideshow="parallax"]';
  const THUMB_SELECTOR = '[data-slideshow="thumb"]';
  const CURRENT_CLASS = "is--current";
  const INSTANCE_KEY = "__dendricProductGallery";
  const AUTOPLAY_DELAY = 4000;
  const ANIMATION_DURATION = 0.9;

  const initGallery = (wrap) => {
    if (wrap[INSTANCE_KEY]) return wrap[INSTANCE_KEY];

    const slides = [...wrap.querySelectorAll(SLIDE_SELECTOR)];
    const parallaxItems = [...wrap.querySelectorAll(PARALLAX_SELECTOR)];
    const thumbs = [...wrap.querySelectorAll(THUMB_SELECTOR)];

    if (!slides.length) return null;

    if (slides.length !== parallaxItems.length || slides.length !== thumbs.length) {
      console.warn("Dendric product gallery was not initialized because its item counts do not match.", {
        slides: slides.length,
        parallaxItems: parallaxItems.length,
        thumbs: thumbs.length,
      });
      return null;
    }

    let current = 0;
    let animating = false;
    let observer;
    let timeline;
    let autoplayTimer;
    let resumeTimer;

    slides.forEach((slide, index) => {
      slide.setAttribute("data-index", String(index));
      slide.classList.toggle(CURRENT_CLASS, index === current);
    });

    thumbs.forEach((thumb, index) => {
      thumb.setAttribute("data-index", String(index));
      thumb.classList.toggle(CURRENT_CLASS, index === current);
    });

    const navigate = (direction, targetIndex = null) => {
      if (animating || slides.length < 2) return false;

      const previous = current;
      const next =
        targetIndex !== null && targetIndex !== undefined
          ? targetIndex
          : direction === 1
            ? current < slides.length - 1
              ? current + 1
              : 0
            : current > 0
              ? current - 1
              : slides.length - 1;

      if (!Number.isInteger(next) || next < 0 || next >= slides.length || next === previous) {
        return false;
      }

      animating = true;
      observer?.disable();
      current = next;

      const currentSlide = slides[previous];
      const currentParallax = parallaxItems[previous];
      const upcomingSlide = slides[current];
      const upcomingParallax = parallaxItems[current];

      timeline = window.gsap
        .timeline({
          defaults: {
            duration: ANIMATION_DURATION,
            ease: "slideshow-wipe",
          },
          onStart: () => {
            upcomingSlide.classList.add(CURRENT_CLASS);
            thumbs[previous].classList.remove(CURRENT_CLASS);
            thumbs[current].classList.add(CURRENT_CLASS);
          },
          onComplete: () => {
            currentSlide.classList.remove(CURRENT_CLASS);
            animating = false;
            observer?.enable();
            timeline = null;
          },
        })
        .to(currentSlide, { xPercent: -direction * 100 }, 0)
        .to(currentParallax, { xPercent: direction * 50 }, 0)
        .fromTo(upcomingSlide, { xPercent: direction * 100 }, { xPercent: 0 }, 0)
        .fromTo(upcomingParallax, { xPercent: -direction * 50 }, { xPercent: 0 }, 0);

      return true;
    };

    const onThumbClick = (event) => {
      event.preventDefault();

      const targetIndex = Number.parseInt(event.currentTarget.getAttribute("data-index"), 10);
      if (!Number.isInteger(targetIndex) || targetIndex === current || animating) return;

      navigate(targetIndex > current ? 1 : -1, targetIndex);
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", onThumbClick);
    });

    observer = window.Observer.create({
      target: wrap,
      type: "wheel,touch,pointer",
      onLeft: () => {
        if (!animating) navigate(1);
      },
      onRight: () => {
        if (!animating) navigate(-1);
      },
      onWheel: (event) => {
        if (animating || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

        if (event.deltaX > 50) navigate(1);
        else if (event.deltaX < -50) navigate(-1);
      },
      wheelSpeed: -1,
      tolerance: 10,
    });

    const stopAutoplay = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }

      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const startAutoplay = () => {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      autoplayTimer = null;

      if (document.hidden || slides.length < 2) return;

      autoplayTimer = window.setInterval(() => {
        if (!document.hidden && !animating) navigate(1);
      }, AUTOPLAY_DELAY);
    };

    const scheduleAutoplay = () => {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(startAutoplay, AUTOPLAY_DELAY);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    };

    wrap.addEventListener("mouseenter", stopAutoplay);
    wrap.addEventListener("mouseleave", startAutoplay);
    wrap.addEventListener("touchstart", stopAutoplay, { passive: true });
    wrap.addEventListener("touchend", scheduleAutoplay, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    const api = {
      destroy: () => {
        stopAutoplay();
        timeline?.kill();
        observer?.kill();

        thumbs.forEach((thumb) => {
          thumb.removeEventListener("click", onThumbClick);
        });

        wrap.removeEventListener("mouseenter", stopAutoplay);
        wrap.removeEventListener("mouseleave", startAutoplay);
        wrap.removeEventListener("touchstart", stopAutoplay);
        wrap.removeEventListener("touchend", scheduleAutoplay);
        document.removeEventListener("visibilitychange", onVisibilityChange);

        delete wrap[INSTANCE_KEY];
        delete wrap.__dendricGalleryAutoplay;
      },
      getCurrentIndex: () => current,
      goTo: (index) => navigate(index > current ? 1 : -1, index),
      next: () => navigate(1),
      previous: () => navigate(-1),
    };

    wrap[INSTANCE_KEY] = api;
    wrap.__dendricGalleryAutoplay = true;
    startAutoplay();

    return api;
  };

  const boot = () => {
    if (!window.gsap || !window.Observer || !window.CustomEase) {
      console.warn("Dendric product gallery requires GSAP, Observer, and CustomEase.");
      return;
    }

    window.gsap.registerPlugin(window.Observer, window.CustomEase);
    window.CustomEase.create("slideshow-wipe", "0.6, 0.08, 0.02, 0.99");

    document.querySelectorAll(WRAP_SELECTOR).forEach(initGallery);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
