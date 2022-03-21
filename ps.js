'use strict';



// button inner/outer diameter
const BID_IN = 91/64;
const BID_PT = BID_IN * 72;
const BOD_IN = 119/64;
const BOD_PT = BOD_IN * 72;
const HEX = "0123456789abcdef";

function getRandomMask(sw, sh) {
	let res = `${sw} ${sh} false [1 0 0 -1 ${sw/2} ${sh/2}] {<\n`;
	for (let i = 0; i < sw * sh / 4; ++i) {
		res += HEX[Math.floor(Math.random() * 16)];
	}
	return res + "\n>} imagemask\n";
}


// this function is used when
// the image has transparent pixels
// and is meant to be on a non-solid background
// but it is also recommended
// when the image only has a few colors
function getImagePsMask(imageData, sx, sy, sw, sh) {
	// pad up to the nearest above-or-eq multiple of 8 pixels
	//const padPixCount = (sw * sh);// + ((8 - ((sw * sh) % 8)) & 7);
	let imd = new Uint8Array(sw * sh * 4);
	let i = 0;
	for (let y = sy; y < sy + sh; ++y)
		for (let xc = sx; xc < (sx + sw) * 4; ++xc)
			imd[i++] = imageData.data[y * imageData.width * 4 + xc];
	i = 0;
	let res = "";
	while (true) {
		// find next color
		while (imd[i + 3] != 255) {
			i += 4;
			if (i >= sw * sh * 4) {
				return res;
			}
		}
		let bitmap = "";
		let buffer = 1;
		for (let j = 0; j < imd.length; j += 4) {
			buffer <<= 1;
			if (imd[j + 3] == 255
				&& imd[j] == imd[i]
				&& imd[j + 1] == imd[i + 1]
				&& imd[j + 2] == imd[i + 2]) {
				buffer |= 1;
				imd[j + 3] = 0;
			}
			if (buffer & 256) {
				bitmap += HEX[(buffer >> 4) & 15] + HEX[buffer & 15];
				buffer = 1;
			}
		}
		if (buffer != 1) {
			console.error("potential source of error", buffer);
			while ((buffer & 256) == 0)
				buffer <<= 1;
			bitmap += HEX[(buffer >> 4) & 15] + HEX[buffer & 15];
		}
		res += `${(imd[i]/255).toFixed(3)} ${(imd[i + 1]/255).toFixed(3)} ${(imd[i + 2]/255).toFixed(3)} setrgbcolor\n`;
		//res += `${Math.random()} setgray\n`;
		res += `${sw} ${sh} true [1 0 0 -1 ${sw/2} ${sh/2}] {<\n`;
		res += bitmap;
		res += "\n>} imagemask\n";
	}
	console.error("ldksfja;fk");
}

// this function is used when
// the image is entirely opaque
// or is meant to be on a solid background
function getImagePsColor(imageData, srcx, srcy, wpx, hpx, bgColor) {
	let res = `${sw} ${sh} 8 [1 0 0 -1 ${sw/2} ${sh/2}] {<\n`;
	for (let y = srcy; y < srcy + hpx; ++y) {
		for (let x = srcx; x < srcx + wpx; ++x) {
			if (imageData.data[(y * imageData.width + x) * 4 + 3] != 255) {
				res += bgColor;
				continue;
			}
			for (let c = 0; c < 3; ++c) {
				const h = imageData.data[(y * imageData.width + x) * 4 + c];
				res += HEX[h >> 4] + HEX[h & 15];
			}
		}
	}
	res += "\n>}\nfalse 3 colorimage\n";
	return res;
}

function hyton(nybble) {
	let c = nybble.charCodeAt(0);
	if (c > 0x39)
		return (c & 15) + 9;
	return c & 15;
}

function hbton(nya, nyb) {
	return (hyton(nya) << 4) + hyton(nyb);
}

function hctostr(hc) { // hex color string to ps string
	return (
		(hbton(hc[0], hc[1]) / 255).toFixed(3) + " " +
		(hbton(hc[2], hc[3]) / 255).toFixed(3) + " " +
		(hbton(hc[4], hc[5]) / 255).toFixed(3) + " setrgbcolor"
	);
}

function getStripesPs(stripes) {
	let res = "";
	res += `newpath ${-BOD_PT/2} ${-BOD_PT/2} moveto ${BOD_PT/2} ${-BOD_PT/2} lineto\n`;
	for (let i = 1; i < stripes.length; ++i) {
		let y = (BID_PT * (-1/2 + i / stripes.length)).toFixed(2);
		res += `${BOD_PT/2} ${y} lineto ${-BOD_PT/2} ${y} lineto closepath\n`;
		res += hctostr(stripes[i - 1]) + " fill\n";
		res += `newpath ${-BOD_PT/2} ${y} moveto ${BOD_PT/2} ${y} lineto\n`;
	}
	res += `${BOD_PT/2} ${BOD_PT/2} lineto ${-BOD_PT/2} ${BOD_PT/2} lineto closepath\n`;
	res += hctostr(stripes[stripes.length - 1]) + " fill\n";
	return res;
}

// auto / inner / outer / custom
// auto + auto = inscribe inner circle
function getScales(scale, sw, sh) {
	let sclx, scly;
	let xss = scale & 3;
	let yss = scale >> 2;
	if (!xss && !yss) {
		sclx = scly = BID_PT / Math.sqrt(sw ** 2 + sh ** 2);
		return [sclx, scly];
	}
	if (xss)
		sclx = [0, BID_PT, BOD_PT, scale[1] || 0][xss] / sw;
	if (yss)
		scly = [0, BID_PT, BOD_PT, scale[2] || 0][yss] / sh;
	if (!xss)
		sclx = scly;
	else
		scly = sclx;
	return [sclx, scly];
}

// sx, sy, sw, and sh refer to the source on the imageData, and are all pixel measurements
function getButtonPs(imageData, sx, sy, sw, sh, offset, scale, bgColor) {
	let res = "";
	let [sclx, scly] = getScales(scale, sw, sh);
	res += `${sclx} ${scly} scale\n`;
	res += `${offset[0] || 0} ${offset[1] || 0} translate\n`;
	if (!bgColor)
		res += getImagePsMask(imageData, sx, sy, sw, sh);
	else
		res += getImagePsColor(imageData, sx, sy, sw, sh, bgColor);
	res += "\n";
	return res;
}

function getAllPs(arr) {
	let outstr = "%!PS-Adobe-2.0\n";
	const pw = 612; // pt
	outstr += `<< /PageSize [${pw} 792] >> setpagedevice\n`; // 8.5x11
	let perrow = Math.floor(pw / BOD_PT);
	let hspace = pw / perrow;
	let vspace = BOD_PT + 12;
	let i = 0;
	arr.push({});
	for (let bd of arr) {
		let x = (i % perrow + 1/2) * hspace;
		let y = (Math.floor(i / perrow) + 1/2) * vspace;
		outstr += `gsave\n${x} ${y} translate\n`;
		outstr += `newpath 0 0 ${BOD_PT/2} 0 360 arc closepath clip\n`;
		outstr += "clippath 1 setlinewidth 0.5 setgray stroke\n";
		//outstr += getButtonPs(bd.imageData, bd.sx, bd.sy, bd.sw, bd.sh, [0, 0], [i], "");
		outstr += getStripesPs(["55aaff", "ff55aa", "ffffff", "ff55aa", "55aaff"]);
		outstr += "grestore\n"; // clipsave/restore not necessary due to gsave/restore
		++i;
	}
	return outstr + "showpage\n";
}

let buttonData = [];
// imageData, sx, sy, sw, sh, offset, scale
