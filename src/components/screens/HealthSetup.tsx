import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Check, Copy, ArrowLeft } from '@phosphor-icons/react'

interface HealthSetupProps {
  apiUrl: string
  onBack: () => void
}

export default function HealthSetup({ apiUrl, onBack }: HealthSetupProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  const fullApiUrl = `${apiUrl}/api/health`

  const sampleJson = `{
  "metrics": [
    {
      "type": "steps",
      "value": 健康样本的值,
      "unit": "count",
      "date": 当前日期
    },
    {
      "type": "heartRate",
      "value": 健康样本的值,
      "unit": "bpm",
      "date": 当前日期
    },
    {
      "type": "activeEnergy",
      "value": 健康样本的值,
      "unit": "kcal",
      "date": 当前日期
    }
  ]
}`

  return (
    <div className="p-4 pt-12 space-y-4 pb-24">
      <button onClick={onBack} className="flex items-center gap-1 text-accent text-sm mb-2">
        <ArrowLeft size={16} />
        返回
      </button>

      <h1 className="text-2xl font-bold">设置健康数据同步</h1>
      <p className="text-sm text-muted-foreground">
        按照以下步骤在 iPhone 上创建快捷指令，自动同步 Apple Health 数据
      </p>

      {/* Step 1 */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <h3 className="font-semibold">打开快捷指令 App</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">点击下方按钮直接打开</p>
        <Button
          className="w-full"
          onClick={() => window.open('shortcuts://', '_self')}
        >
          打开快捷指令 App
        </Button>
      </Card>

      {/* Step 2 */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <h3 className="font-semibold">新建快捷指令</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          点击右上角 <span className="text-foreground font-bold">+</span>，然后添加以下操作：
        </p>
      </Card>

      {/* Step 3 - Health samples */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
          <h3 className="font-semibold">添加健康数据操作</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">搜索并添加 3 个「查找健康样本」操作：</p>
        <div className="space-y-2">
          {[
            { type: '步数 (Steps)', icon: '🚶' },
            { type: '心率 (Heart Rate)', icon: '❤️' },
            { type: '活动能量 (Active Energy)', icon: '🔥' },
          ].map(item => (
            <div key={item.type} className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
              <span>{item.icon}</span>
              <div className="text-sm">
                <p className="text-foreground font-medium">查找健康样本</p>
                <p className="text-muted-foreground text-xs">类型：{item.type}，开始日期：今天开始</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Step 4 - API URL */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
          <h3 className="font-semibold">添加「获取 URL 内容」操作</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">复制下方 URL，粘贴到操作中：</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-secondary px-3 py-2 rounded text-xs break-all">{fullApiUrl}</code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(fullApiUrl, 'url')}
            className="shrink-0"
          >
            {copiedField === 'url' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </Button>
        </div>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>• 方法设为 <span className="text-foreground font-medium">POST</span></p>
          <p>• 请求体选 <span className="text-foreground font-medium">JSON</span></p>
        </div>
      </Card>

      {/* Step 5 - JSON body */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">5</span>
          <h3 className="font-semibold">配置 JSON 请求体</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          在快捷指令的 JSON 键值编辑器中，添加一个键 <span className="text-foreground font-medium">metrics</span>，
          值为一个数组（Array），包含 3 个字典（Dictionary）：
        </p>
        <div className="space-y-3">
          {[
            { type: 'steps', label: '步数', unit: 'count', varName: '步数' },
            { type: 'heartRate', label: '心率', unit: 'bpm', varName: '心率' },
            { type: 'activeEnergy', label: '活动能量', unit: 'kcal', varName: '活动能量' },
          ].map(item => (
            <div key={item.type} className="bg-secondary/50 rounded-lg p-3">
              <p className="text-sm font-medium text-foreground mb-1">{item.label}</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <p>type → <span className="text-foreground">{item.type}</span></p>
                <p>unit → <span className="text-foreground">{item.unit}</span></p>
                <p>value → <span className="text-accent">选{item.varName}变量</span></p>
                <p>date → <span className="text-accent">选当前日期</span></p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          💡 value 和 date 字段需要选择上面「查找健康样本」操作的输出变量
        </p>
      </Card>

      {/* Step 6 - Automation */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">6</span>
          <h3 className="font-semibold">设置每日自动化（可选）</h3>
        </div>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>在快捷指令 App 中切换到「自动化」标签</li>
          <li>点击 + →「创建个人自动化」</li>
          <li>选择「特定时间」→ 每天 22:00</li>
          <li>选择刚创建的快捷指令</li>
          <li>关闭「运行前询问」</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3">
          ✅ 设置后每天自动同步健康数据，无需手动操作
        </p>
      </Card>

      {/* Test button */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
          <h3 className="font-semibold">测试连接</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          设置完成后，手动运行一次快捷指令，然后点击下方按钮检查数据是否成功同步
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            try {
              const r = await fetch('/api/health?days=1')
              const data = await r.json()
              if (data.metrics && data.metrics.length > 0) {
                alert(`✅ 同步成功！收到 ${data.metrics.length} 条数据`)
              } else {
                alert('暂未收到数据，请先在快捷指令 App 中运行一次')
              }
            } catch {
              alert('连接失败，请检查网络')
            }
          }}
        >
          检查同步状态
        </Button>
      </Card>
    </div>
  )
}
