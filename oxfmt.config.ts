import { defineConfig } from 'oxfmt'

export default defineConfig({
	printWidth: 120, // 将打印宽度调整为 120，适配现代宽屏显示器
	useTabs: true, // 使用制表符进行缩进，而非空格
	tabWidth: 4, // 设置制表符宽度为 4 （注意！：vscode settings editor.tabSize配置优先级高于此配置）
	semi: false, // 不添加分号，使代码更简洁
	singleQuote: true, // 使用单引号而非双引号

	jsxSingleQuote: true, // 在 JSX 中使用单引号
	bracketSameLine: true, // 控制多行 HTML/JSX 元素的闭合尖括号 > 的位置

	sortImports: {}, // 启用 import 语句排序，使用默认分组规则
	sortTailwindcss: {}, // 启用 Tailwind CSS 默认排序规则
})
