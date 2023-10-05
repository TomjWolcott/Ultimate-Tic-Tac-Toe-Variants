// This class holds the logic of uttt boards, ttt = {metaLevel: 1, layout: 3}, uttt = {metaLevel: 2, layout: 3}
class Board {
	constructor (metaLevel = 2, layout = [3, 3], firstMove = 1, players = 2) {
		this.metaLevel = metaLevel; // m
		this.layout = layout; // n x p
		this.layout.total = layout[0] * layout[1]; // total cells = (np)^(m)
		this.players = players;

		this.data = {
			levels: [], // [(Array of cells), (Array of tic-tac-toe boards), (Array of ultimate tic-tac-toe boards) ... ]
			lastMove: -1, // The index of cell that was last chosen (top left is 0, bottom right is the # of cells - 1)
			turn: firstMove, // Shows who's turn it is 1 - (# of players) 
			moves: []
		}

		this.data.firstMove = this.data.turn;

		// This creates each of the levels
		for (let i = metaLevel; i > 0; i--) {
			this.data.levels[metaLevel - i] = new Array(layout.total**i).fill(1);
			this.data.levels[metaLevel - i] = this.data.levels[metaLevel - i].map((el, index) =>({value: 0, index: index, metaLevel: metaLevel - i}))
		}

		this.data.levels[metaLevel] = [{value: 0, index: 0, metaLevel: metaLevel}]; // This represents the entire board

		// Assigns a parent to every board all the way up to the
		for (let i = 0; i < this.data.levels.length - 1; i++) {
			for (let j = 0; j < this.data.levels[i].length; j++) {
				this.data.levels[i][j].parent = this.data.levels[i + 1][Math.floor(j / this.layout.total)];
			}
		}

		this.wins = []; // The array of ways a board could be won

		for (let i = 0; i < layout[1] && (layout[0] >= layout[1] || smallSideWinning); i++) {
			let hor = [];
			
			// This adds the horizontal and vertical ways to win
			for (let j = 0; j < layout[0]; j++) {
				hor.push(j + layout[0] * i);
			}

			this.wins.push(hor);
		}

		for (let i = 0; i < layout[0] && (layout[1] >= layout[0] || smallSideWinning); i++) {
			let ver = [];

			for (let j = 0; j < layout[1]; j++) {
				ver.push(i + layout[0] * j);
			}

			this.wins.push(ver);
		}

		// This adds the diagonal ways to win if n == p
		if (layout[0] == layout[1]) {
			let diag1 = [];
			let diag2 = [];

			for (let i = 0; i < layout[0]; i++) {
				diag1.push(layout[0] - i - 1 + i * layout[0]);
				diag2.push(i * (layout[0] + 1));
			}

			this.wins.push(diag1, diag2);
		}

		// Creates a function that copies the data
		/*let copyDataFunction = `
			let newData = {
				lastMove: data.lastMove,
				turn: data.turn,
				firstMove: data.firstMove,
				levels: [],
				moves: [] // This is here just for show
			}
			
			${constructString(this.data.levels.length, (index) => {
				let i = this.data.levels.length - index - 1;

				return `
					newData.levels[${i}] = [
						${
							constructString(this.data.levels[i].length, (index2) => {
								let str = `{
									value: data.levels[${i}][${index2}].value,
									index: data.levels[${i}][${index2}].index,
									metaLevel: data.levels[${i}][${index2}].metaLevel,
								`

								if (index != 0) {
									str += `parent: newData.levels[${i + 1}][${Math.floor(index2 / this.layout.total)}]`
								}

								return str + "},"
							})
						}
					];
				`
			})}

			return newData;
		`;

		this.copyData2 = new Function("data", copyDataFunction)/**/
	}

	copyData (data = this.data) {
		let newData = {
			lastMove: data.lastMove,
			turn: data.turn,
			firstMove: data.firstMove,
			levels: [],
			moves: [] // This is here just for show
		};

		for (let i = data.levels.length - 1; i >= 0; i--) {
			newData.levels[i] = [];

			for (let j = 0; j < data.levels[i].length; j++) {
				newData.levels[i].push({
					value: data.levels[i][j].value,
					index: data.levels[i][j].index,
					metaLevel: data.levels[i][j].metaLevel,
				})

				if (i != data.levels.length - 1) {
					newData.levels[i][j].parent = newData.levels[i + 1][Math.floor(j / this.layout.total)]
				}
			}
		}

		return newData;
	}

