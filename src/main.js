import "./styles/styles.css"; // Ruta a tus estilos CSS
import "./lib/fontawesome.js"; // Ruta a tu configuración de FontAwesome
import { Game } from "./lib/Game";
import center from "./lib/center.js";
import calculateLetterPositions from "./lib/letter_positions.js";
import { getElementCenter, lengthAndAngle } from "./lib/line_position.js";

// Insertar el HTML dentro de #app
document.querySelector("body").innerHTML = `
<main>
  <div id="game">
    <div id="black" class="hidden"></div>
    <section id="word-grid">
      <div id="grid">
            
      </div>
    </section>
    <section id="controls">
      <div class="tools left">
        <div class="tool" id="shuffle"><i class="tool-icon fa-solid fa-shuffle"></i></div>
        <div class="tool" id="expand"><i class="tool-icon fa-solid fa-expand"></i></div>
      </div>
      <div id="wheel-container">
        <div id="wheel">
          <div class="wheel-letter" style="left: 50%; top: 20%;">c</div>
          <div class="wheel-letter" style="left: 21.4683%; top: 40.7295%;">r</div>
          <div class="wheel-letter" style="left: 32.3664%; top: 74.2705%;">b</div>
          <div class="wheel-letter" style="left: 67.6336%; top: 74.2705%;">e</div>
          <div class="wheel-letter" style="left: 78.5317%; top: 40.7295%;">a</div>
        </div>
      </div>
      <div class="tools right">
        <div class="tool" id="bulb"><i class="tool-icon fa-solid fa-lightbulb"></i></div>
        <div class="tool" id="fa-hammer"><i class="tool-icon fa-solid fa-hammer"></i></div>
      </div>
    </section>
  </div>
</main>
`;

const game = new Game();
const wordPositions = game.wordPositions;
const letters = game.letters.split("");

let isMouseDown = false;

let word = "";

let centrar;

let maxy = 0;
let maxx = 0;

let grid = [];

let activeHammer = false;

wordPositions.forEach((element) => {
  let x = element.origin[0] + 1;
  let y = element.origin[1] + 1;

  center();

  for (let i = 0; i < element.length; i++) {
    grid.push([x, y]);
    if (element.direction == "vertical") {
      y++;
    } else {
      x++;
    }
  }

  maxy = maxy < y ? y - 2 : maxy;
  maxx = maxx < x ? x - 2 : maxx;
});

centrar = center(maxx, maxy, 10, 10);

grid.forEach((element) => {
  let x = element[0] + centrar[0];
  let y = element[1] + centrar[1];
  document.getElementById(
    "grid"
  ).innerHTML += `<div data-x="${element[0]}" data-y="${element[1]}" class="letter" style="grid-area: ${y}/${x};"></div>`;
});

let posiciones = calculateLetterPositions(letters.length);

document.getElementById("wheel").innerHTML = "";

letters.forEach((element, index) => {
  document.getElementById(
    "wheel"
  ).innerHTML += `<div class="wheel-letter" style="left: ${posiciones[index].left}; top: ${posiciones[index].top};">${element}</div>`;
});

function createNewLine(element) {
  element.classList.add("selected");

  let div = document.createElement("div");

  div.classList.add("line");

  let centro = getElementCenter(element);

  div.style.top = centro.y + "px";
  div.style.left = centro.x + "px";

  document.querySelector("body").appendChild(div);
}

document.querySelectorAll(".wheel-letter").forEach((element) => {
  element.addEventListener("mousedown", () => {
    isMouseDown = true;
    word += element.textContent;
    createNewLine(element);
  });
  

  element.addEventListener("mouseover", () => {
    let lineas = document.getElementsByClassName("line");
    let ultimaLinea = lineas[lineas.length - 1];

    if (lineas.length && !element.classList.contains("selected")) {
      word += element.textContent;
      let centro = getElementCenter(element);
      let data = lengthAndAngle(
        [
          ultimaLinea.style.left.replace("px", ""),
          ultimaLinea.style.top.replace("px", ""),
        ],
        [centro.x, centro.y]
      );
      ultimaLinea.style.width = data.length + "px";
      ultimaLinea.style.transform = `rotate(${data.angle}deg)`;
      element.classList.add("selected");

      createNewLine(element);
    }
  });
});


