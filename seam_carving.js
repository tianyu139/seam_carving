let canvas = document.getElementById('img');
let gray_canvas = document.getElementById('gray');
let energy_canvas = document.getElementById('energy');
let seam_canvas = document.getElementById('seam');
let ctx = canvas.getContext("2d");
let gray_ctx = gray_canvas.getContext("2d");
let energy_ctx = energy_canvas.getContext("2d");
let seam_ctx = seam_canvas.getContext("2d");

let mountain = new Image();
mountain.src='view.jpg';
mountain.onload = () => {
  ctx.drawImage(mountain, 0, 0, canvas.width, canvas.height);
  init()
}

function get_pixel(image,x,y){
  let index = (y * image.width + x) * 4;
  let image_data = image.data
  let pixel = {red:image_data[index],
               green:image_data[index+1],
               blue:image_data[index+2],
               alpha:image_data[index+3]};
  return pixel;
}

function set_pixel(image,x,y,pixel){
  let index = (y * image.width + x)*4;
  image.data[index] = pixel.red;
  image.data[index+1] = pixel.green;
  image.data[index+2] = pixel.blue;
  image.data[index+3] = pixel.alpha;
}

function convert_pixel_to_gray(pixel){
  let gray_value = pixel.red * 0.3 + pixel.green * 0.59 + pixel.blue * 0.11;
  gray_pixel = {
    red:gray_value,
    green:gray_value,
    blue:gray_value,
    alpha:pixel.alpha
  };
  return gray_pixel;

}

function init(){
  let image = ctx.getImageData(0,0,canvas.width,canvas.height);
  let gray_image = gray_ctx.getImageData(0,0,gray_canvas.width,gray_canvas.height);
  for (let x = 0; x < image.width; x++){
    for (let y = 0; y < image.height; y++){
      let pixel = get_pixel(image,x,y);
      pixel = convert_pixel_to_gray(pixel);
      set_pixel(gray_image, x, y, pixel);
    }
  }
  gray_ctx.putImageData(gray_image,0,0);

  let energy_image = energy_ctx.getImageData(0,0,energy_canvas.width,energy_canvas.height)

  for (let x=0; x< gray_image.width; x++){
    for (let y=0; y < gray_image.height; y++){
      let pixel = get_pixel(image,x,y);
      let pixel_left = x == 0 ? get_pixel(gray_image,gray_image.width-1,y) : get_pixel(gray_image,x-1,y);
      let pixel_right = x == gray_image.width-1 ? get_pixel(gray_image,0,y) : get_pixel(gray_image,x+1,y);
      let pixel_top = y == 0 ? get_pixel(gray_image,x, gray_image.height-1) : get_pixel(gray_image,x,y-1);
      let pixel_bottom = y == gray_image.height-1 ? get_pixel(gray_image,x,0) : get_pixel(gray_image,x,y+1);
      let pixel_energy = get_energy(pixel_left,pixel_right) + get_energy(pixel_top,pixel_bottom);
      pixel_energy /= 2;
      new_pixel = {
        red:pixel_energy,
        green:pixel_energy,
        blue:pixel_energy,
        alpha:pixel.alpha,
      };
      set_pixel(energy_image,x,y,new_pixel);
    }
  }
  energy_ctx.putImageData(energy_image,0,0);

  

}


function get_energy(pixel_1,pixel_2){
  return Math.abs(pixel_1.red - pixel_2.red)
}
