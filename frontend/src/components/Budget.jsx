import React, { useState, useEffect } from 'react';
import './Budget.css';

function Budget({ eventId, onClose, onSave }) {
    const [budget, setBudget] = useState({
        total_budget: 0,
        expenses: []
    });
    const [newExpense, setNewExpense] = useState({
        category: '',
        amount: 0,
        description: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleAddExpense = () => {
        if (!newExpense.category || !newExpense.amount) {
            setError('Please fill in all expense fields');
            return;
        }
        setBudget({
            ...budget,
            expenses: [...budget.expenses, newExpense]
        });
        setNewExpense({
            category: '',
            amount: 0,
            description: ''
        });
    };

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://127.0.0.1:5000/event/${eventId}/budget`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setBudget(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to fetch budget');
                }
            } catch (err) {
                setError('Error fetching budget data');
            } finally {
                setLoading(false);
            }
        };
        fetchBudget();
    }, [eventId]);

    if (loading) return <div className="budget-loading">Loading budget data...</div>;
    if (error) return <div className="budget-error">Error: {error}</div>;

    return (
        <div className="budget-modal">
            <h2>Event Budget</h2>
            <div className="budget-form">
                <input
                    type="number"
                    value={budget.total_budget}
                    onChange={(e) => setBudget({...budget, total_budget: parseFloat(e.target.value)})}
                    placeholder="Total Budget"
                />
                {/* Expense list */}
                <div className="expenses-list">
                    {budget.expenses.map((expense, index) => (
                        <div key={index} className="expense-item">
                            <span>{expense.category}</span>
                            <span>${expense.amount}</span>
                            <span>{expense.description}</span>
                        </div>
                    ))}
                </div>
                {/* Add new expense form */}
                <div className="add-expense-form">
                    <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    >
                        <option value="">Select Category</option>
                        <option value="venue">Venue</option>
                        <option value="transportation">Transportation</option>
                        <option value="food">Food</option>
                        <option value="decorations">Decorations</option>
                        <option value="miscellaneous">Miscellaneous</option>
                    </select>
                    <input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                        placeholder="Amount"
                    />
                    <input
                        type="text"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        placeholder="Description"
                    />
                    <button onClick={handleAddExpense}>Add Expense</button>
                </div>
            </div>
            <div className="modal-actions">
                <button onClick={onClose}>Close</button>
                <button onClick={() => onSave(budget)}>Save Changes</button>
            </div>
        </div>
    );
}

export default Budget;