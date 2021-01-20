const moment = require('moment');

// location = user填入的地點
// date = 今天、明天、後天或空字串
module.exports = {
    // 一日潮汐拼湊字元
    echoTidal: tidalArry => {
        let tidalStr = ``;
        tidalArry.forEach(element => {
            tidalStr += `\n ${element.parameter[0].parameterValue}: ${element.dataTime}`;
        });
        return tidalStr;
    },

    // 回覆字串拼接
    setEchoText: (target, date, originalMsg) => {
        const datePlus = module.exports.dateToVal(date);
        const targetDate = target.validTime[datePlus];
        const tagetDateTidal = targetDate.weatherElement[1].time; // Arry 該日所有潮汐
        const weekdayStr = () => {
            switch (moment().add(datePlus, 'days').weekday()) {
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
        return [{
                type: 'text',
                text: `${target.locationName}: \n 日期: ${moment().add(datePlus, 'days').format('YYYY/MM/DD')} (${weekdayStr()}) \n 潮差: ${targetDate.weatherElement[0].elementValue}潮 ${module.exports.echoTidal(tagetDateTidal)}`
            },
            {
                type: 'text',
                text: `你可能需要來點氣象?\nhttps://www.google.com/search?q=${originalMsg}氣象&rlz=1C1CHBD_zh-twTW888TW888&oq=${originalMsg}`
            }
        ]
    },

    // 建立flex button option
    createOption: function(dataList, setting) {
        dataString = (element) => {
            const { type, date, originalLocation, user } = setting;
            switch (type) {
                case 'addFavorite':
                    return `type=insert&user=${user}&location=${element.locationName}`;
                case 'search':
                    return `type=flex&message=${element.locationName}/${date ? date : '今天'}/${originalLocation}`;
                case 'deleteFavorite':
                    return `type=delete&user=${user}&location=${element}`
            }
        };
        let option = [];
        dataList.forEach(element => {
            const obj = {
                type: "button",
                action: {
                    type: "postback",
                    label: typeof(element) === 'string' ? element : element.locationName,
                    data: dataString(element)
                }
            }
            option.push(obj);
        });
        return option;
    },

    // 篩選搜尋結果
    getTargetData: function(tidalData, location) {
        return tidalData.filter(item => {
            return item.locationName.indexOf(location) != -1;
        });
    },

    // 時間文字轉數字
    dateToVal: (date) => {
        switch (date) {
            case '今天':
            case '':
                return 0
            case '明天':
                return 1
            case '後天':
                return 2
        }
    },

    // 查詢
    filterDataByLocation: (tidalData, location, date) => {
        const target = module.exports.getTargetData(tidalData, location);
        if (target.length === 1) {
            return module.exports.setEchoText(target[0], date, location);
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
                        contents: module.exports.createOption(target, { type: 'search', date: date, originalLocation: location })
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
    },

    getTidalByText: (userInputStr, tidalData) => {
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
                return module.exports.filterDataByLocation(tidalData, keyword[0], keyword[1]);
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
    },

    getTidalByPostback: (userInputStr, tidalData) => {
        const keyword = userInputStr.split("/"); // 分割 keyword[0]=地點, keyword[1]=時間, keyword[2]=原本搜尋的關鍵字
        const target = module.exports.getTargetData(tidalData, keyword[0]);
        return module.exports.setEchoText(target[0], keyword[1], keyword[2]);
    }
}