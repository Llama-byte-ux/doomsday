https://www.d3indepth.com/geographic/
// Declaring some inital variables
var pietyCurrent = 1;
var currentIncome = 0;
var clickCount = 0;
var dayCount = 0;
var playBtnBool = "false";
var spreadRate = 10;
var selectedNation = "NULL";
nations = [];
w = 1125;
h = 900;

 // Got this bit of code from https://stackoverflow.com/a/2901298
 function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var projection = d3
    .geoEquirectangular()
    .center([-0.5, -10])
    .scale([w / (2 * Math.PI)])
    .translate([w / 2, h / 2])
    ;

var path = d3
    .geoPath()
    .projection(projection)
    ;

var svg = d3
    .select("#map")
    .append("svg")
    .attr("width", $("#map").width())
    .attr("height", $("#map").height())
    ;

d3.json(
    "../maps/custom.geo.json",
    function(json) {
        countriesGroup = svg.append("g").attr("id", "map");

        countries = countriesGroup
            .selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", function(d) {


                console.log(d.properties.formal_en)

                let nation = {formalName: d.properties.formal_en, name: d.properties.geounit, id:"country" + d.properties.iso_a3,  population: d.properties.pop_est, followers:0, geometry: d.geometry.coordinates};
                nations.push(nation);
                return "country" + d.properties.iso_a3;
            })
            .attr("class", "country")

            .on("click", function(d) {
                if(selectedNation != "NULL") {
                d3.selectAll(".country").classed("country-on", false);
                d3.select(this).classed("country-on", true);
                mapNatView(this.id);
                }
                else {
                    var x = this.id
                    console.log(x);
                    nationChoice(x);
                }
            });
    }
)

function nationChoice(x) {
    var currentNation = x;
    for (var i = 0; i < nations.length; i++) {
        if(nations[i].id == currentNation) {
           var currentNation = nations[i];
           selectedNation = nations[i];
           console.log(currentNation);
        }
    }
    currentNation.followers = 1;
    currentNation.spread = "true";
    var textBoxUpdate = document.getElementById("textDisplay");
    var newText = "The prophet of your faith has arisen in " + currentNation.name;
    textBoxUpdate.innerText = "Recent Events: " + newText;

    var nationSelection = document.getElementById("initalStartupBox").style.display = "none";
    var upgradeBox = document.getElementById("upgradeBox").style.display = "grid";

    var btnMap = document.getElementsByClassName("btnMap");
    runGame();
}


function mapNatViewSetup(x) {
    for (var i = 0; i < nations.length; i++) {
        if(nations[i].id == x) {
            var currentNation = nations[i];
        }
    }

    var mapStat = document.getElementById("regionStatBox");

    var currentNationName = document.getElementById("currentNation");
    currentNationName.innerText = currentNation.formalName;

    var currentNationImg = document.getElementsByClassName("nationImg");

    var currentNationPops = document.getElementById("pops");
    currentNationPops.innerText =  "Current Population: " + numberWithCommas(currentNation.population);

    var currentNationFollowers = document.getElementById("totalFollowerNation");
    currentNationFollowers.innerText =  "Followers: " + numberWithCommas(currentNation.followers);
}

function mapNatView(x) {
    document.getElementById("upgradeBox").style.display = "none";
    selectedNation = x;
    var currentNation = x;
    mapNatViewSetup(currentNation)
    map = document.getElementById("regionStatBox");
    map.style.display = "grid";
}



