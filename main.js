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

svg.append("rect")
    .attr("fill", "#fff")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

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
        // .attr("fill", "#000")
        .attr("id", function (d) {
            return "path" + d.properties.id;
        })
        .attr("style", "display:block")
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
            d3.select(this).attr("stroke-width", 5 / self.scale + "px");
            d3.select(this).attr("stroke", color.pointColor);
        })
        .on('mousemove', function (d, i) {
            let info = d.target.__data__.properties
            // console.log(d)
            let x = d.pageX;
            let y = d.pageY;
            d3.select("#tooltip").remove();
            d3.select('svg').append("text")
                .attr("id", "tooltip")
                .attr("x", x + 18)
                .attr("y", y + 18)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-setif")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "#D36611")
                .text("当前位置" + ":" + info.name)
        })
        .on('mouseout', function () {
            d3.select(this)
                .attr("stroke", color.lineColor)
                .attr("stroke-width", 1 / scale + "px");
            d3.select("#tooltip").remove();
        })
        .on("click", function (d) {
            if (d.target.__data__.properties.id.length <= 2) {
                clicked(d.target.__data__, 1)
            }
            if (d.target.__data__.properties.id.length > 2) {
                let info = d.target.__data__.properties
                getWeather(info.id, 2).then(weatherData => {
                    let x = d.pageX;
                    let y = d.pageY;
                    d3.select("#tooltip").remove();
                    let s = "实时天气" + "，"
                        + " ，"
                        + "当前城市：" + weatherData.live[0].city + "，"
                        + "天气：" + weatherData.live[0].weather + "，"
                        + "温度：" + weatherData.live[0].temperature + "℃" + "，"
                        + "湿度：" + weatherData.live[0].humidity + "，"
                        + "风向：" + weatherData.live[0].winddirection + "，"
                        + "风力：" + weatherData.live[0].windpower + "级" + "，"
                        + "更新时间：" + weatherData.live[0].reporttime + "，"
                    let text = d3.select("svg").append("text")
                        .attr("id", "tooltip")
                        .attr("x", x + 18)
                        .attr("y", y + 18)
                        .attr("text-anchor", "middle")
                        .attr("font-family", "sans-setif")
                        .attr("font-size", "15px")
                        .attr("font-weight", "bold")
                        .attr("fill", "#FF8C00")
                    let str = s.split("，");
                    text.selectAll("tspan")
                        .data(str)
                        .enter()
                        .append("tspan")
                        .attr("x", text.attr("x"))
                        .attr("dy", "1em")
                        .text(function (d) {
                            return d;
                        });
                })
            }
        })

});

function clicked(d, flag) {
    let x, y, k;
    if (flag === 1) {
        if (centered !== d) {
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
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        scale = 1;
        centered = null;
        mapChange("close");
    }
    mapG.selectAll("path")
        .classed("active", centered && function (d) {
            return d === centered;
        });
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
                    //如果是属于该省的地级市
                    if (n.properties.id.length > 2 && n.properties.id.substr(0, 2) === disId) {
                        //必须加#才起效果
                        d3.select("#path" + n.properties.id)
                            .attr("style", "display:block")
                            .attr("stroke", color.lineColor)
                            .attr("stroke-width", 1 / scale + "px")
                            .attr("fill", "#1b5c5b")
                    } else {
                        //如果是省 & 并且是点击之外的其他省
                        if (n.properties.id.length <= 2 && n.properties.id !== disId) {
                            d3.select(".point-info").attr("style", "display:none;");
                            d3.select("#path" + n.properties.id)
                                //隐藏其他省份
                                .attr("style", "display:none")
                                .attr("stroke-width", "0.3px");
                            // d3.select("#text" + n.properties.id)
                            //     .attr("style", "display:none")
                            //     .attr("font-size", "3px");
                        } else {
                            //如果是其他地级市
                            d3.select("#path" + n.properties.id)
                                .attr("style", "display:none")
                                .attr("stroke-width", "0.2px");
                            // d3.select("#text" + n.properties.id)
                            //     .attr("style", "display:none")
                            //     .attr("font-size", "1px");
                        }
                    }
                })
            })
        }
    } else {
        d3.selectAll(".location").attr("style", "display:none");
        // d3.selectAll("text").attr("font-size", "14px");
        d3.selectAll("path").attr("stroke-width", "1px");
        // d3.selectAll(".distribution").attr("style", "display:block");
        d3.selectAll(".distribution").attr("style", "cursor:pointer");

    }
}


//天气api部分
// getWeather(3301, 1)

async function getWeather(location, flag) {
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
    const weather = await fetch('http://111.0.80.7:7654/weather-server-go/rest/weather/getWeather', options).then(res => res.json())
    // .then(weatherData => console.log(weatherData))
    // .catch(err => console.log('err:', err))
    console.log(weather.data)
    return weather.data
}