import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';
import Navbar from '../components/Navbar';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const menuItemSchema = Yup.object({
  name:        Yup.string().min(2, 'Name must be at least 2 characters').required('Item name is required'),
  price:       Yup.number().typeError('Price must be a number').positive('Price must be greater than 0').required('Price is required'),
  categoryId:  Yup.string().required('Please select a category'),
  description: Yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
  image:       Yup.string().url('Enter a valid image URL').nullable().notRequired(),
  isAvailable: Yup.boolean(),
});

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  
  // Form submit error
  const [submitError, setSubmitError] = useState('');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        getMenuItems(),
        getCategories()
      ]);
      setMenuItems(menuRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };


  // ── Formik for Add/Edit menu item ──────────────────────────
  const emptyItem = { name: '', description: '', price: '', categoryId: '', image: '', isAvailable: true };

  const formik = useFormik({
    initialValues: emptyItem,
    validationSchema: menuItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitError('');
      try {
        if (isEditing) {
          await updateMenuItem(currentItemId, values);
        } else {
          await createMenuItem(values);
        }
        setShowModal(false);
        resetForm();
        fetchData();
      } catch (error) {
        setSubmitError('Error saving item. Please check all fields.');
      }
      setSubmitting(false);
    },
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentItemId(null);
    formik.resetForm();
  };

  const handleShowAddModal = () => {
    setIsEditing(false);
    formik.resetForm();
    formik.setValues({ ...emptyItem, categoryId: categories.length > 0 ? categories[0]._id : '' });
    setShowModal(true);
  };

  const handleShowEditModal = (item) => {
    setIsEditing(true);
    setCurrentItemId(item._id);
    formik.setValues({
      name:        item.name,
      description: item.description,
      price:       item.price,
      categoryId:  item.categoryId?._id || '',
      image:       item.image || '',
      isAvailable: item.isAvailable
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar />

      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Menu Management</h3>
          <Button variant="danger" onClick={handleShowAddModal}>
            + Add New Item
          </Button>
        </div>

        {loading ? (
          <div className="text-center">Loading menu items...</div>
        ) : menuItems.length === 0 ? (
          <p className="text-center">No menu items found. Add some!</p>
        ) : (
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item._id} className="align-middle">
                      <td>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', backgroundColor: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <small className="text-muted">No Img</small>
                          </div>
                        )}
                      </td>
                      <td className="fw-bold">{item.name}</td>
                      <td>{item.categoryId?.categoryName || 'Uncategorized'}</td>
                      <td className="text-danger fw-bold">₹{item.price}</td>
                      <td>
                        <Badge bg={item.isAvailable ? 'success' : 'secondary'}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(item)}>
                          Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && <div className="alert alert-danger py-2 small mb-3">{submitError}</div>}
          <Form noValidate onSubmit={formik.handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    type="text" name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.name && !!formik.errors.name}
                    placeholder="e.g. Margherita Pizza"
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number" name="price"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.price && !!formik.errors.price}
                    min="0" placeholder="e.g. 299"
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.price}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formik.values.categoryId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.categoryId && !!formik.errors.categoryId}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formik.errors.categoryId}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL <span className="text-muted small">(optional)</span></Form.Label>
                  <Form.Control
                    type="url" name="image"
                    value={formik.values.image}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.image && !!formik.errors.image}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.image}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea" rows={3} name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.description && !!formik.errors.description}
                placeholder="Brief description of the item..."
              />
              <Form.Control.Feedback type="invalid">{formik.errors.description}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                label="Item is currently available"
                name="isAvailable"
                checked={formik.values.isAvailable}
                onChange={formik.handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="danger" type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Item')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-auto">
        <p className="mb-0">© 2026 Pizza Store. Built for Capstone.</p>
      </footer>
    </div>
  );
};

export default AdminMenu;
