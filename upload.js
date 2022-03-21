'use strict';

const canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
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

function loadCeleste(datafile, metafile) {
	let fr = new FileReader();
	fr.onloadend = function() {
		let imd = celesteToImageData(fr.result);
		fr.onloadend = function() {
			let sm = celesteToSheetmeta(fr.result);
			console.log(imd, sm);
			for (let h of sm) {
				if (h[3] * h[4] % 8 == 0)
				addSprite({
					imageData: imd,
					sx: h[1], sy: h[2], sw: h[3], sh: h[4]
				}, h[0]);
			}
		}
		fr.readAsArrayBuffer(metafile);
		//canvas.width = imd.width;
		//canvas.height = imd.height;
		//ctx.putImageData(imd, 0, 0);
	}
	fr.readAsArrayBuffer(datafile);
}


updog.addEventListener("change", function(e) {
	let upmode = 1;
	switch (upmode) {
	case 0:
		for (let file of this.files)
			loadSingleWholeImage(file);
		break;
	case 1:
		console.log(this.files.length);
		if (this.files.length != 2) break;
		let fn0 = this.files[0].name;
		if (fn0.substr(fn0.length - 4) == "data")
			loadCeleste(this.files[0], this.files[1]);
		else
			loadCeleste(this.files[1], this.files[0]);
		break;
	}
	console.log(this.files);
}, false);

capitaine.addEventListener("click", function(e) {
	navigator.clipboard.writeText(getAllPs(buttonData));
}, false);
