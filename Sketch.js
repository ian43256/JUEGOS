//POU GAME FINAL VERSION ESTA SI FUNCIONA OMG

var PLAY = 1;
var END = 0;
var gameState = PLAY;

var Pou1;
var pou, pouInvencible, pou_collided;

var groundImage;

var Comida1, Comida2, Comida3, Comida4, Comida5, Comida6;
var comidaImgs = [];
var Obstaculo1, Obstaculo2, Obstaculo3, Obstaculo4, Obstaculo5, Obstaculo6;
var obstaculoImgs = [];
var PowerUp;
var invisibleGround;
var gameOverImg, restartImg;

var obstaculosGroup;
var comidaGroup;
var powerUpGroup;

var score = 0;
var vidas = 3;
var velocidadCaida;
var intervaloSpawn = 60;   
var framesSinSpawn = 0;

var esInvencible = false;
var tiempoInvencible = 0;
var DURACION_INVENCIBLE = 600; 
var framesSinPowerUp = 0;
var INTERVALO_POWERUP = 500;   

var sueloAlto;                
var pouAnchoMax, pouAltoMax;  
var itemTam;                  
var margenHUD, hudTextoTam;   

var btnRestartX, btnRestartY, btnRestartW, btnRestartH;

var musicaFondo;


function preload() {
    groundImage = loadImage("FondoFoodDrop.jpg"); 

    pou = loadAnimation("Pou1.png", "Pou2.png", "Pou3.png");
    pouInvencible = loadAnimation("PouStar.png", "PouStar2.png", "PouStar3.png");
    pou_collided = loadAnimation("PouGameOver.png");

    Obstaculo1 = loadImage("Obstaculo1.png");
    Obstaculo2 = loadImage("Obstaculo2.png");
    Obstaculo3 = loadImage("Obstaculo3.png");
    Obstaculo4 = loadImage("Obstaculo4.png");
    Obstaculo5 = loadImage("Obstaculo5.png");
    Obstaculo6 = loadImage("Obstaculo6.png");
    obstaculoImgs = [Obstaculo1, Obstaculo2, Obstaculo3, Obstaculo4, Obstaculo5, Obstaculo6];

    Comida1 = loadImage("Comida1.png");
    Comida2 = loadImage("Comida2.png");
    Comida3 = loadImage("Comida3.png");
    Comida4 = loadImage("Comida4.png");
    Comida5 = loadImage("Comida5.png");
    Comida6 = loadImage("Comida6.png");
    comidaImgs = [Comida1, Comida2, Comida3, Comida4, Comida5, Comida6];

    PowerUp = loadImage("PowerUp.png");
    musicaFondo = loadSound("PouMusic.mp3");

    gameOverImg = loadImage("GameOverPou.png");
    restartImg = loadImage("RestartPou.png");
}


function setup() {
    createCanvas(windowWidth, windowHeight);

    calcularProporciones();

    Pou1 = createSprite(width / 2, height - sueloAlto, 10, 10);
    Pou1.addAnimation("pou", pou);
    Pou1.addAnimation("invencible", pouInvencible);
    Pou1.addAnimation("collided", pou_collided);
    ajustarPou();

    invisibleGround = createSprite(width / 2, height - sueloAlto, width, sueloAlto * 0.2);
    invisibleGround.visible = false;
    invisibleGround.immovable = true;

    obstaculosGroup = createGroup();
    comidaGroup = createGroup();
    powerUpGroup = createGroup();

    musicaFondo.setLoop(true);
    musicaFondo.setVolume(0.4);

    velocidadCaida = height * 0.005;
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calcularProporciones();

    Pou1.position.x = constrain(Pou1.position.x, pouAnchoMax / 2, width - pouAnchoMax / 2);
    ajustarPou();

    invisibleGround.position.x = width / 2;
    invisibleGround.position.y = height - sueloAlto;
    invisibleGround.width = width;
    invisibleGround.height = sueloAlto * 0.2;
}

function calcularProporciones() {
    sueloAlto   = height * 0.10; 
    pouAnchoMax = width  * 0.25; 
    pouAltoMax  = height * 0.18; 
    itemTam     = width  * 0.12; 
    margenHUD   = width  * 0.03;
    hudTextoTam = width  * 0.07; 
}