	simulateRandomGame (data = this.data) {
		if (data.levels.last()[0].value !== 0) return data.levels.last()[0].value;

		data = this.copyData(data);

		let winner = 0;
		let moves = 0;

		do {
			winner = this.takeTurn(data);
			moves++;
		} while (winner === 0 && moves < 800)

		let r = 0;

		return winner;
	}

	simulateManyGames (cycles = 1000, data = this.data) {
		let winArray = new Array(this.players).fill(0);
		winArray[-1] = 0;

		for (let i = 0; i < cycles; i++) {
			winArray[parseInt(this.simulateRandomGame(data)) - 1]++;
		}

		return winArray;
	}

	avalMoves (data) {

		// If this is the first turn, the player can go anywhere
		if (data.lastMove == -1) return data.levels[0].filter(move => move.value === 0);

		// Finds the index of the board (meta-level = 1) that the last move leads to
		let boardIndex = data.lastMove % this.layout.total**(this.metaLevel - 1);
		let moves = data.levels[0] // Finds the possible moves in the current board
			.slice(boardIndex * this.layout.total, (boardIndex + 1) * this.layout.total)
			.filter(move => move.value === 0)

		// If there weren't any available moves, then open it up to the entire board
		if (moves.length == 0) {
			let dataBoard = data.levels[1][boardIndex];

			let y = 0;

			do { // Finds the furthest back ancestor that hasn't been won yet
				dataBoard = dataBoard.parent;
			} while (dataBoard.value !== 0);

			let slice = data.levels[0]
				.slice(dataBoard.index * this.layout.total**(dataBoard.metaLevel), (dataBoard.index + 1) * this.layout.total**(dataBoard.metaLevel))
				.filter(move => move.value === 0);

			let x = 0;

			return slice;
		}

		return moves;
	}

	takeTurn (data, move = null, winEvent = (indexes) => {}) {
		move = (move == null) ? this.avalMoves(data).rand() : move;

		data.moves.push(move);

		if (typeof move == "undefined") return "0";

		data.levels[0][move.index].value = data.turn;

		for (let i = 0; i < this.metaLevel; i++) {

			// Gets the index for the current board given the meta level
			let index = Math.floor(move.index / this.layout.total**(i + 1));
			let slice = data.levels[i].slice(this.layout.total * index, this.layout.total * (index + 1))

			// Checks if the board has been won and continues if true
			if (this.checkWin(slice) !== 0) {
				let winner = this.checkWin(slice);

				for (let j = 0; j < i + 1; j++) { // Sets the value of all of the children to the winner
					data.levels[j]
						.slice(index * this.layout.total**(i - j + 1), (index + 1) * this.layout.total**(i - j + 1))
						.forEach(cell => cell.value = winner);
				}

				data.levels[i + 1][index].value = winner;

				if (i + 1 == this.metaLevel) return winner;
				
				// slice.forEach(cell => cell.value = winner);
				winEvent([i + 1, index]);
			} else {
				break;
			}
		}

		data.lastMove = move.index;
		data.turn = (data.turn > this.players - 1) ? 1 : (data.turn + 1);

		return 0;
	}

	checkWin (slice) {
		for (let i = 0; i < this.wins.length; i++) {
			let win = this.wins[i];
			let winner = 0;

			for (let j = 0; j < win.length; j++) {
				winner = ((slice[win[j]].value == winner && winner != 0) || j == 0) ? slice[win[j]].value : 0;
			}

			if (winner !== 0) return winner;
		}

		if (slice.every(cell => cell.value !== 0)) return "0";

		return 0;
	}

	saveCurrentState () {
		let txt = `${
			this.players} | ${
			this.data.firstMove} | ${
			this.layout[0]} | ${
			this.layout[1]} | ${
			this.metaLevel} | ${
			0 + smallSideWinning} | ${
			turnTime
			} | `;

		if (typeof aiButtons != "undefined") {
			txt += aiButtons
				.map(btn => btn.clicked)
				.join(" || ")
				+ " | ";
		}

		for (const move of this.data.moves) {
			txt += `${move.index} || `;
		}

		return txt;
	}

	loadCurrentState (data) {
		let arr = data.split(" || ");
		arr.pop();

		for (let i = 0; i < arr.length; i++) {
			this.levels[0][parseInt(arr[i])].click();
		}
	}
}

class UI extends Board {
	constructor (metaLevel = 2, layout = [3, 3], firstMove = 1, parent = document.body, players = 2) {
		super(metaLevel, layout, firstMove, players);
		this.expectingClick = false;
		this.pause = false;
		this.levels = [];
		this.parent = parent;

		this.html = document.createElement("div");
		parent.appendChild(this.html);
		this.html.className = "board giantBoard";

		this.createBoard(this.html, metaLevel - 1, this.levels);
	}

