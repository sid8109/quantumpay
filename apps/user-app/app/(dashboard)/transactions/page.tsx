"use client"

import { Card } from "@repo/ui/card";
import { useState, useEffect } from "react";
import convertDate from "../../lib/actions/convertDate";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { sessionState } from "@repo/store/session";
import { useRecoilValue } from "recoil";
import { getTransactions, getTransactionsForPDF } from "../../lib/actions/transactions";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { svg2pdf } from "svg2pdf.js";
import Loading from '@repo/ui/loading';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const session = useRecoilValue(sessionState);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [initialBalance, setInitialBalance] = useState<number | undefined>(0);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setTransactions([])
        async function main() {
            setLoading(true)
            const response = await getTransactions(session?.user.id, currentPage);
            if (response.error) {
                toast.error(response.error);
            } else {
                setTransactions(response.transactions);
                setInitialBalance(response.balance);
            }
            setLoading(false)
        }
        main();
    }, [currentPage]);

    const months = getLastSixMonths();

    function getLastSixMonths() {
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            months.push(`${month} ${year}`);
        }
        return months;
    }

    function calculateBalancesForTransactions() {
        let balance = initialBalance;
        if (balance === undefined && transactions.length === 0) return [];
        let size: number
        if (transactions.length === 11) size = 10
        else size = transactions.length
        for (let i = 0; i < size; i++) {
            if (i === 0) {
                transactions[i].balance = balance;
                continue
            }
            if (transactions[i - 1].source === 'OnRampTransaction') {
                transactions[i].balance = transactions[i - 1].balance - transactions[i - 1].amount;
            } else {
                if (transactions[i - 1].fromUserId.toString() === session?.user.id) {
                    transactions[i].balance = transactions[i - 1].balance + transactions[i - 1].amount;
                } else {
                    transactions[i].balance = transactions[i - 1].balance - transactions[i - 1].amount;
                }
            }
        }
        console.log(transactions, size)
        return transactions.slice(0, 10)
    }

    function calculateBalances(transactions: any[], initialBalance: number | undefined) {
        if (initialBalance === undefined && transactions.length === 0) return [];
        let balance: number = initialBalance, closingBalance: number = 0, totalCredited: number = 0, totalDebited: number = 0
        let trans: any[] = new Array(transactions.length + 1)
        trans[0] = ["", "Openning Balance", "", initialBalance?.toString()]
        console.log(transactions)
        for (let i = 0; i < transactions.length; i++) {
            let transDetails, finalAmt
            if (transactions[i].source === 'OnRampTransaction') {
                transDetails = transactions[i].provider
            } else {
                transDetails = transactions[i].otherUserName
            }
            if (transactions[i].source === 'p2pTransfer' && transactions[i].fromUserId.toString() === session?.user.id) {
                finalAmt = "-" + transactions[i].amount / 100
                balance = balance - transactions[i].amount / 100
                totalDebited += transactions[i].amount / 100
            } else {
                finalAmt = transactions[i].amount / 100
                balance = balance + transactions[i].amount / 100
                totalCredited += transactions[i].amount / 100
            }
            const finalBalance = balance
            trans[i + 1] = [convertDate(transactions[i].timestamp), transDetails, finalAmt, finalBalance]
        }
        closingBalance = trans[transactions.length][3]
        return {
            trans,
            totalCredited,
            totalDebited,
            closingBalance
        }
    }

    async function downloadTransactions() {
        if (!selectedMonth) {
            toast.error("Please select a month");
            return;
        }

        const [monthName, year] = selectedMonth.split(' ');
        const month = new Date(Date.parse(`${monthName} 1, ${year}`)).getMonth() + 1;

        const response = await getTransactionsForPDF(session?.user.id, month, year);
        if (response.error) {
            toast.error(response.error);
            return;
        }

        if (response.openingBalance === undefined || response.transactions.length === 0) {
            toast.error("No transactions found for the selected month");
            return;
        }
        const transactionsWithBalances = calculateBalances(response.transactions, response.openingBalance / 100);

        const doc = new jsPDF();
        doc.setFont("helvetica");

        const svgLogo = `
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00baf2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="17" height="12" x="2" y="5" rx="2"/>
            <line x1="2" x2="19" y1="10" y2="10"/>
        </svg>
        `;

        const div = document.createElement('div');
        div.innerHTML = svgLogo;
        const svgElement = div.firstElementChild;

        await svg2pdf(svgElement, doc, {
            x: 10,
            y: 12,
            width: 16,
            height: 16,
        });

        doc.setTextColor(0, 186, 242);
        doc.setFontSize(20);
        doc.setFont("bold");
        doc.text("QuantumPay", 26, 20);

        doc.setFontSize(11);
        doc.setTextColor(156, 163, 175);
        doc.text("Empowering Your Financial Future", 26, 25);

        doc.setTextColor(0, 0, 0);
        const user = session?.user;
        doc.setFontSize(13);
        doc.text(`Name: ${user?.name}`, 10, 40);
        doc.text(`Email: ${user?.email}`, 10, 45);
        doc.text(`Phone: ${user?.number}`, 10, 50);

        doc.setFontSize(16);
        doc.setFont("bold");
        doc.text(`Transactions for ${selectedMonth}`, 10, 65);

        const tableData = transactionsWithBalances.trans

        autoTable(doc, {
            startY: 75,
            head: [['Date', 'Transaction Details', 'Credit/Debit', 'Balance']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [0, 186, 242],
                textColor: [255, 255, 255],
                fontSize: 12,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 11,
                textColor: [0, 0, 0],
            },
            styles: {
                lineColor: [44, 62, 80],
                lineWidth: 0.1,
                cellPadding: 2,
                overflow: 'linebreak',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' }
            }
        });

        // const summaryStartY = doc.autoTableEndPosY() + 10;

        // doc.setFontSize(14);
        // doc.setFont("bold");
        // doc.text("Summary", 10, summaryStartY);

        // doc.setFontSize(12);
        // doc.setFont("normal");

        // const summaryLines = [
        //     `Opening Balance: ${response.openingBalance / 100}`,
        //     `Total Credited: ${transactionsWithBalances.totalCredited}`,
        //     `Total Debited: -${transactionsWithBalances.totalDebited}`,
        //     `Closing Balance: ${transactionsWithBalances.closingBalance.}`
        // ];

        // let currentY = summaryStartY + 10;

        // summaryLines.forEach(line => {
        //     doc.text(line, 10, currentY);
        //     currentY += 7;
        // });

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 10, doc.internal.pageSize.getHeight() - 10);

        doc.save(`QuantumPay_${monthName}_${year}.pdf`);
    }

    if (transactions.length === 0) {
        return <>
            {loading ? <Loading /> :
                <>
                    <div className="text-3xl text-[#00baf2] pt-3 mb-4 font-bold">
                        Transactions History
                    </div>
                    <Card title="">
                        <div className="text-center pb-8 pt-8">
                            No recent transactions
                        </div>
                    </Card>
                </>
            }
        </>
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="text-3xl text-[#00baf2] pt-3 mb-4 font-bold">
                    Transactions History
                </div>
                <div className="flex space-x-4 items-center">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-300 rounded-md p-2.5 cursor-pointer outline-none"
                    >
                        <option value="" disabled>Select Month</option>
                        {months.map((month, index) => (
                            <option key={index} value={month}>{month}</option>
                        ))}
                    </select>
                    <Button onClick={downloadTransactions}>
                        Download Statement
                    </Button>
                </div>
            </div>
            {
                loading ? <Loading /> : (
                    <Card title="">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {calculateBalancesForTransactions().map((transaction: any) => {
                                    const isPayer = transaction.source === 'p2pTransfer' && transaction.fromUserId.toString() === session?.user.id;
                                    return (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                                                {convertDate(transaction.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                                                {transaction.source === 'OnRampTransaction' ? transaction.provider : transaction.otherUserName}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-center ${isPayer ? "text-red-600" : "text-green-600"}`}>
                                                {isPayer ? `-₹${(transaction.amount / 100).toFixed(2)}` : `₹${(transaction.amount / 100).toFixed(2)}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                                                ₹{(transaction.balance / 100).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>
                )
            }
            <div className="flex justify-center mt-4">
                <nav>
                    <ul className="inline-flex -space-x-px">
                        <li>
                            <button
                                className={`px-3 py-2 ml-0 leading-tight border border-gray-300 rounded-l-lg ${currentPage === 1 ? 'text-gray-300 bg-gray-200 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'}`}
                                onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : currentPage)}
                                disabled={currentPage === 1 ? true : false}
                            >
                                <FaAngleLeft size={16} />
                            </button>
                        </li>
                        <li>
                            <button
                                className={`px-3 py-2 leading-tight border border-gray-300 rounded-r-lg ${transactions.length !== 11 ? 'text-gray-300 bg-gray-200 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'}`}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={transactions.length === 11 ? false : true}
                            >
                                <FaAngleRight size={16} />
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default TransactionsPage;