import json

import requests
import telegram
import re

'''
下面的data是先在浏览器中登录，然后打开开发者选项，找到一个请求方法为POST的请求，复制里面的Form Data
'''

f = open('config.json', 'r', encoding='utf-8')
text = f.read()
f.close()
config = json.loads(text)

userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) ' \
            'AppleWebKit/537.36 (KHTML, like Gecko) ' \
            'Chrome/39.0.2171.95 Safari/537.36'
header = {
    "Referer": config['domain'] + "/auth/login",
    'User-Agent': userAgent,
}

bot = telegram.Bot(token=config['bot_token'])


def send_tg(msg):
    bot.send_message(chat_id=config['chat_id'], text=config['msg_prefix'] + '\n' + msg)


def cordcloud_checkin(email, pwd):
    domain_name = config['domain']
    postUrl = domain_name + '/auth/login'
    checkUrl = domain_name + '/user/checkin'
    queryUrl = domain_name + '/user'
    postData = {
        'email': email,
        'passwd': pwd
    }
    # 登录
    print("开始模拟登录")
    session = requests.Session()
    login_response = session.post(postUrl, data=postData, headers=header)
    # 无论是否登录成功，状态码一般都是 statusCode = 200
    print(f"statusCode = {login_response.status_code}")
    print(f"text = {login_response.text.encode('utf-8').decode('unicode_escape')}")

    query_response = session.get(url=queryUrl, headers=header)
    query_text = query_response.text
    used_obj = re.search(r'legendText:"(已用 \d+\.\d+% \d+.\d+\w+)"', query_text, re.M | re.I)
    today_obj = re.search(r'legendText:"(今日 \d+\.\d+% \d+.\d+\w+)"', query_text, re.M | re.I)
    left_obj = re.search(r'legendText:"(剩余 \d+\.\d+% \d+.\d+\w+)"', query_text, re.M | re.I)
    if used_obj:
        print(used_obj.group(1))
    if today_obj:
        print(today_obj.group(1))
    if left_obj:
        print(left_obj.group(1))

    ext_info = used_obj.group(1) + "\n" + today_obj.group(1) + "\n" + left_obj.group(1)

    checkin_response = session.post(url=checkUrl, headers=header)
    # 无论是否登录成功，状态码一般都是 statusCode = 200
    response_text = checkin_response.text.encode('utf-8').decode('unicode_escape')
    print(f"text = {response_text}")
    result = json.loads(response_text)
    msg = result['msg']
    if checkin_response.status_code == 200:
        if msg.startswith("获得了"):
            print("签到续命成功:" + msg)
            send_tg("签到续命成功:" + msg + '\n\n' + ext_info)
        elif msg == '您似乎已经续命过了...':
            print("重复签到")
            send_tg("重复签到" + '\n\n' + ext_info)
    else:
        print("签到续命失败")
        print(f"statusCode = {checkin_response.status_code}")
        send_tg("签到续命失败" + '\n\n' + ext_info)


if __name__ == "__main__":
    # 从返回结果来看，有登录成功
    cordcloud_checkin(config['email'], config['pwd'])
