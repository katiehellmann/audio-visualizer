/*
    The purpose of this file is to take in the analyser node and a <canvas> element: 
      - the module will create a drawing context that points at the <canvas> 
      - it will store the reference to the analyser node
      - in draw(), it will loop through the data in the analyser node
      - and then draw something representative on the canvas
      - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import Sprite from './sprite.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData;
let sprites = [];
let running = false;
let img = new Image(); 

//setup the canvas
const setupCanvas = (canvasElement, analyserNodeRef) => {
    // create drawing context
    ctx = canvasElement.getContext("2d", {willReadFrequently: true});
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "blue" }, { percent: .25, color: "green" }, { percent: .5, color: "yellow" }, { percent: .75, color: "red" }, { percent: 1, color: "magenta" }]);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);

    //sprite instances
    sprites.push(new Sprite(50,50,50,50,'white', "media/sparkles.png"));
    sprites.push(new Sprite(350,30,60,60,'blue', "media/rabbit.png"));
    sprites.push(new Sprite(550,75,30,30,'pink', "media/wand.png"));

}


//a function that draws to the canvas
const draw = (params = {}) => {

    //viz type
    const visualizationType = document.querySelector('input[name="visualization"]:checked').value;


    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference" 
    if (visualizationType === "frequency"){
        analyserNode.getByteFrequencyData(audioData);
    } else if (visualizationType === "time-domain") {
        analyserNode.getByteTimeDomainData(audioData);
    }
    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3 - draw gradient
    if (params.showGradient) {
        let gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, "#6e21fc");
        gradient.addColorStop(0.5, "#181e4a");
        gradient.addColorStop(1, "#381a70");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }


    // 4 - draw bars
    if (params.showBars) {
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let barHeight = 100;
        let topSpacing = 100;

        ctx.save();
         //loop through data and set color for each bar
    for (let i = 0; i < audioData.length; i++) {
        //calculate the huto create a rainbow effect
        let hue = (i / audioData.length) * 360; 

        //set fill and stroke styles using HSL for rainbow effect
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.5)`; 
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.7)`;

        //draw the filled bar
        ctx.fillRect(
            margin + i * (barWidth + barSpacing),
            topSpacing + 256 - audioData[i],
            barWidth,
            barHeight
        );

        //draw the outline of the bar
        ctx.strokeRect(
            margin + i * (barWidth + barSpacing),
            topSpacing + 256 - audioData[i],
            barWidth,
            barHeight
        );
    }
        ctx.restore();
    }

        //DRAW CHAPPEL ROAN!!!!!!!!!!!!
        loadImage();
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(img, 0, 0);
        ctx.restore();

    // 5 - DRAW HEARTS!!!
    if (params.showCircles) {
        for (let i = 0; i < audioData.length; i++) {
          
        let percent = audioData[i] / 255;
        let scaleFactor = 0.5 + percent *1.3;
        let maxRadius = canvasHeight / 6;
        ctx.globalAlpha = 0.4;
        ctx.save();
        
        let heartX = canvasWidth / 3 * 2;
        let heartY = canvasHeight / 4  ;
            
        // Draw first heart layer
        ctx.fillStyle = utils.makeColor(240, 0, 73, 0.34 - percent / 3.0);
        drawHeart(ctx, heartX, heartY+20, maxRadius * scaleFactor);
        ctx.fill();
    
        // Draw second heart layer
        ctx.fillStyle = utils.makeColor(255, 0, 212, 0.10 - percent / 10.0);
        drawHeart(ctx, heartX, heartY +10, maxRadius * scaleFactor * 1.5);
        ctx.fill();
    
        // Draw third heart layer
        ctx.fillStyle = utils.makeColor(255, 100, 100, 0.5 - percent / 5.0);
        drawHeart(ctx, heartX, heartY+30, maxRadius * scaleFactor * 0.5);
        ctx.fill();
        }
        ctx.restore();
    }


    //draw sprites
    for (let sprite of sprites){
        sprite.update(audioData);
        sprite.draw(ctx);
    }



    // 6 - bitmap manipulation
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
    // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i += 4) {


        // C) randomly change every 20th pixel to a custom color (e.g., random blue shades)
        if (params.showNoise && Math.random() < 0.5) {
            let randomBlue = Math.floor(Math.random() * 255); // generate a random blue value
            data[i] = 0;   // red channel set to 0
            data[i + 1] = 0; // green channel set to 0
            data[i + 2] = randomBlue; // blue channel set to a random value
            data[i + 3] = 255; // alpha channel set to fully opaque
        } // end if


        //invert
        if (params.showInvert) {
            let red = data[i], green = data[i + 1], blue = data[i + 2];
            data[i] = 255 - red;
            data[i + 1] = 255 - green;
            data[i + 2] = 255 - blue;
        }
    } // end for

    if (params.showEmboss) {
        for (let i = 0; i < length; i++) {
            if (i % 4 == 3) continue;
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
        }
    }

    // D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);

}

//start visualizer!1
const startVisualizer = (params) => {
    running = true;
    const frameDuration = 1000 / 60; 

    const render = () => {
        if (running) {
            draw(params);
            setTimeout(render, frameDuration); 
        }
    };
    render(); 
}

//stop visualizer!!
const stopVisualizer = () => {
    running = false; 
}

//a function to load an image and to prevent flickering
function loadImage(){
    img.onload = function(){
      img = this; // update the image to be rendered with the new & loaded one
      setTimeout(loadImage, 2000); // start loading a new one in 2 sec (will be rendered even later)
      }
    img.onerror = loadImage;
    img.src = "media/chappell-roan-sticker.png";
    }


//a helper function to draw a heart
function drawHeart(ctx, x, y, size) {
    
    ctx.beginPath();
    ctx.moveTo(x, y + size / 8);
    
    //first half of the heart
    ctx.bezierCurveTo(
        x - size / 2, y - size / 2, 
        x - size, y + size / 2,     
        x, y + size                 
    );
    
    //other half of the heart
    ctx.bezierCurveTo(
        x + size, y + size / 2,     
        x + size / 2, y - size / 2, 
        x, y + size / 6             
    );

    ctx.closePath();
}
export { setupCanvas, startVisualizer, stopVisualizer, draw };