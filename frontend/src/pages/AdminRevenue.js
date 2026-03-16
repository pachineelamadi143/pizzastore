import React, { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import { getMonthlyRevenue } from '../services/api';
import Navbar from '../components/Navbar';

const AdminRevenue = () => {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await getMonthlyRevenue();
        setRevenue(res.data);
      } catch (error) {
        console.error('Error fetching revenue:', error);
      }
      setLoading(false);
    };
    fetchRevenue();
  }, []);

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <Container className="mt-4">
        <h3 className="mb-4">Monthly Revenue Analytics</h3>

        {loading ? (
          <div className="text-center">Loading revenue data...</div>
        ) : revenue.length === 0 ? (
          <p>No revenue data yet.</p>
        ) : (
          <Table striped bordered hover>
            <thead className="table-primary">
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Total Orders</th>
                <th>Total Revenue</th>
                <th>Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r, index) => (
                <tr key={index}>
                  <td>{getMonthName(r._id.month)}</td>
                  <td>{r._id.year}</td>
                  <td>{r.totalOrders}</td>
                  <td className="text-success fw-bold">₹{r.totalRevenue}</td>
                  <td className="text-primary fw-bold">₹{r.averageOrderValue?.toFixed(2) || 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">© 2026 Pizza Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminRevenue;
