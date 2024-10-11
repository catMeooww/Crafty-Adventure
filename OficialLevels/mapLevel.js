mapdata = { mapname: "", ambient: "plains", void: 1200, components: [] };
isRunning = false;
isSelectorOpen = false;
isDebbuging = false;

var ShowDevInfo = false;
var latestRunData = [];

var sprites = [];

function preload() {
  //player and editor
  playerImage = loadImage("../sprites/ExplorerPlayer.png");
  pickaxeImg = loadImage("../sprites/pickaxe.jpg");
  eAxeImg = loadImage("../sprites/axe.png");

  bg_air = loadImage("../ambient_assets/empty_bg.png");
  bg_plains = loadImage("../ambient_assets/plains_bg.png");
  bg_islands = loadImage("../ambient_assets/islandy_bg.png");

  planksImg = loadImage("../sprites/Planks.jpg");
  woodImg = loadImage("../sprites/Wood.jpg");
  leavesImg = loadImage("../sprites/Leaves.jpg");
  grassImg = loadImage("../sprites/Grass.jpg");
  dirtImg = loadImage("../sprites/Dirt.jpg");
  enderEye = loadImage("../sprites/EnderFinish.png");
  enderPearl = loadImage("../sprites/EnderTeleporter.png");
  spawner = loadImage("../sprites/spawner.png");
}

function setup() {
  canvas = createCanvas(windowWidth - 100, windowHeight - 100);
  canvas.parent("GameCanvas");

  playerSprite = createSprite(0, 0);
  playerSprite.addImage("player", playerImage);
  playerSprite.depth = 2;
  playerHolder = createSprite(0, 35, 15, 5);
  playerHolder.visible = false;
}

function draw() {
  frameRate(100);
  background("cyan");
  document.getElementById("mapId").innerHTML = "Map: " + mapdata.mapname;
  document.getElementById("mapId_menu").innerHTML = "Map Id: " + mapdata.mapname + ".craftymap";

  if (mapdata.ambient == "air") {
    image(bg_air, camera.x - 650, camera.y - 260, 1300, 520);
  } else if (mapdata.ambient == "plains") {
    image(bg_plains, camera.x - 650, camera.y - 260, 1300, 520);
  } else if (mapdata.ambient == "islandy") {
    image(bg_islands, camera.x - 650, camera.y - 260, 1300, 520);
  }

  if (isRunning) {
    playerSprite.velocityY = playerSprite.velocityY + 0.6;
    for (var i = 0; i < sprites.length; i++) {
      if (sprites[i].visible == true && mapdata.components[i].isSolid == true) {
        playerSprite.collide(sprites[i]);
      } else if (sprites[i].visible == true && playerSprite.isTouching(sprites[i])) {
        testFunctional(i)
      }
    }
  } else {
    playerSprite.velocityY = 0;
  }

  drawSprites();

  camera.x = playerSprite.position.x;
  camera.y = playerSprite.position.y - 60;

  //controls
  if (keyDown("right") || keyDown("d")) {
    playerSprite.mirrorX(1);
    playerSprite.velocityX = 5;
  } else if (keyDown("left") || keyDown("a")) {
    playerSprite.mirrorX(-1);
    playerSprite.velocityX = -5;
  } else {
    playerSprite.velocityX = 0;
  }

  if (keyDown("up") || keyDown("w") || keyDown("space")) {
    if (isRunning) {
      if (testForInGround()) {
        playerSprite.velocityY = -12;
      }
    } else {
      playerSprite.velocityY = -5;
    }
  } else if (keyDown("down") || keyDown("s")) {
    if (!isRunning) {
      playerSprite.velocityY = 5;
    }
  } else if (!isRunning) {
    playerSprite.velocityY = 0;
  }

  if (playerSprite.position.y > mapdata.void) {
    endLevel(0)
    latestRunData.push("Died by: Void");
  }

  playerHolder.position.x = playerSprite.position.x;
  playerHolder.position.y = playerSprite.position.y + 35;
}

//tests

function testFunctional(index) {
  if (mapdata.components[index].type == "finish") {
    latestRunData.push("Level Completed");
    endLevel(1)
  } else if (mapdata.components[index].type == "ender") {
    EnderTpX = mapdata.components[index].extra.tpX;
    EnderTpY = mapdata.components[index].extra.tpY;
    if (EnderTpX == undefined || EnderTpY == undefined) {
      EnderTpX = 0;
      EnderTpY = 0;
    }
    playerSprite.x = EnderTpX;
    playerSprite.y = EnderTpY;
    latestRunData.push("Teleported to: " + EnderTpX + " | " + EnderTpY);
  }
}

function testForInGround() {
  for (var i = 0; i < sprites.length; i++) {
    if (playerHolder.isTouching(sprites[i]) && mapdata.components[i].isSolid == true) {
      latestRunData.push("Player on Ground: true");
      return (true);
    }
  }
}

//loading map
function placeBlock(thisblock, placedPosX, placedPosY, thisBlockRotation, thisBlockIsSolid, breakbility, extra) {
  createdSprite = createSprite(placedPosX, placedPosY);
  createdSprite.depth = 1;
  if (thisblock == "grass") {
    createdSprite.addImage("default", grassImg);
  } else if (thisblock == "planks") {
    createdSprite.addImage("default", planksImg);
  } else if (thisblock == "wood") {
    createdSprite.addImage("default", woodImg);
  } else if (thisblock == "leaves") {
    createdSprite.addImage("default", leavesImg);
  } else if (thisblock == "dirt") {
    createdSprite.addImage("default", dirtImg);
  } else if (thisblock == "finish") {
    createdSprite.addImage("default", enderEye);
  } else if (thisblock == "ender") {
    createdSprite.addImage("default", enderPearl);
  } else if (thisblock == "spawner") {
    createdSprite.addImage("default", spawner);
  }
  createdSprite.scale = 0.8;
  createdSprite.rotation = thisBlockRotation;

  if (isDebbuging) {
    createdSprite.debug = true;
  }

  if (thisBlockIsSolid == false) {
    createdSprite.tint = "rgb(150,150,150)";
  }

  mapdata.components.push({
    type: thisblock,
    x: placedPosX,
    y: placedPosY,
    isSolid: thisBlockIsSolid,
    rotation: thisBlockRotation,
    break: breakbility,
    extra: extra
  });

  sprites.push(createdSprite);
}

function pauseUi(){
  document.getElementById("PauseMenu").style.visibility = "visible";
  console.log("Menu Open")
}

function restart() {
  playerSprite.x = 0;
  playerSprite.y = 0;
  isRunning = true;
  closeUIs();
}

function endLevel(type = 0) {
  isRunning = false;
  console.log(latestRunData);
  latestRunData = [];
  if (type == 1) {
    document.getElementById("WinMenu").style.visibility = "visible";
  } else {
    document.getElementById("DeathMenu").style.visibility = "visible";
  }
}

function leaveLevel() {
  window.location = "../";
}

function closeUIs(){
  document.getElementById("WinMenu").style.visibility = "hidden";
  document.getElementById("DeathMenu").style.visibility = "hidden";
  document.getElementById("PauseMenu").style.visibility = "hidden";
}