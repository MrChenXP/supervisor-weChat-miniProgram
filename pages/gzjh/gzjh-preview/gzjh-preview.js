const app = getApp()
Page({
    data: {
        contentId: '',
        XXMC: '',
        SDMC: '',
        SXDXMC: '',
        QRSXDXMC: '',
        PGMC: '',
        // 督导事项显示隐藏
        ddsxShow: false,
        DDSX: {},
        sdList: [],
    },
    onLoad(param) {
        if (param && param.CONTENT_ID) {
            this.data.contentId = param.CONTENT_ID
            app.$kwz.loadDms('DM_SD', dms => {
                this.data.sdList = app.$kwz.copyJson(dms.DM_SD) || {}
                // 评估标准 暂时不要
                this.loadData()
            })
        }
    },
    // 初始化页面
    loadData() {
        app.$kwz.ajax.ajaxUrl({
            url: '/dd_gzap/doSelectByPrimary/DDGZAP_GP',
            type: 'POST',
            data: {
                CONTENT_ID: this.data.contentId
            },
            page: this,
            then(response) {
                let datas = response.datas
                if (datas && datas.map) {
                    let map = datas.map
                    this.data.XXMC = map.ORG_ID_TARGET_MC
                    let sdmc = map.YWSJ
                    sdmc = sdmc.length > 10 ? sdmc.substr(0, 10) : sdmc
                    for (let i = 0; i < this.data.sdList.length; i++) {
                        if (this.data.sdList[i].DMMX_CODE == map.SD) {
                            sdmc += ' ' + this.data.sdList[i].DMMX_MC
                            break
                        }
                    }

                    this.data.SDMC = sdmc
                    this.data.SXDXMC = map.JGID_MC
                    this.data.QRSXDXMC = map.CJID_MC
                    this.data.DDSX = app.$kwz.formatImg(map.TXT)
                    this.data.CONTENT = map.CONTENT
                }
                this.setData({
                    XXMC: this.data.XXMC,
                    SDMC: this.data.SDMC,
                    SXDXMC: this.data.SXDXMC,
                    QRSXDXMC: this.data.QRSXDXMC,
                    DDSX: this.data.DDSX,
                    CONTENT: this.data.CONTENT,
                })
            }
        })
    },
    // 督导事项 显示隐藏
    ddsxShow() {
        this.setData({
            ddsxShow: !this.data.ddsxShow
        })
    },
})