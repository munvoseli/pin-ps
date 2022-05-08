'use strict';

function readLeint(arr, i) {
	let sum = arr[i++];
	sum |= arr[i++] << 8;
	sum |= arr[i++] << 16;
	sum |= arr[i] << 24;
	return sum;
	//return ((arr[i++] * 256 + arr[i++]) * 256 + arr[i++]) * 256 + arr[i];
}

function readLesho(arr, i) {
	return arr[i++] | (arr[i] << 8);
}

function readString(arr, i) {
	// read leb
	let strlen = 0;
	let bo = 0;
	while (true) {
		strlen |= arr[i] << bo;
		bo += 7;
		++i;
		if ((arr[i - 1] & 128) == 0)
			break;
	}
	// decode utf-8
	let res = "";
	let j = i;
	while (j < strlen + i) {
		let codepoint = 0;
		if ((arr[j] & 128) == 0) {
			codepoint = arr[j++];
		}
		else {
			let n =
				(arr[j] & 32 == 0) ? 5 :
				(arr[j] & 16 == 0) ? 4 : 3;
			codepoint = arr[j++] & ((1 << n) - 1);
			// & (255 >> (8 - n))
			// & ~(255 << n)
			for (let k = 0; k < n; ++k) {
				codepoint <<= 6;
				codepoint |= arr[j++] & 63;
			}
		}
		res += String.fromCharCode(codepoint);
	}
	if (j != strlen + i) console.error("sdjkflsk");
	return [res, strlen + i];
}

function celesteToSheetmeta(arrbuf) {
	let arr = new Uint8Array(arrbuf);
	let sm = [];
	let i = 0, k = 0x62;
	while (k < arr.length) {
		let [str, nk] = readString(arr, k);
		k = nk;
		let a = [
			str,
			readLesho(arr, k),
			readLesho(arr, k + 2),
			readLesho(arr, k + 4),
			readLesho(arr, k + 6)
		];
		sm.push(a);
		k += 16;
	}
	return sm;
}

function celesteToImageData(arrbuf) {
	let arr = new Uint8Array(arrbuf);
	let w = readLeint(arr, 0);
	let h = readLeint(arr, 4);
	let mode = arr[8];
	let imageData = new ImageData(w, h);
	let i = 0, k = 9;
	if (mode == 0) { // opaque [n, b, g, r]
		while (k < arr.length) {
			for (let j = 0; j < arr[k]; ++j) {
				imageData.data[i++] = arr[k + 3];
				imageData.data[i++] = arr[k + 2];
				imageData.data[i++] = arr[k + 1];
				imageData.data[i++] = 255;
			}
			k += 4;
		}
	}
	else { // [n, 0] || [n, !0, b, g, r]
		while (k < arr.length) {
			if (arr[k + 1]) {
				for (let j = 0; j < arr[k]; ++j) {
					imageData.data[i++] = arr[k + 4];
					imageData.data[i++] = arr[k + 3];
					imageData.data[i++] = arr[k + 2];
					imageData.data[i++] = 255;
				}
				k += 5;
			}
			else {
				i += 4 * arr[k];
				k += 2;
			}
		}
	}
	return imageData;
}
