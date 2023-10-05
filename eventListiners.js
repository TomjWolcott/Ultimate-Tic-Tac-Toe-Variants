mousePos = {x: 0, y: 0};

onmousemove = (e) => {
	mousePos = {
		x: e.clientX,
		y: e.clientY
	}
}

// ------------------------------------------------ Resize elements onscreen
	rightMost = [...$(".sameLine")].last().getBoundingClientRect().right;
	windowResizeHandler();

	function windowResizeHandler() {
		ui.html.style.transform = "scale(1)"
		$("#optionsBar")[0].style.width = window.innerWidth + "px";

		if (rightMost > window.innerWidth) {
			$(".sameLine").each(index => {
				let span = $(".sameLine")[index];

				if (index == $(".sameLine").length - 1) return;

				span.style.marginBottom = "20px";
				span.style.display = "block";
				span.style.width = "300px";
			})
		} else {
			$(".sameLine").each(index => {
				let span = $(".sameLine")[index];
				
				span.style.marginBottom = "0";
				span.style.display = "inline-block";
				span.style.width = "revert";
			})
		}

		// The board re-sizing is here so the shifting of the top bit doesn't contaminate the variables
		let box = ui.html.getBoundingClientRect();
		let optionsBox = $("#optionsBar")[0].getBoundingClientRect();
		let isHorBounded = (window.innerWidth - (box.width + 40)) < (window.innerHeight - (box.height + optionsBox.height + 40));
		
		$("#turnIndicator")[0].style.top = optionsBox.bottom - 14 + "px";

		if (window.innerWidth < (box.width + 40) && isHorBounded) {
			ui.html.style.transform = `scale(${(window.innerWidth - 40) / box.width})`;
		} else if (window.innerHeight < box.height + optionsBox.height + 40 && !isHorBounded) {
			ui.html.style.transform = `scale(${(window.innerHeight - optionsBox.height - 40) / box.height})`;
		}

		if (window.innerWidth < box.width) ui.html.style.left = -(box.width - window.innerWidth) / 2 + "px";

		for (const cover of covers) {
			cover.readjust();
		}
	}

	window.addEventListener("resize", windowResizeHandler);

// ------------------------------------------------ set session storage on reload
	window.onbeforeunload = function () {
		window.sessionStorage.setItem("players", players);
		window.sessionStorage.setItem("meta", metaLevel);
		window.sessionStorage.setItem("start", startingPlayer);
		window.sessionStorage.setItem("skips", $("#skipper")[0].value);
		window.sessionStorage.setItem("ssw", smallSideWinning);
		window.sessionStorage.setItem("timer", turnTime);

		window.sessionStorage.setItem("dim0", dim[0]);
		window.sessionStorage.setItem("dim1", dim[1]);

		for (let i = 0; i < aiButtons.length; i++) {
			window.sessionStorage.setItem("aiBtn" + i, aiButtons[i].clicked + "");
		}
	}


// ------------------------------------------------ Open extra menus
	$("#options")[0].onclick = function () {
		$("#optionsMenu")[0].open();
	}

	$("#closeOptions")[0].onclick = function () {
		$("#optionsMenu")[0].style.display = "none";
	}

	$("#howTo")[0].onclick = function () {
		$("#howToMenu")[0].open();
	}

	$("#closeHowTo")[0].onclick = function () {
		$("#howToMenu")[0].style.display = "none";
	}

	ex1 = new UI(1, [3, 3], 1, $("#3x3")[0]);
	ex1.html.style.pointerEvents = "none";

	// $(".popup")[1].style.display = "flex";

	ex2 = new UI(2, [3, 3], 1, $("#u3x3")[0]);
	ex2.html.style.pointerEvents = "none";
	ex2.levels[0][32].click();

	ex3 = new UI(3, [3, 3], 1, $("#uu3x3")[0]);
	ex3.html.style.pointerEvents = "none";
	ex3.html.style.transform = `scale(${1/3})`;
	ex3.levels[0][292].click();
	$("#uu3x3")[0].style.height = "460px";

	ex4 = new UI(1, [2, 2], 1, $("#2x2")[0]);
	ex4.html.style.pointerEvents = "none";

	ex5 = new UI(2, [2, 2], 1, $("#u2x2")[0]);
	ex5.html.style.pointerEvents = "none";
	ex5.levels[0][11].click();

	ex6 = new UI(3, [2, 2], 1, $("#uu2x2")[0]);
	ex6.html.style.pointerEvents = "none";
	ex6.levels[0][49].click();

