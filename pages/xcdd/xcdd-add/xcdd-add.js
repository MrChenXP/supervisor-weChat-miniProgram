// pages/xcdd/xcdd-add/xcdd-add.js
const app = getApp()
Page({
    data: {
        // 去评估 权限
        qpgShow: false,
        // 工作计划 学校 随行督学选择页面 后续处理意见 评估 显示隐藏
        gzjhShow: true,
        schoolShow: true,
        sxdxShow: true,
        hxclyjShow: false,
        pgShow: true,
        // 督导纪实 资料采集 经验做法 存在问题 显示隐藏
        ddjsShow: false,
        zlcjShow: true,
        jyzfShow: true,
        czwtShow: true,
        // 保存权限
        hasXzAuth: false,
        // 页面数据
        data: {
            ywsj: "", // 业务时间 督导时间
            gzjhName: "", // 工作计划名字
            gzjhId: "", // 工作计划Id
            xqid: "", // 学期id
            schoolName: "", // 学校名字
            schoolId: "", // 学校Id
            sxdxName: "", // 随行督学名字
            sxdxId: "", // 随行督学Id
            ddjs: "", // 督导纪实内容
            cyzl: 0, // 查阅资料
            lxhy: 0, // 列席会议
            ztzf: 0, // 座谈走访
            wjdc: 0, // 问卷调查
            xyxs: 0, // 校园巡视
            dxjyzf: "", // 典型经验做法
            czwt: "", // 存在问题
            contentId: "", // 督导纪实id
            status: "1", // 后续处理意见状态
            status_mc: '无意见', // 后续处理意见状态名称
            zgxsyj: "", // 整改建议，当STATUS=4，即后续处理意见选择 小问题 时，不能为空必传，其余状态时为空
            zgxsid: "", // 整个协商id STATUS=2或3或5时 不能为空必传
            zgxsBh: "", // 整改协商编号
            clqx: "", // 整改协商期限
            ksid: "", // 协商科室id
            ksName: "", // 协商科室名称
            pgid: "", //评估id，点了“去评估”才有，否则为空
            minDate: "", // 最小时间限制
            maxDate: "", // 最大时间限制
        },
        // 工作计划数据
        gzjh:{},
        // 登录用户数据
        loginUser: {},
    },
    onLoad(param) {
        if (param) {
            if (param.CONTENT_ID) {
                this.data.data.contentId = param.CONTENT_ID
                this.loadData()
            } else if (param.workplanId) {
                this.data.data.gzjhId = param.workplanId
                this.loadDdGzjh()
            }
        }
        app.$kwz.getLoginUser((e) => {
            this.data.loginUser = e
            this.data.data.sxdxName = e.name
            this.data.data.sxdxId = e.uid
            this.setData({
                data: this.data.data
            })
        })
        app.$kwz.hasAuth('ddjl/doEdit', (auth) => {
            auth ? this.setData({
                hasXzAuth: auth
            }) : ""
        })
    },
    // 加载督导纪实
    loadData() {
        if (this.data.data.contentId) {
            app.$kwz.ajax.ajaxUrl({
                url: '/ddjl/doSelectByPrimaryKey',
                type: 'POST',
                data: {
                    CONTENT_ID: this.data.data.contentId
                },
                page: this,
                then(response) {
                    let datas = response.datas

                    if (datas && datas.CONTENT_ID) {
                        this.data.data.schoolId = datas.ORG_ID
                        this.data.data.schoolName = datas.XXMC
                        this.data.data.ywsj = datas.YWSJ
                        this.data.data.status = datas.STATUS
                        this.data.data.status_mc = datas.STATUS_MC
                        this.data.data.sxdxName = datas.USERNAME
                        this.data.data.sxdxId = datas.USERID
                        this.data.data.dxjyzf = datas.DXJY || ''
                        this.data.data.czwt = datas.CZWT || ''
                        this.data.data.cyzl = datas.CYZL || 0
                        this.data.data.lxhy = datas.LXHY || 0
                        this.data.data.ztzf = datas.ZTZF || 0
                        this.data.data.wjdc = datas.WJDC || 0
                        this.data.data.xyxs = datas.XYXS || 0
                        this.data.data.pgid = datas.PGID
                        this.data.data.ddjs = datas.DDJS
                        this.setData({
                            data: this.data.data
                        })
                        if (datas.CONTENT_ID) {
                            let status = datas.STATUS
                            if (status == '4') {
                                this.data.data.zgxsyj = datas.ZGJY || ''
                            } else if (status == '2' || status == '3' || status == '5') {
                                // 如果是一般问题-复杂-严重就加载整改协商
                                app.$kwz.ajax.ajaxUrl({
                                    url: '/dd_zgxs/selectZgxsList',
                                    type: 'POST',
                                    data: {
                                        CONTENT_ID: this.data.data.contentId
                                    },
                                    page: this,
                                    then(response) {
                                        let zgdatas = response.datas[0]
                                        this.data.data.zgxsBh = zgdatas.BH
                                        this.data.data.zgxsid = zgdatas.ZGXSID
                                        this.data.data.zgxsyj = zgdatas.XSNR
                                        this.data.data.clqx = zgdatas.CLQX
                                        this.data.data.ksid = zgdatas.ORG_ID
                                        this.data.data.ksName = zgdatas.ORG_MC
                                        this.setData({
                                            data: this.data.data
                                        })
                                    }
                                })
                            }
                        }
                        // 加载工作安排
                        if (datas.GZAP_YWID) {
                            this.data.data.gzjhId = datas.GZAP_YWID
                            app.$kwz.ajax.ajaxUrl({
                                url: '/dd_gzap/doSelectByPrimary/DDGZAP_GP',
                                type: 'POST',
                                data: {
                                    CONTENT_ID: datas.GZAP_YWID
                                },
                                page: this,
                                then(response) {
                                    let datas = response.datas.map
                                    datas.YWSJ = app.$kwz.formatDate('yyyy-MM-dd', datas.YWSJ)
                                    let workPlanName = datas.ORG_ID_TARGET_MC + '/' + datas.YWSJ + '/' +
                                        (datas.SD === '1' ? "上午" : "下午") + '/' + datas.AUTHOR
                                    this.data.data.gzjhName = workPlanName
                                    if (datas.BZID) {
                                        this.loadDdGzjh()
                                    }
                                    this.setData({
                                        data: this.data.data,
                                        qpgShow: datas.BZID
                                    })
                                    
                                }
                            })
                        }
                    }
                }
            })
        }
    },
    // 工作计划确定
    confirmGzjh(e) {
        let gzjh = e.detail.data
        // 随行督学传的是用户id
        if (gzjh) {
            this.data.data.gzjhId = gzjh.value
            this.data.data.schoolName = gzjh.data.XXMC
            this.data.data.schoolId = gzjh.data.ORG_ID_TARGET
            this.data.data.sxdxName = gzjh.data.CJID_MC || ""
            this.data.data.sxdxId = gzjh.data.CJID
            this.data.data.ywsj = gzjh.data.YWSJ && gzjh.data.YWSJ.length > 10 ? gzjh.data.YWSJ.substr(0, 10) : app.$kwz.formatDate('yyyy-MM-dd')
            let gzjhMc = `${this.data.data.schoolName}/${this.data.data.sxdxName}/${this.data.data.ywsj}`
            this.data.data.gzjhName = gzjhMc.length > 20 ? (gzjhMc.substr(0, 19) + '...') : gzjhMc
            // 下面还有个获取标准
            if (gzjh.data.BZID){
                this.loadDdGzjh()
            }
        }
        this.setData({
            gzjhShow: !this.data.gzjhShow,
            data: this.data.data,
            qpgShow: gzjh && gzjh.data.BZID
        })
    },
    // 保存督导
    saveXcdd(sfXq) {
        var that = this
        if (!this.data.data.schoolName || !this.data.data.ywsj || !this.data.data.ddjs) {
            app.$kwz.alert('学校、时间、督导纪实为必填项')
            return
        }
        if (this.data.data.ddjs.length < 50 || this.data.data.dxjyzf < 50 || this.data.data.czwt < 50) {
            var content = '';
            if (this.data.data.ddjs.length < 50) {content = content + '督导纪实  '}
            if (this.data.data.dxjyzf.length < 50) {content = content + '典型经验  '}
            if (this.data.data.czwt.length < 50) {content = content + '存在问题  '}
            wx.showModal({
              title: '督导纪实',
              content: '您填写的督导纪实('+content+')内容过于简单，不利于后期数据分析工作，建议字数50字以上。是否继续提交?',
              showCancel: true,
              cancelText: '否',
              confirmText: '是',
              success: function(res) {
                if (res.confirm) {
                  if (!that.data.data.xqid) {
                    app.$kwz.ajax.ajaxUrl({
                      url: '/jc_xq/getCurXq',
                      type: 'POST',
                      page: that,
                      then(response) {
                        let datas = response.datas
                        if (datas && datas.curXq && datas.curXq.XQ_ID) {
                          that.data.data.xqid = datas.curXq.XQ_ID
                          that.sendSaveXcdd()
                        }
                      }
                    })
                  } else {
                    this.sendSaveXcdd()
                  }
                } else if (res.cancel) {
                  return
                }
              }
            })
        } else {
          // 如果没有选择工作计划,则学期id会为空,那么默认取当前学期
          if (!this.data.data.xqid) {
              app.$kwz.ajax.ajaxUrl({
                  url: '/jc_xq/getCurXq',
                  type: 'POST',
                  page: this,
                  then(response) {
                      let datas = response.datas
                      if (datas && datas.curXq && datas.curXq.XQ_ID) {
                          this.data.data.xqid = datas.curXq.XQ_ID
                          this.sendSaveXcdd()
                      }
                  }
              })
          } else {
              this.sendSaveXcdd()
          }
        }
    },
    // 保存督导的ajax
    sendSaveXcdd() {
        // 点击保存按钮时,将初始zgxsId置空,否则onUnload里的判断会真,会运行删除zgxsId函数
        this.selectComponent(".xcdd-hxclyj").data.zgxsidOld = ""
        app.$kwz.ajax.ajaxUrl({
            url: '/ddjl/doEdit',
            type: 'POST',
            page: this,
            data: {
                CONTENT_ID: this.data.data.contentId || "",
                ORG_ID: this.data.data.schoolId,
                XXMC: this.data.data.schoolName,
                YWSJ: this.data.data.ywsj,
                USERID: this.data.data.sxdxId,
                USERID_MC: this.data.data.sxdxName,
                DDJS: this.data.data.ddjs,
                CYZL: this.data.data.cyzl,
                LXHY: this.data.data.lxhy,
                ZTZF: this.data.data.ztzf,
                WJDC: this.data.data.wjdc,
                XYXS: this.data.data.xyxs,
                DXJY: this.data.data.dxjyzf,
                CZWT: this.data.data.czwt,
                GZAP_YWID: this.data.data.gzjhId,
                XQID: this.data.data.xqid,
                STATUS: this.data.data.status,
                STATUS_MC: this.data.data.status_mc,
                ZGJY: this.data.data.zgxsyj,
                ZGXSID: this.data.data.zgxsid,
                PGMC: '',
                // BZID: this.data.data.pgbzID,
                PGID: this.data.data.pgid,
                minDate: this.data.data.minDate, // 最小时间限制
                maxDate: this.data.data.maxDate // 最大时间限制
            },
            vue: this,
            then(response) {
                app.$kwz.alert('保存成功')
                wx.redirectTo({
                    url: '/pages/xcdd/xcdd'
                })
            }
        })
    },
    // 加载工作计划数据=>从工作计划列表点击去督导,传过来工作计划id,然后加载工作计划内容填充至督导纪实
    loadDdGzjh() {
        app.$kwz.ajax.ajaxUrl({
            url: '/dd_gzap/doselectContentByContentId/DDGZAP_GP',
            type: 'POST',
            data: {
                CONTENT_ID: this.data.data.gzjhId
            },
            page: this,
            then(response) {
                let datas = response.datas
                if (datas && datas.map) {
                    let gzjh = datas.map
                    this.data.data.schoolName = gzjh.ORG_ID_TARGET_MC
                    this.data.data.schoolId = gzjh.ORG_ID_TARGET
                    this.data.data.sxdxName = gzjh.JGID_MC || ''
                    this.data.data.sxdxId = gzjh.JGID || ''
                    this.data.data.ywsj = gzjh.YWSJ && gzjh.YWSJ.length > 10 ? gzjh.YWSJ.substr(0, 10) : app.$kwz.formatDate('yyyy-MM-dd')
                    let gzjhMc = `${this.data.data.schoolName}/${this.data.data.sxdxName}/${this.data.data.ywsj}`
                    this.data.data.gzjhName = gzjhMc.length > 25 ? (gzjhMc.substr(0, 24) + '...') : gzjhMc,
                    this.setData({
                        data: this.data.data,
                    })
                    // 判断是否有评估权限 有批次id(BZID) 是随行督学
                    if (gzjh.BZID && gzjh.CJID.indexOf(this.data.loginUser.uid) >-1){
                        this.data.gzjh = gzjh
                        this.setData({ qpgShow: true})
                    }
                }
            }
        })
    },
    // 学校确定
    confirmSchool(e) {
        this.data.data.schoolName = e.detail.data.name;
        this.data.data.schoolId = e.detail.data.value;
        this.setData({
            schoolShow: !this.data.schoolShow,
            data: this.data.data
        })
    },
    // 随行督学确定
    sxdxConfirm(e) {
        let sxDxList = e.detail.data
        let sxdxIds = []
        let sxdxNames = []
        if (sxDxList && sxDxList.length > 0) {
            for (let i = 0; i < sxDxList.length; i++) {
                sxdxIds.push(sxDxList[i].value)
                sxdxNames.push(sxDxList[i].name)
            }
        }
        this.data.data.sxdxName = sxdxNames.join(',')
        this.data.data.sxdxId = sxdxIds.join(',')
        this.setData({
            sxdxShow: !this.data.sxdxShow,
            data: this.data.data
        })
    },
    // 后续处理意见弹出框确认
    hxclyjConfirm({detail}) {
        this.data.data.status = detail.status
        this.data.data.status_mc = detail.status_mc
        this.data.data.zgxsyj = detail.zgxsyj
        this.data.data.zgxsid = detail.zgxsid
    },
    // 打开关闭 工作计划 学校 随行督学
    showGzjh(e) {
        if (!this.data.data.contentId && !this.data.data.gzjhId) {
            this.setData({gzjhShow: !this.data.gzjhShow})
        }
    },
    showSchool(e) {
        if (!this.data.data.contentId) {
            this.setData({schoolShow: !this.data.schoolShow})
        }
    },
    showSxdx(e) {
        this.setData({sxdxShow: !this.data.sxdxShow})
    },
    showHxclyj(e) {
        this.setData({hxclyjShow: !this.data.hxclyjShow})
    },
    // 修改业务时间
    changeYwsj(e) {
        this.data.data.ywsj = e.detail.value
        this.setData({data: this.data.data})
    },
    // 督导纪实修改
    ddjsInput({detail}) {
        this.data.data.ddjs = detail.data
    },
    //打开关闭 督导纪实 资料采集 经验做法 存在问题
    changeDdjsShow() {
        this.setData({
            ddjsShow: !this.data.ddjsShow
        })
    },
    changeZlcjShow() {
        this.setData({
            zlcjShow: !this.data.zlcjShow
        })
    },
    changeJyzfShow() {
        this.setData({
            jyzfShow: !this.data.jyzfShow
        })
    },
    changeCzwtShow() {
        this.setData({
            czwtShow: !this.data.czwtShow
        })
    },
    // 更改 查阅资料 列席会议 座谈作坊 问卷调查 校园寻访 值
    changeCyzl({detail}) {
        this.data.data.cyzl = detail.value
        this.setData({
            data: this.data.data
        })
    },
    changeLxhy({detail}) {
        this.data.data.lxhy = detail.value
        this.setData({
            data: this.data.data
        })
    },
    changeZtzf({detail}) {
        this.data.data.ztzf = detail.value
        this.setData({
            data: this.data.data
        })
    },
    changeWjdc({detail}) {
        this.data.data.wjdc = detail.value
        this.setData({
            data: this.data.data
        })
    },
    changeXyxs({detail}) {
        this.data.data.xyxs = detail.value
        this.setData({
            data: this.data.data
        })
    },
    // 更改 典型经验做法 存在问题 值
    inputDxjyzf({detail}) {
        this.data.data.dxjyzf = detail.value
    },
    inputCzwt({detail}) {
        this.data.data.czwt = detail.value
    },
    // 去督评
    toPgdp() {
        app.$kwz.ajax.ajaxUrl({
            url: 'dd/ddGpEvaluation/doInitiateEvaluationPageList',
            type: 'POST',
            data: {
                nbId: this.data.gzjh.BZID, // 批次id
                evaluationOrgId: this.data.gzjh.ORG_ID, // 学校id
                evaluationObjectType: "1",//被评估对象类型，默认1（机构），写死
                type: "2",//评估类型，默认2 ，写死，督评
                assessorId: this.data.loginUser.uid//用户ID
            },
            page: this,
            then(response) {
                let data = response.datas[0]
                let url = `pgId=${data.pgId}&type=${data.type}&nbId=${data.nbId}&evaluationType=${data.evaluationObjectType}&evaluationOrgId=${data.evaluationOrgId}&name=${data.name}`
                for (let i in data.assessorVoList){
                    if (this.data.loginUser.uid == data.assessorVoList[i].assessorId){
                        url += `&isReport=${data.assessorVoList[i].isReport}`
                    }else{
                        url += `&isReport=''`
                    }
                }
                wx.navigateTo({
                    url: '/pages/pgzb/pgtb/pgtb?'+url
                })
            }
        })
    },
})