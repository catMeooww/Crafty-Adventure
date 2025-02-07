var user = localStorage.getItem("user");
var password = localStorage.getItem("password");
var logged = false;

const firebaseConfig = {
    apiKey: "AIzaSyC2LLGHUFhsbNUycHGYr-Wwxqc4n4VaTu8",
    authDomain: "crafty-adv-maps.firebaseapp.com",
    databaseURL: "https://crafty-adv-maps-default-rtdb.firebaseio.com",
    projectId: "crafty-adv-maps",
    storageBucket: "crafty-adv-maps.firebasestorage.app",
    messagingSenderId: "418998957545",
    appId: "1:418998957545:web:3d908319aa712482b58778"
};
firebase.initializeApp(firebaseConfig);

function loadUserData() {
    if (user != undefined && password != undefined) {
        var userref = firebase.database().ref("/users/" + user + "/status");
        var passref = firebase.database().ref("/users/" + user + "/password");
        var isUserCreated;
        var isJoining = false;
        userref.on("value", data => {
            isUserCreated = data.val();
            console.log("logged: " + logged);
            if (!isJoining) {
                isJoining = true;
                if (isUserCreated == "online" || isUserCreated == "mod") {
                    passref.on("value", data => {
                        canPass = data.val();
                        if (canPass == password) {
                            logged = true;
                            userLogged()
                        }
                    })
                }
            }
        });
    }
    console.log("logged: " + logged);
}