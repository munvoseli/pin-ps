// offset:
// pixels
// points

// scale:
// inscribe
// circumscribe inner
// circumscribe outer
// circumscribe outer unlinked
// circumscribe outer unlinked
// custom original ratio
// custom unlinked ratio

// outer / inner / auto / custom
// auto + auto = inscribe inner circle

// button inner/outer diameter
const BID_IN = 91/64;
const BID_PT = BID_IN * 72;
const BOD_IN = 119/64;
const BOD_PT = BOD_IN * 72;
const HEX = "0123456789abcdef";

function getImagePsColor(imageData, srcx, srcy, wpx, hpx) {
	let res = `${wpx} ${hpx} 8 [1 0 0 -1 ${wpx/2} ${hpx/2}] {<\n`;
	for (let y = srcy; y < srcy + hpx; ++y) {
		for (let x = srcx; x < srcx + wpx; ++x) {
			for (let c = 0; c < 3; ++c) {
				const h = imageData.data[(y * imageData.width + x) * 4 + c];
				res += HEX[h >> 4] + HEX[h & 15];
			}
		}
	}
	return res + "\n>}\nfalse 3 colorimage\n";
}

// auto / inner / outer / custom
function getScales(scale, sw, sh) {
	let sclx, scly;
	let xss = scale & 3;
	let yss = scale >> 2;
	if (xss && yss) {
		sclx = [0, BID_PT, BOD_PT, scale[1]][xss] / sw;
		scly = [0, BID_PT, BOD_PT, scale[2]][yss] / sh;
	} else if (xss) {
		sclx = scly = [0, BID_PT, BOD_PT, scale[1]][xss] / sw;
	} else if (yss) {
		sclx = scly = [0, BID_PT, BOD_PT, scale[2]][yss] / sh;
	} else {
		sclx = scly = BID_PT / Math.sqrt(sw ** 2 + sh ** 2);
	}
	return [sclx, scly];
}

function getButtonPs(wpx, hpx, srcx, srcy, imageData, offset, scale, bgColor) {
	let res = "";
	let [sclx, scly] = getScales(scale, wpx, hpx);
	res += "clipsave\n";
	res += `newpath 0 0 ${BOD_PT/2} 0 360 arc closepath clip\n`;
	res += `gsave\n${sclx} ${scly} scale\n`;
	res += getImagePsColor(imageData, srcx, srcy, wpx, hpx);
	res += "grestore\n";
	res += `newpath 0 0 ${BID_PT/2} 0 360 arc closepath\n`;
	res += "1 setlinewidth 0.5 setgray stroke\n";
	res += `newpath 0 0 ${BOD_PT/2} 0 360 arc closepath\n`;
	res += "1 setlinewidth 0.5 setgray stroke\n";
	res += "cliprestore\n";

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
	for (let bd of arr) {
		let x = (i % perrow + 1/2) * hspace;
		let y = (Math.floor(i / perrow) + 1/2) * vspace;
		++i;
		outstr += `gsave\n${x} ${y} translate\n`;
		outstr += getButtonPs(bd.sw, bd.sh, bd.sx, bd.sy, bd.imageData, bd.offset, bd.scale, 5);
		outstr += "grestore\n";
	}
	return outstr + "showpage\n";
}

let buttonData = [];
// imageData, sx, sy, sw, sh, offset, scale
