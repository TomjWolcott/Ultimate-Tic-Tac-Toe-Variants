Array.prototype.rand = function () {
	return this[Math.floor(Math.random() * this.length)]
}

Array.prototype.last = function () {
	return this[this.length - 1];
}

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

function ucb1 (wins, visits, parentVisits, explorationFactor) {
	return (
		// exploitation -- This pushes monty to focus on good paths
		wins / visits
		+
		// exploration -- This pushes monty to try and learn about all the paths
		explorationFactor * ( Math.log(parentVisits) / visits )**0.5
	) || Infinity
}

function constructArray (length, fn) {
	let arr = [];

	for (let i = 0; i < length; i++) {
		arr.push(fn(i, length))
	}

	return arr;
}

function constructString (length, fn) {
	let str = "";

	for (let i = 0; i < length; i++) {
		str += fn(i, length);
	}

	return str;
}