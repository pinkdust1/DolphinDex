import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface LiquidityChartProps {
  token1: {
    symbol: string;
    amount: string;
    logo: string;
  };
  token2: {
    symbol: string;
    amount: string;
    logo: string;
  };
  totalValue: string;
  myContribution: string;
}

export const LiquidityChart = ({
  token1,
  token2,
  totalValue,
  myContribution,
}: LiquidityChartProps) => {
  const data = [
    { name: token1.symbol, value: parseFloat(token1.amount), color: "#333" },
    { name: token2.symbol, value: parseFloat(token2.amount), color: "#222" },
  ];

  const renderCustomLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xl font-bold fill-foreground"
      >
        {totalValue}
      </text>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="space-y-3">
        {payload.map((entry: any, index: number) => {
          const tokenData = index === 0 ? token1 : token2;
          const [whole, decimal] = tokenData.amount.split(".");
          
          return (
            <div key={`legend-${index}`} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">
                  Total {entry.value}
                </span>
              </div>
              <div className="ml-5 flex items-baseline gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  {whole}
                  {decimal && (
                    <span className="text-muted-foreground">.{decimal}</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Pool Liquidity
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="30%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            content={renderLegend}
            verticalAlign="middle"
            align="right"
            layout="vertical"
            wrapperStyle={{ paddingLeft: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">My Contribution</p>
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              className="opacity-50"
            >
              <circle
                opacity="0.1"
                cx="12.664"
                cy="12"
                r="12"
                fill="url(#paint0_linear)"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9915 3.00861V3.00049H11.9976L11.9915 3.00861ZM11.9915 3.00861L5.92417 11.0603C5.75785 11.2812 5.66797 11.55 5.66797 11.8264C5.66797 12.5294 6.23777 13.0992 6.94085 13.0992H10.7175L11.9915 11.4005L7.79149 11.4005L11.9915 5.80049V3.00861ZM11.2772 14.2194L7.09152 19.8006H9.21448L12.1262 15.9181H17.456C18.7034 15.9181 19.7148 14.9068 19.7148 13.6594C19.7148 12.412 18.7034 11.4006 17.456 11.4006H13.3912L12.1172 13.0994H17.456C17.7651 13.0994 18.016 13.35 18.016 13.6594C18.016 13.8139 17.9533 13.9539 17.8519 14.0553C17.7506 14.1566 17.6106 14.2194 17.456 14.2194H11.2772Z"
                fill="currentColor"
              />
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="12.664"
                  y1="0"
                  x2="12.664"
                  y2="24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="#878787" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-2xl font-bold text-foreground">
              {myContribution}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
