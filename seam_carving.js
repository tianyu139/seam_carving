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

function carve_vertical(image,vertical_seams){
  //let new_image = {};
  //new_image.width = image.width-1;
  //new_image.height = image.height;
  let new_data = [];
  for (let y=0; y<image.height;y++){
    let seam_pixel = vertical_seams[y];
    for (let x=0; x<image.width;x++){
      if (x !== seam_pixel) {
        let index = (y * image.width + x)*4;
        new_data.push(image.data[index]);
        new_data.push(image.data[index+1]);
        new_data.push(image.data[index+2]);
        new_data.push(image.data[index+3]);
      }
    }
  }
  new_data = new Uint8ClampedArray(new_data);
  let new_image = new ImageData(new_data,image.width-1,image.height);
  return new_image;
  /*for (let y=0; y<image.height; y++){
    let x = vertical_seams[y];
    let index = (y * image.width +x)*4;
    image.data.slice(index,4)
  }
  image.width = image.width-1;
  image.height = image.height-1;
  return image;*/
}
function wait(ms){
  let d = new Date();
  let d2 = null;
  do { d2 = new Date(); }
  while(d2-d < ms);
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

  //for (let i=0;i<50;i++){
  let count=0;
  let intervalz = setInterval(function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    gray_ctx.clearRect(0,0,gray_canvas.width,gray_canvas.height);
    energy_ctx.clearRect(0,0,energy_canvas.width,energy_canvas.height);
    ctx.putImageData(image,0,0);
    gray_ctx.putImageData(gray_image,0,0);
    energy_ctx.putImageData(energy_image,0,0);
    let energy_matrix = [];
    for (let x=0; x< gray_image.width; x++){
      energy_matrix[x] = [];
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
        energy_matrix[x][y] = pixel_energy;
      }
    }
    energy_ctx.putImageData(energy_image,0,0);

    let cost_matrix = get_vertical_cost_matrix(energy_matrix);
    vertical_seam = get_vertical_seam(cost_matrix);

    for (let y=0;y < image.height; y++){
      red_pixel = {
          red:255,
          green:0,
          blue:0,
          alpha:255
      };
      set_pixel(image,vertical_seam[y],y,red_pixel);
      set_pixel(gray_image,vertical_seam[y],y,red_pixel);
      set_pixel(energy_image,vertical_seam[y],y,red_pixel);
    }
    ctx.putImageData(image,0,0);
    gray_ctx.putImageData(gray_image,0,0);
    energy_ctx.putImageData(energy_image,0,0);

    image=carve_vertical(image,vertical_seam);
    gray_image=carve_vertical(gray_image,vertical_seam);
    energy_image=carve_vertical(energy_image,vertical_seam);
    count++;
    if (count > 150){
      stopInterval()
    }
  }, 200);
  function stopInterval(){
    clearInterval(intervalz);
  }
}


function get_energy(pixel_1,pixel_2){
  return Math.abs(pixel_1.red - pixel_2.red)
}

function get_vertical_cost_matrix(energy_matrix){
  let width = energy_matrix.length;
  let height = energy_matrix[0].length;
  let cost_matrix = [];
  // Initialize the cost matrix
  for (let x = 0; x < width; x++){
    cost_matrix[x] = [];
    for (let y = 0; y < height; y++){
      cost_matrix[x][y] = 0;
    }
  }
  for (let y = 0; y < height; y++){
    for (let x = 0; x < width ; x++){
      if ( y == 0 ) {
        cost_matrix[x][y] = energy_matrix[x][y];
        continue;
      }
      let pixel_topleft_energy = x == 0 ? cost_matrix[x][y-1] : cost_matrix[x-1][y-1];
      let pixel_top_energy = cost_matrix[x][y-1];
      let pixel_topright_energy = x == width-1 ? cost_matrix[x][y-1] : cost_matrix[x+1][y-1];
      let min_energy = Math.min(pixel_topleft_energy,pixel_top_energy,pixel_topright_energy);
      cost_matrix[x][y] = min_energy + energy_matrix[x][y];
    }
  }
  return cost_matrix;
}

function get_vertical_seam(cost_matrix){
  let width = cost_matrix.length;
  let height = cost_matrix[0].length;
  let index = 0;
  let number = cost_matrix[0][height-1];
  let seam = []
  for ( let x = 1; x <= width-1; x++){
    if (cost_matrix[x][height-1] < number){
      number = cost_matrix[x][height]-1;
      index = x;
    }
  }
  seam.push(index);
  for ( let y = height-2; y >= 0; y--){
    let index = seam[seam.length-1];
    console.log(index);
    if (index==0) {
      if ( cost_matrix[1][y] < cost_matrix[0][y] ) {
        seam.push(1);
      } else {
        seam.push(0);
      }
    } else if (index==width-1) {
      if ( cost_matrix[width-1][y] < cost_matrix[width-2][y] ) {
        seam.push(width-1);
      } else {
        seam.push(width-2);
      }
    } else {
      let min_value = cost_matrix[index-1][y];
      let min_index = index-1;
      if (cost_matrix[index][y] < min_value) {
        min_value = cost_matrix[index][y];
        min_index = index;
      }
      if (cost_matrix[index+1][y] < min_value) {
        min_value = cost_matrix[index+1][y];
        min_index = index+1;
      }
      seam.push(min_index)
    }
  }
  return seam
}
