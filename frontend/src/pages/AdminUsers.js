import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { getAllUsers, deleteUser, updateUserRole } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      try {
        await deleteUser(id);
        addToast(`User ${name} deleted successfully`, 'success');
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        addToast(error.response?.data?.message || 'Error deleting user', 'danger');
      }
    }
  };

  const handleRoleChange = async (id, newRole, name) => {
    try {
      await updateUserRole(id, { role: newRole });
      addToast(`User ${name} role updated to ${newRole}`, 'success');
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      addToast(error.response?.data?.message || 'Error updating user role', 'danger');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <Container className="mt-4">
        <h3 className="mb-4">Customer Management</h3>

        {loading ? (
          <div className="text-center">Loading customers...</div>
        ) : users.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th className="text-center">Joined Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td className="align-middle">{user.name}</td>
                  <td className="align-middle">{user.email}</td>
                  <td className="align-middle">{user.phone}</td>
                  <td className="align-middle">
                    <select 
                      className="form-select form-select-sm" 
                      value={user.role || 'customer'} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value, user.name)}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="text-center align-middle">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-center align-middle">
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(user._id, user.name)}
                    >
                      Delete
                    </Button>
                  </td>
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

export default AdminUsers;
