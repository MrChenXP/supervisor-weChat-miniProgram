// kwz对微信接口的封装

import consts from './kwz.const'
import util from './kwz.util'

/**
 * 是否可以使用微信的接口
 * 具体使用见官方：https://developers.weixin.qq.com/miniprogram/dev/api/wx.canIUse.html
 * @param {string} key 
 * @returns true/false 是/否
 */
const canUse = (key) => {
  if (wx.canIUse(key)) {
    return true
  } else {
    errorLog(`${key} is not support in current weixin version`)
  }
  return false
}

/**
 * 从缓存中异步取出字符串值
 * @param {string} key 缓存key
 * @param {function} callback 回调函数 (data) => {...}
 * @param {object} app 回调函数的this指向
 */
const getStringFromStorage = (key, callback, app) => {
  if (canUse('getStorage') && key) {
    wx.getStorage({
      key,
      // success (res) {
      //   util.cfp(callback, app || this, [res.data])
      // }, 
      complete (res) {
        util.cfp(callback, app || this, [res.data])
      }
    })
  }
}

/**
 * 将字符串值异步设置到缓存中
 * @param {string} key 缓存key
 * @param {string} data 缓存data
 * @param {function} callback 回调函数 () => {...}
 * @param {object} app 回调函数this指向
 */
const setStringToStorage = (key, data, callback, app) => {
  if (canUse('setStorage')) {
    wx.setStorage({
      key, data,
      success () {
        util.cfp(callback, app || this, [])
      }
    })
  }
}

/**
 * 从缓存中同步取出字符串值
 * @param {string} key 
 */
const getStringFromStorageSync = (key) => {
  if (canUse('getStorageSync') && key) {
    return wx.getStorageSync(key)
  }
  return null
}

/**
 * 将字符串值同步设置到缓存中
 * @param {string} key 
 * @param {string} value
 */
const setStringToStorageSync = (key, value) => {
  if (canUse('setStorageSync')) {
    wx.setStorageSync(key, value)
  }
}

/**
 * 从缓存中移除
 * @param {string} key 
 * @param {function} callback 
 * @param {object} app 
 */
const removeFromStorage = (key, callback, app) => {
  if (canUse('removeStorage')) {
    wx.removeStorage({
      key, 
      success () {
        util.cfp(callback, app || this, [])
      }
    })
  }
}

/**
 * 从缓存中移除(同步)
 * @param {string} key 
 */
const removeFromStorageSync = (key) => {
  if (canUse('removeStorageSync')) {
    wx.removeStorageSync(key)
  }
}

/**
 * 清空缓存
 * @param {function} callback 
 * @param {object} app 
 */
const clearStorage = (callback, app) => {
  if (canUse('clearStorage')) {
    wx.clearStorage({
      success () {
        util.cfp(callback, app || this, [])
      }
    })
  }
}

/**
 * 清空缓存(同步)
 * @param {function} callback 
 * @param {object} app 
 */
const clearStorageSync = () => {
  if (canUse('clearStorageSync')) {
    wx.clearStorageSync()
  }
}

/**
 * 微信弹窗
 * @param {string} content 
 */
const alert = (content) => {
  showToast({
    title: content,
    icon: 'none',
    duration: 1500
  })
}

/**
 * 调用微信的show toast
 * @param {object} option
 */
const showToast = (option) => {
  if (canUse('showToast')) {
    wx.showToast(option)
  }
}

/**
 * 显示loading框,显示后，需要手动调用 closeLoading 方法关闭
 * @param {string} content loading框的文字，默认'加载中...'
 */
const openLoading = (content = '加载中...') => {
  if (canUse('showLoading')) {
    wx.showLoading({
      title: content, 
      mask: true 
    })
  }
}

/**
 * 关闭loading框
 * @param {function} callback 
 * @param {object} app 
 */
const closeLoading = (callback, app) => {
  if (canUse('hideLoading')) {
    wx.hideLoading({
      complete () {
        util.cfp(callback, app || this)
      }
    })
  }
}

/**
 * 微信request封装
 * 底层使用 wx.downloadFile, https://developers.weixin.qq.com/miniprogram/dev/api/wx.request.html
 * @param {object} option 包含{url, data, type, dataType, header, success, fail, complete}
 */