function ajustarPou() {
    var frame = pou.images[0];
    var escala = min(pouAnchoMax / frame.width, pouAltoMax / frame.height);

    Pou1.width = frame.width;
    Pou1.height = frame.height;
    Pou1.scale = escala;

    var altoVisible = frame.height * escala;
    Pou1.position.y = (height - sueloAlto) - altoVisible / 2 + altoVisible * 0.05;
}


function draw() {

    dibujarFondo();

    if (gameState === PLAY) {
        actualizarJuego();
    }

    imageMode(CORNER);
    drawSprites();

    if (gameState === END) {
        mostrarPantallaFinal();
    }

    dibujarHUD();
}


function dibujarFondo() {
    var escala = max(width / groundImage.width, height / groundImage.height);
    var wDestino = groundImage.width * escala;
    var hDestino = groundImage.height * escala;
    
    var x = (width - wDestino) / 2;
    
    var y = ((height - hDestino) / 2) - 500; 

    imageMode(CORNER);
    image(groundImage, x, y, wDestino, hDestino);
}


function actualizarJuego() {
    moverJugador();
    generarObjetosQueCaen();
    revisarColisiones();
    actualizarInvencibilidad();
    aumentarDificultad();
}


function moverJugador() {
    var velocidad = width * 0.012; 

    if (keyDown("LEFT_ARROW") || keyDown("a")) {
        Pou1.velocity.x = -velocidad;
    } else if (keyDown("RIGHT_ARROW") || keyDown("d")) {
        Pou1.velocity.x = velocidad;
    } else {
        Pou1.velocity.x = 0;
    }

    var limite = pouAnchoMax / 2;
    Pou1.position.x = constrain(Pou1.position.x, limite, width - limite);
}


function generarObjetosQueCaen() {
    framesSinSpawn++;
    framesSinPowerUp++;

    if (framesSinSpawn >= intervaloSpawn) {
        framesSinSpawn = 0;
        if (random(1) < 0.75) {
            crearComida();
        } else {
            crearObstaculo();
        }
    }

    if (framesSinPowerUp >= INTERVALO_POWERUP) {
        framesSinPowerUp = 0;
        crearPowerUp();
    }
}


function crearSpriteQueCae(img, grupo) {
    var x = random(itemTam, width - itemTam);
    var s = createSprite(x, -itemTam, img.width, img.height);
    s.addImage(img);
    s.scale = itemTam / max(img.width, img.height);
    s.velocity.y = velocidadCaida;
    grupo.add(s);
    return s;
}


function crearComida() {
    crearSpriteQueCae(random(comidaImgs), comidaGroup);
}


function crearObstaculo() {
    crearSpriteQueCae(random(obstaculoImgs), obstaculosGroup);
}


function crearPowerUp() {
    crearSpriteQueCae(PowerUp, powerUpGroup);
}


function revisarColisiones() {
    Pou1.overlap(comidaGroup, function (pou, comida) {
        score += 10;
        comida.remove();
    });

    Pou1.overlap(powerUpGroup, function (pou, star) {
        activarInvencibilidad();
        star.remove();
    });

    Pou1.overlap(obstaculosGroup, function (pou, obs) {
        if (esInvencible) {
            score += 5;
            obs.remove();
        } else {
            terminarJuego();
        }
    });

    invisibleGround.overlap(comidaGroup, function (piso, comida) {
        if (!esInvencible) {
            perderVida(); 
        }
        comida.remove();
    });

    invisibleGround.overlap(obstaculosGroup, function (piso, obs) {
        obs.remove(); 
    });

    invisibleGround.overlap(powerUpGroup, function (piso, star) {
        star.remove();
    });
}


function activarInvencibilidad() {
    esInvencible = true;
    tiempoInvencible = DURACION_INVENCIBLE;
    Pou1.changeAnimation("invencible");
}


function actualizarInvencibilidad() {
    if (!esInvencible) return;

    tiempoInvencible--;

    if (tiempoInvencible < 120) {
        if (frameCount % 10 < 5) {
            Pou1.changeAnimation("pou");
        } else {
            Pou1.changeAnimation("invencible");
        }
    }

    if (tiempoInvencible <= 0) {
        esInvencible = false;
        Pou1.visible = true; 
        Pou1.changeAnimation("pou");
    }
} 


