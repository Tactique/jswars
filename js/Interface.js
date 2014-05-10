onclick=function(){
    console.log("foo")
    if (unitControlState.unit != null) {
        document.getElementById("unitInfo").style.display = "block";
        document.getElementById("unitName").textContent = unitControlState.unit.name;
        document.getElementById("unitLegs").textContent = unitControlState.unit.movementType;
        document.getElementById("unitHealth").style.width = (100 * (unitControlState.unit.health / unitControlState.unit.maxHealth));
    } else {
        document.getElementById("unitInfo").style.display = "none";
    }
}