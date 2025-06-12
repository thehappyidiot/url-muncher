const signalToChromeThatWeAreDone = () => {
    chrome.runtime.sendMessage({ action: "finished" });
};

let stopped = false;

function listenForStop() {
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "stop") {
        stopped = true;
    }
  });
}

const demon = "👹";
const demonBacksUpBy = 3;
const nbsp = String.fromCharCode(160);

let lastIdx = 0;
const sayings = ["𝓂𝓂𝓂", "𝓽𝓪𝓼𝓽𝔂", "𝖉𝖊𝖑𝖎𝖈𝖎𝖔𝖚𝖘"];
const sayingChance = 0.5;
const sayingTicks = 10;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const fontGuess = "13.9px system-ui";
ctx.font = fontGuess;

const elt = document.createElement("div");
elt.classList.add("url-bar");

function measureUrlText(text) {
    return ctx.measureText(text).width;
}

function randInt(n) {
    return Math.floor(Math.random() * n);
}

function selectSaying() {
    let idx = randInt(sayings.length);
    while (idx === lastIdx) {
        idx = randInt(sayings.length);
    }
    lastIdx = idx;
    return sayings[idx];
}


function main() {
    stopped = false;
    let pathname = location.pathname;
    if (pathname.startsWith("/")) {
        pathname = pathname.slice(1, pathname.length);
    }
    const origin = location.origin;
    let pathRemaining = pathname.length;
    let demonSpacing = demonBacksUpBy;
    let demonDx = -1;
    let saying = { active: false, ticks: 0, text: "" };

    let interval = setInterval(() => {
        demonSpacing += demonDx;
        if (demonDx < 0 && demonSpacing === 0) {
            pathRemaining -= 1;
            console.log(`eat char: ${pathname[pathRemaining]}`);
            const elt = document.createElement("span");
            elt.textContent = pathname[pathRemaining];
            elt.classList.add("falling-char");
            const targetText = origin.replace("https://www.", "") + "/" + pathname.slice(0, pathRemaining);
            const textLength = measureUrlText(targetText);
            console.log(`${targetText} - ${Math.floor(textLength)}`);
            elt.style.setProperty("--left-offset", `${textLength}px`);
            document.body.appendChild(elt);
            demonDx = 1;
            if (Math.random() < sayingChance) {
                saying = { active: true, ticks: sayingTicks, text: selectSaying() }
            }
        } else if (demonDx > 0 && demonSpacing >= demonBacksUpBy) {
            demonDx = -1;
        }
        let URL = origin + "/" + pathname.slice(0, pathRemaining) + ".".repeat(demonSpacing) + demon;

        if (saying.active) {
            URL += "*" + saying.text;
            saying.ticks -= 1;
            if (saying.ticks <= 0) {
                saying.active = false;
            }
        }
        
        history.pushState(null, "", URL);
        if (pathRemaining < 0) {
            history.pushState(null, "", origin + "/" + demon);
            clearInterval(interval);
            signalToChromeThatWeAreDone();
            document.querySelectorAll(".falling-char").forEach((elt) => {
                elt.remove();
            });
            return;
        }
    }, 50);
}


main();
