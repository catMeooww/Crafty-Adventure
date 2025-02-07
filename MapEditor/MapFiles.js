function handle_file_select(evt) {
    console.info("[Event] file chooser");

    let fl_files = evt.target.files;

    let fl_file = fl_files[0];

    let reader = new FileReader();

    let display_file = (e) => {
        uploadedmapdata = JSON.parse(e.target.result);
        //map config
        mapdata.mapname = uploadedmapdata.mapname;
        mapdata.ambient = uploadedmapdata.ambient;
        if(uploadedmapdata.void != undefined){
            mapdata.void = uploadedmapdata.void;
        }else{
            mapdata.void = 1200;
        }
        document.getElementById('showVoidHeight').innerHTML = mapdata.void;
        document.getElementById("actualambient").innerHTML = mapdata.ambient;
        document.getElementById("uploadmap").innerHTML = "<b>Map Loaded!</b>";
        document.getElementById("mapname").value = mapdata.mapname;
        document.getElementById("title").innerHTML ="Crafty Adventure: Map Editor: " + mapdata.mapname;
        //map components
        for(var i = 0;i < uploadedmapdata.components.length;i++){
            UpComponentType = uploadedmapdata.components[i].type;
            UpComponentX = uploadedmapdata.components[i].x;
            UpComponentY = uploadedmapdata.components[i].y;
            UpComponentSolid = uploadedmapdata.components[i].isSolid;

            if(uploadedmapdata.components[i].rotation != undefined){
                UpComponentRotation = uploadedmapdata.components[i].rotation;
            }else{
                UpComponentRotation = 0;
            }
            if(uploadedmapdata.components[i].break != undefined){
                UpBreaking = uploadedmapdata.components[i].break;
            }else{
                UpBreaking = "Unbreakable";
            }
            if(uploadedmapdata.components[i].extra != undefined){
                UpExtra = uploadedmapdata.components[i].extra;
            }else{
                UpExtra = {};
            }

            //place blocks
            if(UpComponentType != "deleted"){
            placeBlock(UpComponentType,UpComponentX,UpComponentY,UpComponentRotation,UpComponentSolid,UpBreaking,UpExtra);
            console.log("uploaded block");
            }
        }
    };

    let on_reader_load = (fl) => {
        return display_file;
    };

    reader.onload = on_reader_load(fl_file);

    reader.readAsText(fl_file);
}

function userLogged(){
    console.log("logged: " + logged);
    document.getElementById("mapPublisherBTN").innerHTML = "Publish Map";
    document.getElementById("mapPublisherBTN").style.color = "lime";
    document.getElementById("publishUSER").innerHTML = user;
}

function download() {
    if (!mapdata.mapname == "") {
        console.log("downloading map")
        filename = document.getElementById('mapname').value + ".craftymap";
        text = JSON.stringify(mapdata);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

function publish(){
    firebase.database().ref("/maps/").push({
            by:user,
            data:mapdata
    });
    document.getElementById("MapPublishing").innerHTML = "<h1>Map Published!<h1><center><button onclick='menu()' style='width: 80%;'>Main Page</button></center><p>Downloading local copy...</p>";
    download();
}