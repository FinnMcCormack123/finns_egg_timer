
// Egg Timer Logic
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const timerDisplay = document.getElementById('timerDisplay');
const alarmSound = document.getElementById('alarmSound');

const runnyBtn = document.getElementById('runnyBtn');
const softBtn = document.getElementById('softBtn');
const hardBtn = document.getElementById('hardBtn');
const customBtn = document.getElementById('customBtn');

// Preset times in seconds
const presets = {
    runny: 4 * 60,        // 4:00
    soft: 6 * 60,         // 6:00
    hard: 9 * 60,         // 9:00
};

let customTime = 5 * 60; // Default custom time (5:00)
let selectedPreset = 'runny';
let initialSeconds = presets.runny;

let timer = null;
let totalSeconds = presets.runny;
let paused = false;

function updateDisplay(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
    updateProgress(secs);
    // Do not enable Start here; only enable after timer ends, reset, or preset selection
}

function updateProgress(secs) {
    const ring = document.querySelector('.progress-bar');
    if (!ring) return;
    let max = initialSeconds || 1;
    let percent = Math.max(0, Math.min(1, secs / max));
    const radius = 135; // match SVG r
    const circumference = 2 * Math.PI * radius;
    ring.setAttribute('stroke-dasharray', `${circumference * percent} ${circumference}`);
}

function setInputsDisabled(disabled) {
    // No-op: no inputs to disable
}

function startTimer() {
    if (timer) return;
    if (!paused) {
        // totalSeconds is already set by preset button
    }
    if (totalSeconds <= 0) return;
    setInputsDisabled(true);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    timer = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay(totalSeconds);
        } else {
            clearInterval(timer);
            timer = null;
            setInputsDisabled(false);
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = true;
            updateDisplay(0);
            if (alarmSound) {
                alarmSound.currentTime = 0;
                alarmSound.play().catch((e) => {
                    // If playback fails (e.g., due to browser policy), show a visual cue
                    timerDisplay.textContent = '🔔';
                });
                // Flash the screen red 3 times, then show alert
                document.body.classList.add('flash-red');
                setTimeout(() => {
                    document.body.classList.remove('flash-red');
                    alert('Time\'s up!');
                }, 1500); // 0.3s * 5 flashes
            } else {
                alert('Time\'s up!');
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        paused = true;
        // Enable startBtn so user can resume
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function resetTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    paused = false;
    setInputsDisabled(false);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    // Reset to initial value for the selected preset
    if (selectedPreset === 'runny') {
        totalSeconds = presets.runny;
        initialSeconds = presets.runny;
    } else if (selectedPreset === 'soft') {
        totalSeconds = presets.soft;
        initialSeconds = presets.soft;
    } else if (selectedPreset === 'hard') {
        totalSeconds = presets.hard;
        initialSeconds = presets.hard;
    } else if (selectedPreset === 'custom') {
        totalSeconds = customTime;
        initialSeconds = customTime;
    }
    updateDisplay(totalSeconds);
}


startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

runnyBtn.addEventListener('click', () => {
    totalSeconds = presets.runny;
    initialSeconds = presets.runny;
    paused = false;
    selectedPreset = 'runny';
    updateDisplay(totalSeconds);
    setActivePreset('runny');
    startBtn.disabled = false;
});
softBtn.addEventListener('click', () => {
    totalSeconds = presets.soft;
    initialSeconds = presets.soft;
    paused = false;
    selectedPreset = 'soft';
    updateDisplay(totalSeconds);
    setActivePreset('soft');
    startBtn.disabled = false;
});
hardBtn.addEventListener('click', () => {
    totalSeconds = presets.hard;
    initialSeconds = presets.hard;
    paused = false;
    selectedPreset = 'hard';
    updateDisplay(totalSeconds);
    setActivePreset('hard');
    startBtn.disabled = false;
});
customBtn.addEventListener('click', () => {
    let min = prompt('Enter custom minutes:', '5');
    let sec = prompt('Enter custom seconds:', '0');
    min = parseInt(min, 10);
    sec = parseInt(sec, 10);
    if (isNaN(min) || min < 0) min = 0;
    if (isNaN(sec) || sec < 0 || sec > 59) sec = 0;
    customTime = min * 60 + sec;
    totalSeconds = customTime;
    initialSeconds = customTime;
    paused = false;
    selectedPreset = 'custom';
    updateDisplay(totalSeconds);
    setActivePreset('custom');
    startBtn.disabled = false;
});

function setActivePreset(preset) {
    [runnyBtn, softBtn, hardBtn, customBtn].forEach(btn => btn.classList.remove('active'));
    if (preset === 'runny') runnyBtn.classList.add('active');
    if (preset === 'soft') softBtn.classList.add('active');
    if (preset === 'hard') hardBtn.classList.add('active');
    if (preset === 'custom') customBtn.classList.add('active');
}

// Initialize display with default (runny)
setActivePreset('runny');
updateDisplay(totalSeconds);

// Unlock audio playback on first user interaction
window.addEventListener('click', function unlockAudio() {
    if (alarmSound) {
        alarmSound.play().then(() => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            window.removeEventListener('click', unlockAudio);
        }).catch(() => {
            // Ignore errors, just try to unlock
        });
    }
});
