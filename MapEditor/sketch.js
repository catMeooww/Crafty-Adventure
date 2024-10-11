mapdata = { mapname: "", ambient: "plains", void: 1200, components: [] };
isRunning = false;
isSelectorOpen = false;
isDebbuging = false;

var selectedBlock = "grass";
var selectedBlockSolid = true;
var selectedBlockRotation = 0;
var selectedBlockBreaking = "Unbreakable";
var editingBlockIndex = 0;

var ShowDevInfo = false;
var latestRunData = [];

var sprites = [];

function saveName() {
  savingName = document.getElementById("mapname").value;
  if (!savingName == "") {
    mapdata.mapname = savingName;
    document.getElementById("title").innerHTML = "Crafty Adventure: Map Editor: " + mapdata.mapname;
    document.getElementById("uploadmap").innerHTML = "<b>Map Name Saved!</b>";
  }
}

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
  canvas.parent("canvashandler");

  playerSprite = createSprite(0, 0);
  playerSprite.addImage("player", playerImage);
  playerSprite.depth = 2;
  playerHolder = createSprite(0, 35, 15, 5);
  playerHolder.visible = false;

  mousePlacer = createSprite(0, 0);
  mousePlacer.addImage("builder", planksImg);
  mousePlacer.addImage("deletor", pickaxeImg);
  mousePlacer.addImage("editor", eAxeImg);
  mousePlacer.scale = 0.8;
  mousePlacer.tint = "rgba(255,255,255,0.5)";
  mousePlacer.depth = 3;
}

function draw() {
  frameRate(100);
  background("cyan");

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
    playerSprite.x = 0;
    playerSprite.y = 0;
    latestRunData.push("Died by: Void");
  }

  playerHolder.position.x = playerSprite.position.x;
  playerHolder.position.y = playerSprite.position.y + 35;

  if (!isRunning) {
    mousePlacer.visible = true;
    mousePlacer.position.x = Math.floor(playerSprite.position.x + mouseX - 630);
    mousePlacer.position.y = Math.floor(playerSprite.position.y - 60 + mouseY - 250);

    if (selectedBlock == "delete") {
      mousePlacer.changeImage("deletor");
      mousePlacer.scale = 0.5;
    } else if (selectedBlock == "editB") {
      mousePlacer.changeImage("editor");
      mousePlacer.scale = 0.5;
    } else {
      mousePlacer.changeImage("builder");
      mousePlacer.scale = 0.8;
    }
  } else {
    mousePlacer.visible = false;
  }

  if (ShowDevInfo) {
    objectsLabel = "<label>Objects: " + mapdata.components.length + "</label><br>";
    document.getElementById("upload_file").innerHTML = objectsLabel + JSON.stringify(mapdata);
  } else {
    positionLabel = "<label>Position:" + Math.floor(playerSprite.position.x) + "," + Math.floor(playerSprite.position.y) + "</label><br>";
    document.getElementById("upload_file").innerHTML = positionLabel + latestRunData;
  }
}

//tests

