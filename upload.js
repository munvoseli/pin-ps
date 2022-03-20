'use strict';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const updog = document.getElementById("updog");
const outta = document.getElementById("outta");
const capitaine = document.getElementById("capitaine");


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
		//outta.value = getAllPs(buttonData);
	}, false);
	be.bi = sprites.length;
	be.innerHTML = blabel;
	document.body.appendChild(be);
	sprites.push(sprite);
}

function loadSingleWholeImage(file) {
	let fr = new FileReader();
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
			}, file.name);
		}
		img.src = fr.result;
	}
	fr.readAsDataURL(file);
}

updog.addEventListener("change", function(e) {
	let upmode = 0;
	switch (upmode) {
	case 0:
		for (let file of this.files)
			loadSingleWholeImage(file);
		break;
	}
}, false);

capitaine.addEventListener("click", function(e) {
	navigator.clipboard.writeText(getAllPs(buttonData));
}, false);
