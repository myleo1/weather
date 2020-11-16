const width = 1000;
const height = 1000;

//创建svg
let svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");

//定义地图投影
let projection = d3.geoMercator()
    .center([97, 26]) // 地图中心位置,经纬度
    .scale(750) //设置缩放量
    .translate([width / 2, height / 2]); // 设置平移量

//定义地理路径生成器,使每一个坐标都会先调用此投影,才产生路径值
let path = d3.geoPath()
    .projection(projection);


//定义颜色
let colors = d3.scaleOrdinal(d3.schemeCategory10)

//请求china.geo.json数据,添加<path>,每个path用于绘制一个省的路径

getJson()

function getJson(flag) {
    switch (flag) {
        case 1:
            d3.json("/assets/geojson/11.json").then(data => draw(data))
            break;
        default:
            d3.json("/assets/geojson/beijing.json").then(data => draw(data))
            break;
    }
}

//这里使用异步方法，可以减少回调嵌套

function draw(data) {
    svg.selectAll("path")
        .data(data.features)  // 绑定数据
        .enter()
        .append("path")
        // .attr("stroke", "#000") //边框
        // .attr("stroke-width", 1)
        .attr("fill", function (d, i) {
            return colors(i);
        })
        .attr("opacity", 0.5) //透明度

        .attr("d", path) //使用路径生成器
        .on('mouseover', function () {
            // d3.select(this).attr("opacity", 1);
            d3.select(this).attr("stroke", "yellow")
                .attr("stroke-width", 3)
        })
        .on('mouseout', function () {
            // d3.select(this).attr("opacity", 0.5);
            d3.select(this).attr("stroke", "")
            // .attr("stroke-width", )
        })
        // .on('click', function () {
        //     svg.selectAll("path").remove()
        //     getJson(1)
        // })
}


// function draw2(data) {
//     svg1.selectAll("path2")
//         .data(data.features)  // 绑定数据
//         .enter()
//         .append("path2")
//         // .attr("stroke", "#000") //边框
//         // .attr("stroke-width", 1)
//         .attr("fill", function (d, i) {
//             return colors(i);
//         })
//         // .attr("opacity", 0.5) //透明度
//         .attr("d", path2) //使用路径生成器
//         .on('mouseover', function () {
//             // d3.select(this).attr("opacity", 1);
//             d3.select(this).attr("stroke", "yellow")
//                 .attr("stroke-width", 3)
//         })
//         .on('mouseout', function () {
//             // d3.select(this).attr("opacity", 0.5);
//             d3.select(this).attr("stroke", "")
//             // .attr("stroke-width", )
//         })
// }

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