	async skipPreGame (skipPercent = 1 / 4) {
		for (let i = 0; i < this.layout.total**this.metaLevel * skipPercent; i++) {
			if (this.data.levels.last()[0].value !== 0) return;
			
			let moves = this.avalMoves(this.data);

			this.levels[0][moves.rand().index].click();

			await sleep(1);
		}

		if (aiButtons[this.data.turn - 1].clicked) {
			botTurnAlert();
		}
	}

	createBoard (prevBoard, depth, levels, baseline = 0, parentIndexes = [0]) {
		let level = [];
		if (typeof levels[depth] == "undefined") levels[depth] = [];

		for (let i = 0; i < this.layout.total; i++) {
			let board = document.createElement((depth == 0) ? "button" : "div");
			let index = i + baseline;
			board.parentIndexes = [index, ...parentIndexes];
			board.value = 0;
			prevBoard.appendChild(board);

			if (depth > 0) this.createBoard(
				board, 
				depth - 1, 
				levels, 
				(i + baseline) * this.layout.total, 
				board.parentIndexes
			);

			board.className = "board h" + depth + ((this.parent.tagName == "BODY") ? "" : "d");
			level.push(board);

			if (i % this.layout[0] == this.layout[0] - 1) {
				let br = document.createElement("br");
				prevBoard.appendChild(br);
			}

			if (depth == 0) {
				board.index = index;
				// board.innerHTML = index;
				board.className = "cell";

				board.onclick = async (e) => {
					if (await this.cellClick(board, this.parent.tagName == "BODY") !== 0) {
						$("#turnIndicator")[0].style.width = "calc(100% - 200px)";

						try {
							clearInterval(timerInt);
						} catch (error) {}
	
						return;
					}

					if (e.isTrusted == false && !this.expectingClick || this.pause) return; // stops if the source was not a click

					$("#turnIndicator")[0].style.width = "calc(100% - 200px)";
					
					try {
						clearInterval(timerInt);
					} catch (error) {}

					if (aiButtons[this.data.turn - 1].clicked) {
						await sleep(100);

						let move = aiButtons[this.data.turn - 1].ai.decide(this.data, aiButtons[this.data.turn - 1].int);
						this.expectingClick = true;
						await this.levels[0][move.index].click();
						this.expectingClick = false;
						return;
					}

					if (turnTime != Infinity) {
						setTimer(turnTime);
					}
				}
			}
		}

		levels[depth].push(...level);
	}

	cellClick (board, isMainBoard = false) { // ----------------------------------------- This is the code that runs when a cell is clicked
		// if (typeof this.moves != "undefined") {
		// 	for (const move of this.moves) {
		// 		this.levels[0][move.index].style.outline = "0px dashed black";
		// 	}
		// }

		if (this.data.lastMove == -1 && isMainBoard) {
			$("#clear")[0].disabled = false;
			$(".dim")[0].disabled = true;
			$(".dim")[1].disabled = true;
			$("#playerSelect")[0].disabled = true;
			$("#meta")[0].disabled = true;
			$("#skip")[0].disabled = true;
			$("#ssw")[0].disabled = true;
			$("#presets")[0].disabled = true;
		}

		board.style.background = colors[this.data.turn - 1];
		board.style.pointerEvents = "none";
		board.value = this.data.turn;

		this.disableAll();

		let winner = this.takeTurn(this.data, {index: board.index}, (indexes) => {
			// -------------------------------------------------- This function is run when a board is won

			let box = this.levels[indexes[0]][indexes[1]];

			if (this.data.levels[indexes[0]][indexes[1]].value === "0") {

				new Cover(box, "#000");
				return;
			}

			new Cover(box, colors[this.data.turn - 1]);
		});

		if (winner != 0) {
			this.data.levels.last()[0].value = winner;

			new Cover(this.html, colors[this.data.turn - 1]);

			alert("Player " + winner + " won!!!");
			return winner;
		} else if (winner !== 0) {
			this.data.levels.last()[0].value = winner;

			new Cover(this.html, "#000");

			alert("Everyone Tied");
			return winner;
		}

		if (isMainBoard) $("#turnIndicator")[0].style.borderColor = colors[this.data.turn - 1]; // Changes the color of the indicator line

		for (let i = 1; i < this.metaLevel; i++) {
			// Gets the index for the current board given the meta level
			let index = board.parentIndexes[i - 1] % this.layout.total**(this.metaLevel - i);
			let dataBoard = this.data.levels[i][index];

			this.levels[i][index].className = "board h" + i + ((isMainBoard) ? "" : "d");

			if (dataBoard.value !== 0) { // If the board has been won
				// this.enableAll();

				do { // Finds the furthest back ancestor that hasn't been won yet
					dataBoard = dataBoard.parent;
				} while (dataBoard.value !== 0);

				this.disableAll((box, i1, i2) => {
					if (
						box.parentIndexes[dataBoard.metaLevel - (i1 + 1)] == dataBoard.index && 
							this.data.levels[i1 + 1][i2].value === 0
					) box.className = "board h" + (i1 + 1) + ((isMainBoard) ? "" : "d");
				});
			}
		}

		// this.moves = this.avalMoves(this.data);

		// for (const move of this.moves) {
		// 	this.levels[0][move.index].style.outline = "2px dashed black";
		// }

		return 0;
	}