document.addEventListener("mousemove", function (event) {
  if (isMouseDown) {
    let lineas = document.getElementsByClassName("line");
    let ultimaLinea = lineas[lineas.length - 1];

    let data = lengthAndAngle(
      [
        ultimaLinea.style.left.replace("px", ""),
        ultimaLinea.style.top.replace("px", ""),
      ],
      [event.clientX, event.clientY]
    );

    ultimaLinea.style.width = data.length + "px";
    ultimaLinea.style.transform = `rotate(${data.angle}deg)`;
  }
});

document.addEventListener("mouseup", function () {
  isMouseDown = false;

  document.querySelectorAll(".line").forEach((element) => {
    element.remove();
  });

  document.querySelectorAll(".wheel-letter").forEach((element) => {
    element.classList.remove("selected");
  });

  let respuesta = "";

  try {
    respuesta = game.findWord(word);

    let x = respuesta.origin[0] + 1;
    let y = respuesta.origin[1] + 1;

    for (const element of word) {


      document
        .querySelectorAll(`[data-x="${x}"][data-y="${y}"]`)
        .forEach((casilla) => {
          casilla.textContent = element;
        });

      if (respuesta.direction == "vertical") {
        y++;
      } else {
        x++;
      }
    }
  } catch {
    console.log("Palabra no encontrada");
  }
  word = "";
});

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function letrasAleatorias() {
  let letters = document.querySelectorAll(".wheel-letter");
  let posiciones = calculateLetterPositions(letters.length);
  shuffle(posiciones);
  letters.forEach((element, index) => {
    element.style.left = posiciones[index].left;
    element.style.top = posiciones[index].top;
  });
}

document.getElementById("shuffle").addEventListener("click", function () {
  letrasAleatorias();
});

document.getElementById("bulb").addEventListener("click", function () {
  let random = false;
  let letters = document.querySelectorAll(".letter:empty");
  while (!random) {
    let letter = letters[Math.floor(Math.random() * letters.length)];
    if (!letter?.textContent) {
      random = true;
      let x = letter.getAttribute("data-x");
      let y = letter.getAttribute("data-y");

      document
        .querySelectorAll(`[data-x="${x}"][data-y="${y}"]`)
        .forEach((element) => {
          element.textContent = game.letterAt(x - 1, y - 1);
        });
    }

    if (!letters.length) {
      random = true;
    }
  }
});

document.getElementById("expand").addEventListener("click", function () {
  for (let i = 0; i < 5; i++) {
    let letters = document.querySelectorAll(".letter:empty");
    let index = Math.floor(Math.random() * letters.length);
    let x = letters[index].getAttribute("data-x");
    let y = letters[index].getAttribute("data-y");

    document
      .querySelectorAll(`[data-x="${x}"][data-y="${y}"]`)
      .forEach((element) => {
        element.textContent = game.letterAt(x - 1, y - 1);
      });
  }
});

document.getElementById("fa-hammer").addEventListener("click", function () {

  document.getElementById("black").classList.remove("hidden");

  document.querySelectorAll(".letter").forEach(element => {
    element.classList.add("on-top")
  })

  activeHammer = true;

});

document.querySelectorAll(".letter").forEach(element => {
  element.addEventListener('click', function(){
    if(activeHammer && !element.textContent.length){
      let x = element.getAttribute("data-x");
      let y = element.getAttribute("data-y");

      document
      .querySelectorAll(`[data-x="${x}"][data-y="${y}"]`)
      .forEach((element) => {
        element.textContent = game.letterAt(x - 1, y - 1);
      });

      document.querySelectorAll(".letter").forEach(element => {
        element.classList.remove("on-top")
      })

      document.getElementById("black").classList.add("hidden");

      activeHammer = false;
    }
  })
})
