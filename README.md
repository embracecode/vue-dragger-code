# vue-dragger-editor

低代码平台


### 主要文件

目录结构主要文件及作用

```sh
├── packages
│   ├── component  ------------ 部分组件
│   ├── plugins  ------------ 注册插件文件及按键映射和简单的发布订阅
│   │   ├── command.plugin ------------  命令的注册以及undo redo （重要）
│   ├── utils
│   │   ├── visualEditor-operation.tsx ------------ 右侧操作栏组件 
│   │   ├── visualEditor.props ----------- 左侧物料对用的属性
│   │   ├── useVisualCommand ----------- 对头部命令的注册 （重要）
│   │   ├── visualEditor.utils ----------- 物料注册的实现核心代码 （重要）
│   │   ├── visualEditor ----------- 整个编辑器及其布局和核心代码 （重要）
│   │   ├── visualEditorBlock ----------- 容器内的物料组件 （重要）
├── dit-data.json   ------------- 已经设置过的数据可以直接做导入功能
├── visualConfig.tsx   ------------ 整个物料的注册 （重要）
```




## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```
## 注意 运行完之后打开页面时此时是预览模式 体验拖拽功能需要在头部命令点击编辑 切换到编辑模式


### Type-Check, Compile and Minify for Production

```sh
npm run build
```