// ------------------------------------------------ Presets
	$("#presets")[0].onchange = function () {
		smallSideWinning = false;
		let optionIndex;

		switch (this.value) {
			case "none":
				optionIndex = 0;
				return;
			case "ttt":
				optionIndex = 1;
				dim = [3, 3];
				metaLevel = 1;
				players = 2;
				break;
			case "uttt":
				optionIndex = 2;
				dim = [3, 3];
				metaLevel = 2;
				players = 2;
				break;
			case "2x2uuuttt":
				optionIndex = 3;
				dim = [2, 2];
				metaLevel = 4;
				players = 2;
				break;
			case "2x2uuttt":
				optionIndex = 4;
				dim = [2, 2];
				metaLevel = 3;
				players = 2;
				break;
			case "3p2x2uuuttt":
				optionIndex = 5;
				dim = [2, 2];
				metaLevel = 4;
				players = 3;
				break;
			case "4x4uttt":
				optionIndex = 6;
				dim = [4, 4];
				metaLevel = 2;
				players = 2;
				break;
		}

		ui.replace();

		$(".presetOptions")[optionIndex].selected = "selected";
	}

// ------------------------------------------------ Set the dimensions
	$(".dim").each(function (index) {
		this.value = ui.layout[index];
		this.index = index;
		
		this.onkeyup = function () {
			if (this.value === "") return;

			if (this.value != parseInt(this.value) || parseInt(this.value) < 0 || parseInt(this.value) > 10) this.value = ui.layout[this.index];

			dim = [...$(".dim")].map(input => parseInt(input.value));

			ui.replace();
		}
	})

// ------------------------------------------------ Select Player
	for (let i = 0; i < colors.length; i++) {
		let option = $(`<option class="playerOptions" style="color: 2px 2px ${colors[i]};">${i + 1}</option>`);
		$("#playerSelect")[0].appendChild(option[0]);
		if (i + 1 == players) option[0].selected = "selected";
	}

	$("#playerSelect")[0].onchange = function () {
		players = parseInt(this.options[this.selectedIndex].value);
		ui.players = players;

		aiButtons.forEach((btn, index) => {
			btn.btnArea.style.display = "none";

			if (index < players) btn.btnArea.style.display = "inline-block";
		})
	}

// ------------------------------------------------ Select meta level
	$("#meta")[0].value = ui.metaLevel;

	$("#meta")[0].onkeyup = function () {
		if (this.value === "") return;

		if (this.value != parseInt(this.value) || parseInt(this.value) < 0 || parseInt(this.value) > 6) this.value = ui.metaLevel;

		startingPlayer = ui.data.firstMove;
		metaLevel = parseInt(this.value);

		ui.replace();
	}

// ------------------------------------------------ Small side winning
	$("#ssw")[0].clicked = smallSideWinning;
	$("#ssw")[0].innerHTML = smallSideWinning;

	$("#ssw")[0].onclick = function () {
		this.clicked = !this.clicked;

		smallSideWinning = this.clicked;
		this.innerHTML = this.clicked + "";

		ui.replace();
	}


