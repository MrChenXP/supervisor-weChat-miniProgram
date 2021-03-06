Component({
  options: {
    styleIsolation: "apply-shared" // 表示页面wxss样式将影响到自定义组件，但自定义组件wxss中指定的样式不会影响页面
  },
  externalClasses: ['kw-class'],
  properties: {
    //slot 名字
    name: {
      type: String,
      value: ''
    },
    //标签是否可以选择
    checkable: {
      type: Boolean,
      value: false
    },
    //标签的选中状态
    checked: {
      type: Boolean,
      value: true
    },
    //标签颜色
    color: {
      type: String,
      value: 'default'
    },
    // 标签的样式类型 border=空心 dot=实心
    type: {
      type: String,
      value: 'dot'
    },
    // 是否为圆角
    circle: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    tapTag() {
      const data = this.data;
      if (data.checkable) {
        const checked = data.checked ? false : true;
        this.triggerEvent('change', {
          name: data.name || '',
          checked: checked
        });
      }
    }
  }
})