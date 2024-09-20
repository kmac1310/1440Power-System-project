// 1440 Power System React Component
// This component implements a time management system based on the 1440 minutes in a day

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from 'lucide-react'

interface Task {
  id: number;
  name: string;
  duration: number;
}

export default function PowerSystem1440() {
  // State variables
  const [sleep, setSleep] = useState(420)
  const [livelihood, setLivelihood] = useState(600)
  const [onTime, setOnTime] = useState(420)
  const [remainingMinutes, setRemainingMinutes] = useState(1440)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDuration, setNewTaskDuration] = useState(0)

  // Update remaining minutes every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      const diff = Math.floor((endOfDay.getTime() - now.getTime()) / 60000)
      setRemainingMinutes(diff)
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Update time allocation
  const updateTime = (zone: 'sleep' | 'livelihood' | 'onTime', value: number) => {
    const newValue = Math.max(0, Math.min(1440, value))
    const others = ['sleep', 'livelihood', 'onTime'].filter(z => z !== zone) as ('sleep' | 'livelihood' | 'onTime')[]
    const remaining = 1440 - newValue
    const half = Math.floor(remaining / 2)

    if (zone === 'sleep') setSleep(newValue)
    if (zone === 'livelihood') setLivelihood(newValue)
    if (zone === 'onTime') setOnTime(newValue)

    if (others[0] === 'sleep') setSleep(half)
    if (others[0] === 'livelihood') setLivelihood(half)
    if (others[0] === 'onTime') setOnTime(half)

    if (others[1] === 'sleep') setSleep(remaining - half)
    if (others[1] === 'livelihood') setLivelihood(remaining - half)
    if (others[1] === 'onTime') setOnTime(remaining - half)
  }

  // Add a new task
  const addTask = () => {
    if (newTaskName && newTaskDuration > 0) {
      const totalTaskDuration = tasks.reduce((sum, task) => sum + task.duration, 0) + newTaskDuration
      if (totalTaskDuration <= onTime) {
        setTasks([...tasks, { id: Date.now(), name: newTaskName, duration: newTaskDuration }])
        setNewTaskName('')
        setNewTaskDuration(0)
      } else {
        alert("Total task duration exceeds On-Time allocation!")
      }
    }
  }

  // Remove a task
  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  // Reset a task's duration
  const resetTask = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, duration: 0 } : task))
  }

  // Calculate total task duration and remaining on-time
  const totalTaskDuration = tasks.reduce((sum, task) => sum + task.duration, 0)
  const remainingOnTime = onTime - totalTaskDuration

  // Prepare data for pie chart
  const chartData = [
    { name: 'Sleep', value: sleep, color: '#FF6384' },
    { name: 'Livelihood', value: livelihood, color: '#36A2EB' },
    { name: 'On-Time (Allocated)', value: totalTaskDuration, color: '#FFCE56' },
    { name: 'On-Time (Remaining)', value: remainingOnTime, color: '#4BC0C0' }
  ]

  // Custom label for pie chart
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, value } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">1440 Power System™</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Time allocation inputs */}
        <div className="space-y-4">
          {['sleep', 'livelihood', 'onTime'].map((zone) => (
            <div key={zone}>
              <label htmlFor={zone} className="block text-sm font-medium text-gray-700">
                {zone.charAt(0).toUpperCase() + zone.slice(1)} (minutes):
              </label>
              <Input
                id={zone}
                type="number"
                value={eval(zone)}
                onChange={(e) => updateTime(zone as 'sleep' | 'livelihood' | 'onTime', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          ))}
        </div>

        {/* Pie chart */}
        <div className="mt-6" style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* On-Time Tasks */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">On-Time Tasks</h3>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between">
                <span>{task.name} - {task.duration} min</span>
                <div>
                  <Button onClick={() => resetTask(task.id)} variant="outline" size="sm" className="mr-2">
                    Reset
                  </Button>
                  <Button onClick={() => removeTask(task.id)} variant="destructive" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Duration"
              value={newTaskDuration}
              onChange={(e) => setNewTaskDuration(parseInt(e.target.value))}
            />
            <Button onClick={addTask}>Add Task</Button>
          </div>
          <p className="mt-2 font-semibold">Remaining On-Time: {remainingOnTime} minutes</p>
        </div>

        {/* Remaining minutes display */}
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold">Minutes remaining today: {remainingMinutes}</p>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">Own your minutes, own your life</p>
      </CardContent>
    </Card>
  )
}