// ------------------------------------------------ ai activations
	aiButtons = [];

	function botTurnAlert () {
		ui.html.style.pointerEvents = "none";
		timerAlertClose();

		if (ui.data.levels.last()[0].value !== 0) {
			$("#firstAI")[0].style.display = "none";
			return;
		}

		$("#firstAI")[0].style.display = "flex";
	}

	function botTurnAlertClose () {
		$("#firstAI")[0].style.display = "none";
		ui.html.style.pointerEvents = "all";
	}

	for (let i = 0; i < colors.length; i++) {
		// This creates the div that holds the ai button and extra button
		let btnArea = document.createElement("div");
		$("#aiBtnArea")[0].appendChild(btnArea);
		btnArea.className = "btnArea";

		// This creates the ai button
		let btn = document.createElement("button");
		btnArea.appendChild(btn);
		btn.btnArea = btnArea;

		btn.innerHTML = i + 1;
		btn.index = i;
		btn.className = "aiSelect";
		btn.clicked = parseInt(window.sessionStorage.getItem("aiBtn" + i)) || 0;
		btn.color = colors[i];
		btn.ai = new AI(i + 1, explorationFactor);

		// This creates the settings button
		let settings = document.createElement("button");
		btnArea.appendChild(settings);
		settings.innerHTML = "Extra";
		settings.index = i;
		settings.btn = btn;

		// This creates the ai settings popup menu that appears when the extra button is clicked
		let aiSettings = $(`<div class='popup' id="aiSettings${i}" style="width: 300px;">
			<span class="header">Extra Bot Settings</span>
			<span style="color: ${colors[i]}">(Bot #${i + 1})</span>
			<span>(Nothing here is saved)</span>
			<button onclick="$('#optionsMenu')[0].open()" style="position: absolute; top: 10px; left: 5px;">Back</button>
			<span><span class='define' id='dExp'>Exploration factor:</span> <input id="aiExp${i}" onkeyup="
				if (this.value == '') return;

				let num = parseFloat(this.value); 
				if (num < 0 || num >= 100 || num != this.value) {
					this.value = (2**0.5).toFixed(2);
					aiButtons[${i}].ai.explorationFactor = 2**0.5;
					return;
				} else if (num == 0) {
					aiButtons[${i}].ai.explorationFactor = 0;
					return;
				}

				aiButtons[${i}].ai.explorationFactor = num;
				this.value = num;
			" value="${(2**0.5).toFixed(2)}"></span>
			<span><span class="define" id="dInt">Intelegence:</span> <input id="aiInt${i}" onkeyup="
				if (this.value == '') return;

				let num = parseInt(this.value); 
				let btn = aiButtons[${i}];

				if (num < 1 || num >= 100000 || num != this.value) {
					this.value = (btn.clicked == 1) ? 100 : (btn.clicked == 2) ? 5000 : (btn.clicked == 3) ? 20000 : '';
					aiButtons[${i}].int = (btn.clicked == 1) ? 100 : (btn.clicked == 2) ? 5000 : (btn.clicked == 3) ? 20000 : 1000;
					return;
				}

				aiButtons[${i}].int = num;
				this.value = num;
			" value="${(btn.clicked == 1) ? 100 : (btn.clicked == 2) ? 5000 : (btn.clicked == 3) ? 20000 : ""}"></span>
			<button onclick="$('#aiSettings${i}')[0].style.display = 'none'">Close</button>
		</div>`)[0];

		document.body.appendChild(aiSettings);

		settings.aiSettings = aiSettings;
		settings.onclick = function () {
			this.aiSettings.open();

			if (typeof this.btn.int != "number") {
				$(`#aiInt${this.index}`)[0].value = "";
				return;
			}

			$(`#aiInt${this.index}`)[0].value = this.btn.int;
			$(`#aiExp${this.index}`)[0].value = this.btn.ai.explorationFactor.toFixed(2);
		};

		if (i == ui.data.turn - 1 && btn.clicked) {
			botTurnAlert();
		}

		if (i >= players) btnArea.style.display = "none";

		if (btn.clicked) {
			let thickness;

			if (btn.clicked == 1) {
				thickness = 2;
				btn.int = 100;
			} else if (btn.clicked == 2) {
				thickness = 4;
				btn.int = 5000;
			} else {
				thickness = 6;
				btn.int = 20000;
			}

			btn.style.outline = thickness + "px double " + btn.color;
		} else {
			btn.style.outline = "2px dashed " + btn.color;
		}

		btn.onclick = function () {
			this.clicked = (this.clicked > 2) ? 0 : (this.clicked + 1);

			if (this.clicked) {
				let thickness;

				if (this.clicked == 1) {
					thickness = 2;
					this.int = 100;
				} else if (this.clicked == 2) {
					thickness = 4;
					this.int = 5000;
				} else {
					thickness = 6;
					this.int = 20000;
				}

				this.style.outline = thickness + "px double " + this.color;

				if (this.index == ui.data.turn - 1) {
					botTurnAlert();
					ui.pause = true;
				}
			} else {
				this.style.outline = "2px dashed " + this.color;

				if (this.index == ui.data.turn - 1) {
					botTurnAlertClose();
					ui.pause = false;
				}
			}
		}

		aiButtons.push(btn);
	}

	$("#aiGo")[0].onclick = async function () {
		botTurnAlertClose();
		ui.pause = false;

		await sleep(100);

		let move = aiButtons[ui.data.turn - 1].ai.decide(ui.data, 10000);
		ui.expectingClick = true;
		await ui.levels[0][move.index].click();
		ui.expectingClick = false;
	}

	$("#aiDelete")[0].onclick = function () {
		aiButtons[ui.data.turn - 1].clicked = -1;
		aiButtons[ui.data.turn - 1].click();
		if (turnTime != Infinity) timerAlert();
	}