function perderVida() {
    vidas--;
    if (vidas <= 0) {
        terminarJuego();
    }
}


function terminarJuego() {
    gameState = END;
    Pou1.changeAnimation("collided");
    Pou1.velocity.x = 0;

    vaciarGrupo(obstaculosGroup);
    vaciarGrupo(comidaGroup);
    vaciarGrupo(powerUpGroup);
}


function vaciarGrupo(grupo) {
    for (var i = grupo.length - 1; i >= 0; i--) {
        grupo[i].remove();
    }
}


function aumentarDificultad() {
    var nivel = floor(score / 100);
    velocidadCaida = height * 0.005 + nivel * (height * 0.00125);
    intervaloSpawn = max(15, 60 - nivel * 5);
}

function dibujarHUD() {
    if (gameState === PLAY) {

        fill(255);
        stroke(0);
        strokeWeight(max(2, width * 0.005)); 
        textSize(hudTextoTam);
        textAlign(LEFT, TOP);
        
        text("Puntos: " + score, margenHUD, margenHUD);

        var fallos = 3 - vidas;
        text("Fallos: " + fallos + "/3", margenHUD, margenHUD + hudTextoTam * 1.2);

        if (esInvencible) {
            fill(255, 180, 0);
            stroke(255);
            textAlign(CENTER, TOP);
            text("¡INVENCIBLE! " + ceil(tiempoInvencible / 60) + "s", width / 2, margenHUD);
        }
    }
}


function mostrarPantallaFinal() {

    imageMode(CENTER);

    var goW = width * 0.8;
    var goH = height * 0.4;

    dibujarImagenAjustada(
        gameOverImg,
        width / 2,
        height * 0.4,
        goW,
        goH
    );

    fill(255);
    stroke(0);
    strokeWeight(max(2, width * 0.005));

    textSize(hudTextoTam);
    textAlign(CENTER, CENTER);

    text(
        "Puntuación final: " + score,
        width / 2,
        height * 0.65
    );

    var bw = width * 0.4;
    var bh = height * 0.15;

    var escala = min(
        bw / restartImg.width,
        bh / restartImg.height
    );

    btnRestartW = restartImg.width * escala;
    btnRestartH = restartImg.height * escala;

    btnRestartX = width / 2;
    btnRestartY = height * 0.85;

    image(
        restartImg,
        btnRestartX,
        btnRestartY,
        btnRestartW,
        btnRestartH
    );
}


function dibujarImagenAjustada(img, x, y, anchoMax, altoMax) {
    var escala = min(anchoMax / img.width, altoMax / img.height);
    var w = img.width * escala;
    var h = img.height * escala;
    image(img, x, y, w, h);
}


function iniciarMusica() {
    userStartAudio(); 
    if (!musicaFondo.isPlaying()) {
        musicaFondo.loop();
    }
}
function mouseReleased() {
    if (gameState === END) {
        var dentroBoton =
            mouseX >= btnRestartX - btnRestartW / 2 &&
            mouseX <= btnRestartX + btnRestartW / 2 &&
            mouseY >= btnRestartY - btnRestartH / 2 &&
            mouseY <= btnRestartY + btnRestartH / 2;

        if (dentroBoton) {
            reiniciarJuego();
            iniciarMusica();
        }
    } else {
        iniciarMusica();
    }
    return false; 


function touchEnded() {
    mouseReleased();
    return false;
}
function keyPressed() {
    iniciarMusica();
}

function reiniciarJuego() {

    score = 0;
    vidas = 3;

    velocidadCaida = height * 0.005;
    intervaloSpawn = 60;

    esInvencible = false;
    tiempoInvencible = 0;

    framesSinSpawn = 0;
    framesSinPowerUp = 0;

    vaciarGrupo(obstaculosGroup);
    vaciarGrupo(comidaGroup);
    vaciarGrupo(powerUpGroup);

    Pou1.position.x = width / 2;
    ajustarPou();

    Pou1.velocity.x = 0;
    Pou1.velocity.y = 0;

    Pou1.visible = true;
    Pou1.changeAnimation("pou");


    gameState = PLAY;
}
}