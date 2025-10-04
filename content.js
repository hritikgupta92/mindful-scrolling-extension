function injectMindfulOverlay() {
  const overlayId = "mindful-overlay-" + location.hostname.replace(/\./g, "-");
  if (document.getElementById(overlayId)) return;

  const overlay = document.createElement("div");
  overlay.id = overlayId;

  const vegetaImg = chrome.runtime.getURL("images/vegeta.jpeg");

  // Show checkboxes only for YouTube / Instagram
  const showCheckboxes = !location.hostname.includes("linkedin.com");

  overlay.innerHTML = `
    <div id="mindful-box">
      <h2>Before you continue...</h2>
      <img src="${vegetaImg}" alt="Vegeta" id="vegeta-img" />
      <p>Chain of thought #1: Do you know this person?</p>
      <p>Chain of thought #2: Are you making use of your potential?</p>
      <p>Chain of thought #3: Is this a good use of your life?</p>
      <hr>
      ${
        showCheckboxes
          ? `
        <h3>Make 3 promises:</h3>
        <label><input type="checkbox" id="promise1"> I Promise my time is Valuable and I'll not just scroll it away.</label><br>
        <label><input type="checkbox" id="promise2"> I Promise you matter more than any strangers</label><br>
        <label><input type="checkbox" id="promise3"> I will stay focused on my goals</label><br><br>
      `
          : ""
      }
      <button id="mindful-continue">Continue</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const style = document.createElement("style");
  style.innerHTML = `
  #${overlayId} {
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex; justify-content: center; align-items: center;
    z-index: 999999;
  }
  #mindful-box {
    background: white; padding: 20px; border-radius: 10px;
    max-width: 400px; text-align: left;
    font-family: Arial, sans-serif;
  }
  #mindful-box h2 { margin-top: 0; }
  #mindful-box p {
    font-size: 18px;
    line-height: 1.5;
  }
  #mindful-box button {
    margin-top: 10px; padding: 10px;
    background: #4CAF50; color: white;
    border: none; border-radius: 5px; cursor: pointer;
  }
  #vegeta-img {
    display: block;
    max-width: 100%;
    margin: 10px auto;
    border-radius: 8px;
  }
  #mindful-fullscreen {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999999;
  }
  #mindful-fullscreen img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 12px;
  }
`;
  document.head.appendChild(style);

  // Pause any playing audio/video
  const mediaElements = Array.from(document.querySelectorAll("video, audio"));
  const wasPlaying = mediaElements.map((el) => {
    const playing = !el.paused;
    if (playing) el.pause();
    return playing;
  });

  // Continue button logic
  document.getElementById("mindful-continue").onclick = () => {
    if (showCheckboxes) {
      if (
        document.getElementById("promise1").checked &&
        document.getElementById("promise2").checked &&
        document.getElementById("promise3").checked
      ) {
        overlay.remove();
      } else {
        alert("Please tick all promises before continuing.");
        return;
      }
    } else {
      overlay.remove();
    }

    // Resume previously playing media
    mediaElements.forEach((el, i) => {
      if (wasPlaying[i]) el.play().catch(() => {});
    });
  };
}

// Show full screen warning with ghar_nhi_chalta.jpeg
function showFullScreenWarning() {
  if (document.getElementById("mindful-fullscreen")) return;

  const overlay = document.createElement("div");
  overlay.id = "mindful-fullscreen";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("images/ghar_nhi_chalta.jpeg");
  img.alt = "Go Home Reminder";

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.onclick = () => overlay.remove();
}

// Run once on load
injectMindfulOverlay();

// SPA navigation handling
(function () {
  let lastUrl = location.href;

  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      injectMindfulOverlay();
    }
  }

  const pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(this, arguments);
    checkUrlChange();
  };

  const replaceState = history.replaceState;
  history.replaceState = function () {
    replaceState.apply(this, arguments);
    checkUrlChange();
  };

  window.addEventListener("popstate", checkUrlChange);
  setInterval(checkUrlChange, 1000);
})();

// Track time spent per site
(function () {
  const host = location.hostname;
  const isInstagram = host.includes("instagram.com");
  const limit = isInstagram ? 3 * 60 * 1000 : 60 * 60 * 1000; // 3 min vs 1 hr
  let timer;

  function startTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      showFullScreenWarning();
    }, limit);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timer);
    } else {
      startTimer();
    }
  });

  startTimer();
})();
