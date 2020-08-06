/*
基于 Neurogram 的脚本做了修改，适配 QuanX
只测试了 CordCloud

本脚本Github地址：https://raw.githubusercontent.com/coderbean/cordcloud-checkin/master/check_in.js
GitHub: coderbean
*/

/*
Check in for Surge by Neurogram

- 站点签到脚本
- 流量详情显示
- 多站签到支持
- 多类站点支持
 
使用说明：https://www.notion.so/neurogram/Check-in-0797ec9f9f3f445aae241d7762cf9d8b

关于作者
Telegram: Neurogram
GitHub: Neurogram-R
*/

const accounts = [
    // ["DlerCloud", "https://example.com/auth/login", "example@dlercloud.com", "password"],
    // ["CCCAT", "https://example.com/user/login.php", "example@cccat.com", "password"]
]

const autoLogout = true

async function launch() {
    for (var i in accounts) {
        let title = accounts[i][0]
        let url = accounts[i][1]
        let email = accounts[i][2]
        let password = accounts[i][3]
        if (autoLogout) {
            let logoutPath = url.indexOf("auth/login") != -1 ? "user/logout" : "user/logout.php"
            var logoutRequest = {
                url: url.replace(/(auth|user)\/login(.php)*/g, "") + logoutPath
            }
            $task.fetch(logoutRequest).then(response => {
                // response.statusCode, response.headers, response.body
                console.log(title + " logout response status:"+response.statusCode);
                login(url, email, password, title);
            }, reason => {
                // reason.error
                $notify(title, "退出登录失败", reason.error); // Error!
            });
        } else {
            login(url, email, password, title)
        }
    }
    $done();
}

launch()

function login(url, email, password, title) {
    let loginPath = url.indexOf("auth/login") != -1 ? "auth/login" : "user/_login.php"
    var loginRequest = {
        url: url.replace(/(auth|user)\/login(.php)*/g, "") + loginPath,
        method: "POST", // Optional, default GET.
        body: `email=${email}&passwd=${password}&code=`
    };
    console.log(title + "登录请求：" + loginRequest.url)

    $task.fetch(loginRequest).then(response => {
        // response.statusCode, response.headers, response.body
        checkin(url, title)
    }, reason => {
        // reason.error
        $notify(title, "登录失败", reason.error); // Error!
    });
}

function checkin(url, title) {
    let checkinPath = url.indexOf("auth/login") != -1 ? "user/checkin" : "user/_checkin.php"

    var checkInRequest = {
        url: url.replace(/(auth|user)\/login(.php)*/g, "") + checkinPath,
        method: "POST", // Optional, default GET.
    };

    $task.fetch(checkInRequest).then(response => {
        // response.statusCode, response.headers, response.body
        dataResults(url, JSON.parse(response.body).msg, title)
    }, reason => {
        // reason.error
        $notify(title, "签到失败", reason.error); // Error!
    });
}

function dataResults(url, checkinMsg, title) {
    console.log("checkinMsg:"+checkinMsg)
    let userPath = url.indexOf("auth/login") != -1 ? "user" : "user/index.php"
    var userRequest = {
        url: url.replace(/(auth|user)\/login(.php)*/g, "") + userPath
    };

    $task.fetch(userRequest).then(response => {
        var usedData = response.body.match(/(>*\s*已用(里程|流量|\s\d.+?%|：))[^B]+/)
        if (usedData) {
            usedData = usedData[0].match(/\d\S*(K|G|M|T)/)
            var restData = response.body.match(/(>*\s*(剩余|可用)(里程|流量|\s\d.+?%|：))[^B]+/)
            restData = restData[0].match(/\d\S*(K|G|M|T)/)

            var todayData = response.body.match(/(>*\s*(今日)(里程|流量|\s\d.+?%|：))[^B]+/)
            todayData = todayData[0].match(/\d\S*(K|G|M|T)/)

            $notify(title, checkinMsg, "今日流量：" + todayData[0] + "B" + "\n剩余流量：" + restData[0] + "B" +  "\n已用流量：" + usedData[0] + "B");
        } else {
            $notify(title + '获取流量信息失败', "", "");
        }
    }, reason => {
        // reason.error
        $notify(title, "获取流量信息失败", reason.error); // Error!
    });
}