	disableAll (fn = (board, i1, i2) => {}) {
		this.levels
			.slice(1, Infinity)
			.forEach((level, i1) => level.forEach((board, i2) => {
				board.className = "board disabled";
				fn(board, i1, i2);
			}));
	}

	enableAll (fn = (board, i1, i2) => {}) {
		this.disableAll();

		this.levels
			.slice(1, Infinity)
			.forEach((level, i1) => level.forEach((board, i2) => {
				if (this.data.levels[i1 + 1][i2].value === 0) board.className = "board h" + (i1 + 1) + ((this.parent.tagName == "BODY") ? "" : "d");
				fn(board, i1, i2);
			}));
	}

	remove () {
		for (const level of this.levels) {
			for (const node of level) {
				node.remove();
			}
		}

		for (const cover of covers) {
			cover.remove();
		}

		this.html.remove();
	}

	replace () {
		this.remove();

		ui = new UI(metaLevel, dim, startingPlayer, undefined, players);

		$("#meta")[0].value = metaLevel;
		$(".dim")[0].value = dim[0];
		$(".dim")[1].value = dim[1];
		$(".playerOptions")[players - 1].selected = "selected";
		$(".presetOptions")[0].selected = "selected";

		let aiBtn = aiButtons[startingPlayer - 1];

		if (aiBtn.clicked) {
			botTurnAlert();
		} else {
			botTurnAlertClose();

			if (turnTime != Infinity) {
				timerAlert();
			}
		}

		aiButtons.forEach((btn, index) => {
			btn.btnArea.style.display = "none";

			if (index < players) btn.btnArea.style.display = "inline-block";
		})

		windowResizeHandler();
	}
}

class AI {
	constructor (player, explorationFactor = 2**0.5) {
		this.player = player;
		this.explorationFactor = explorationFactor;
		this.path = {};
	}

	decide (data, int = 100) {
		let path = {
			index: -1,
			visits: 0,
			wins: new Array(ui.players).fill(0),
			winner: 0
		};

		let cycles = 0;

		do {
			this.explorePath(data, path, this.player);
			cycles++;

		} while (cycles < int)

		path.branches.sort((a, b) => { // Sorts the branches from best (for me) to worst (for me)
			return (
				b.wins[this.player - 1] / b.visits - 
				a.wins[this.player - 1] / a.visits
			)
		})

		this.path = path;

		return path.branches[0];
	}

	explorePath (data, path, player, depth = 0) {
		path.visits++;

		if (path.winner !== 0) { // --------------------- If this node is a win/loss/tie for a player than immediately return
			let winner = path.winner;

			if (winner === "0") {
				path.wins = path.wins.map(val => val + 0.5);
				return "0"; 
			}

			path.wins[winner - 1]++;

			return winner;
		}

		if (path.visits < 2) { // ------------------------------------------------------ This runs when a node is first reached
			path.data = data;

			if (path.index != -1) ui.takeTurn(data, {index: path.index});

			// If monty's branches has reached a board that has been won
			if (data.levels.last()[0].value !== 0) {
				let winner = data.levels.last()[0].value;
				path.winner = winner;

				if (winner === "0") {
					path.wins = path.wins.map(val => val + 0.5);
					return "0"; 
				}

				path.wins[winner - 1]++;

				return winner;
			}

			path.branches = ui.avalMoves(data).map(move => ({
				index: move.index,
				winPercent: "",
				visits: 0,
				wins: new Array(ui.players).fill(0),
				winner: 0
			}));

			let winner = ui.simulateRandomGame(data);

			if (winner === "0") {
				path.wins = path.wins.map(val => val + 0.5);
				return "0"; 
			}

			path.wins[winner - 1]++;

			return winner;
		}
			
		let bestBranch = {ucb1: -Infinity};

		// path.branches.sort(() => Math.random() - 0.5);

		path.branches.forEach(branch => {
			branch.ucb1 = ucb1(branch.wins[player - 1], branch.visits, path.visits, this.explorationFactor);

			if (branch.ucb1 > bestBranch.ucb1) bestBranch = branch;
		});
			
		let nextPlayer = (player > ui.players - 1) ? 1 : (player + 1);

		let winner = this.explorePath(ui.copyData(path.data), bestBranch, nextPlayer, depth + 1);

		bestBranch.winPercent = (100 * bestBranch.wins[player - 1] / bestBranch.visits).toFixed(2) + "%";

		if (winner === "0") {
			path.wins = path.wins.map(val => val + 0.5);
			return "0"; 
		}

		path.wins[winner - 1]++;

		return winner;
	}
}