// ------------------------------------------------ Timer
  function setTimer(ms) {
    let time = 0;

		$("#turnIndicator")[0].style.width = "calc(100% - 200px)";

		try {
			clearInterval(timerInt);
		} catch (error) {}
		
		timerInt = setInterval(async () => {
			time += 10;

			$("#turnIndicator")[0].style.width = `calc(${100 * (ms - time) / ms}% - 200px)`;

			if (time >= ms) {
				clearInterval(timerInt);

				ui.html.style.pointerEvents = "none";
				ui.expectingClick = true;

				let move = ui.avalMoves(ui.data).rand();
				
				await ui.levels[0][move.index].click();

				ui.expectingClick = false;
				ui.html.style.pointerEvents = "all";
				
				$("#turnIndicator")[0].style.width = "calc(100% - 200px)";
			}
		}, 10)
	}

	function resetTimer() {
		try {
			clearInterval(timerInt);
		} catch (error) {}
		
		$("#turnIndicator")[0].style.width = "calc(100% - 200px)";
	}

	function timerAlert () {
		ui.html.style.pointerEvents = "none";

		if (ui.data.levels.last()[0].value !== 0 || $("#firstAI")[0].style.display == "flex") {
			$("#timerAlert")[0].style.display = "none";
			return;
		}

		$("#timerAlert")[0].style.display = "flex";
	}

	function timerAlertClose () {
		$("#timerAlert")[0].style.display = "none";
		ui.html.style.pointerEvents = "all";
	}

	function selectTimerOption () {
		switch (turnTime) {
			case Infinity:
				$(".timerTimes")[0].selected = "selected";
				break;
			case 60000:
				$(".timerTimes")[1].selected = "selected";
				break;
			case 30000:
				$(".timerTimes")[2].selected = "selected";
				break;
			case 20000:
				$(".timerTimes")[3].selected = "selected";
				break;
			case 10000:
				$(".timerTimes")[4].selected = "selected";
				break;
			case 5000:
				$(".timerTimes")[5].selected = "selected";
				break;
			case 2000:
				$(".timerTimes")[6].selected = "selected";
				break;
			default:
				$(".timerTimes")[0].selected = "selected";
				break;
		}
	}

	selectTimerOption();

	if (turnTime != Infinity) {
		timerAlert();
	}

	$("#timer")[0].onchange = function () {
		let time = Infinity;

		switch (this.value) {
			case "infinity":
				turnTime = Infinity;
				timerAlertClose();
				return;
			case "minute":
				turnTime = 60000;
				break;
			case "30s":
				turnTime = 30000;
				break;
			case "20s":
				turnTime = 20000;
				break;
			case "10s":
				turnTime = 10000;
				break;
			case "5s":
				turnTime = 5000;
				break;
			case "2s":
				turnTime = 2000;
				break;
		}

		timerAlert();
	}

	$("#timerStart")[0].onclick = function () {
		timerAlertClose();
		setTimer(turnTime);
	}

