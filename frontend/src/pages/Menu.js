import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMenuItems, getCategories, addToCart, getCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const { user, addToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location]);

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, catRes, cartRes] = await Promise.all([
        getMenuItems(),
        getCategories(),
        user ? getCart() : Promise.resolve({ data: { items: [] } })
      ]);
      setMenuItems(menuRes.data);
      setCategories(catRes.data);
      if (user) setCart(cartRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await addToCart({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1
      });
      setCart(res.data.cart);
      addToast('SUCCESS', `${item.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const getItemInCart = (itemId) => {
    return cart.items.find(i => {
      const id = i.itemId?._id || i.itemId;
      return id === itemId;
    });
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item =>
        item.categoryId?.categoryName === selectedCategory
      );

  // Reorder categories to put specific ones first
  const sortedCategories = [...categories].sort((a, b) => {
    const order = ['New Launches', 'Bestsellers', 'Pizza', 'Veg', 'Non-Veg'];
    const indexA = order.indexOf(a.categoryName);
    const indexB = order.indexOf(b.categoryName);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.categoryName.localeCompare(b.categoryName);
  });

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />


      <Container className="mt-4">
        <h3 className="mb-4 fw-bold">Our Menu</h3>

        {/* Category Filter */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          <Button
            variant={selectedCategory === 'All' ? 'danger' : 'outline-danger'}
            className="rounded-pill px-4"
            size="sm"
            onClick={() => setSelectedCategory('All')}
          >
            All
          </Button>
          {sortedCategories.map(cat => (
            <Button
              key={cat._id}
              variant={selectedCategory === cat.categoryName
                ? 'danger' : 'outline-danger'}
              className="rounded-pill px-4"
              size="sm"
              onClick={() => setSelectedCategory(cat.categoryName)}
            >
              {cat.categoryName}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Fetching yummy pizzas...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No items found in this category.</p>
          </div>
        ) : (
          <Row>
            {filteredItems.map(item => (
              <Col md={4} key={item._id} className="mb-4">
                <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden product-card">
                  {item.image && (
                    <div style={{ height: '220px', overflow: 'hidden' }}>
                      <Card.Img
                        variant="top"
                        src={item.image}
                        className="h-100 w-100 object-fit-cover hover-zoom"
                      />
                    </div>
                  )}
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="border border-secondary p-1 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '16px', height: '16px' }}>
                        <div className={`rounded-circle ${item.categoryId?.categoryName === 'Non-Veg' ? 'bg-danger' : 'bg-success'}`} style={{ width: '8px', height: '8px' }}></div>
                      </div>
                      <h5 className="fw-bold mb-0">{item.name}</h5>
                    </div>
                    <Card.Text className="text-muted small flex-grow-1">
                      {item.description}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <h5 className="text-danger fw-bold mb-0">
                        ₹{item.price}
                      </h5>
                      <Badge bg={item.isAvailable ? 'success' : 'secondary'} className="rounded-pill">
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </Badge>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-0 p-4 pt-0">
                    <div className="d-flex gap-2">
                      <Button
                        variant="danger"
                        className="rounded-pill flex-grow-1 fw-bold py-2 shadow-sm"
                        disabled={!item.isAvailable}
                        onClick={async () => {
                           if (!getItemInCart(item._id)) {
                             await handleAddToCart(item);
                           }
                           navigate('/cart');
                        }}
                      >
                        Order Now
                      </Button>
                      <Button
                        variant={getItemInCart(item._id) ? "success" : "outline-danger"}
                        className="rounded-circle d-flex align-items-center justify-content-center border-2 transition-all"
                        style={{ width: '45px', height: '45px' }}
                        disabled={!item.isAvailable}
                        title={getItemInCart(item._id) ? "In Cart" : "Add to Cart"}
                        onClick={() => {
                          if (!getItemInCart(item._id)) {
                            handleAddToCart(item);
                          } else {
                            navigate('/cart');
                          }
                        }}
                      >
                        {getItemInCart(item._id) ? (
                          <i className="bi bi-check-lg fs-5"></i>
                        ) : (
                          <i className="bi bi-cart-plus fs-5"></i>
                        )}
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-auto">
        <p className="mb-0 opacity-75">© 2026 Pizza Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Menu;