/*
    main.js is primarily responsible for hooking up the UI to the rest of the application 
    and setting up the main event loop
*/

import * as audio from "./audio.js";
import * as canvas from "./canvas.js";
import * as utils from "./utils.js";

const fps = 60;
const interval = 1000 / fps;

const drawParams = {
  showGradient: true,
  showBars: true,
  showCircles: true,
  showNoise: true,
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "media/after-midnight.mp3",
});

const init = () => {
    //load json
  fetch("./data/av-data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      document.title = data.appTitle;
      document.querySelector("h1").innerText = data.appTitle;

      //setup audio with the first track
      audio.setupWebaudio(data.audioTracks[0].file);

      //initialize UI elements with data from JSON
      setupUI(data);
      let canvasElement = document.querySelector("canvas");
      canvas.setupCanvas(canvasElement, audio.analyserNode);

      loop();
    })
    .catch((error) => {
      console.error("Error loading JSON data:", error);
    });
};

const setupUI = (data) => {
  let canvasElement = document.querySelector("canvas");
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#btn-fs");
  fsButton.onclick = (e) => {
    console.log("goFullscreen() called");
    utils.goFullscreen(canvasElement);
  };

  // B - hookup play button
  const btnPlay = document.querySelector("#btn-play");
  btnPlay.onclick = (e) => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    if (audio.audioCtx.state == "suspended") {
      audio.audioCtx.resume();
    }

    if (e.target.dataset.playing == "no") {
      audio.playCurrentSound();
      e.target.dataset.playing = "yes";
    } else {
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no";
    }
  };

  // C - hookup volume slider / label
  const sliderVolume = document.querySelector("#slider-volume");
  const volumeLabel = document.querySelector("#label-volume");
  sliderVolume.value = data.startingState.volume;

  sliderVolume.oninput = (e) => {
    audio.setVolume(e.target.value);
    volumeLabel.innerHTML = Math.round((e.target.value / 2) * 100);
  };

  sliderVolume.dispatchEvent(new Event("input")); // Set the volume label to match initial slider value

  // D - hookup track selection
  const trackSelect = document.querySelector("#trackSelect");
  data.audioTracks.forEach((track) => {
    const option = document.createElement("option");
    option.value = track.file;
    option.textContent = `${track.title} by ${track.artist}`;
    trackSelect.appendChild(option);
  });

  //change music
  trackSelect.onchange = (e) => {
    audio.loadSoundFile(e.target.value);
    if (btnPlay.dataset.playing == "yes") {
      btnPlay.dispatchEvent(new MouseEvent("click"));
    }
  };

  //bass/treble slider
  const bassSlider = document.querySelector("#slider-bass");
  const trebleSlider = document.querySelector("#slider-treble");
  bassSlider.value = data.startingState.bass;
  trebleSlider.value = data.startingState.treble;

  bassSlider.oninput = (e) => {
    audio.updateBass(e.target.value);
  };

  trebleSlider.oninput = (e) => {
    audio.updateTreble(e.target.value);
  };

  //checkboxes
  const cbGradient = document.querySelector("#cb-gradient");
  const cbBars = document.querySelector("#cb-bars");
  const cbCircles = document.querySelector("#cb-circles");
  const cbNoise = document.querySelector("#cb-noise");
  const cbInvert = document.querySelector("#cb-invert");
  const cbEmboss = document.querySelector("#cb-emboss");

  //checked parameters
  drawParams.showGradient = cbGradient.checked;
  drawParams.showBars = cbBars.checked;
  drawParams.showCircles = cbCircles.checked;
  drawParams.showNoise = cbNoise.checked;
  drawParams.showInvert = cbInvert.checked;
  drawParams.showEmboss = cbEmboss.checked;

  //set states in fecked
  cbGradient.checked = data.startingState.showGradient;
  cbBars.checked = data.startingState.showBars;
  cbCircles.checked = data.startingState.showCircles;
  cbNoise.checked = data.startingState.showNoise;
  cbInvert.checked = data.startingState.showInvert;
  cbEmboss.checked = data.startingState.showEmboss;

  //update event handlers
  cbGradient.onchange = (e) => {
    drawParams.showGradient = e.target.checked;
  };

  cbBars.onchange = (e) => {
    drawParams.showBars = e.target.checked;
  };

  cbCircles.onchange = (e) => {
    drawParams.showCircles = e.target.checked;
  };

  cbInvert.onchange = (e) => {
    drawParams.showInvert = e.target.checked;
  };

  cbNoise.onchange = (e) => {
    drawParams.showNoise = e.target.checked;
  };

  cbEmboss.onchange = (e) => {
    drawParams.showEmboss = e.target.checked;
  };
};

export { init };

const loop = () => {
  canvas.draw(drawParams);
  setTimeout(loop, interval);
};
