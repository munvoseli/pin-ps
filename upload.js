'use strict';

const canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
const updog = document.getElementById("updog");
const outta = document.getElementById("outta");
const capitaine = document.getElementById("capitaine");


let sprites = [];
let sprh = ["Spritesheets"];
let sprhel = document.createElement("dir");
sprhel.innerHTML = "h";
document.body.appendChild(sprhel);
sprhel.setAttribute("id", "sprhel");
for (let i = 0; i < 10; ++i) {
	sprhel.appendChild(document.createElement("div"));
}

function clearChildren(el) {
	while (el.children.length)
		el.removeChild(el.lastChild);
}

function dironclick() {
	console.log(this.dirt);
	for (let i = this.layer; i < 10; ++i)
		clearChildren(sprhel.children[i]);
	for (let i = 1; i < this.dirt.length; ++i) {
		if (this.dirt[i] instanceof Array) {
			sprhel.children[this.layer].appendChild(createButtonWithDir(this.dirt[i], this.layer + 1));
		} else if (typeof this.dirt[i] == "number") {
			addSpriteToButtonData(this.dirt[i]);
			console.log("added button data");
		}
	}
}

document.body.appendChild(createButtonWithDir(sprh, 0));

function getDescBySteps(steps) {
	let p = sprh;
	for (let step of steps) {
		for (let i = 0; i < p.length; ++i) {
			if (p instanceof Array && p[i][0] == step) {
				p = p[i];
				break;
			}
		}
	}
	return p;
}

function createButtonWithDir(dir, layer) {
	let btn = document.createElement("button");
	btn.dirt = dir;
	btn.layer = layer;
	btn.innerHTML = dir[0];
	if (dir.length == 2 && typeof dir[1] == "number") {
		btn.style.backgroundColor = "#ccc";
		let can = document.createElement("canvas");
		let spr = sprites[dir[1]];
		can.width  = spr.sw;
		can.height = spr.sh;
		let ctx = can.getContext("2d");
		ctx.putImageData(spr.imageData, -spr.sx, -spr.sy, spr.sx, spr.sy, spr.sw, spr.sh);
		btn.appendChild(can);
	}
	btn.addEventListener("click", dironclick);
	return btn;
}

function splitPath(path) {
	let steps = [];
	let j = 0;
	for (var i = 0; i < path.length; ++i) {
		if (path[i] == "\\" || path[i] == "/") {
			let ss = path.substring(j, i);
			if (ss.length != 0)
				steps.push(ss);
			j = i + 1;
		} else if (path.charCodeAt(i) >= 0x30 && path.charCodeAt(i) <= 0x39 && (path.charCodeAt(i-1) < 0x30 || path.charCodeAt(i-1) > 0x39)) {
			let ss = path.substring(j, i);
			if (ss.length != 0)
				steps.push(ss);
			j = i;
		}
	}
	if (i > j) {
		let ss = path.substring(j, i);
		steps.push(ss);
	}
	return steps;
}

function addSpriteToPath(id, path) {
	let steps = splitPath(path);
	let patharr = sprh;
	for (let i = 0; i < steps.length; ++i) {
		let foundPath = false;
		for (let p of patharr) {
			if (p[0] == steps[i]) {
				foundPath = true;
				patharr = p;
				break;
			}
		}
		if (!foundPath) {
			let p = [steps[i]];
			patharr.push(p);
			patharr = p;
		}
	}
	patharr.push(id);
}

function addSpriteToButtonData(bi) {
	let spr = sprites[bi];
	buttonData.push({
		imageData: spr.imageData,
		sx: spr.sx,
		sy: spr.sy,
		sw: spr.sw,
		sh: spr.sh,
		offset: [0, 0],
		scale: [0]
	});
}

function addSprite(sprite, blabel) {
//	let be = document.createElement("button");
//	be.addEventListener("click", function() {
//		//outta.value = getAllPs(buttonData);
//	}, false);
//	be.bi = sprites.length;
//	be.innerHTML = blabel;
//	document.body.appendChild(be);
	addSpriteToPath(sprites.length, blabel);
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
