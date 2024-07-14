import { ResponsiveLine } from "@nivo/line"

export default function LineChart(props: any) {
    return (
        <div {...props}>
            <ResponsiveLine
                data={[
                    {
                        id: "Money Spent",
                        data: [
                            { x: "Jan", y: 43 },
                            { x: "Feb", y: 137 },
                            { x: "Mar", y: 61 },
                            { x: "Apr", y: 145 },
                            { x: "May", y: 26 },
                            { x: "Jun", y: 154 },
                        ],
                    },
                    {
                        id: "Wallet Balance",
                        data: [
                            { x: "Jan", y: 60 },
                            { x: "Feb", y: 48 },
                            { x: "Mar", y: 177 },
                            { x: "Apr", y: 78 },
                            { x: "May", y: 96 },
                            { x: "Jun", y: 204 },
                        ],
                    },
                ]}
                margin={{ top: 10, right: 10, bottom: 60, left: 60 }}
                xScale={{
                    type: "point",
                }}
                yScale={{
                    type: "linear",
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 0,
                    tickPadding: 10,
                    legend: 'Months',
                    legendPosition: 'middle',
                    legendOffset: 45,
                }}
                axisLeft={{
                    tickSize: 0,
                    tickValues: 5,
                    tickPadding: 10,
                    legend: 'Amount in ₹',
                    legendPosition: 'middle',
                    legendOffset: -50,
                }}
                colors={["#2563eb", "#e11d48"]}
                pointSize={6}
                useMesh={true}
                gridYValues={6}
                theme={{
                    axis: {
                        legend: {
                            text: {
                                fontSize: 16,
                                fontWeight: 'bold',
                            },
                        },
                    },
                    tooltip: {
                        container: {
                            fontSize: '12px',
                            textTransform: 'capitalize',
                            borderRadius: '6px',
                        },
                        chip: {
                            borderRadius: '9999px',
                        },
                    },
                    grid: {
                        line: {
                            stroke: "#f3f4f6",
                        },
                    },
                }}
                tooltip={({ point }) => (
                    <div
                        style={{
                            background: 'white',
                            padding: '5px 10px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            fontSize: '11px',
                            boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <strong>{point.serieId}</strong>
                        <br />
                        {`Month: ${point.data.x}`}
                        <br />
                        {`Amount: ${point.data.y}`}
                    </div>
                )}
                role="application"
            />
        </div>
    );
}