const request = (option) => {
  if (option && canUse('request')) {
    let url, method, data, dataType, header
    if (typeof option === 'object') {
      // 如果传的参数为json对象，
      url = option.url
      method = option.type || option.method
      data = option.data
    } else if (typeof option === 'string') {
      // 如果参数为字符串
      url = option
    }
    method = (method || 'GET').toUpperCase()
    data = data || {}
    // 默认请求格式json
    dataType = dataType || 'json'

    // 格式化请求头=》默认带上cookie头
    header = formatRequestHeader(option)

    if (method === 'GET') {
      // get请求
      url = formatGet(url, option)
    } else if (method === 'POST') {
      // post请求 处理url
      url = formatUrl(url)
    }

    // 发起请求
    wx.request({
      url, method, data, dataType, header,
      // 成功方法（微信官方：只有请求返回就会执行，不管httpcode）
      success(response) {
        requestSuccess(response, option)
      },
      // 请求失败方法（如果请求没有回来会执行）
      fail(error) {
        requestFail(error, option)
      },
      // 请求完成执行方法
      complete(response) {
        requestComplete(response, option)
      }
    })
  }
}

/**
 * 上传文件 底层使用wx.uploadFile，https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html
 * @param {object} option {url, filePath, data, header, success, fail, complete}
 */
const upalodFile = (option) => {
  if (option && canUse('uploadFile')) {
    wx.uploadFile({
      url: formatUrl(option.url),
      filePath: option.filePath,
      name: 'file',
      header: option.header,
      formData: option.data,
      success(response) {
        requestSuccess(response, option)
      },
      // 请求失败方法（如果请求没有回来会执行）
      fail(error) {
        requestFail(error, option)
      },
      // 请求完成执行方法
      complete(response) {
        requestComplete(response, option)
      }
    })
  }
}

/**
 * 格式化url，将option中的参数格式化到url中
 * @param {string} url
 * @param {object} option 
 */
const formatGet = (url, option) => {
  let urlArray = [formatUrl(url)]
  if (option && typeof(option.data) === 'object') {
    let data = option.data
    let paramArray = []
    for (let i in data) {
      paramArray.push('&')
      paramArray.push(i)
      paramArray.push('=')
      paramArray.push(data[i])
    }

    if (paramArray.length > 0) {
      if (url.indexOf('?') < 0) {
        urlArray.push('?')
        paramArray.shift()
      } else if (url.endsWith('&') || url.endsWith('?')) {
        paramArray.shift()
      }
      urlArray.push(...paramArray)
    }
  }
  return urlArray.join('')
}

/**
 * 格式化url，加入baseurl和proxytag
 * @param {string} url 
 */
const formatUrl = (url) => {
  // 如果已经包含了baseurl
  if (url.startsWith(consts.getBaseUrl())) {
    // 如果启用了代理且url中不包含代理路径
    if (consts.isProxy() && !url.startsWith(consts.getBaseUrl() + consts.getProxyTag())) {
      url = consts.getBaseUrl() + consts.getProxyTag() + url.substr(consts.getBaseUrl().length, url.length)
    }
  } else {
    // 如果启用了代理且url中不包含代理路径
	  if(consts.isProxy() && !url.startsWith(consts.getProxyTag())){
      url = consts.getProxyTag() + url
    }
    url = consts.getBaseUrl() + url
  }

  return url
}

/**
 * 格式化请求头，默认加上consts中的default_header
 * @param {object} option 
 */
const formatRequestHeader = (option) => {
  let defaultRequestHeader = consts.getDefaultRequestHeader()
  if (option && option.header) {
    for (let i in option.header) {
      if (i === 'Referer') {
        util.errorLog('微信官方request的header中，不支持设置Referer')
      } else {
        defaultRequestHeader[i] = option.header[i]
      }
    }
  }
  return defaultRequestHeader
}

/**
 * 请求成功回调
 * @param {object} response 返回值
 * @param {object} option 请求参数
 */
const requestSuccess = (response, option) => {
  if (response && response.statusCode === 200) {
    if (option) {
      util.cfp(option.success, option.app || (option.vue || this), [response, option])
    }
  } else {
    requestFail(response, option)
  }
}

/**
 * 请求失败回调
 * @param {object} error 返回值
 * @param {object} option 请求参数
 */
