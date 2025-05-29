let lastStepAt = 0;
const stepCooldown = 300; // milliseconds between steps (e.g. 300ms = ~3 steps/sec)

let pos = { top: window.innerHeight / 2, left: window.innerWidth / 2 };
let velocity = { x: 0, y: 0 };
let currentZone = null;
let proximityInterval = null;
let speaking = false;
let lastSpokenAt = 0;


// Unlock audio context and speech synthesis on user click
window.addEventListener("click", () => {
  // Trigger a silent utterance to unlock SpeechSynthesis
  const unlock = new SpeechSynthesisUtterance(" ");
  window.speechSynthesis.speak(unlock);

  // Trigger and pause audio to unlock WebAudio
  footstepSound.volume = 0;
  footstepSound.play().then(() => footstepSound.pause()).catch(() => {});
  proximitySound.volume = 0;
  proximitySound.play().then(() => proximitySound.pause()).catch(() => {});

  // Hide any unlock prompt if present
  const prompt = document.getElementById("unlockPrompt");
  if (prompt) prompt.style.display = "none";
});

// DOM Elements
const cursor = document.getElementById("cursor");
const footstepSound = document.getElementById("footstepSound");
const proximitySound = document.getElementById("proximitySound");
const visitedZones = new Set();


function speak(text, force = false) {
  const now = Date.now();
  if (!force && (speaking || now - lastSpokenAt < 1500)) return;

  window.speechSynthesis.cancel(); // Stop any existing speech
  speaking = false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.2;
  speaking = true;
  lastSpokenAt = now;

  utterance.onend = () => {
    speaking = false;
  };

  console.log("Speaking:", text);
  window.speechSynthesis.speak(utterance);
}


function getEdgeDistance(cursorRect, zoneRect) {
  const dx = Math.max(zoneRect.left - cursorRect.right, cursorRect.left - zoneRect.right, 0);
  const dy = Math.max(zoneRect.top - cursorRect.bottom, cursorRect.top - zoneRect.bottom, 0);
  return Math.sqrt(dx * dx + dy * dy);
}

function checkProximity() {
  const cursorRect = cursor.getBoundingClientRect();
  let insideZone = null;
  let nearZone = null;
  let minProximityDistance = Infinity;

  document.querySelectorAll('.zone').forEach(zone => {
    const zoneRect = zone.getBoundingClientRect();
    const isInside = (
      cursorRect.left >= zoneRect.left &&
      cursorRect.right <= zoneRect.right &&
      cursorRect.top >= zoneRect.top &&
      cursorRect.bottom <= zoneRect.bottom
    );

    if (isInside) {
      insideZone = zone;
    } else {
      const distance = getEdgeDistance(cursorRect, zoneRect);
      if (distance < minProximityDistance && distance < 90) {
        nearZone = zone;
        minProximityDistance = distance;
      }
    }
  });

  if (insideZone && currentZone !== insideZone.id) {
    currentZone = insideZone.id;
    stopProximityPing();

    const name = insideZone.querySelector('h2').textContent;
    const description = insideZone.getAttribute('data-description') || "";
    speak(`You have reached ${name}. Press button to interact`);
  }


  if (nearZone && !insideZone && !proximityInterval) {
    startProximityPing();
  }

  if (!nearZone || insideZone) {
    stopProximityPing();
  }

  if (!insideZone && currentZone !== null) {
    console.log("Leaving zone:", currentZone);
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    speaking = false;
    currentZone = null; // Clear only once, not repeatedly
  }

}

function startProximityPing() {
  stopProximityPing();
  proximityInterval = setInterval(() => {
    const ping = proximitySound.cloneNode();
    ping.play();
  }, 600);
}

function stopProximityPing() {
  if (proximityInterval) {
    clearInterval(proximityInterval);
    proximityInterval = null;
  }
}

function animationLoop() {
  const isWalking = Math.abs(velocity.x) > 0 || Math.abs(velocity.y) > 0;

  if (isWalking) {
    pos.left = Math.max(0, Math.min(window.innerWidth, pos.left + velocity.x));
    pos.top = Math.max(0, Math.min(window.innerHeight, pos.top + velocity.y));

    gsap.to(cursor, {
      duration: 0.1,
      top: pos.top,
      left: pos.left,
      ease: "power2.out"
    });

    const now = Date.now();
    if (now - lastStepAt > stepCooldown) {
      const step = footstepSound.cloneNode();
      step.play();
      lastStepAt = now;
    }
  }

  checkProximity();
  requestAnimationFrame(animationLoop);
}

const ws = new WebSocket("ws://localhost:8765");

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  const { x, y, btn } = data;

  const DEADZONE = 50;
  const dx = x - 512;
  const dy = y - 512;

  if (Math.abs(dx) > DEADZONE) {
    velocity.x = (dx / 512) * 1.5; // cursor sensitivity 
  } else {
    velocity.x = 0;
  }

  if (Math.abs(dy) > DEADZONE) {
    velocity.y = (dy / 512) * 1.5;
  } else {
    velocity.y = 0;
  }

  if (btn === 1) {
    console.log("button pressed");
  }

  if (btn === 1 && currentZone) {
  const zoneEl = document.getElementById(currentZone);
  const name = zoneEl.querySelector("h2").textContent;
  const description = zoneEl.getAttribute("data-description") || "";

  visitedZones.add(currentZone);
  speak(`${description}. You have visited ${visitedZones.size} out of 4 zones.`, true);

  // Trigger unique actions per zone
  const overlay = document.getElementById("zoneOverlay");

  switch (currentZone) {
    case "astraea":
      overlay.style.background = `
        radial-gradient(circle at center, rgba(13,13,47,0.95), rgba(0,0,0,1)),
        repeating-linear-gradient(to bottom, #88ccffaa 0 8px, transparent 8px 16px)`;
      break;

    case "gilded":
      overlay.style.background = `
        radial-gradient(circle at center, rgba(58,51,0,0.95), rgba(0,0,0,1)),
        repeating-linear-gradient(45deg, #ffff66cc 0 6px, #333 6px 12px)`;
      break;

    case "twilight":
      overlay.style.background = `
        radial-gradient(circle at center, rgba(50,0,85,0.95), rgba(0,0,0,1)),
        repeating-linear-gradient(90deg, #ff99ffcc 0 8px, transparent 8px 16px)`;
      break;

    case "unknown":
      overlay.style.background = `
        radial-gradient(circle at center, rgba(133, 30, 99, 0.95), rgba(0,0,0,1)),
        repeating-radial-gradient(circle, #ffffffaa 0 5px, transparent 5px 12px)`;
      break;


    default:
      overlay.style.background = "transparent";
}

}

};

animationLoop(); 