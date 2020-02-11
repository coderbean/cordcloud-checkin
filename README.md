## CordCloud 自动签到脚本
### 配置
和 py 同级别简历 `config.json` 文件，文件结构如下
```
.
├── README.md
├── checkin.py
├── config.json
├── requirements.txt
└── venv

```
### 配置示例
```json
{
  "domain": "",
  "email":"",
  "pwd": "", 
  "bot_token": "", 
  "chat_id": "", 
  "msg_prefix": "【CordCloud签到】" 

}
```
### 配置含义
| 属性         | 含义                                             |
| ------------ | ------------------------------------------------ |
| "domain"     | 签到域名，理论上支持 帕斯喵， 绝对支持 cordcloud |
| "email":     | 登陆用户邮箱                                     |
| "pwd":       | 密码                                             |
| "bot_token": | telegram的bot token， 为空表示不发送通知         |
| "chat_id":   | chat ID                                          |
| "msg_prefix" | tg通知的前缀                                     |

### 运行 
执行 py 文件即可

### tips
定时任务配置执行该脚本定时签到