function runGame() {

function geoParser(x) {
    var nation = x
    if(nation.geometry.length == 1) {
        var type = "Polygon"; 
        var coordinates = [nation.geometry[0]];
        var geometry = turf.geometry(type, coordinates);
        return geometry;
    }
    else if(nation.geometry.length > 1) {
        var nationArr = [];
        for (var k = 0; k < nation.geometry.length; k++) { 
            var type = "MultiPolygon"; 
            var coordinates = [nation.geometry[k]];
            var geometry = turf.geometry(type, coordinates);
            nationArr.push(geometry);
        }
        return nationArr
    }
}


function borderCheck() {
    for(var i = 0; i < nations.length; i++) {
        nation = nations[i]
        var nationGeo = geoParser(nation)
        for(var k = 0; k < nations.length; k++) {
            newNation = nations[k];
            var nationGeoNew = geoParser(newNation)
            if(Array.isArray(nationGeoNew)) {
                for(var s = 0; s < nationGeoNew.length; s++) {
                    var bordering = turf.booleanTouches(nationGeo, nationGeoNew[s])
                    if(bordering) {
                        console.log(nation.name + " is bordering " + newNation.name)
                    }

                }
            }
            else if(!Array.isArray(nationGeoNew)) {
                    var bordering = turf.booleanTouches(nationGeo, nationGeoNew)
                    if(bordering) {
                        console.log(nation.name + " is bordering " + newNation.name)
                    }

            }
        }
    }
}
borderCheck()
  
//Inital Setup for Doomsday
    function initalSetup() {
        pietyTotal = document.getElementById("pietyCount");
        pietyTotal.innerText = "Piety: " + pietyCurrent.toFixed(2);

        var btnMap = document.getElementsByClassName("btnMap");
        for(var i = 0; i < btnMap.length; i++) {
            btnMap[i].addEventListener("click", mapNatView);
        }

        var playBtn = document.getElementById("playBtn");
        playBtn.addEventListener("click", playBtnCheck);
    }

    var btnBack = document.getElementById("btnBack");
    btnBack.addEventListener("click", backFunc);

    // Calling the inital setup functions alongside the upgrade setup
    initalSetup();
    upgradeSetup();
    upgInfoUpdate();

    //Function for when the clicker is clicked
    function clickerClicked() {
        pietyCurrent = pietyCurrent + 1;
        clickCount = clickCount + 1;
        pietyTotal.innerText = "Piety: " + pietyCurrent.toFixed(2);
        upgInfoUpdate();
    }

    //--- Start of the Upgrade Functions --//
    // Checks to see if the upgrade choice is valid
    function upgradeCheck(btnClicked) {
        console.log(btnClicked.currentTarget.id)
        // If choice is valid it runs calls the upgPurchase function and passes the upgObjects[i].id
        for (var i = 0; i < upgObjects.length; i++) {
            console.log(upgObjects.length)
            if(btnClicked.currentTarget.id == upgObjects[i].id && upgObjects[i].cost <= pietyCurrent && upgObjects[i].revealed == "true") {
                console.log("I guess you can buy this");
                upgPurchase(upgObjects[i].id);
                return;
            }
            // If the choice is invalid due to lack of funds than the function simply ends and alerts the user that they are unable to purchase it via the displayBox
            if (btnClicked.currentTarget.id == upgObjects[i].id && upgObjects[i].cost > pietyCurrent && upgObjects[i].revealed == "true") {
                textBoxUpdate = document.getElementById("textDisplay");
                newText = "You don't have the piety to purchase this";
                textBoxUpdate.innerText = "Recent Events: " + newText;
                console.log("Made it to here")
                return;
            }
            // If the choice is invalid due to it not being unclocked the function simply ends and the user is alerted via the disaplyBox
            if (btnClicked.currentTarget.id == upgObjects[i].id && upgObjects[i].revealed != "true") {
                textBoxUpdate = document.getElementById("textDisplay");
                newText = "You have not revealed this item!";
                textBoxUpdate.innerText = "Recent Events: " + newText;
            }
        }
    }

    // This function takes the information from upgradeCheck and updates the variables accordingly
    function upgPurchase(x) {
        // Loops through the function to see which one has the correct id
        for (var i = 0; i < upgObjects.length; i++) {
            if (upgObjects[i].id == x) {
                // Once the id is found it increase the amount of the item that has been purchased
                upgObjects[i].amount += 1;
                // The total cost is deducted from pietyCurrent which than gets updated in the statBox
                pietyCurrent -= upgObjects[i].cost;
                pietyTotal.innerText = "Piety: " +  pietyCurrent.toFixed(2);
                // The cost increases after the purchase according to how many have been purchase multiplied by 0.10
                upgObjects[i].cost = upgObjects[i].cost + (0.10 * upgObjects[i].cost) * upgObjects[i].amount;
                // Call upgInfoUpdate and incomeCheck to update the upgrade information listed in the upgradeBox and current income located in the stat box
                upgInfoUpdate();
                incomeCheck();
            }
        }
    }

    //Creates and appends up each upgrade button and gives them the proper ids and classes
    function upgradeSetup() {
        var oldLevel = -1
        for (i = 0; i < upgObjects.length; i++) {
            var upgradeBox = document.getElementById("upgradeBox");
            var attributeDiv = document.getElementById("attributeDiv");

            var upgBtnDiv = document.createElement("div")

            var upgBtnToolTip = document.createElement("div")
            upgBtnToolTip.setAttribute("class", "toolTipDiv");
            upgBtnToolTip.setAttribute("id", upgObjects[i].id + "ToolTip");

            var upgBtn = document.createElement("button");
            upgBtn.setAttribute("id", upgObjects[i].id);
            upgBtn.setAttribute("class", "upgradeButton");


            if (upgObjects[i].level != oldLevel){
                var newUpgDiv = document.createElement("div")
                newUpgDiv.setAttribute("class", "upgDiv")
                attributeDiv.appendChild(newUpgDiv)
                oldLevel = upgObjects[i].level;
            }
            newUpgDiv.appendChild(upgBtnDiv)
            upgBtnDiv.appendChild(upgBtnToolTip)
            upgBtnDiv.appendChild(upgBtn)

            upgBtn.addEventListener("click", upgradeCheck)
            upgBtn.addEventListener("mouseover", tooltipShow)
            upgBtn.addEventListener("mouseout", tooltipHide)

            upgBtn.innerText = upgObjects[i].name;

            var rect = upgBtn.getBoundingClientRect();
            console.log(rect.left, rect.right, rect.top, rect.bottom)

            var nameCostDiv = document.createElement("div");
            nameCostDiv.setAttribute("class", "nameCostDiv");
            nameCostDiv.setAttribute("id", upgObjects[i].nameCostId)
            upgBtnToolTip.appendChild(nameCostDiv);

            var descDiv = document.createElement("div");
            descDiv.setAttribute("class", "descDiv");
            descDiv.setAttribute("id", upgObjects[i].descId)
            upgBtnToolTip.appendChild(descDiv);

            var upgCount = document.createElement("div");
            upgCount.setAttribute("class", "upgCount");
            upgCount.setAttribute("id", upgObjects[i].countId)
            upgBtnToolTip.appendChild(upgCount);
        }
    }

    function upgInfoUpdate() {
        for (var i = 0; i < upgObjects.length; i++) {
            if(upgObjects[i].unlock <= pietyCurrent && upgObjects[i].revealed != "true") {
                upgObjects[i].revealed = "true";
            }

            if (upgObjects[i].revealed == "true") {
                var currentNameCostInfo = document.getElementById(upgObjects[i].nameCostId)
                currentNameCostInfo.innerText = upgObjects[i].name + upgObjects[i].cost.toFixed(2);

                var currentDescInfo = document.getElementById(upgObjects[i].descId)
                currentDescInfo.innerText = upgObjects[i].desc;

                var currentAmountInfo = document.getElementById(upgObjects[i].countId)
                currentAmountInfo.innerText = "Current Count: " + upgObjects[i].amount;
            };

            if(upgObjects[i].revealed == "false") {
                document.getElementById(upgObjects[i].id).style.display = "none";
            }
        }
    }

    function tooltipShow(x) {
        element = x.target
        var toolTip = document.getElementById(element.id + "ToolTip")
        var btn = document.getElementById(element.id)
        var toolTipPosition = btn.getBoundingClientRect();
        var newTopPos = toolTipPosition.top + 50;
        toolTip.style.top = newTopPos + "px";

        toolTip.style.display = "block";

    }

    function tooltipHide(x) {
        element = x.target
        document.getElementById(element.id + "ToolTip").style.display = "none";
    }
    //--- End of the Upgrade Functions --//


    // The incomeCheck function loops through the current upgrades to determine what the total income should be
    function incomeCheck() {
        // Resets the income to 0 to ensure it doesn't hold onto the previous amount and simply add the new total to it
        currentIncome = 0;
        // Loops through the current upgrades to get the amount of each and how much piety they provide
        for (i = 0; i < upgObjects.length; i++) {
            var itemEarnTotal = upgObjects[i].amount * upgObjects[i].pietyBump;
            // Sets the current income to the updated amount
            currentIncome = currentIncome + itemEarnTotal;
        }

        // Updates the income inner text in the statBox with the new income total per tick
    }

    function pietyUpdate() {
        if(playBtnBool == "true") {
        incomeCheck();
        spreadLocationCheck()
        dayCount = dayCount + 1;
        document.getElementById("dayCount").innerText = "Day: " + dayCount;
        pietyCurrent = pietyCurrent + currentIncome;
        pietyTotal.innerText = "Piety: " + pietyCurrent.toFixed(2);
        upgInfoUpdate();
        }
        else {
            console.log("I am paused like a cringe lord")
        }
    }

    setInterval(pietyUpdate, 1000);

    function playBtnCheck() {
        if (playBtnBool == "true") {
            playBtnBool = "false";
            document.getElementById("playBtn").innerText = "Play";
            console.log(playBtnBool)
        }
        else if(playBtnBool == "false") {
            playBtnBool = "true";
            document.getElementById("playBtn").innerText = "Pause";
            console.log(playBtnBool)
        }
    }

    function backFunc() {
        document.getElementById("regionStatBox").style.display = "none";
        upg = document.getElementById("upgradeBox");
        upg.style.display = "grid";
    }

    //--- Spread Mechanics --//

function spreadLocationCheck(x) {
    for (var i = 0; i < nationArray.length; i++){
        if (nationArray[i].spread == "true") {
          spreadRateCheck(nationArray[i])
        }
        if (nationArray[i].followers >= nationArray[i].pops) {
            nationArray[i].followers = nationArray[i].pops;
        }
        mapNatViewSetup(selectedNation)

    }
}

function spreadRateCheck(x) {
    var country = x;
    var roll =  Math.floor(Math.random() * 10)
    if(roll <= spreadRate) {
        country.followers += Math.ceil(1 * (country.followers));
    }
}



}