// ------------------------------------------------ Save the game
	$("#save")[0].onclick = function () {
		$("#saver")[0].open();

		if (window.localStorage.getItem("savesCounter") === null) window.localStorage.setItem("savesCounter", "0");
		let saves = parseInt(window.localStorage.getItem("savesCounter")) + 1;
		let name = $("#name")[0].value || "Save File " + saves;

		$("#copyData")[0].value = name + " ||| " + ui.saveCurrentState();
	}

	$("#name")[0].onkeyup = function () {
		let saves = parseInt(window.localStorage.getItem("savesCounter")) + 1;
		let name = $("#name")[0].value || "Save File " + saves;

		$("#copyData")[0].value = name + " ||| " + ui.saveCurrentState();
	}

	$("#save2")[0].onclick = function () {
		let saves = parseInt(window.localStorage.getItem("savesCounter")) + 1;

		let saveData = ui.saveCurrentState();
		let name = $("#name")[0].value || "Save File " + saves;

		window.localStorage.setItem("save" + saves, name + " ||| " + saveData);
		window.localStorage.setItem("savesCounter", saves + "");

		$("#saver")[0].style.display = "none";

		allLoadsLoaded = false;
		newSaves++;
	}

	$("#cancelS")[0].onclick = function () {
		$("#saver")[0].style.display = "none";
	}

	$("#copyData")[0].onclick = function () {
		this.setSelectionRange(0, this.value.length)
	}