const requestFail = (error, option) => {
  if (option) {
    util.cfp(option.fail, (option.app || (option.vue || this)), [error, option])
  }
}

/**
 * 请求完成回调
 * @param {object} data 返回值
 * @param {object} option 请求参数
 */
const requestComplete = (response, option) => {
  if (option) {
    util.cfp(option.complete, (option.app || (option.vue || this)), [response, option])
  }
}

/**
 * 请求文件
 * 底层使用 wx.downloadFile, https://developers.weixin.qq.com/miniprogram/dev/api/wx.downloadFile.html
 * @param {object} option {url, header, filePath, success, fail, complete}
 */
const requestAttach = (option) => {
  if (option && canUse('downloadFile')) {
    let url, header, filePath

    if (typeof(option) === 'object') {
      url = option.url
      filePath = option.filePath
    } else if (typeof(option) === 'string') {
      url = option
    }

    // 处理url
    url = formatUrl(url)
    // 处理请求头
    header = formatRequestHeader(option)

    // 下载文件
    wx.downloadFile({
      url, header, filePath, 
      success (response) {
        requestSuccess(response, option)
      },
      fail (error) {
        requestFail(error, option)
      },
      complete (response) {
        requestComplete(response, option)
      }
    })
  }
}

/**
 * 关闭所有页面，打开到应用内的某个页面
 * 具体使用见官方：https://developers.weixin.qq.com/miniprogram/dev/api/wx.reLaunch.html
 * @param {object} option 
 */
const reLaunch = (option) => {
  if (option && canUse('reLaunch')) {
    let newOption = util.copyJson(option)
    newOption.success = option.success
    newOption.complete = option.complete
    newOption.fail = () => {
      util.cfp(option.fail, option.app || (option.vue || this), [], () => {
        alert('操作失败')
      })
    }
    wx.reLaunch(newOption)
  }
}

/**
 * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
 * 具体使用见官方：https://developers.weixin.qq.com/miniprogram/dev/api/wx.switchTab.html
 * @param {object} option 
 */
const switchTab = (option) => {
  if (option && canUse('switchTab')) {
    let newOption = util.copyJson(option)
    newOption.success = option.success
    newOption.complete = option.complete
    newOption.fail = () => {
      util.cfp(option.fail, option.app || (option.vue || this), [], () => {
        alert('操作失败')
      })
    }
    wx.switchTab(newOption)
  }
}

/**
 * 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。使用 #{navigateBack} 可以返回到原页面。小程序中页面栈最多十层。
 * 具体使用见官方：https://developers.weixin.qq.com/miniprogram/dev/api/wx.navigateTo.html
 * @param {object} option 
 */
const navigateTo = (option) => {
  if (option && canUse('navigateTo')) {
    let newOption = util.copyJson(option)
    newOption.success = option.success
    newOption.complete = option.complete
    newOption.fail = () => {
      util.cfp(option.fail, option.app || (option.vue || this), [], () => {
        alert('操作失败')
      })
    }
    wx.navigateTo(newOption)
  }
}

/**
 * 关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages 获取当前的页面栈，决定需要返回几层。
 * 具体使用见官方：https://developers.weixin.qq.com/miniprogram/dev/api/wx.navigateBack.html
 * @param {object} option 
 */
const navigateBack = (option) => {
  if (option && canUse('navigateBack')) {
    let newOption = util.copyJson(option)
    newOption.success = option.success
    newOption.complete = option.complete
    newOption.fail = () => {
      util.cfp(option.fail, option.app || (option.vue || this), [], () => {
        alert('操作失败')
      })
    }
    wx.navigateBack(newOption)
  }
}

/**
 * 选择图片
 * @param {object} option 
 */
const chooseImage = (option) => {
  if (option && canUse('chooseImage')) {
    wx.chooseImage(option)
  }
}

export default {
  canUse,
  getStringFromStorage, setStringToStorage, getStringFromStorageSync, setStringToStorageSync, formatUrl,
  alert, openLoading, closeLoading, requestAttach, request, reLaunch, switchTab, navigateTo, navigateBack,
  removeFromStorage, removeFromStorageSync, clearStorage, clearStorageSync, upalodFile, chooseImage
}