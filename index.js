const height = 800;
const width = 1200;
const color = {
    lineColor: "#4AFFFE",
    pointColor: "#fbcd2c",
    lightColor: "#4affff",
    areaColor: ["#09373a", "#11545c", "#0b6c79", "#769398"],
    locationBgColor: "#0e403f",
    pointTextColor: "#fff",
    haveSelectColor: "#1c2b2b"
}
//默认flag为2,获取实时天气
let getWeatherFlag = 2
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

svg.append("text")
    .attr("x", 450)
    .attr("y", 80)
    .attr("fill", "#00A876")
    .attr("font-weight", "bold")
    .attr("style", "letter-spacing:10px")
    .attr("font-size", 40)
    .text("全国天气数据可视化")

// svg.append("rect")
//     .attr("id", "live")
//     .attr("class", "button")
//     /*  x : 矩形左上角的x坐标。
//         y : 矩形左上角的y坐标。
//         width : 矩形的宽度。
//         height : 矩形的高度。
//         rx : 对于圆角矩形，指定椭圆在x方向的半径。
//         ry : 对于圆角矩形，指定椭圆在y方向的半径。
//         fill : 填充色 改变文字<text>的颜色也用这个。
//         storke ： 轮廓线的颜色。
//         stroke-width : 轮廓线的宽度。
//         opacity ： 透明度
//     */
//     .attr("transform", "translate(+1050,+200)")
//
// svg.append("rect")
//     .attr("id", "forecast")
//     .attr("class", "button")
//     .attr("transform", "translate(+1050,+270)")
//
// svg.selectAll(".button")
//     .attr("rx", 10)
//     .attr("ry", 10)
//     .attr("width", 70)
//     .attr("height", 40)
//     .attr("fill", "#0b6c79")
//     .attr("style", "cursor:pointer")
//     .on("mouseover", function () {
//         d3.select(this).attr("fill", "#fbcd2c")
//     })
//     .on("mouseout", function () {
//         d3.select(this).attr("fill", "#0b6c79")
//     })
//
// svg.append("text")
//     .attr("x", 1055)
//     .attr("y", 225)
//     .attr("fill", "white")
//     .attr("font-weight", "bold")
//     .attr("style", "letter-spacing:3px")
//     .attr("font-size", 15)
//     .attr("style", "cursor:pointer")
//     .text("实时天气")
//
// svg.append("text")
//     .attr("x", 1055)
//     .attr("y", 295)
//     .attr("fill", "white")
//     .attr("font-weight", "bold")
//     .attr("style", "letter-spacing:3px")
//     .attr("font-size", 15)
//     .attr("style", "cursor:pointer")
//     .text("预报天气")
//
// svg.selectAll(".button")
//     .on("click", function (d) {
//         buttonClicked(d)
//     })

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
            let info = d.target.__data__.properties
            let fill = "#7AC5CD"
            if (info.id.length > 2) {
                fill = "#C1FFC1"
            }
            d3.select(this).attr("fill", fill)
        })
        .on('mousemove', function (d) {
            let info = d.target.__data__.properties
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
        .on('mouseout', function (d) {
            let info = d.target.__data__.properties
            let fill = "#000"
            if (info.id.length > 2) {
                fill = "#1b5c5b"
            }
            d3.select(this)
                .attr("fill", fill)
            d3.select("#tooltip").remove();
        })
        .on("click", function (d) {
            if (d.target.__data__.properties.id.length <= 2) {
                clicked(d.target.__data__, 1)
            }
            if (d.target.__data__.properties.id.length > 2) {
                let info = d.target.__data__.properties
                window.location.href = "./weatherPanel.html?value=" + info.id
                // getWeather(info.id, getWeatherFlag).then(weatherData => {
                //     let x = d.pageX;
                //     let y = d.pageY;
                //     d3.select("#tooltip").remove();
                //     //预报天气
                //     if (getWeatherFlag === 1) {
                //         let s = "预报天气" + "，"
                //
                //         for (let i = 0; i < 3; i++) {
                //             s = s
                //                 + " ，"
                //                 + "日期：" + weatherData.forecast[i].date + "，"
                //                 + "当前城市：" + weatherData.live[0].city + "，"
                //                 + "白天天气：" + weatherData.forecast[i].dayweather + "，"
                //                 + "夜晚天气：" + weatherData.forecast[i].nightweather + "，"
                //                 + "温度：" + weatherData.forecast[i].nighttemp + "℃" + "~" + weatherData.forecast[0].daytemp + "℃" + "，"
                //                 + "风向：" + weatherData.forecast[i].daywind + "，"
                //                 + "风力：" + weatherData.forecast[i].daypower + "级" + "，"
                //         }
                //         let text = d3.select("svg").append("text")
                //             .attr("id", "tooltip")
                //             .attr("x", x + 18)
                //             .attr("y", y + 18)
                //             .attr("text-anchor", "middle")
                //             .attr("font-family", "sans-setif")
                //             .attr("font-size", "15px")
                //             .attr("font-weight", "bold")
                //             .attr("fill", "#FF8C00")
                //         let str = s.split("，");
                //         text.selectAll("tspan")
                //             .data(str)
                //             .enter()
                //             .append("tspan")
                //             .attr("x", text.attr("x"))
                //             .attr("dy", "1em")
                //             .attr("opacity", 0.8)
                //             .text(function (d) {
                //                 return d;
                //             })
                //     } else {
                //         let s = "实时天气" + "，"
                //             + " ，"
                //             + "当前城市：" + weatherData.live[0].city + "，"
                //             + "天气：" + weatherData.live[0].weather + "，"
                //             + "温度：" + weatherData.live[0].temperature + "℃" + "，"
                //             + "湿度：" + weatherData.live[0].humidity + "，"
                //             + "风向：" + weatherData.live[0].winddirection + "，"
                //             + "风力：" + weatherData.live[0].windpower + "级" + "，"
                //             + "更新时间：" + weatherData.live[0].reporttime + "，"
                //         let text = d3.select("svg").append("text")
                //             .attr("id", "tooltip")
                //             .attr("x", x + 18)
                //             .attr("y", y + 18)
                //             .attr("text-anchor", "middle")
                //             .attr("font-family", "sans-setif")
                //             .attr("font-size", "15px")
                //             .attr("font-weight", "bold")
                //             .attr("fill", "#FF8C00")
                //         let str = s.split("，");
                //         text.selectAll("tspan")
                //             .data(str)
                //             .enter()
                //             .append("tspan")
                //             .attr("x", text.attr("x"))
                //             .attr("dy", "1em")
                //             .attr("opacity", 0.8)
                //             .text(function (d) {
                //                 return d;
                //             })
                //     }
                // })
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
                            .attr("style", "cursor:pointer")
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
                        } else {
                            //如果是其他地级市
                            d3.select("#path" + n.properties.id)
                                .attr("style", "display:none")
                                .attr("stroke-width", "0.2px");
                        }
                    }
                })
            })
        }
    } else {
        //close
        d3.selectAll(".location").attr("style", "display:none");
        d3.selectAll("path").attr("stroke-width", "1px");
        d3.selectAll(".distribution").attr("style", "cursor:pointer");
    }
}

// function buttonClicked(d) {
//     if (d.toElement.id === "live") {
//         getWeatherFlag = 2
//     } else {
//         getWeatherFlag = 1
//     }
// }