function testFunctional(index) {
  if (mapdata.components[index].type == "finish") {
    latestRunData.push("Level Completed");
    runTest()
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

//place

function mouseClicked() {
  if (!(isRunning || mapdata.mapname == "" || isSelectorOpen)) {
    if (mouseX > 50 && mouseY > 50 && mouseX < 1200 && mouseY < 450) {
      if (selectedBlock == "delete") {
        for (var i = 0; i < sprites.length; i++) {
          if (mousePlacer.isTouching(sprites[i])) {
            sprites[i].visible = false;
            mapdata.components[i].type = "deleted";
          }
        }
      } else if (selectedBlock == "editB") {
        for (var i = 0; i < sprites.length; i++) {
          if (mousePlacer.isTouching(sprites[i]) && sprites[i].visible == true) {
            editingBlockIndex = i;
            openBlockProperties();
          }
        }
      } else {
        placeBlock(selectedBlock, mousePlacer.position.x, mousePlacer.position.y, selectedBlockRotation, selectedBlockSolid, selectedBlockBreaking, {});
      }
    }
  }
}

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

//data

function enableShowMapJson() {
  ShowDevInfo = true;
  document.getElementById("showJsonBtn").style.borderBottomColor = "blue";
  document.getElementById("showConsoleBtn").style.borderBottomColor = "green";
}
function enableShowMapConsole() {
  ShowDevInfo = false;
  document.getElementById("showJsonBtn").style.borderBottomColor = "green";
  document.getElementById("showConsoleBtn").style.borderBottomColor = "blue";
}

function runTest() {
  if (isRunning == false) {
    isRunning = true;
    document.getElementById("runButton").innerHTML = "Stop Game";
    latestRunData = [];
  } else {
    isRunning = false;
    document.getElementById("runButton").innerHTML = "Run Game";
  }
  playerSprite.x = 0;
  playerSprite.y = 0;
}

//select blocks

function selectBlock(b) {
  selectedBlockSolid = true;
  if (b == 1) {
    selectedBlock = "grass";
  } else if (b == 2) {
    selectedBlock = "planks";
  } else if (b == 3) {
    selectedBlock = "wood";
  } else if (b == 4) {
    selectedBlock = "leaves";
  } else if (b == 5) {
    selectedBlock = "dirt";
  }
  document.getElementById("actualblock").innerHTML = selectedBlock + "  |<b class='greenTxt'>  solid</b>";
}

function selectBgBlock(b) {
  selectedBlockSolid = false;
  if (b == 1) {
    selectedBlock = "grass";
  } else if (b == 2) {
    selectedBlock = "planks";
  } else if (b == 3) {
    selectedBlock = "wood";
  } else if (b == 4) {
    selectedBlock = "leaves";
  } else if (b == 5) {
    selectedBlock = "dirt";
  }
  document.getElementById("actualblock").innerHTML = selectedBlock + "  |<b class='yellowTxt'>  background</b>";
}

function selectFunctionalBlock(b) {
  selectedBlockSolid = false;
  if (b == 1) {
    selectedBlock = "finish";
  } else if (b == 2) {
    selectedBlock = "ender";
  } else if (b == 3) {
    selectedBlock = "spawner";
  }
  document.getElementById("actualblock").innerHTML = selectedBlock + "  |<b class='purpleTxt'>  functional</b>";
}

function selectBlockTool(t) {
  if (t == 1) {
    selectedBlock = "delete";
  } else if (t == 2) {
    selectedBlock = "editB";
  }
  document.getElementById("actualblock").innerHTML = selectedBlock + "  |<b class='redTxt'>  tool</b>";
}

function selectAmbient(a) {
  if (a == 1) {
    mapdata.ambient = "air";
  } else if (a == 2) {
    mapdata.ambient = "plains";
  } else if (a == 3) {
    mapdata.ambient = "islandy";
  }
  document.getElementById("actualambient").innerHTML = mapdata.ambient;
}

//open choosers
function openChooseBlock() {
  document.getElementById("blockselector").style.visibility = "visible";
  isSelectorOpen = true;
}
function closeChooseBlock() {
  document.getElementById("blockselector").style.visibility = "hidden";
  setTimeout(() => {
    isSelectorOpen = false;
  }, 500)
}

function openChooseAmbient() {
  document.getElementById("ambientselector").style.visibility = "visible";
  isSelectorOpen = true;
}
function closeChooseAmbient() {
  document.getElementById("ambientselector").style.visibility = "hidden";
  setTimeout(() => {
    isSelectorOpen = false;
  }, 500)
}

//block properties
function openBlockProperties() {
  document.getElementById('blockProperties').style.visibility = "visible";
  isSelectorOpen = true;
  editingThisBlockType = mapdata.components[editingBlockIndex].type;
  editingThisBlockSolid = mapdata.components[editingBlockIndex].isSolid;
  if (editingThisBlockSolid == true) {
    document.getElementById('editingBlockName').innerHTML = editingThisBlockType + "  |<b class='greenTxt'>  solid</b>";
  } else {
    document.getElementById('editingBlockName').innerHTML = editingThisBlockType + "  |<b class='yellowTxt'>  background</b>"
  }
  document.getElementById('editingBlockID').innerHTML = editingBlockIndex;
  document.getElementById('editingBlockPosX').innerHTML = mapdata.components[editingBlockIndex].x;
  document.getElementById('editingBlockPosY').innerHTML = mapdata.components[editingBlockIndex].y;
  document.getElementById('editingBlockPosR').innerHTML = mapdata.components[editingBlockIndex].rotation;
  document.getElementById('editingBlockBreakbility').innerHTML = mapdata.components[editingBlockIndex].break;

  if (editingThisBlockType == 'ender') {
    document.getElementById("extraProperties").innerHTML = "<h3>Ender Pearl Config</h3><br><br><label>X:</label><input id='specialPropertiesInput1' type='number'><br><br><label>Y:</label><input id='specialPropertiesInput2' type='number''><br><br><button id='specialPropertiesBtn' onclick='setEnderTp()'>Set Tp</button>";
  }else{
    document.getElementById("extraProperties").innerHTML = "";
  }
}

function closeBlockProperties() {
  document.getElementById('blockProperties').style.visibility = "hidden";
  setTimeout(() => {
    isSelectorOpen = false;
  }, 500)
}

function moveEditingBlock(movement) {
  if (movement == 'less-x') {
    mapdata.components[editingBlockIndex].x--;
    sprites[editingBlockIndex].position.x--;
  } else if (movement == 'more-x') {
    mapdata.components[editingBlockIndex].x++;
    sprites[editingBlockIndex].position.x++;
  } else if (movement == 'less-y') {
    mapdata.components[editingBlockIndex].y--;
    sprites[editingBlockIndex].position.y--;
  } else if (movement == 'more-y') {
    mapdata.components[editingBlockIndex].y++;
    sprites[editingBlockIndex].position.y++;
  } else if (movement == 'less-r') {
    if (mapdata.components[editingBlockIndex].rotation == 0) {
      mapdata.components[editingBlockIndex].rotation = 270;
      sprites[editingBlockIndex].rotation = 270;
    } else {
      mapdata.components[editingBlockIndex].rotation -= 90;
      sprites[editingBlockIndex].rotation -= 90;
    }
  } else if (movement == 'more-r') {
    if (mapdata.components[editingBlockIndex].rotation == 270) {
      mapdata.components[editingBlockIndex].rotation = 0;
      sprites[editingBlockIndex].rotation = 0;
    } else {
      mapdata.components[editingBlockIndex].rotation += 90;
      sprites[editingBlockIndex].rotation += 90;
    }
  }
  document.getElementById('editingBlockPosX').innerHTML = mapdata.components[editingBlockIndex].x;
  document.getElementById('editingBlockPosY').innerHTML = mapdata.components[editingBlockIndex].y;
  document.getElementById('editingBlockPosR').innerHTML = mapdata.components[editingBlockIndex].rotation;
  selectedBlockRotation = sprites[editingBlockIndex].rotation;
}

function breakbilityEditingBlock(n){
  if (mapdata.components[editingBlockIndex].break == "Unbreakable"){
    if (n == 1){
      mapdata.components[editingBlockIndex].break = 1;
    }
  }else{
    if (mapdata.components[editingBlockIndex].break == 1 && n == -1){
      mapdata.components[editingBlockIndex].break = "Unbreakable";
    }else{
      mapdata.components[editingBlockIndex].break += n;
    }
  }
  selectedBlockBreaking = mapdata.components[editingBlockIndex].break;
  document.getElementById('editingBlockBreakbility').innerHTML = mapdata.components[editingBlockIndex].break;
}

//extra
function startDepuration() {
  if (isDebbuging) {
    isDebbuging = false;
    playerSprite.debug = false;
    playerHolder.visible = false;
    for (var i = 0; i < sprites.length; i++) {
      if (sprites[i].visible == true) {
        sprites[i].debug = false;
      }
    }
    document.getElementById("showDebugBtn").innerHTML = "Start Debug";
  } else {
    isDebbuging = true;
    playerSprite.debug = true;
    playerHolder.visible = true;
    for (var i = 0; i < sprites.length; i++) {
      if (sprites[i].visible == true) {
        sprites[i].debug = true;
      }
    }
    document.getElementById("showDebugBtn").innerHTML = "Stop Debug";
  }
}

function newVoid() {
  newVoidHeight = document.getElementById('voidHeightEditor').value;
  if (newVoidHeight > 1000) {
    mapdata.void = newVoidHeight;
  } else {
    mapdata.void = 1000;
  }
  document.getElementById('showVoidHeight').innerHTML = mapdata.void;
}

function setEnderTp(){
  mapdata.components[editingBlockIndex].extra.tpX = Number(document.getElementById("specialPropertiesInput1").value);
  mapdata.components[editingBlockIndex].extra.tpY = Number(document.getElementById("specialPropertiesInput2").value);
}