class LoadItem {
	constructor(data, index) {
		this.fullData = data;
		this.index = index;

		let arr = data.split(" ||| ");
		this.data = arr[1];
		let arr2 = arr[1].split(" | ");

		this.html = document.createElement("div");
		$("#loadsList")[0].appendChild(this.html);
		this.html.className = "loadSlot";
		this.html.innerHTML =  `
			<span style="vertical-align: sub; pointer-events: none">
				${arr[0]}
			</span>
			<span class='extraSaveInfo' style='display: none; vertical-align: sub; margin: 0; pointer-events: none'>
				&emsp; dim: ${arr2[2]} x ${arr2[3]}, meta: ${arr2[4]}, players: ${arr2[0]}
			</span>
		`;
		if (loads.length == 0) this.html.style.borderTop = "1px dashed black"
		// this.html.style.background = (loads.length % 2) ? "#cef" : "#fec"

		this.del = document.createElement("button");
		this.html.appendChild(this.del);
		this.del.innerHTML = "Delete";
		this.del.style.float = "right";
		this.del.style.verticalAlign = "middle";

		this.del.onclick = () => {	
			loads.splice(this.index - 1, 1);
			window.localStorage.removeItem("save" + this.index);
			this.remove();

			let saves = parseInt(window.localStorage.getItem("savesCounter")) - 1;

			window.localStorage.removeItem("save" + (saves + 1));

			for (let i = this.index - 1; i < saves; i++) {
				loads[i].index--;
				window.localStorage.setItem("save" + (i + 1), loads[i].fullData);
			}

			window.localStorage.setItem("savesCounter", saves);
		}

		this.html.onclick = (e) => {
			if (e.target !== this.html) return;
			loadData(this.data);
		}
	}

	remove () {
		this.html.remove();
	}
}

class ConfirmationBox {
	constructor (fn = (isConfirmed, box) => {}) {
		this.fn = fn;
		this.html = document.createElement("div");
		document.body.appendChild(this.html);
		this.html.className = "popup";
		this.html.style.display = "flex";

		this.message = document.createElement("span");
		this.html.appendChild(this.message);
		this.message.innerHTML = "Are you sure?";
		this.message.style.marginBottom = "20px";

		this.buttons = document.createElement("span");
		this.html.appendChild(this.buttons);
		
		this.yes = document.createElement("button");
		this.buttons.appendChild(this.yes);
		this.yes.innerHTML = "Yes";
		this.yes.onclick = () => {
			fn(true, this);
			this.html.remove();
		}

		this.no = document.createElement("button");
		this.buttons.appendChild(this.no);
		this.no.innerHTML = "No";
		this.no.onclick = () => {
			fn(false, this);
			this.html.remove();
		}
	}
}

class Cover {
	constructor (boundBox, color) {
		covers.push(this);

		this.boundBox = boundBox;
		let box = boundBox.getBoundingClientRect();

		this.html = document.createElement("div");
		document.body.appendChild(this.html);
		this.html.className = "cover";
		
		this.html.style.background = color + "5";
		this.html.style.outlineColor = color;

		this.html.style.width = box.width - 14 + "px";
		this.html.style.height = box.height - 14 + "px";
		this.html.style.left = box.x + "px";
		this.html.style.top = box.y + "px";
	} 

	readjust() {
		let box = this.boundBox.getBoundingClientRect();

		this.html.style.width = box.width - 14 + "px";
		this.html.style.height = box.height - 14 + "px";
		this.html.style.left = box.x + "px";
		this.html.style.top = box.y + "px";
	}

	remove() {
		this.html.remove();
	}
}