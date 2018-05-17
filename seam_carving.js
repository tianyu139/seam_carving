let canvas = document.getElementById('img');
let gray_canvas = document.getElementById('gray');

let ctx = canvas.getContext("2d");
let gray_ctx = gray_canvas.getContext("2d")

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
  for (let x = 0; x < canvas.width; x++){
    for (let y = 0; y < canvas.height; y++){
      let pixel = get_pixel(image,x,y);
      pixel = convert_pixel_to_gray(pixel);
      set_pixel(gray_image, x, y, pixel);
    }
  }
  gray_ctx.putImageData(gray_image,0,0);
}
