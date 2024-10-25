class Sprite {
  constructor(x, y, width, height, color, imagePath) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.imagePath = imagePath;
    this.image = new Image(); // Create a new Image object
    this.image.src = this.imagePath; // Set the source of the image
  }

  //change the sprite based on audio data
  update(audioData) {
    this.width = (audioData[0] / 255) * 100;
    this.height = (audioData[1] / 255) * 100;
    this.alpha = Math.abs(Math.sin(Date.now() * 0.001)) * 0.5 + 0.5;
  }

  //a function to draw a sprite
  draw(ctx) {
    ctx.save();
    //check if the image is loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      //fallback to a colored rectangle if the image is not loaded
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }
}

export default Sprite;