// ------------------------------------------------ Load the game
	loads = [];
	allLoadsLoaded = false;
	newSaves = 0;
	$("#info")[0].clicked = false;

	function loadData(data) {
		let arr = data.split(" | ");
		let clicks;

		data = arr.pop(); // Seperates the move data into a seperate array
		if (arr.length > 5) clicks = arr.pop(); // Seperates the bot data into a seperate array

		arr = arr // Turn all the ui data into numbers
			.map(str => parseInt(str));

		players = arr[0];
		startingPlayer = arr[1];
		dim = [arr[2], arr[3]];
		metaLevel = arr[4];

		// If there is data on small side winning and the current value isn't correct, then set small side winning
		if (typeof arr[5] == "number") {
			smallSideWinning = (arr[5] == true);
			$("#ssw")[0].innerHTML = (arr[5] == true) + "";
		} else {
			smallSideWinning = false;
			$("#ssw")[0].innerHTML = "false";
		}

		if (typeof arr[6] == "number" && !isNaN(arr[6])) {
			turnTime = arr[6]
		} else {
			turnTime = Infinity;
		}

		selectTimerOption();

		// If there was no data on the bot's, then set all players to human
		if (typeof clicks == "undefined") {
			aiButtons.forEach(btn => {
				btn.clicked = -1;
				btn.click();
			})
		} else { // Else set the bot levels to the proper settings
			clicks = clicks
				.split(" || ")
				.map(str => parseInt(str))

			aiButtons.forEach((btn, index) => {
				btn.clicked = (typeof clicks[index] == "undefined") ? 0 : (clicks[index] - 1);
				btn.click();
			})
		}

		ui.replace();
		ui.loadCurrentState(data);

		let aiBtn = aiButtons[ui.data.turn - 1];

		if (aiBtn.clicked) {
			botTurnAlert();
		} else {
			botTurnAlertClose();

			if (turnTime != Infinity) {
				timerAlert();
			}
		}

		windowResizeHandler();
		$("#loader")[0].style.display = "none";
	}

	$("#load")[0].onclick = function () {
		$("#loader")[0].open();

		if (allLoadsLoaded) return;

		let saves = parseInt(window.localStorage.getItem("savesCounter"));

		if (loads.length == 0) $("#loadsList")[0].innerHTML = "";

		for (let i = loads.length; i < saves; i++) {
			let file = window.localStorage.getItem("save" + (i + 1));
			loads.push(new LoadItem(file, i + 1));
		}

		allLoadsLoaded = true;
	}

	$("#load2")[0].onclick = function () {
		if (window.localStorage.getItem("savesCounter") === null) window.localStorage.setItem("savesCounter", "0");
		let saves = parseInt(window.localStorage.getItem("savesCounter")) + 1;

		let saveData = $("#saveString")[0].value || "lol";
		$("#saveString")[0].value = "";

		if (saveData.split(" ||| ").length == 1 || saveData.split(" || ").length == 1 || saveData.split(" | ").length == 1) {
			alert("The save data is invalid, please try again");
			return;
		}

		window.localStorage.setItem("save" + saves, saveData);
		window.localStorage.setItem("savesCounter", saves + "");

		allLoadsLoaded = false;
		newSaves++;

		loadData(saveData.split(" ||| ")[1]);

		$("#loader")[0].style.display = "none";
	}

	$("#cancelL")[0].onclick = function () {
		$("#loader")[0].style.display = "none";
	}

	$("#clearSaves")[0].onclick = function () {
		new ConfirmationBox((isConfirmed) => {
			if (isConfirmed) {
				window.localStorage.clear();
				loads.forEach(slot => slot.remove());
				$("#loadsList")[0].innerHTML = "None";
			}
		})
	}

	$("#info")[0].onclick = function () {
		this.clicked = !this.clicked;

		if (this.clicked) {
			this.innerHTML = "Hide extra information";

			$(".extraSaveInfo").each(function () {
				this.style.display = "inline-block";
			})
		} else {
			this.innerHTML = "Show extra information";

			$(".extraSaveInfo").each(function () {
				this.style.display = "none";
			})
		}
	}

// ------------------------------------------------ Clears the current board
	$("#clear")[0].onclick = function () {
		new ConfirmationBox((isConfirmed) => {
			if (isConfirmed) {
				ui.replace();

				$("#clear")[0].disabled = true;
				$(".dim")[0].disabled = false;
				$(".dim")[1].disabled = false;
				$("#playerSelect")[0].disabled = false;
				$("#meta")[0].disabled = false;
				$("#skip")[0].disabled = false;
				$("#ssw")[0].disabled = false;
				$("#presets")[0].disabled = false;

				$("#turnIndicator")[0].style.borderColor = colors[ui.data.firstMove - 1];

				windowResizeHandler();
				resetTimer();
			}
		})
	}

// ------------------------------------------------ Skip the pre-game
	$("#skipper")[0].onkeyup = function () {
		if (
			(parseFloat(this.value) != this.value || 
			parseFloat(this.value) < 0 || 
			parseFloat(this.value) > 100) &&
			this.value !== ""
		) this.value = 25;
	}

	$("#skip")[0].onclick = function () {
		ui.skipPreGame((parseFloat($("#skipper")[0].value) / 100) || 25);
	}

// ------------------------------------------------ Simulate Game Button
	$("#simGame")[0].onclick = function () {
		let cycles = 10000;
		let wins = ui.simulateManyGames(cycles);
		let percents = wins.map(num => (100 * num / cycles));

		$('#simResult')[0].value = 
			'Ties: ' + 
			(100 * wins[-1] / cycles) + 
			'% | Wins:' + 
			wins.map((num, index) => 
				' Player ' + 
				(index + 1) + 
				': ' + 
				(100 * num / cycles) + 
				"%"
			) + 
			" | Non-ties: " + 
			percents.reduce((acc, val) => acc + val).toFixed(2) + "%";
	}

