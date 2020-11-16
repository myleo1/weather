const height = 600;
const width = 1000;
const color = {
    lineColor: "#4AFFFE",
    pointColor: "#fbcd2c",
    lightColor: "#4affff",
    areaColor: ["#09373a", "#11545c", "#0b6c79", "#769398"],
    locationBgColor: "#0e403f",
    pointTextColor: "#fff",
    haveSelectColor: "#1c2b2b"
}
let scale = 1;
let texts, centered;

let svg = d3.select("body").append("svg")
    .attr("id", "mapSvg")
    .attr("width", width)
    .attr("height", height)

svg.attr("class", "background")
    .attr("width", width)
    .attr("height", height)
//todo click

let mapG = svg.append("g")
    .attr("id", "mapG")

let projection = d3.geoMercator()
    .center([100, 36])
    .scale(600)
    .translate([width / 2, height / 2]);

let path = d3.geoPath()
    .projection(projection);

async function geoJson() {
    const data = await d3.json("/assets/geojson/beijing.json");
    return data
}

this.geoJson().then(data => {
    mapG.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("stroke", color.lineColor)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5)
        .attr("id", function (d) {
            return "path" + d.properties.id;
        })
        .attr("class", function (d) {
            if (d.properties.id.length > 2) {
                return "location"
            } else {
                return "distribution"
            }
        })
        .attr("style", "cursor:pointer")
        .attr("d", path)
        .on('mouseover', function (d) {
            d3.select(this).attr("stroke", "#fbcd2c")
                .attr("stroke-width", 3)
        })
        .on('mouseout', function () {
            d3.select(this).attr("stroke", color.lineColor)
                .attr("stroke-width", 1)
        })
        .on("click", function (d) {
            if (d.target.__data__.properties.id.length <= 2) {
                clicked(d.target.__data__)
            }
        })
});

function clicked(d) {
    let x, y, k;
    if (d && centered !== d) {
        //对指定的功能feature计算投影重心
        let centroid = path.centroid(d)
        x = centroid[0]
        y = centroid[1]
        if (d.properties.id === "46") {
            y = y + 10;
        }
        if (d.properties.scale) {
            k = d.properties.scale
        } else {
            k = scale
        }
        scale = k
        centered = d
        mapChange("open", d)
    }
    mapG.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

function mapChange(flag, d) {
    if (flag === "open") {
        let disId = d.properties.id
        if (disId.length < 3) {
            this.geoJson().then(data => {
                data.features.forEach(function (n) {
                    //遍历所有id，如果id>2(不是省) & 前2位和传入的id相等(属于该省)
                    if (n.properties.id.length > 2 && n.properties.id.substr(0, 2) === disId) {
                        //必须加#才起效果
                        d3.select("#path" + n.properties.id)
                            .attr("stroke", color.lineColor)
                            .attr("stroke-width", 1 / scale + "px")
                            .attr("fill", "#1b5c5b")
                    } else {
                        //todo
                    }
                })


            })
        }
    }
}



//天气api部分
getWeather(3301, 1)

function getWeather(location, flag) {
    let formData = new FormData();
    if (flag === 1) {
        formData.append("location", location)
        formData.append("getLive", "true")
        formData.append("getForecast", "true");
    } else {
        formData.append("location", location)
        formData.append("getLive", "true")
        formData.append("getForecast", "false");
    }
    let options = {
        method: 'POST',
        headers: {
            'Accept': 'application/x-www-form-urlencoded',
        },
        body: formData
    };
    fetch('http://111.0.80.7:7654/weather-server-go/rest/weather/getWeather', options).then(res => res.json())
        .then(weatherData => console.log(weatherData))
        .catch(err => console.log('err:', err))
}