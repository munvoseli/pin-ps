'use strict';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const updog = document.getElementById("updog");
const outta = document.getElementById("outta");


let sprites = [];

function addSprite(sprite, blabel) {
	let be = document.createElement("button");
	be.addEventListener("click", function() {
		let spr = sprites[this.bi];
		buttonData.push({
			imageData: spr.imageData,
			sx: spr.sx,
			sy: spr.sy,
			sw: spr.sw,
			sh: spr.sh,
			offset: [0, 0],
			scale: [0]
		});
		outta.value = getAllPs(buttonData);
	}, false);
	be.bi = sprites.length;
	be.innerHTML = blabel;
	document.body.appendChild(be);
	sprites.push(sprite);
}

updog.addEventListener("change", function(e) {
	let fr = new FileReader();
	let blabel = this.files[0].name;
	fr.onloadend = function() {
		let img = new Image();
		img.onload = function() {
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			canvas.getContext("2d").drawImage(img, 0, 0);
			let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
			addSprite({
				imageData: imageData,
				sx: 0, sy: 0,
				sw: imageData.width,
				sh: imageData.height
			}, blabel);
		}
		img.src = fr.result;
	}
	fr.readAsDataURL(this.files[0]);
}, false);