// ------------------------------------------------ Create function for the popup menus
	$(".popup").each(function () {
		this.open = function () {
			if (
				aiButtons[((ui.data.turn + 1) > ui.players) ? 0 : ui.data.turn].clicked && // If the next player is a bot
				aiButtons[ui.data.turn - 1].clicked // And this player is a bot
			) {
				ui.pause = true; // This allows you to pause when an ai is about to players

				botTurnAlert();
			}

			if (turnTime != Infinity) {
				timerAlert();
				resetTimer();
			}

			if (this.style.display == "flex") {
				this.style.display = "none";
				return;
			}

			$(".popup").each(function () {
				if (this.id == "firstAI" || this.id == "timerAlert") return;

				this.style.display = "none";
			});

			this.style.display = "flex";
		}
	});

// ------------------------------------------------ Define on hover
	$(".define").each(function () {
		this.style.borderBottom = "1px dotted black";

		this.onmouseover = function () {
			$("#definePopup")[0].style.display = "flex";
			$("#definePopup")[0].innerHTML = this.text;
		}

		this.onmousemove = function () {
			$("#definePopup")[0].style.left = mousePos.x + "px";
			$("#definePopup")[0].style.top = mousePos.y + "px";
		}

		this.onmouseout = function () {
			$("#definePopup")[0].style.display = "none";
		}

		switch (this.id) {
			case "dMeta":
				this.text = `
					This is the number of layers of boards. 
					<br><br>For Example:<br>
					&emsp; (metaLevel = 1): a tic tac toe board<br>
					&emsp; (metaLevel = 2): a tic tac toe board of tic tac toe boards<br>
					&emsp; (metaLevel = 3): a tic tac toe board of ...
				`
				break;
			case "dDim":
				this.text = `
					This is the dimensions of each board. 
					<br><br>For Example:<br>
					&emsp; 2 x 6: 2 columns and 6 rows<br>
					&emsp; 3 x 3: 3 columns and 3 rows (a normal tic tac toe board)<br>
					&emsp; 4 x 2: 4 columns and 2 rows<br>
					&emsp; ...<br><br>
					This applies to the all boards, including the larger ones.
				`
				break;
			case "dSmall":
				this.text = `
					&emsp;This determines whether a board can be won along <br>
					its smaller dimension (this only applies to n x p boards <br>
					where n &ne; p).
				`
				break;
			case "dPre":
				this.text = `
					&emsp;This determines the percentage of the game that is <br>
					skipped when the "Skip pre-game" button is clicked.
				`
				break;
			case "dSkip":
				this.text = `
					&emsp;This allows the user to skip a percentage of the game<br> 
					as determined by the input in the options menu.  You might want <br>
					to do this if you find the begining of these games boring.
				`
				break;
			case "dSim":
				this.text = `
					&emsp;When clicked this button simulates 10,000 random games <br>
					and displays the results in the bar below
				`
				break;
			case "dExp":
				this.text = `
					&emsp;This number represents whether the Bot will try to look deep <br>
					into certain moves vs trying to survey the entirity of its possible <br>
					moves.<br><br>
					&emsp;(0 to &radic;2): focuses on depth<br>
					&emsp;(&radic;2 or more): spreads its focus<br><br>
					&emsp;The number &radic;2 is used because (according to what I've read) it <br>
					is optimal for games that only has wins, losses, and ties.
				`
				break;
			case "dInt":
				this.text = `
					&emsp;This is the total number of moves that the Bot will look at. <br>
					The larger the number it is, the longer the bot will have to take.
				`
				break;
			case "dTimer":
				this.text = `
					&emsp;The Players have x seconds to make a move, if they don't move a random <br>
					move is made for them.  (The Bots do not have to make a move within the <br>
					allotted time.)
				`
				break;
		}
	})
