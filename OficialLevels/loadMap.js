gettingFrom = localStorage.getItem("MapType");
selectedMapId = localStorage.getItem("CraftyMapId");

function loadMapFile(fl_file) {
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', fl_file, false);
    xmlhttp.send();

    uploadedmapdata = JSON.parse(xmlhttp.responseText);
    //map config
    mapdata.mapname = uploadedmapdata.mapname;
    mapdata.ambient = uploadedmapdata.ambient;
    if (uploadedmapdata.void != undefined) {
        mapdata.void = uploadedmapdata.void;
    } else {
        mapdata.void = 1200;
    }
    //map components
    for (var i = 0; i < uploadedmapdata.components.length; i++) {
        UpComponentType = uploadedmapdata.components[i].type;
        UpComponentX = uploadedmapdata.components[i].x;
        UpComponentY = uploadedmapdata.components[i].y;
        UpComponentSolid = uploadedmapdata.components[i].isSolid;

        if (uploadedmapdata.components[i].rotation != undefined) {
            UpComponentRotation = uploadedmapdata.components[i].rotation;
        } else {
            UpComponentRotation = 0;
        }
        if (uploadedmapdata.components[i].break != undefined) {
            UpBreaking = uploadedmapdata.components[i].break;
        } else {
            UpBreaking = "Unbreakable";
        }
        if (uploadedmapdata.components[i].extra != undefined) {
            UpExtra = uploadedmapdata.components[i].extra;
        } else {
            UpExtra = {};
        }

        //place blocks
        if (UpComponentType != "deleted") {
            placeBlock(UpComponentType, UpComponentX, UpComponentY, UpComponentRotation, UpComponentSolid, UpBreaking, UpExtra);
            console.log("uploaded block");
        }
    }
}

function initializeMap() {
    if (gettingFrom == "oficial") {
        if (selectedMapId == "Level 1") {
            loadMapFile("./Level 1.craftymap");
        }else if (selectedMapId == "Level 2") {
            loadMapFile("./Level 2.craftymap");
        }else{
            window.location = "../";
        }
        isRunning = true
    }else{
        window.location = "../";
    }
}