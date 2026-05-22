import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { allocationData } from '../../assets/marketData';

export default function AllocationPieChart({ data = allocationData }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={66} outerRadius={98} paddingAngle={4}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
      </PieChart>
    </ResponsiveContainer>
  );
}
