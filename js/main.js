/**
 * Portfolio Interface Controller
 * Manages intersection observers, navigation highlights, contact form submits,
 * tactile cabinet joystick animations, and initialises the game core.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Slum Runner Game
  const game = new SlumRunnerGame('game-canvas');

  // Trigger game start on overlay button click
  const btnStartGame = document.getElementById('btn-start-game');
  if (btnStartGame) {
    btnStartGame.addEventListener('click', () => {
      game.startGame();
    });
  }

  // Trigger game restart on retry button click
  const btnRestartGame = document.getElementById('btn-restart-game');
  if (btnRestartGame) {
    btnRestartGame.addEventListener('click', () => {
      game.restartGame();
    });
  }

  // 2. Mobile Navigation Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Close mobile menu when clicking nav links
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.textContent = '☰';
      });
    });
  }

  // 3. Scroll Events: Sticky Header
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 4. Intersection Observer: Scroll Fade In Animations
  const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
  const fadeObserverOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, fadeObserverOptions);

  fadeElements.forEach(el => fadeObserver.observe(el));

  // 5. Intersection Observer: Animate Skill Progress Bars
  const skillProgressBars = document.querySelectorAll('.skill-progress');
  const skillObserverOptions = {
    threshold: 0.25
  };

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.getAttribute('data-width');
        bar.style.width = targetWidth;
      }
    });
  }, skillObserverOptions);

  skillProgressBars.forEach(bar => skillObserver.observe(bar));

  // 6. Dynamic Active Link Highlight on Scroll
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('nav a');

  window.addEventListener('scroll', () => {
    let currentActive = 'hero';
    const scrollPos = window.scrollY + 200; // Offset for top header

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentActive = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      if (href === '#' && currentActive === 'hero') {
        item.classList.add('active');
      } else if (href === `#${currentActive}`) {
        item.classList.add('active');
      }
    });
  });

  // 7. Tactile Cabinet Joystick Animations on Action Click
  const joystickHandle = document.getElementById('cabinet-joystick');
  const btnJump = document.getElementById('btn-jump');
  const btnSlide = document.getElementById('btn-slide');

  if (joystickHandle) {
    const tiltJoystick = (x, y) => {
      joystickHandle.style.transform = `translate(${x}px, ${y}px)`;
      setTimeout(() => {
        joystickHandle.style.transform = 'translate(0px, 0px)';
      }, 150);
    };

    // Tilt joystick up on jump trigger
    if (btnJump) {
      btnJump.addEventListener('mousedown', () => tiltJoystick(0, -10));
      btnJump.addEventListener('touchstart', () => tiltJoystick(0, -10));
    }
    
    // Tilt joystick down on slide trigger
    if (btnSlide) {
      btnSlide.addEventListener('mousedown', () => tiltJoystick(0, 10));
      btnSlide.addEventListener('touchstart', () => tiltJoystick(0, 10));
    }

    // Keyboard mappings to joystick tilts
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        tiltJoystick(0, -10);
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        tiltJoystick(0, 10);
      }
    });
  }

  // 8. Contact Form Handling
  const contactForm = document.getElementById('portfolio-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show beautiful success validation message inside form area
      const parentCard = contactForm.parentElement;
      
      // Synthesize quick success click
      audioController.playMilestone();
      
      parentCard.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 300px; text-align: center; gap: 1.5rem; animation: fadeIn 0.5s ease-out;">
          <div style="width: 72px; height: 72px; background: rgba(46, 213, 115, 0.15); border: 2px solid #2ed573; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 2.2rem; color: #2ed573; box-shadow: 0 0 15px rgba(46, 213, 115, 0.25);">
            ✓
          </div>
          <h3 style="font-family: var(--font-headings); font-size: 1.8rem; font-weight: 800;">Message Dispatched!</h3>
          <p style="color: var(--text-secondary); max-width: 320px; font-size: 0.95rem; line-height: 1.6;">Thank you for getting in touch. I have received your notification and will follow up with you shortly.</p>
          <button class="btn btn-secondary" onclick="location.reload()" style="font-size: 0.85rem; padding: 0.6rem 1.4rem;">Send Another</button>
        </div>
      `;
    });
  }
});
