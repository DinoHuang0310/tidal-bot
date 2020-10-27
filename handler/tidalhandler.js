const moment = require('moment');

// location = user填入的地點
// date = 今天、明天、後天或空字串
module.exports = (userID, userInputStr, tidalData) => {
    // 一日潮汐拼湊字元
    const echoTidal = tidalArry => {
            let tidalStr = ``;
            tidalArry.forEach(element => {
                tidalStr += `\n ${element.parameter[0].parameterValue}: ${element.dataTime}`;
            });
            return tidalStr;
        }
        // 回覆字串拼接
    const setEchoText = (target, date) => {
            const targetDate = target.validTime[date];
            const tagetDateTidal = targetDate.weatherElement[1].time; // Arry 該日所有潮汐
            const weekdayStr = () => {
                switch (moment().add(date, 'days').weekday()) {
                    case 0:
                        return '日'
                    case 1:
                        return '一'
                    case 2:
                        return '二'
                    case 3:
                        return '三'
                    case 4:
                        return '四'
                    case 5:
                        return '五'
                    case 6:
                        return '六'
                }
            }
            return {
                type: 'text',
                text: `${target.locationName}: \n 日期: ${moment().add(date, 'days').format('YYYY/MM/DD')} (${weekdayStr()}) \n 潮差: ${targetDate.weatherElement[0].elementValue}潮 ${echoTidal(tagetDateTidal)}`
            }
        }
        // 建立flex button option
    const createOption = (dataList, date) => {
        let option = [];
        dataList.forEach(element => {
            const obj = {
                type: "button",
                action: {
                    type: "message",
                    label: element.locationName,
                    text: `${element.locationName}潮汐 ${date}`
                }
            }
            option.push(obj);
        });
        return option;
    }

    const filterDataByLocation = (location, date) => {
        // 時間文字轉數字
        const dateToVal = () => {
                switch (date) {
                    case '今天':
                    case '':
                        return 0
                    case '明天':
                        return 1
                    case '後天':
                        return 2
                }
            }
            // 篩選符合關鍵字的地點
        const target = tidalData.filter(item => {
            return item.locationName.indexOf(location) != -1
        });
        if (target.length === 1) {
            return setEchoText(target[0], dateToVal());
        } else if (target.length < 1) {
            // 該關鍵字查無資料
            return {
                type: 'text',
                text: `你的地點查無資料哦哦哦~~~~`
            }
        } else if (target.length < 6) {
            // 查詢結果2~5筆 產出選項
            return {
                type: "flex",
                altText: "你484要查:",
                contents: {
                    type: "bubble",
                    body: {
                        type: "box",
                        layout: "vertical",
                        contents: [{
                            type: "text",
                            text: "你484要查:",
                        }]
                    },
                    footer: {
                        type: "box",
                        layout: "vertical",
                        contents: createOption(target, date)
                    },
                    styles: {
                        footer: {
                            separator: true
                        }
                    }
                }
            }
        }
        // 查詢結果過多
        return {
            type: 'text',
            text: `你的地點查詢結果過多~~ 下精準一點 董?`
        }
    }

    const keyword = userInputStr.split("潮汐"); // 分割 keyword[0]=地點, keyword[1]=時間
    console.log(keyword)
    if (keyword.length === 2) {
        if (keyword[1] !== '今天' && keyword[1] !== '明天' && keyword[1] !== '後天' && keyword[1] !== '') {
            return {
                type: 'text',
                text: '麥來亂小~~時間只能寫今天、明天或後天'
            }
        } else {
            // 符合潮汐規則 帶入查詢
            return filterDataByLocation(keyword[0], keyword[1]);
        }
    }
    return [{
            type: 'text',
            text: `公蝦咪挖溝 聽某喇`
        },
        {
            type: 'text',
            text: `請輸入:說明`
        }
    ]

}