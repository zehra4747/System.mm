'use client';
import { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import Image from 'next/image';

const initialProducts = [
    { name: 'On On', price: 270 },
    { name: 'Crazy Egg', price: 815 },
    { name: 'Jimsim10', price: 263 },
    { name: 'Cola10', price: 263 },
    { name: 'OrangeSlice', price: 420 },
    { name: 'TooToo', price: 270 },
    { name: 'Trexo', price: 423 },
    { name: 'Rockeys', price: 157 },
    { name: 'Tiny Egg', price: 275 },
    { name: 'Candle jelly', price: 310 },
    { name: 'Cotton Candy', price: 207 }
];

export default function Home() {
    const [products, setProducts] = useState(initialProducts);
    const [quantities, setQuantities] = useState(Array(initialProducts.length).fill(0));
    const [totals, setTotals] = useState(Array(initialProducts.length).fill(0));
    const [grandTotal, setGrandTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
    const today = new Date().toLocaleDateString('en-GB');
    const [isCustomDiscount, setIsCustomDiscount] = useState(false);

    const calculateGrandTotal = useCallback(() => {
        const total = totals.reduce((acc, curr) => acc + curr, 0);
        setGrandTotal(total);
    }, [totals]);

    const calculateFinalTotal = useCallback(() => {
        const discountAmount = (grandTotal * discount) / 100;
        setFinalTotal(grandTotal - discountAmount);
    }, [grandTotal, discount]);

    useEffect(() => {
        calculateGrandTotal();
    }, [calculateGrandTotal, totals]);

    useEffect(() => {
        calculateFinalTotal();
    }, [calculateFinalTotal, grandTotal, discount]);

    const handleQuantityChange = (index: number, value: number) => {
        const updatedQuantities = [...quantities];
        updatedQuantities[index] = value;
        setQuantities(updatedQuantities);

        const updatedTotals = [...totals];
        updatedTotals[index] = products[index].price * value;
        setTotals(updatedTotals);
    };

    const handleDiscountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === "custom") {
            setIsCustomDiscount(true);
            setDiscount(0);
        } else {
            setIsCustomDiscount(false);
            setDiscount(Number(e.target.value));
        }
    };

    const handleCustomDiscountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDiscount(Number(e.target.value));
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Adding the logo
        const logoUrl = '/Simple Aesthetic Elegant Minimalist Logo (1).png';
        doc.addImage(logoUrl, 'PNG', 14, 10, 30, 30);

        // Adding the title and customer details
        doc.setFontSize(18);
        doc.text('MM DISTRIBUTORS', 50, 22);
        doc.setFontSize(12);
        doc.text(`Customer: ${customerName}`, 14, 45);
        doc.text(`Date: ${today}`, 14, 55);

        const phoneNumbers = ['Contact: 03432546206', 'Contact: 03432558041', 'Contact: 03332294598'];
        phoneNumbers.forEach((phone, i) => {
            doc.text(phone, 140, 15 + i * 5);
        });

        doc.line(14, 60, 196, 60);

        // Table Headers
        let y = 65;
        doc.setFontSize(12);
        doc.text('Serial', 14, y);
        doc.text('Product', 40, y);
        doc.text('Price', 90, y, { align: 'right' });
        doc.text('Quantity', 120, y, { align: 'right' });
        doc.text('Total', 160, y, { align: 'right' });

        y += 10;

        // Table Rows
        let serial = 1;
        products.forEach((product, index) => {
            if (quantities[index] > 0) {
                doc.text(`${serial}`, 14, y);
                doc.text(`${product.name}`, 40, y);
                doc.text(`${product.price.toFixed(2)}`, 90, y, { align: 'right' });
                doc.text(`${quantities[index]}`, 120, y, { align: 'right' });
                doc.text(`${totals[index].toFixed(2)}`, 160, y, { align: 'right' });
                y += 10;
                serial++;
            }
        });

        // Adding a horizontal line before Grand Total
        doc.line(14, y, 196, y);

        // Grand Total
        doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 14, y + 10);

        // Conditional Discount
        if (discount > 0) {
            doc.text(`Discount: ${discount}%`, 14, y + 20);
            doc.text(`Final Total: ${finalTotal.toFixed(2)}`, 14, y + 30);
        } else {
            doc.text(`Final Total: ${finalTotal.toFixed(2)}`, 14, y + 20);
        }

        doc.save(`${customerName}.billing-summary.MMdistributors.pdf`);
        resetProducts();
    };

    const removeProduct = (index: number) => {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);

        const updatedQuantities = quantities.filter((_, i) => i !== index);
        setQuantities(updatedQuantities);

        const updatedTotals = totals.filter((_, i) => i !== index);
        setTotals(updatedTotals);
    };

    const resetProducts = () => {
        setProducts(initialProducts);
        setQuantities(Array(initialProducts.length).fill(0));
        setTotals(Array(initialProducts.length).fill(0));
        setGrandTotal(0);
        setDiscount(0);
        setFinalTotal(0);
        setCustomerName('');
        setIsCustomDiscount(false);
    };

    const addNewProduct = () => {
        if (!newProduct.name || !newProduct.price || !newProduct.quantity) return;

        const updatedProducts = [...products, { name: newProduct.name, price: parseFloat(newProduct.price) }];
        const updatedQuantities = [...quantities, parseInt(newProduct.quantity)];
        const updatedTotals = [...totals, parseFloat(newProduct.price) * parseInt(newProduct.quantity)];

        setProducts(updatedProducts);
        setQuantities(updatedQuantities);
        setTotals(updatedTotals);

        setNewProduct({ name: '', price: '', quantity: '' });
    };

    return (
        <div className="p-4 md:p-10">
            <div className="mb-6 flex flex-col items-center md:flex-row">
                <Image src="/Simple Aesthetic Elegant Minimalist Logo (1).png" alt="Company Logo" className="h-auto mr-0 md:mr-4 mb-4 md:mb-0" width={150} height={150} />
                <h2 className="text-2xl md:text-4xl font-bold font-serif text-center md:text-left">MM DISTRIBUTORS</h2>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium" htmlFor="customerName">Customer Name:</label>
                <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                    placeholder="Enter Customer Name"
                />
            </div>

            <div className="overflow-x-auto mb-4">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">Serial</th>
                            <th className="border border-gray-300 px-4 py-2">Product</th>
                            <th className="border border-gray-300 px-4 py-2">Quantity</th>
                            <th className="border border-gray-300 px-4 py-2">Price (per unit)</th>
                            <th className="border border-gray-300 px-4 py-2">Total</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={quantities[index]}
                                        onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right">{product.price.toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-2 text-right">{totals[index].toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <button
                                        onClick={() => removeProduct(index)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-black"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold">Add New Product</h3>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="p-2 border border-gray-300 rounded w-full"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="p-2 border border-gray-300 rounded w-full"
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        className="p-2 border border-gray-300 rounded w-full"
                    />
                    <button
                        onClick={addNewProduct}
                        className="bg-slate-950 text-white px-4 py-2 rounded w-full md:w-auto hover:bg-slate-700"
                    >
                        Add Item
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-center md:text-left">Grand Total: {grandTotal.toFixed(2)}</h3>
                <div className="mt-4">
                    <label htmlFor="discount" className="block text-sm font-medium">Discount (%):</label>
                    <select
                        id="discount"
                        value={isCustomDiscount ? "custom" : discount.toString()}
                        onChange={handleDiscountChange}
                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                    >
                        <option value="0">No Discount</option>
                        <option value="3">3% Discount</option>
                        <option value="7">7% Discount</option>
                        <option value="custom">Custom Discount</option>
                    </select>
                    {isCustomDiscount && (
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={discount}
                            onChange={handleCustomDiscountInput}
                            className="mt-2 p-2 border border-gray-300 rounded w-full"
                            placeholder="Enter discount percentage"
                        />
                    )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center md:text-left">Final Total after Discount: {finalTotal.toFixed(2)}</h3>
                <div className="flex flex-col md:flex-row items-center mt-6">
                    <button
                        onClick={generatePDF}
                        className="hover:bg-cyan-600 text-white p-2 rounded mb-4 md:mb-0 md:mr-4 w-full md:w-auto bg-cyan-900 transition duration-300"
                    >
                        Download PDF
                    </button>
                    <button
                        onClick={resetProducts}
                        className="bg-zinc-950 text-white p-2 rounded w-full md:w-auto hover:bg-slate-700 transition duration-300"
                    >
                        New Bill
                    </button>
                </div>
            </div>
        </div>
    );
}