// Upgrade Items Array
const upgObjects = [
    {revealed: "true",  id: "foundYourCultBtn", nameCostId: "foundYourCultNameCost", descId: "foundYourCultDesc", countId: "foundYourCultCount", name: "Found Your Cult", cost: 1, level: 0, amount: 0, pietyBump: 0.10, unlock: 0, desc: ""},
    {revealed: "true",  id: "upgTier2", nameCostId: "upgTier2NameCost", descId: "upgTier2UpgDesc", countId: "upgCountUpgTier2",  name: "Upgrade Tier 2", cost: 100, amount: 0, level: 1, pietyBump: 0.20, unlock: 100, desc: "Everyone loves being yelled at while walking around in public!\n Lets make sure everyone hears about our saviour the Flying Spaghetti Monster!" },
    {revealed: "true",  id: "communalPrayerBtn", nameCostId: "communalPrayerNameCost", descId: "communalPrayerDesc", countId: "communalPrayerUpgCount",  name: "Communal Prayer", cost: 100, amount: 0, level: 1, pietyBump: 0.20, unlock: 100, desc: "Everyone loves being yelled at while walking around in public!\n Lets make sure everyone hears about our saviour the Flying Spaghetti Monster!" },
    {revealed: "true",  id: "upgTier3", nameCostId: "upgTier3NameCost", descId: "upgTier3UpgDesc", countId: "upgCountUpgTier3",  name: "Upgrade Tier 3", cost: 100, amount: 0, level: 2, pietyBump: 0.20, unlock: 100, desc: "Everyone loves being yelled at while walking around in public!\n Lets make sure everyone hears about our saviour the Flying Spaghetti Monster!" },
]

