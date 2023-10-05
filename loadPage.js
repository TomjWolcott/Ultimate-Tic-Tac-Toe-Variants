players = parseInt(window.sessionStorage.getItem("players")) || 2;
metaLevel = parseInt(window.sessionStorage.getItem("meta")) || 2;
startingPlayer = parseInt(window.sessionStorage.getItem("start")) || 1;
$("#skipper")[0].value = window.sessionStorage.getItem("skips") || 25;
smallSideWinning = (window.sessionStorage.getItem("ssw") == (true + ""));
turnTime = parseInt(window.sessionStorage.getItem("timer")) || Infinity;

dim = [
	parseInt(window.sessionStorage.getItem("dim0")) || 3,
	parseInt(window.sessionStorage.getItem("dim1")) || 3
];

// This opens the how to play menu if the page have been opened for the first time
if (window.sessionStorage.getItem("players") === null) setTimeout(() => {$("#howToMenu")[0].open()}, 10);

if (metaLevel > 6) metaLevel = 6

explorationFactor = 2**0.5;
covers = [];
colors = [
	"#f66",
	"#78f",
	"#fc6",
	"#f8c",
	"#8e9",
	"#b8d"
]

$("#turnIndicator")[0].style.borderColor = colors[startingPlayer - 1];

ui = new UI(metaLevel, dim, startingPlayer, undefined, players);

setTimeout(() => {window.scrollTo(0, 0)}, 120);